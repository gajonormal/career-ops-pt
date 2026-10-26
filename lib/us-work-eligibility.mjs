import { htmlToText } from '../providers/_html-to-text.mjs';

// Explicit requirements only. Preserve evidence; silence never confirms eligibility.
const US = '(?:united states(?: of america)?|usa|us|eua|estados unidos)';
const patterns = [
  `(?:must|need to|required to) (?:be )?(?:legally )?(?:authorized|authorised|eligible) to work in (?:the )?${US}`,
  `(?:must|need to|required to) (?:currently )?(?:be )?(?:based|located|live|resid(?:e|ent)) (?:in |within )?(?:the )?${US}`,
  `${US}[- ](?:based (?:candidates|applicants)|residents?|citizens?|candidates|applicants) (?:only|required)`,
  `(?:only|exclusively) (?:open to |available to |hiring |hire )?(?:candidates |applicants )?(?:based |located |residing )?in (?:the )?${US}`,
  `(?:require[sd]?|must have|need) (?:valid |current |existing )?${US} (?:work (?:authorization|authorisation|permit)|citizenship|residency)`,
  `(?:right|authorization|authorisation) to work in (?:the )?${US} (?:is )?(?:required|mandatory)`,
  `(?:must|need to|required to) (?:be )?(?:a )?${US} (?:citizen|resident)`,
  `(?:must|need to|required to) (?:have|hold) (?:a )?(?:valid )?green card`,
  `(?:must|need to|required to) have (?:the )?(?:right|authorization|authorisation) to work in (?:the )?${US}`,
  `(?:position|role|job) (?:is )?(?:restricted to |open to )?${US}[- ]only`,
  `(?:obrigat[oó]rio|necess[aá]rio|deve|devem) (?:possuir |ter )?(?:autoriza[çc][aã]o de trabalho|resid[eê]ncia|cidadania) (?:nos |dos )?${US}`,
  `(?:deve|devem|obrigat[oó]rio) (?:residir|viver) nos ${US}`,
].map(pattern => new RegExp(`\\b${pattern}\\b`, 'i'));

export function findUsWorkRequirement(description) {
  if (typeof description !== 'string') return null;
  const text = htmlToText(description, { maxLength: Infinity }).replace(/U\.S\.(?:A\.)?/gi, match => match.replace(/\./g, '\uE000'));
  for (const part of text.split(/[;!\n]|\.(?=\s|$)/)) {
    const excerpt = part.replace(/\uE000/g, '.');
    let clause = excerpt.toLowerCase().replace(/u\.s\.(?:a\.)?/g, 'usa').replace(/\s+/g, ' ').trim();
    // Only 'or' introduces an alternative. 'And' can require both permissions.
    // Remove just that requirement, retaining any subsequent US-only clause.
    clause = clause.replace(new RegExp(`\\b(?:must|need to|required to) (?:be )?(?:authorized|authorised|eligible|based|located|resident|reside)(?:(?!\\band\\b)[^,;.!])*?\\b${US}\\s+or\\s+(?:portugal|the eu|eu|eea|europe)\\b`, 'g'), '');
    clause = clause.replace(new RegExp(`\\b(?:do not|does not|don't|doesn't|not|no)\\s+(?:require|need)\\s+(?:valid |current |existing )?${US} (?:work (?:authorization|authorisation|permit)|citizenship|residency)`, 'g'), '');
    clause = clause.replace(/\bnot required to\b/g, 'not obliged to');
    if (patterns.some(pattern => pattern.test(clause))) return { evidence: excerpt.trim(), rule: 'explicit-us-requirement' };
  }
  return null;
}

export function hasUsWorkRequirement(description) {
  return findUsWorkRequirement(description) !== null;
}

// Preliminary country screen, never a guarantee about a contract or relocation.
export function assessPortugalEligibility(job, { authorizedInPortugal = false, usWorkAuthorized = null, usResident = null } = {}) {
  const restriction = findUsWorkRequirement(job?.description);
  if (restriction) return { status: usWorkAuthorized === false && usResident === false ? 'ineligible' : 'unknown', ...restriction };
  const location = typeof job?.location === 'string' ? job.location.trim() : '';
  const description = typeof job?.description === 'string' ? htmlToText(job.description, { maxLength: Infinity }).trim() : '';
  if (!description) return { status: 'unknown', rule: 'missing-description', evidence: '' };
  const country = /\bPortugal\b|(?:^|[,|;]\s*)PT(?:$|[,|;])/i;
  const evidence = description.split(/[\n;]|\.(?=\s|$)/).find(line => /\b(?:(?:role|position|job|vaga|função)\b.{0,40}\b(?:based|located|remote|remot[oa]|em|in)\b.{0,80}\bPortugal|(?:work|working|trabalhar) (?:remotely |remotamente )?(?:from|in|em|a partir de) Portugal|(?:candidates|candidatos) (?:must be |devem )?(?:based|located|residir) (?:in |em )?Portugal)\b/i.test(line)
    && country.test(line) && !/\b(?:not|não|except|excluding|exceto|excepto)\b/i.test(line));
  if (authorizedInPortugal === true && evidence && country.test(location)) return { status: 'eligible', rule: 'portugal-role-and-authorization', evidence: evidence.trim() };
  return { status: 'unknown', rule: authorizedInPortugal === true ? 'hiring-country-unconfirmed' : 'candidate-authorization-unconfirmed', evidence: '' };
}
