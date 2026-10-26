import { htmlToText } from '../providers/_html-to-text.mjs';

const COUNTRIES = [ ['Portugal', 'portugal'], ['United Kingdom', '(?:united kingdom|uk|u\\.k\\.)'], ['United States', '(?:united states|usa|us|eua|estados unidos)'], ['Germany', '(?:germany|alemanha)'], ['Spain', '(?:spain|espanha)'], ['France', '(?:france|frança)'], ['Netherlands', '(?:netherlands|países baixos)'], ['Ireland', '(?:ireland|irlanda)'] ];

export function assessHiringRestrictions(description, { country = 'Portugal', authorizedIn = [] } = {}) {
  const body = htmlToText(description, { maxLength: Infinity });
  const restrictions = [];
  const excluded = body.match(/\b(?:not hiring (?:in|from)|cannot hire (?:in|from)|not available in|excluding|except|não contratamos (?:em|a partir de))\s+Portugal\b/i);
  if (excluded) restrictions.push({ kind: 'country-excluded', country: 'Portugal', status: 'ineligible', evidence: excluded[0] });
  for (const [name, pattern] of COUNTRIES) {
    const residence = new RegExp(`\\b(?:must|need to|required to) (?:be )?(?:based|located|resident|reside|live) (?:in|within) (?:the )?${pattern}\\b`, 'ig');
    for (const match of body.matchAll(residence)) {
      const before = body.slice(Math.max(0, match.index - 4), match.index);
      const after = body.slice(match.index + match[0].length, match.index + match[0].length + 40);
      if (/not\s*$/i.test(before)) continue;
      if (/^\s+or\s+(?:in )?(?:Portugal|the EU|EU|EEA|Europe)\b/i.test(after)) continue;
      restrictions.push({ kind: 'residence', country: name, status: name.toLowerCase() === country.toLowerCase() ? 'compatible' : 'ineligible', evidence: match[0] });
    }
    const permit = new RegExp(`\\b(?:must|need to|required to) (?:be )?(?:legally )?(?:authorized|authorised|eligible) to work in (?:the )?${pattern}\\b`, 'ig');
    for (const match of body.matchAll(permit)) {
      if (/not\s*$/i.test(body.slice(Math.max(0, match.index - 4), match.index))) continue;
      const after = body.slice(match.index + match[0].length, match.index + match[0].length + 40);
      if (/^\s+or\s+(?:in )?(?:Portugal|the EU|EU|EEA|Europe)\b/i.test(after)) continue;
      restrictions.push({ kind: 'work-authorization', country: name, status: authorizedIn.some(value => typeof value === 'string' && value.toLowerCase() === name.toLowerCase()) ? 'compatible' : 'unknown', evidence: match[0] });
    }
  }
  return { restrictions, status: restrictions.some(row => row.status === 'ineligible') ? 'ineligible' : restrictions.some(row => row.status === 'unknown') ? 'unknown' : 'unconfirmed', contract_model: /\b(?:contractors?|b2b|freelance)\b/i.test(body) ? 'contractor-mentioned' : /\b(?:employer of record|eor)\b/i.test(body) ? 'eor-mentioned' : 'unconfirmed' };
}
