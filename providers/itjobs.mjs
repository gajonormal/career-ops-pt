// Official read-only API: https://www.itjobs.pt/api/docs/job
// Credentials stay in the environment, never in portals.yml or posting URLs.
import { htmlToText } from './_html-to-text.mjs';
import { countryNameFromIso } from './_country.mjs';
import { safeEncodeURIComponent } from './_safe-url.mjs';

export function normalizeItjobsJob(row) {
  if (!row || typeof row !== 'object' || !Number.isSafeInteger(Number(row.id)) || Number(row.id) <= 0) return null;
  const title = typeof row.title === 'string' ? row.title.trim() : '';
  const slug = typeof row.slug === 'string' ? row.slug.trim() : '';
  if (!title || !slug || !/^[\p{L}\p{N}_-]+$/u.test(slug)) return null;
  const country = countryNameFromIso(row.country || 'PT') || String(row.country || 'PT');
  const locations = (Array.isArray(row.locations) ? row.locations : [])
    .map(place => typeof place?.name === 'string' ? place.name.trim() : '').filter(Boolean);
  const job = {
    title,
    url: `https://www.itjobs.pt/oferta/${Number(row.id)}/${safeEncodeURIComponent(slug)}`,
    company: typeof row.company?.name === 'string' ? row.company.name.trim() : 'ITJobs',
    location: locations.length ? [...new Set(locations)].map(place => `${place}, ${country}`).join(' | ') : country,
    description: typeof row.body === 'string' ? htmlToText(row.body, { maxLength: Infinity }) : '',
  };
  // The documented workModel numeric values are not guessed. The JD remains
  // the source for remote eligibility until that mapping is verified.
  if (typeof row.publishedAt === 'string' && /^\d{4}-\d{2}-\d{2}/.test(row.publishedAt)) {
    const date = Date.parse(`${row.publishedAt.slice(0, 10)}T00:00:00Z`);
    if (Number.isFinite(date)) job.postedAt = date;
  }
  return job;
}

export default {
  id: 'itjobs',
  async fetch(entry, ctx) {
    const key = process.env.ITJOBS_API_KEY?.trim();
    if (!key) throw new Error('itjobs: configurar ITJOBS_API_KEY no ambiente; manter pesquisa assistida enquanto não houver chave.');
    const query = typeof entry?.itjobs?.query === 'string' ? entry.itjobs.query.trim() : '';
    const configured = entry?.itjobs?.max_pages;
    if (configured !== undefined && (!Number.isInteger(configured) || configured < 1 || configured > 100)) throw new Error('itjobs: max_pages deve ser um inteiro de 1 a 100.');
    const cap = Math.min(configured || 20, Number.isInteger(ctx.maxPages) && ctx.maxPages > 0 ? ctx.maxPages : 100);
    const rows = new Map();
    for (let page = 1; page <= cap; page++) {
      const params = new URLSearchParams({ api_key: key, limit: '100', page: String(page) });
      if (query) params.set('q', query);
      let response;
      try {
        response = await ctx.fetchJson(`https://api.itjobs.pt/job/${query ? 'search' : 'list'}.json`, {
          method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString(), redirect: 'error',
        });
      } catch {
        throw new Error('itjobs: falha ao consultar a API; verificar acesso, chave e limites na documentação oficial.');
      }
      if (response?.error) throw new Error('itjobs: a API recusou a consulta; verificar credenciais e permissões.');
      if (!Array.isArray(response?.results)) throw new Error('itjobs: resposta inválida (results em falta).');
      const previous = rows.size;
      for (const raw of response.results) {
        const job = normalizeItjobsJob(raw);
        if (job) rows.set(job.url, job);
      }
      const limit = Number(response.limit) || 100;
      if (response.results.length < limit || (Number.isFinite(Number(response.total)) && page * limit >= Number(response.total))) break;
      if (rows.size === previous) throw new Error('itjobs: paginação sem progresso; cobertura incompleta.');
      if (page === cap && !ctx.maxPages) console.error(`⚠️ itjobs: limite de ${cap} páginas atingido; cobertura incompleta, aumentar itjobs.max_pages.`);
    }
    return [...rows.values()];
  },
};
