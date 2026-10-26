import { makeHttpCtx } from '../providers/_http.mjs';
import landingjobs from '../providers/landingjobs.mjs';
import { parseItjobsPosting } from '../providers/itjobs-public.mjs';
import { htmlToText } from '../providers/_html-to-text.mjs';
import { classifyLiveness } from '../liveness-core.mjs';

// Fixed public hosts only, as in providers/. No arbitrary URL HTTP fallback.
export function makePublicLiveness(ctx = makeHttpCtx()) {
  let landingFeed;
  return async url => {
    let parsed;
    try { parsed = new URL(url); } catch { return null; }
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.port) return null;
    if (parsed.hostname === 'landing.jobs' && /^\/at\/[\w-]+\/[\w-]+\/?$/.test(parsed.pathname)) {
      landingFeed ||= landingjobs.fetch({ name: 'Landing.jobs' }, ctx);
      const jobs = await landingFeed;
      return jobs.some(job => new URL(job.url).pathname.replace(/\/$/, '') === parsed.pathname.replace(/\/$/, ''))
        ? { result: 'active', code: 'public_feed_listed', reason: 'Anúncio presente no feed público consultado nesta execução.' }
        : { result: 'uncertain', code: 'public_feed_absent', reason: 'Não encontrado no feed; confirmar na página do anúncio.' };
    }
    if (parsed.hostname !== 'www.itjobs.pt' || !/^\/oferta\/\d+\/[\p{L}\p{N}_%-]+$/u.test(parsed.pathname)) return null;
    const target = `https://www.itjobs.pt${parsed.pathname}`;
    let html;
    try { html = await ctx.fetchText(target, { redirect: 'error' }); }
    catch (error) { return [404, 410].includes(error.status) ? { result: 'expired', code: 'http_gone', reason: `HTTP ${error.status}` } : { result: 'uncertain', code: 'public_fetch_failed', reason: 'Não foi possível consultar a página pública.' }; }
    const finding = classifyLiveness({ status: 200, requestedUrl: target, finalUrl: target, bodyText: htmlToText(html, { maxLength: Infinity }) });
    if (['expired_body', 'bot_challenge', 'access_blocked'].includes(finding.code)) return finding;
    parseItjobsPosting(html, target); // A listing, challenge or unrelated page is not an active job.
    const blocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    for (const block of blocks) {
      let row; try { row = JSON.parse(block[1]); } catch { continue; }
      if (row?.['@type'] !== 'JobPosting') continue;
      const expires = Date.parse(row.validThrough);
      if (Number.isFinite(expires) && expires < Date.now()) return { result: 'expired', code: 'structured_expiry', reason: 'Prazo publicado no anúncio já terminou.' };
      if (Number.isFinite(expires) && row.directApply === true) return { result: 'active', code: 'structured_job_open', reason: 'Página do anúncio disponível, candidatura direta indicada e prazo publicado ainda válido.' };
    }
    return { result: 'uncertain', code: 'structured_status_unknown', reason: 'Página disponível; abertura de candidaturas por confirmar.' };
  };
}
