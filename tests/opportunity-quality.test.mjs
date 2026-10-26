import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { assessSeniority } from '../lib/job-seniority.mjs';
import { assessHiringRestrictions } from '../lib/hiring-restrictions.mjs';
import { verifyOpportunities } from '../lib/opportunity-verification.mjs';
import { commuteOptions } from '../lib/commute-options.mjs';
import { validateFeedback, readFeedback } from '../opportunity-feedback.mjs';
import publicItjobs, { parseItjobsPosting, itjobsPostingLinks } from '../providers/itjobs-public.mjs';
import { makePublicLiveness } from '../lib/public-posting-liveness.mjs';
const run = promisify(execFile);

test('seniority uses the minimum of a range and distinguishes requirements, preferences and company history', () => {
  assert.equal(assessSeniority({ title: 'Junior Developer', description: 'Experiência mínima de 5 anos em desenvolvimento.' }).level, 'conflicting');
  assert.equal(assessSeniority({ title: 'Programador', description: 'Experiência profissional de 3 a 5 anos.' }).level, 'stretch');
  assert.equal(assessSeniority({ title: 'Developer', description: 'At least 5 years of experience in development.' }).level, 'experienced');
  assert.equal(assessSeniority({ title: 'Developer', description: '3–5 years of experience.' }).level, 'stretch');
  assert.equal(assessSeniority({ title: 'Junior Engineer', description: '0-2 years of experience.' }).level, 'junior');
  assert.equal(assessSeniority({ title: 'Junior Engineer', description: '5 years of experience required.' }).level, 'conflicting');
  assert.equal(assessSeniority({ title: 'Junior Engineer', description: 'Company with 20 years of experience. 4 years of experience preferred.' }).level, 'junior');
  assert.equal(assessSeniority({ title: 'Developer', description: '5 years of experience is not required.' }).level, 'unknown');
  assert.equal(assessSeniority({ title: 'Developer', description: 'You are a senior builder.' }).level, 'experienced');
});

test('hiring country constraints override generic remote and unrelated offices without inventing work permits', () => {
  const options = { country: 'Portugal', authorizedIn: ['Portugal', 'European Union'] };
  assert.equal(assessHiringRestrictions('We have offices in Portugal. You must be based in the UK.', options).status, 'ineligible');
  assert.equal(assessHiringRestrictions('Remote Europe, excluding Portugal.', options).status, 'ineligible');
  assert.equal(assessHiringRestrictions('Candidates must be authorized to work in the UK.', options).status, 'unknown');
  assert.equal(assessHiringRestrictions('Candidates must be based in the UK or Portugal.', options).status, 'unconfirmed');
  assert.equal(assessHiringRestrictions('You are not required to be based in Germany.', options).status, 'unconfirmed');
  assert.equal(assessHiringRestrictions('Contractors in Europe.', options).contract_model, 'contractor-mentioned');
});

test('verification keeps failures and thin pages uncertain, preserves definitive expiry and respects its limit', async () => {
  const rows = [1, 2, 3, 4].map(i => ({ url: `https://example.com/${i}`, discovery_pass: true }));
  const result = await verifyOpportunities(rows, { limit: 3, api: async url => {
    if (url.endsWith('/1')) return { result: 'expired', code: 'http_gone' };
    if (url.endsWith('/2')) throw Error('network failed');
    return null;
  }, openBrowser: async () => ({ result: 'expired', code: 'insufficient_content' }) });
  assert.deepEqual(result.map(row => row.liveness.result), ['expired', 'uncertain', 'uncertain', 'unverified']);
});

test('commute links retain published countries and never invent travel times', () => {
  const routes = commuteOptions('Coimbra, Portugal | Berlin, Germany', ['Abrantes', 'Castelo Branco']);
  assert.equal(routes.length, 4);
  assert.equal(routes[0].duration_minutes, null);
  assert.equal(new URL(routes[0].transit_url).searchParams.get('travelmode'), 'transit');
  assert.equal(new URL(routes[2].driving_url).searchParams.get('destination'), 'Berlin, Germany');
  assert.deepEqual(commuteOptions('Remote', ['Abrantes']), []);
});

