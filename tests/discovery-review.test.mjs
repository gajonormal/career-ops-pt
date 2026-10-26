import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assessPortugalEligibility, hasUsWorkRequirement } from '../lib/us-work-eligibility.mjs';
import { reviewOpportunities, formatReview } from '../review-opportunities.mjs';
import landingjobs, { normalizeLandingJob } from '../providers/landingjobs.mjs';
import { htmlToText, DESCRIPTION_CAP } from '../providers/_html-to-text.mjs';
import { buildTitleFilter } from '../title-keywords.mjs';

const config = { title_filter: { positive: ['Developer', 'Engineer'], negative: ['Senior'] }, location_filter: { always_allow: ['Portugal', 'Abrantes', 'Castelo Branco'], allow: ['Remote', 'Europe'], block_hard: ['US', 'USA'], match_any_location: true }, country_eligibility_filter: { exclude_us_requirements: true } };
const profile = { location: { country: 'Portugal', us_work_authorized: false, us_resident: false, nearby_locations: ['Abrantes', 'Castelo Branco', 'Covilhã'] }, compensation: { autorizacao_trabalho_pt: true } };
const job = { title: 'Junior Developer', company: 'Example', url: 'https://example.com/jobs/1', location: 'Castelo Branco, Portugal', description: 'This role is based in Portugal.' };

test('country screen distinguishes supporting evidence from silence and headquarters', () => {
  assert.equal(assessPortugalEligibility(job, { authorizedInPortugal: true }).status, 'eligible');
  assert.equal(assessPortugalEligibility({ ...job, description: 'The role is based in Lisbon, Portugal, with regular time in the office.' }, { authorizedInPortugal: true }).status, 'eligible');
  assert.equal(assessPortugalEligibility(job).status, 'unknown', 'no guessed authorization');
  for (const description of ['', 'Our headquarters and offices are in Portugal.', 'We are based in Portugal.', 'This role is not based in Portugal.', 'Remote worldwide.']) {
    assert.equal(assessPortugalEligibility({ ...job, description }, { authorizedInPortugal: true }).status, 'unknown', description);
  }
  const restricted = { ...job, description: '<p>You must be authorized to work in the U.S.</p><p>We have offices in Portugal.</p>' };
  assert.equal(assessPortugalEligibility(restricted).status, 'unknown', 'candidate US status is never inferred');
  const rejected = assessPortugalEligibility(restricted, { usWorkAuthorized: false, usResident: false });
  assert.equal(rejected.status, 'ineligible');
  assert.match(rejected.evidence, /authorized to work/);
  assert.match(rejected.evidence, /U\.S\./, 'evidence preserves the original abbreviation');
});

test('requirements preserve conjunctions, later restrictions and negation', () => {
  for (const description of ['You must be authorized to work in the US and EU.', 'You must live in the United States.', 'Deve residir nos Estados Unidos.', 'É obrigatório possuir autorização de trabalho nos EUA.', 'Must be based in the US or Portugal, but must be a US resident.', 'Must be a US resident and authorized to work in the US or Portugal.']) assert.equal(hasUsWorkRequirement(description), true, description);
  for (const description of ['You are not required to be a US resident.', 'You must be based in the US or Portugal.', 'We do not require US work authorization.']) assert.equal(hasUsWorkRequirement(description), false, description);
});

test('junior developer discovery accepts language-qualified titles without accepting senior titles', () => {
  const matches = buildTitleFilter({ positive: ['Junior + Developer', '.NET + Developer'], negative: ['Senior'] });
  assert.equal(matches('Junior PHP Developer - Estágio profissional'), true);
  assert.equal(matches('Junior iOS Developer'), true);
  assert.equal(matches('.Net & Blazor Developer'), true);
  assert.equal(matches('Senior PHP Developer'), false);
  assert.equal(matches('Junior Account Manager'), false);
});

