// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

// Landing.jobs provider — board-wide aggregator feed (tech, Europe-focused):
// https://landing.jobs/api/v1/jobs
// Response shape: a JSON ARRAY of
//   { id, title, url, locations: [{ city, country_code }], remote, published_at,
//     created_at, type, tags, gross_salary_low, gross_salary_high, ... }
//
// NOTE: the v1 feed carries no company-name field — the employer slug only
// appears in the posting URL path (`https://landing.jobs/at/<slug>/<job>`), so
// `company` is derived best-effort from that slug (humanized) and falls back to
// the portal entry name. The public list is paginated (limit <= 50, offset).
// Official contract: https://github.com/LandingJobs/LandingJobs-api
//
// Wire in via a `job_boards:` entry with `provider: landingjobs`.

import { countryNameFromIso } from './_country.mjs';
import { htmlToText } from './_html-to-text.mjs';
const FEED_URL = 'https://landing.jobs/api/v1/jobs';
const TRUSTED_HOST = 'landing.jobs';

/** @param {string} url */
function assertLandingUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`landingjobs: invalid URL: ${url}`);
  }
  if (parsed.protocol !== 'https:') throw new Error(`landingjobs: URL must use HTTPS: ${url}`);
  if (parsed.hostname !== TRUSTED_HOST) {
    throw new Error(`landingjobs: untrusted hostname "${parsed.hostname}" — must be ${TRUSTED_HOST}`);
  }
  return url;
}

// NaN-safe Date.parse.
function toEpochMs(value) {
  if (typeof value !== 'string' || !value) return undefined;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * Derive a best-effort company name from a Landing.jobs posting URL.
 * Posting URLs are `https://landing.jobs/at/<slug>/<job>`; the `<slug>` is
 * humanized (hyphens/underscores → spaces, title-cased). Returns '' when the
 * URL is not the expected `/at/<slug>/…` shape. Exported for unit tests.
 * @param {string} url
 */
export function companyFromUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return '';
  }
  const segs = parsed.pathname.split('/').filter(Boolean);
  if (segs[0] !== 'at' || !segs[1]) return '';
  return segs[1]
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Normalize a single Landing.jobs job. Exported for unit tests.
 *
 * Field mapping → the normalized Job shape:
 *   - title:    `title`, trimmed (postings without one are dropped).
 *   - url:      `url` — host-locked to `landing.jobs` (an off-host or non-https
 *               URL drops the posting). It is the dedup key and is display-only.
 *   - company:  derived from the URL slug (see companyFromUrl), falling back to
 *               the portal entry name, then "Landing.jobs".
 *   - location: all `locations[]` entries with expanded country names; "Remote" is
 *               appended when `remote` is true.
 *   - postedAt: `published_at` (else `created_at`) ISO date → epoch ms.
 *
 * @param {any} j
 * @param {string} [fallbackCompany]
 * @returns {{ title: string, url: string, company: string, location: string, postedAt?: number } | null}
 */
export function normalizeLandingJob(j, fallbackCompany) {
  if (!j || typeof j !== 'object') return null;

  const title = typeof j.title === 'string' ? j.title.trim() : '';
  if (!title) return null;

  let url = '';
  const rawUrl = typeof j.url === 'string' ? j.url.trim() : '';
  if (rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol === 'https:' && parsed.hostname === TRUSTED_HOST) url = parsed.href;
    } catch {
      // malformed URL → leave url = '' → dropped below
    }
  }
  if (!url) return null;

  const company =
    companyFromUrl(url) ||
    (typeof fallbackCompany === 'string' && fallbackCompany.trim() ? fallbackCompany.trim() : 'Landing.jobs');

  const places = (Array.isArray(j.locations) ? j.locations : []).map(place => {
    if (!place || typeof place !== 'object') return '';
    const city = typeof place.city === 'string' ? place.city.trim() : '';
    const code = typeof place.country_code === 'string' ? place.country_code.trim() : '';
    return [city, countryNameFromIso(code) || code].filter(Boolean).join(', ');
  }).filter(Boolean);
  const base = [...new Set(places)].join(' | ');
  const location = [base, j.remote === true ? 'Remote' : ''].filter(Boolean).join(', ');
  // Keep descriptions available for eligibility checks; remote alone is not
  // evidence of permission to work from the candidate's country.
  const description = [...new Set([j.description, j.body, j.role_description, j.main_requirements, j.nice_to_have, j.perks]
    .filter(value => typeof value === 'string' && value.trim()).map(value => htmlToText(value, { maxLength: Infinity }).trim()))].join('\n\n');

  /** @type {{ title: string, url: string, company: string, location: string, postedAt?: number }} */
  const job = { title, url, company, location };
  if (description) job.description = description;
  const postedAt = toEpochMs(j.published_at) ?? toEpochMs(j.created_at);
  if (postedAt !== undefined) job.postedAt = postedAt;
  return job;
}

/** @type {Provider} */
export default {
  id: 'landingjobs',

  async fetch(entry, ctx) {
    const configured = entry?.landingjobs?.max_pages ?? 100;
    if (!Number.isInteger(configured) || configured < 1 || configured > 1000) throw new Error('landingjobs: max_pages deve ser um inteiro de 1 a 1000.');
    const cap = Math.min(configured, Number.isInteger(ctx.maxPages) && ctx.maxPages > 0 ? ctx.maxPages : configured);
    const rows = new Map();
    const seenRaw = new Set();
    for (let page = 0; page < cap; page++) {
      const url = assertLandingUrl(`${FEED_URL}?limit=50&offset=${page * 50}`);
      const json = await ctx.fetchJson(url, { redirect: 'error' });
      if (!Array.isArray(json)) throw new Error(`landingjobs: unexpected API response — expected a JSON array, got ${json === null ? 'null' : typeof json}`);
      const previous = seenRaw.size;
      for (const row of json) {
        // Raw identity, not accepted count: a page of malformed rows must not
        // truncate a later valid page or masquerade as a looping endpoint.
        seenRaw.add(JSON.stringify(row));
        const job = normalizeLandingJob(row, entry?.name);
        if (job) rows.set(job.url, job);
      }
      if (json.length === 0) break;
      if (page > 0 && seenRaw.size === previous) throw new Error('landingjobs: paginação sem progresso; cobertura incompleta.');
      if (json.length < 50) break;
      if (page + 1 === cap && !ctx.maxPages) throw new Error(`landingjobs: limite de ${cap} páginas atingido; cobertura incompleta. Aumentar landingjobs.max_pages.`);
    }
    return [...rows.values()];
  },
};
