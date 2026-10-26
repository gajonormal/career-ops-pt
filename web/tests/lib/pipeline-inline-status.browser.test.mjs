// Optional live-browser regression suite (run explicitly from web/tests/lib).
// Run a local web server with
// CAREER_OPS_ROOT set to a disposable fixture directory, then set
// PIPELINE_STATUS_TEST_URL and PIPELINE_STATUS_TEST_ROOT when running this file.
// Generate that directory with: node tests/fixtures/pipeline-status.mjs
// The marker and fictional-only rows guard against testing a personal tracker.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

const url = process.env.PIPELINE_STATUS_TEST_URL;
const root = process.env.PIPELINE_STATUS_TEST_ROOT;

test("inline Pipeline status browser flow (disposable data only)", { skip: !url || !root, timeout: 120_000 }, async (t) => {
  const origin = new URL(url);
  assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname));
  const relative = path.relative(os.tmpdir(), fs.realpathSync(root));
  assert.ok(relative && !relative.startsWith("..") && !path.isAbsolute(relative));
  assert.equal(fs.readFileSync(path.join(root, ".inline-status-fixture"), "utf8").trim(), "fictional-only");
  const tracker = path.join(root, "data/applications.md");
  const initial = fs.readFileSync(tracker, "utf8");
  assert.ok(initial.includes("Fixture Alpha") && initial.includes("Fixture Beta") && initial.includes("Fixture Gamma"));
  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_TEST_EXECUTABLE ? { executablePath: process.env.BROWSER_TEST_EXECUTABLE } : process.env.BROWSER_TEST_CHANNEL ? { channel: process.env.BROWSER_TEST_CHANNEL } : {}) });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  // Missing fixture resources and the deliberately injected HTTP 503 are
  // network errors, not React/runtime errors. Still fail on console exceptions.
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().startsWith("Failed to load resource:")) errors.push(message.text());
  });
  const posts = [];
  page.on("request", (request) => {
    if (request.url().endsWith("/api/status") && request.method() === "POST") posts.push(request.postDataJSON());
  });
  const row = (n) => page.locator("tbody tr").filter({ has: page.getByRole("link", { name: `#${n}`, exact: true }) });
  const labels = { INBOX: "Por avaliar", ALL: "Todas", EVALUATED: "Avaliadas", APPLIED: "Enviadas" };
  const tab = (name) => page.getByRole("button", { name: new RegExp(`^${labels[name] ?? name} \\d+$`) });
  const edit = (n) => row(n).getByRole("button", { name: /^Editar estado/ });
  const select = (n) => row(n).getByRole("combobox");
  async function until(check) {
    const start = Date.now();
    while (!await check()) {
      if (Date.now() - start > 15_000) assert.fail("UI did not reach expected state");
      await page.waitForTimeout(50);
    }
  }

  await page.goto(`${origin.origin}/pipeline?tab=ALL`);
  await edit(11).waitFor();
  assert.equal(await page.locator("tbody tr").count(), 3);
  assert.equal(await page.getByRole("button", { name: /^Editar estado/ }).count(), 3);

  await t.test("pencil, Cancel, Escape and same-value selection do not write", async () => {
    await edit(11).focus();
    await page.keyboard.press("Enter");
    assert.equal(await select(11).evaluate((element) => document.activeElement === element), true);
    assert.equal(await page.getByRole("combobox").count(), 1);
    await select(11).selectOption("Evaluated");
    await row(11).getByRole("button", { name: /^Cancelar edição/ }).click();
    await edit(11).waitFor();
    await until(() => edit(11).evaluate((element) => document.activeElement === element));
    await edit(11).click();
    await select(11).press("Escape");
    await until(() => edit(11).evaluate((element) => document.activeElement === element));
    assert.equal(posts.length, 0);
    assert.equal(fs.readFileSync(tracker, "utf8"), initial);
  });

  await t.test("sorting preserves the open editor and other rows remain usable", async () => {
    await edit(11).click();
    await page.getByRole("button", { name: "Empresa", exact: true }).click();
    await page.waitForURL(/sort=company/);
    await select(11).waitFor();
    assert.equal(await row(12).getByRole("combobox").count(), 0);
    await select(11).press("Escape");
  });

  await t.test("Today retains the decision card when a save fails or is not confirmed", async (subtest) => {
    subtest.after(() => page.unrouteAll({ behavior: "wait" }));
    await page.goto(`${origin.origin}/`);
    const discard = page.getByRole("button", { name: "Descartar", exact: true });
    await discard.first().waitFor();
    const count = await discard.count();
    await page.route("**/api/status", route => route.fulfill({ status: 503, json: { error: "Fixture failure" } }));
    await discard.first().click();
    await page.getByRole("alert").filter({ hasText: "Não foi possível guardar o estado" }).waitFor();
    assert.equal(await discard.count(), count);
    assert.equal(fs.readFileSync(tracker, "utf8"), initial);
    await page.unroute("**/api/status");
    await page.route("**/api/status", route => route.fulfill({ status: 200, json: { ok: false } }));
    await discard.first().click();
    await until(() => discard.first().isEnabled());
    assert.equal(await discard.count(), count);
    assert.equal(fs.readFileSync(tracker, "utf8"), initial);
    await page.unrouteAll({ behavior: "wait" });
    await page.goto(`${origin.origin}/pipeline?tab=ALL`);
    await edit(11).waitFor();
  });

  await t.test("failed save disables its controls, then rolls back with an accessible error", async () => {
    let release;
    const gate = new Promise((resolve) => { release = resolve; });
    await page.route("**/api/status", async (route) => {
      await gate;
      await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Fixture tracker busy; retry shortly" }) });
    });
    await edit(11).click();
    await select(11).selectOption("Applied");
    assert.equal(await select(11).isDisabled(), true);
    assert.equal(await row(11).getByRole("button", { name: /^Cancelar edição/ }).isDisabled(), true);
    assert.equal(await edit(12).isEnabled(), true);
    await page.getByPlaceholder("Pesquisar empresa ou função…").fill("Fixture");
    release();
    await row(11).getByRole("alert").waitFor();
    assert.equal(await select(11).inputValue(), "Evaluated");
    assert.equal(await select(11).getAttribute("aria-invalid"), "true");
    assert.equal(fs.readFileSync(tracker, "utf8"), initial);
    await select(11).press("Escape");
    await page.unroute("**/api/status");
  });

  await t.test("confirmed save updates filtered rows/counts before refresh, then persists", async (subtest) => {
    await tab("EVALUATED").click();
    await page.waitForURL(/tab=EVALUATED/);
    await edit(11).waitFor();
    let release;
    let held = false;
    const gate = new Promise((resolve) => { release = resolve; });
    subtest.after(async () => { release(); await page.unrouteAll({ behavior: "wait" }); });
    await page.route("**/pipeline?**", async (route) => {
      // Delay the server refresh, not the POST: confirmed UI feedback should
      // already move the row and counts while the fresh RSC payload is pending.
      if (route.request().headers().rsc === "1") { held = true; await gate; }
      await route.continue();
    });
    await edit(11).click();
    await select(11).selectOption("Applied");
    await until(() => row(11).count().then((count) => count === 0));
    await until(() => tab("EVALUATED").innerText().then((text) => /^Avaliadas\s+1$/.test(text)));
    assert.match(await tab("APPLIED").innerText(), /^Enviadas\s+2$/);
    assert.equal(await tab("EVALUATED").evaluate((element) => document.activeElement === element), true);
    await until(() => held);
    assert.match(fs.readFileSync(tracker, "utf8"), /Fixture Alpha.*Applied/);
    release();
    await page.unrouteAll({ behavior: "wait" });
    await page.reload();
    assert.equal(await row(11).count(), 0);
    await tab("APPLIED").click();
    await edit(11).waitFor();
    assert.match(await row(11).innerText(), /Enviada/);
    assert.match(fs.readFileSync(path.join(root, "data/status-log.tsv"), "utf8"), /11\t.*Evaluated\tApplied\tweb/);
  });

  await t.test("search during a delayed save cannot apply its response to a different row", async () => {
    await tab("ALL").click();
    await edit(13).waitFor();
    let release;
    const gate = new Promise((resolve) => { release = resolve; });
    await page.route("**/api/status", async (route) => { await gate; await route.continue(); });
    await edit(13).click();
    await select(13).selectOption("Interview");
    const search = page.getByPlaceholder("Pesquisar empresa ou função…");
    await search.fill("Fixture Beta");
    assert.equal(await row(13).count(), 0);
    release();
    await until(() => fs.readFileSync(tracker, "utf8").includes("3.6/5 | Interview"));
    await page.unroute("**/api/status");
    assert.match(await row(12).innerText(), /Enviada/);
    await search.fill("");
    await until(() => row(13).innerText().then((text) => text.includes("Entrevista")));
  });

  await t.test("independent row saves may finish out of order without crossing identities", async (subtest) => {
    let release;
    const gate = new Promise((resolve) => { release = resolve; });
    subtest.after(async () => { release(); await page.unrouteAll({ behavior: "wait" }); });
    await page.route("**/api/status", async (route) => {
      if (route.request().postDataJSON().n === "12") await gate;
      await route.continue();
    });
    await edit(12).click();
    await select(12).selectOption("Offer");
    await edit(13).click();
    await select(13).selectOption("Rejected");
    await until(() => row(13).innerText().then((text) => text.includes("Rejeitada")));
    assert.equal(await select(12).isDisabled(), true);
    release();
    await until(() => fs.readFileSync(tracker, "utf8").includes("3.8/5 | Offer"));
    assert.match(fs.readFileSync(tracker, "utf8"), /Fixture Gamma \| Analyst \| 3\.6\/5 \| Rejected/);
    await page.unrouteAll({ behavior: "wait" });
    await page.reload();
    await until(async () => (await row(12).innerText()).includes("Proposta") && (await row(13).innerText()).includes("Rejeitada"));
    assert.match(await row(12).innerText(), /Proposta/);
    assert.match(await row(13).innerText(), /Rejeitada/);
  });

  await t.test("detail-page dropdown retains the saved animation and persists", async () => {
    await page.goto(`${origin.origin}/pipeline/11`);
    const detailSelect = page.getByLabel("Estado", { exact: true });
    await detailSelect.waitFor();
    assert.equal(await detailSelect.inputValue(), "Applied");
    assert.equal(await page.getByRole("button", { name: /^Editar estado/ }).count(), 0);
    await detailSelect.selectOption("Responded");
    await page.locator(".animate-terminal-popup").filter({ hasText: "guardado" }).waitFor();
    await page.reload();
    assert.equal(await detailSelect.inputValue(), "Responded");
  });

  await t.test("narrow-screen editor stays reachable by horizontal scroll; inbox has no editor", async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${origin.origin}/pipeline?tab=ALL`);
    await edit(11).click();
    await select(11).waitFor();
    assert.equal(await select(11).evaluate((element) => element.getBoundingClientRect().height >= 44), true);
    assert.equal(await row(11).getByRole("button", { name: /^Cancelar edição/ }).evaluate((element) => element.getBoundingClientRect().height >= 44), true);
    await select(11).press("Escape");
    await tab("INBOX").click();
    await page.waitForURL((value) => !value.searchParams.has("tab"));
    assert.equal(await page.getByRole("button", { name: /^Editar estado/ }).count(), 0);
  });
  assert.deepEqual(errors, []);
});