test('feedback rejects unsafe protocols and preserves concurrent decisions as an append-only history', async () => {
  assert.throws(() => validateFeedback({ url: 'javascript:alert(1)', decision: 'interested' }));
  assert.throws(() => validateFeedback({ url: 'https://example.com', decision: 'applied' }));
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'co-quality-'));
  try {
    const env = { ...process.env, CAREER_OPS_ROOT: root };
    await Promise.all(Array.from({ length: 5 }, (_, i) => run(process.execPath, ['opportunity-feedback.mjs', 'add', '--url', 'https://example.com/job', '--decision', 'interested', '--reason', `motivo ${i}`], { env })));
    const file = path.join(root, 'data/opportunity-feedback.jsonl');
    assert.equal(readFeedback(file).length, 5);
    const before = fs.readFileSync(file, 'utf8');
    await run(process.execPath, ['opportunity-feedback.mjs', '--json'], { env });
    assert.equal(fs.readFileSync(file, 'utf8'), before);
    assert.equal(fs.existsSync(path.join(root, 'data/applications.md')), false);
  } finally { fs.rmSync(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }); }
});

const posting = { '@type': 'JobPosting', title: 'Junior Developer', description: '<p>Trabalhar em Portugal.</p>', hiringOrganization: { name: 'Example' }, jobLocation: [{ address: { addressLocality: 'Castelo Branco', addressCountry: 'PT' } }] };
const html = `<html><script type="application/ld+json">${JSON.stringify(posting)}</script></html>`;
test('fixed-host liveness requires explicit live metadata and never falls back to arbitrary hosts', async () => {
  let calls = 0;
  const check = makePublicLiveness({ fetchText: async () => { calls++; return `<html><script type="application/ld+json">${JSON.stringify({ ...posting, directApply: true, validThrough: '2099-12-31' })}</script></html>`; } });
  assert.equal(await check('https://evil.example/oferta/123/job'), null);
  assert.equal(await check('https://www.itjobs.pt:8443/oferta/123/job'), null);
  assert.equal(calls, 0);
  assert.equal((await check('https://www.itjobs.pt/oferta/123/job')).result, 'active');
  const expired = makePublicLiveness({ fetchText: async () => `<script type="application/ld+json">${JSON.stringify({ ...posting, validThrough: '2000-01-01' })}</script>` });
  assert.equal((await expired('https://www.itjobs.pt/oferta/123/job')).result, 'expired');
});
test('ITJobs public uses structured fields and only fixed-host posting links', async () => {
  const url = 'https://www.itjobs.pt/oferta/123/junior-developer';
  assert.equal(parseItjobsPosting(html, url).location, 'Castelo Branco, Portugal');
  assert.throws(() => parseItjobsPosting(html, 'https://example.com/oferta/123/job'));
  assert.throws(() => parseItjobsPosting('<html>challenge</html>', url));
  assert.deepEqual(itjobsPostingLinks('<a href="https://evil.example/oferta/1/job">bad</a><a href="/oferta/123/junior-developer">job</a>'), [url]);
  const calls = [];
  const jobs = await publicItjobs.fetch({ itjobs_public: { max_pages: 1, max_details: 1 } }, { sleep: async () => {}, fetchText: async (target, options) => { calls.push({ target, options }); return target.includes('/emprego?') ? '<html><a href="/oferta/123/junior-developer">job</a></html>' : html; } });
  assert.equal(jobs.length, 1);
  assert.equal(calls.every(row => row.options.redirect === 'error'), true);
});

test('scan review writes to a separate data root, preserves JSON receipts and keeps dry runs read-only', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'co-review-scan-'));
  try {
    fs.mkdirSync(path.join(root, 'config'));
    fs.mkdirSync(path.join(root, 'data'));
    fs.writeFileSync(path.join(root, 'config/profile.yml'), 'location:\n  country: Portugal\n');
    fs.writeFileSync(path.join(root, 'portals.yml'), 'tracked_companies: []\njob_boards: []\n');
    const env = { ...process.env, CAREER_OPS_ROOT: root, CAREER_OPS_PROFILE: path.join(root, 'config/profile.yml'), CAREER_OPS_PORTALS: path.join(root, 'portals.yml'), CAREER_OPS_PIPELINE: path.join(root, 'data/pipeline.md'), CAREER_OPS_SCAN_HISTORY: path.join(root, 'data/scan-history.tsv') };
    const snapshot = path.join(root, 'data/opportunity-review.json');
    await run(process.execPath, ['scan.mjs', '--review', '--dry-run', '--json'], { env });
    assert.equal(fs.existsSync(snapshot), false);
    const result = await run(process.execPath, ['scan.mjs', '--review', '--json'], { env });
    assert.equal(JSON.parse(result.stdout).added, 0);
    assert.deepEqual(JSON.parse(fs.readFileSync(snapshot, 'utf8')).rows, []);
    assert.equal(fs.existsSync(path.join(root, 'data/opportunity-feedback.jsonl')), false);
    assert.equal(fs.existsSync(path.join(root, 'data/applications.md')), false);
  } finally { fs.rmSync(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }); }
});
