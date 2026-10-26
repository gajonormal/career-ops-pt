// Public HTML + JobPosting JSON-LD. Bounded discovery, no login or API key.
import { htmlToText } from './_html-to-text.mjs';
import { decodeEntities } from './_html-entities.mjs';
import { countryNameFromIso } from './_country.mjs';
import { sleep } from './_http.mjs';

const HOST = 'https://www.itjobs.pt';
export function itjobsPostingLinks(html) {
  return [...new Set([...String(html).matchAll(/href=["'](\/oferta\/\d+\/[\p{L}\p{N}_%-]+)["']/giu)].map(match => HOST + match[1]))];
}
export function parseItjobsPosting(html, url) {
  const parsedUrl = new URL(url);
  if (parsedUrl.origin !== HOST || !/^\/oferta\/\d+\/[\p{L}\p{N}_%-]+$/u.test(parsedUrl.pathname)) throw new Error('itjobs-public: URL não suportado.');
  const values = [];
  function visit(value) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(visit); return; }
    values.push(value);
    if (Array.isArray(value['@graph'])) value['@graph'].forEach(visit);
  }
  for (const match of String(html).matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { visit(JSON.parse(match[1])); } catch { /* another unrelated JSON-LD block may be malformed */ }
  }
  const row = values.find(value => value['@type'] === 'JobPosting' || Array.isArray(value['@type']) && value['@type'].includes('JobPosting'));
  if (!row || typeof row.title !== 'string' || !row.title.trim() || typeof row.description !== 'string') throw new Error('itjobs-public: JobPosting válido em falta.');
  const places = (Array.isArray(row.jobLocation) ? row.jobLocation : [row.jobLocation]).filter(Boolean).map(place => {
    const address = place.address || {};
    const code = typeof address.addressCountry === 'string' ? address.addressCountry : address.addressCountry?.name;
    return [address.addressLocality, countryNameFromIso(code) || code].filter(value => typeof value === 'string' && value).join(', ');
  });
  const job = { title: decodeEntities(row.title).trim(), url: parsedUrl.href, company: typeof row.hiringOrganization?.name === 'string' ? row.hiringOrganization.name : 'ITJobs', location: [...new Set(places)].join(' | '), description: htmlToText(row.description, { maxLength: Infinity }) };
  if (Number.isFinite(Date.parse(row.datePosted))) job.postedAt = Date.parse(row.datePosted);
  return job;
}

export default {
  id: 'itjobs-public',
  async fetch(entry, ctx) {
    const options = entry?.itjobs_public || {};
    const pages = options.max_pages ?? 2;
    const maxDetails = options.max_details ?? 40;
    if (!Number.isInteger(pages) || pages < 1 || pages > 10 || !Number.isInteger(maxDetails) || maxDetails < 1 || maxDetails > 100) throw new Error('itjobs-public: limites inválidos.');
    const query = typeof options.query === 'string' ? options.query : 'junior';
    const urls = new Set();
    const cap = Math.min(pages, ctx.maxPages || pages);
    for (let page = 1; page <= cap; page++) {
      const html = await ctx.fetchText(`${HOST}/emprego?${new URLSearchParams({ q: query, page: String(page) })}`, { redirect: 'error' });
      if (!/<html\b/i.test(html) || /cf-chl-|verify you are human/i.test(html)) throw new Error('itjobs-public: página indisponível ou protegida; continuar com pesquisa assistida.');
      const links = itjobsPostingLinks(html);
      const previous = urls.size;
      links.forEach(url => urls.add(url));
      if (!links.length || urls.size === previous || urls.size >= maxDetails) break;
      await sleep(500, ctx);
    }
    const jobs = [];
    for (const url of [...urls].slice(0, maxDetails)) {
      try {
        const html = await ctx.fetchText(url, { redirect: 'error' });
        jobs.push(parseItjobsPosting(html, url));
      } catch (error) {
        if (![404, 410].includes(error?.status)) throw error;
        console.error('itjobs-public: anúncio removido entre a pesquisa e a leitura.');
      }
      await sleep(500, ctx);
    }
    if (urls.size >= maxDetails || cap === pages) console.error(`itjobs-public: pesquisa limitada a ${cap} páginas / ${maxDetails} detalhes; complementar a cobertura com a API ou pesquisa assistida.`);
    return jobs;
  },
};