test('eligibility checks and Landing.jobs preserve mandatory restrictions at the end of long descriptions', () => {
  const body = `${'Company background. '.repeat(400)} Candidates must be authorized to work in the US.`;
  assert.equal(htmlToText(body).length, DESCRIPTION_CAP, 'existing provider default is unchanged');
  assert.equal(hasUsWorkRequirement(body), true);
  const normalized = normalizeLandingJob({ ...job, url: 'https://landing.jobs/at/example/long', role_description: body });
  assert.equal(hasUsWorkRequirement(normalized.description), true);
  assert.equal(normalized.description.endsWith('in the US.'), true);
});

test('pilot exposes false negatives and positives without pretending unlabeled ads are ground truth', () => {
  const result = reviewOpportunities([
    { ...job, expected_discovery_pass: true },
    { ...job, title: 'Senior Engineer', url: 'https://example.com/2', expected_discovery_pass: true },
    { ...job, location: 'Remote', description: '', url: 'https://example.com/3', expected_discovery_pass: false },
    { ...job, url: 'https://example.com/4', description: 'US residents only', expected_discovery_pass: false },
  ], config, profile);
  assert.equal(result.metrics.false_negative, 1);
  assert.equal(result.metrics.false_positive, 1);
  assert.equal(result.metrics.precision, 0.5);
  assert.equal(result.metrics.recall, 0.5);
  assert.equal(result.rows[0].geography.travel_feasibility, 'unconfirmed');
  assert.deepEqual(result.rows[0].geography.matched_places, ['Castelo Branco']);
  assert.match(formatReview(result), /Por confirmar/);
  const unlabeled = reviewOpportunities([job], config, profile);
  assert.equal(unlabeled.metrics.precision, null);
  assert.equal(unlabeled.metrics.recall, null);
  const rendered = formatReview(reviewOpportunities([{ ...job, company: '![tracking](https://example.com/pixel)', description: '' }], config, profile));
  assert.match(rendered, /Descrição em falta/);
  assert.equal(rendered.includes('![tracking]('), false, 'external metadata cannot insert Markdown images');
});

test('pilot rejects duplicate URLs, invalid inputs and other market profiles', () => {
  const result = reviewOpportunities([job, { ...job, url: `${job.url}#apply` }], config, profile);
  assert.equal(result.counts.discovery_pass, 1);
  assert.equal(result.rows[1].exclusion_reasons.includes('duplicate-url'), true);
  assert.throws(() => reviewOpportunities({}, config, profile), /lista JSON/);
  assert.throws(() => reviewOpportunities([{ ...job, url: 'javascript:alert(1)' }], config, profile), /não suportado/);
  assert.throws(() => reviewOpportunities([job], config, { location: { country: 'France' } }), /Portugal/);
});

test('Landing.jobs paginates beyond 50, retains requirement fields and rejects repeated pages', async () => {
  const first = Array.from({ length: 50 }, (_, i) => ({ title: 'Junior Developer', url: `https://landing.jobs/at/example/job-${i}` }));
  const calls = [];
  const result = await landingjobs.fetch({}, { fetchJson: async url => {
    calls.push(url);
    return Number(new URL(url).searchParams.get('offset')) === 0 ? first : [{ title: 'Junior Engineer', url: 'https://landing.jobs/at/example/last', role_description: '<p>Work in Portugal.</p>', main_requirements: 'US residents only' }];
  } });
  assert.equal(result.length, 51);
  assert.equal(calls.length, 2);
  assert.equal(hasUsWorkRequirement(result[50].description), true);
  await assert.rejects(() => landingjobs.fetch({}, { fetchJson: async () => first }), /sem progresso/);
  await assert.rejects(() => landingjobs.fetch({ landingjobs: { max_pages: 1 } }, { fetchJson: async () => first }), /cobertura incompleta/);
  assert.equal((await landingjobs.fetch({}, { maxPages: 1, fetchJson: async () => first })).length, 50, 'audit sampling remains intentional');
  assert.equal(normalizeLandingJob({ ...first[0], role_description: '<p>Role</p>', main_requirements: '<p>Requirements</p>' }).description, 'Role\n\nRequirements');
});
