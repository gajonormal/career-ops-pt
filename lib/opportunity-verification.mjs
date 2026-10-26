// Reuse the same public-API and guarded browser ladder as the main scanner.
export async function verifyOpportunities(rows, { limit = 30, api, openBrowser } = {}) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('Limite de verificação inválido (1–100).');
  const checkApi = api || (await import('../liveness-api.mjs')).checkLivenessViaApi;
  const publicCheck = (await import('./public-posting-liveness.mjs')).makePublicLiveness();
  let browser;
  let page;
  let checked = 0;
  const results = [];
  try {
    for (const row of rows) {
      if (!row.discovery_pass || checked >= limit) { results.push({ ...row, liveness: { result: 'unverified', reason: 'Não consultado nesta execução.' } }); continue; }
      checked++;
      let finding;
      try {
        finding = await checkApi(row.url);
        if (!finding) finding = await publicCheck(row.url);
        if (!finding) {
          if (openBrowser) finding = await openBrowser(row.url);
          else {
            const { chromium } = await import('playwright');
            const { newLivenessPage, checkUrlLiveness } = await import('../liveness-browser.mjs');
            if (!browser) { browser = await chromium.launch({ headless: true }); page = await newLivenessPage(browser); }
            finding = await checkUrlLiveness(page, row.url);
          }
        }
        // A thin page or a generic listing is inconclusive, not definitive expiry.
        if (['insufficient_content', 'listing_page', 'expired_body_soft'].includes(finding?.code)) finding = { ...finding, result: 'uncertain' };
        if (!['active', 'expired', 'uncertain'].includes(finding?.result)) finding = { result: 'uncertain', reason: 'Resposta de verificação inconclusiva.' };
      } catch { finding = { result: 'uncertain', reason: 'Não foi possível confirmar o anúncio na fonte.' }; }
      results.push({ ...row, liveness: { result: finding.result, code: finding.code || null, reason: finding.reason || '', checked_at: new Date().toISOString() } });
    }
  } finally { await browser?.close(); }
  return results;
}
