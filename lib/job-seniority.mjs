import { htmlToText } from '../providers/_html-to-text.mjs';

// Evidence-based triage, not an inferred number of candidate employment years.
export function assessSeniority(job) {
  const title = typeof job?.title === 'string' ? job.title : '';
  const body = htmlToText(job?.description, { maxLength: Infinity });
  const requirements = [];
  const patterns = [
    /\b(?:(?:at least|minimum of|mínimo de)\s+)?(\d{1,2})(?:\s*(?:[-–]|to|a)\s*(\d{1,2})|\+)?\s*(?:years?|anos)\s+(?:of |de )?(?:[\p{L}/-]+\s+){0,3}(?:experience|experiência)\b/giu,
    /\bexperiência(?: profissional)?(?: comprovada)?\s+(?:(?:mínima|mínimo)\s+)?(?:de\s+)?(?:pelo menos\s+)?(\d{1,2})(?:\s*(?:[-–]|a)\s*(\d{1,2})|\+)?\s*anos\b/giu,
  ];
  for (const match of patterns.flatMap(pattern => [...body.matchAll(pattern)]).sort((a, b) => a.index - b.index)) {
    const before = body.slice(Math.max(0, match.index - 100), match.index);
    if (/\b(?:company|business|empresa|organization|organização)\b[^.!;]{0,70}$/iu.test(before)) continue;
    if (/\b(?:no|not|não|sem)\s+(?:need for |necessidade de )?$/iu.test(before)) continue;
    const after = body.slice(match.index + match[0].length, match.index + match[0].length + 65);
    if (/^\s+(?:is |are |é )?(?:not required|não obrigatória|não exigida)/iu.test(after)) continue;
    const preferred = /(?:preferred|nice.to.have|preferencial|valorizad[oa]|idealmente)\s*[:,-]?\s*$/iu.test(before) || /^\s*(?:is |are |é )?(?:preferred|a plus|preferencial|valorizad[oa])/iu.test(after);
    requirements.push({ minimum_years: Number(match[1]), maximum_years: match[2] ? Number(match[2]) : null, strength: preferred ? 'preferred' : 'stated', evidence: match[0] });
  }
  const required = requirements.filter(row => row.strength !== 'preferred');
  const min = required.length ? Math.max(...required.map(row => row.minimum_years)) : null;
  const explicitExperienced = /\b(?:senior|staff|principal|director|head of|engineering manager)\b/i.test(title)
    || /\byou are a senior (?:builder|engineer|developer)\b/i.test(body);
  const explicitJunior = /\b(?:junior|júnior|graduate|trainee|entry.level)\b/i.test(title);
  const mixed = explicitJunior && (explicitExperienced || (min !== null && min >= 4));
  const level = mixed ? 'conflicting' : explicitExperienced || (min !== null && min >= 4) ? 'experienced' : min !== null && min >= 3 ? 'stretch' : explicitJunior || (min !== null && min <= 2) ? 'junior' : 'unknown';
  return { level, minimum_years_stated: min, requirements, evidence: explicitExperienced ? title + (body.match(/\byou are a senior (?:builder|engineer|developer)\b/i)?.[0] ? ' / ' + body.match(/\byou are a senior (?:builder|engineer|developer)\b/i)[0] : '') : '' };
}
