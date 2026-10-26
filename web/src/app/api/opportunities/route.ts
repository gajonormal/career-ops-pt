import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { careerOpsRoot, rootScript } from "@/lib/career-ops";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const run = promisify(execFile);

export async function GET() {
  try {
    const file = path.join(careerOpsRoot(), "data", "opportunity-review.json");
    const review = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
    const { stdout } = await run(process.execPath, [rootScript("opportunity-feedback"), "--json"], { env: { ...process.env, CAREER_OPS_ROOT: careerOpsRoot() }, timeout: 15000, maxBuffer: 8 * 1024 * 1024 });
    return Response.json({ review, feedback: JSON.parse(stdout).latest });
  } catch { return Response.json({ error: "Não foi possível ler a revisão e o histórico de decisões." }, { status: 500 }); }
}

export async function POST(req: Request) {
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: "Pedido inválido." }, { status: 400 }); }
  if (typeof body?.url !== "string" || body.url.length > 2048 || !["interested", "not-interested", "review"].includes(body?.decision) || typeof body?.reason !== "string" || body.reason.length > 1000) return Response.json({ error: "Decisão ou motivo inválido." }, { status: 400 });
  try {
    const { stdout } = await run(process.execPath, [rootScript("opportunity-feedback"), "add", "--url", body.url, "--decision", body.decision, ...(body.reason.trim() ? ["--reason", body.reason.trim()] : []), "--json"], { env: { ...process.env, CAREER_OPS_ROOT: careerOpsRoot() }, timeout: 15000, maxBuffer: 1024 * 1024 });
    return Response.json(JSON.parse(stdout));
  } catch { return Response.json({ error: "Não foi possível guardar a decisão. Tenta novamente." }, { status: 500 }); }
}
