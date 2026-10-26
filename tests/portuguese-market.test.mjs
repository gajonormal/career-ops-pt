// Exercise market selection and actual evaluator requests with two isolated
// candidate profiles; no real API, personal files or application submission.
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadMarketContext, loadMarketMode, resolveMarketModes } from '../lib/market-context.mjs';
import { pass, fail, rmSync, ROOT, NODE } from './helpers.mjs';

const check = (condition, label) => condition ? pass(label) : fail(label);
const pt = 'language:\n  output: pt-PT\n  modes_dir: modes/pt\n';
const market = loadMarketContext(ROOT, pt);
check(market.evaluationPath === 'modes/pt/oferta.md', 'PT market resolves independently of JD language');
for (const section of ['## Machine Summary', '## Risk Summary', '## Score Evidence', '## Job Description (archived verbatim)']) {
  check(market.ofertaContent.includes(section), `PT evaluator retains ${section}`);
}
check(market.sharedContent.toLowerCase().includes('duodécimos') && market.sharedContent.includes('Termo Incerto'), 'PT compensation covers annualization and fixed-term employment');
check(market.sharedContent.includes('categorias A e B') && market.sharedContent.includes('35 anos inclusive'), 'IRS Jovem keeps current age/category scope');
check(!/VisitAR|Oportunia|IPCB|equipa de 3|Cidadão português|Inglês \(Fluente \/ C1\)/.test(market.sharedContent + market.ofertaContent + loadMarketMode(ROOT, pt, 'apply')), 'market context contains no candidate identity or assumed citizenship/language level');
check(loadMarketMode(ROOT, pt, 'apply').includes('Não presumir disponibilidade imediata'), 'canonical apply resolves Portuguese supplement');
const multi = loadMarketContext(ROOT, 'language:\n  modes_dir: [modes/pt, modes/de]\n');
check(multi.evaluationPath === market.evaluationPath && multi.sharedContent.includes('modes/de/_shared.md'), 'secondary market contributes shared context without replacing PT evaluation');
const fallback = resolveMarketModes(ROOT, 'language:\n  modes_dir: [../outside, modes/de]\n', { warn() {} });
check(fallback.primary === 'modes', 'invalid primary never promotes secondary market');

const scratch = mkdtempSync(join(ROOT, '.tmp-script-test-portuguese-market-'));
const captured = [];
const summary = '## A) Resumo\nExemplo.\n---SCORE_SUMMARY---\nCOMPANY: Fixture\nROLE: Engineer\nSCORE: 4.0\nARCHETYPE: Engineer\nLEGITIMACY: High Confidence\n---END_SUMMARY---';
const server = createServer((req, res) => {
  let raw = '';
  req.on('data', chunk => { raw += chunk; });
  req.on('end', () => {
    res.setHeader('Content-Type', 'application/json');
    if (req.url === '/api/tags') { res.end('{"models":[]}'); return; }
    const body = JSON.parse(raw);
    const content = body.messages?.find(m => m.role === 'system' || m.role === 'developer')?.content;
    captured.push(Array.isArray(content) ? content.map(part => part.text || '').join('\n') : (content || ''));
    if (req.url === '/api/chat') {
      res.setHeader('Content-Type', 'application/x-ndjson');
      res.end(JSON.stringify({ message: { role: 'assistant', content: summary }, done: true }) + '\n');
    } else {
      res.setHeader('Content-Type', 'text/event-stream');
      res.end(`data: ${JSON.stringify({ choices: [{ delta: { content: summary } }] })}\n\ndata: [DONE]\n\n`);
    }
  });
});
try {
  mkdirSync(join(scratch, 'config'));
  mkdirSync(join(scratch, 'modes'));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  for (const candidate of ['CANDIDATE_ALPHA', 'CANDIDATE_BETA']) {
    writeFileSync(join(scratch, 'cv.md'), `# ${candidate}\n\n## Skills\nPython\n`);
    writeFileSync(join(scratch, 'config/profile.yml'), pt + `name: ${candidate}\n`);
    writeFileSync(join(scratch, 'modes/_profile.md'), `${candidate}_TARGETS`);
    writeFileSync(join(scratch, 'modes/_custom.md'), `${candidate}_STYLE`);
    for (const engine of ['openai-eval.mjs', 'ollama-eval.mjs']) {
      const argv = [join(ROOT, engine), '--url', url, '--model', 'fixture-model', '--no-save'];
      if (engine.startsWith('openai')) argv.push('--key', 'fixture-key');
      argv.push('Software engineer in Portugal. Requirements: Python.');
      const result = await new Promise(resolve => execFile(NODE, argv, {
        timeout: 30000, env: { ...process.env, CAREER_OPS_ROOT: scratch, CAREER_OPS_DATA_DIR: scratch },
      }, (error, stdout, stderr) => resolve({ error, stdout, stderr })));
      const prompt = captured.pop() || '';
      check(!result.error, `${engine} completes a mocked PT evaluation for ${candidate}${result.error ? ': ' + result.stderr.slice(-500) : ''}`);
      check(prompt.includes(candidate) && prompt.includes(`${candidate}_TARGETS`) && prompt.includes(`${candidate}_STYLE`), `${engine} receives this candidate's primary sources and house rules`);
      check(prompt.includes('duodécimos') && prompt.includes('## Machine Summary'), `${engine} sends PT rules plus canonical report contract`);
      check(!prompt.includes(candidate === 'CANDIDATE_ALPHA' ? 'CANDIDATE_BETA' : 'CANDIDATE_ALPHA'), `${engine} does not leak the previous candidate's facts`);
    }
    const script = `import {loadContext,buildSystemPrompt} from ${JSON.stringify(pathToFileURL(join(ROOT, 'openrouter-runner.mjs')).href)}; const c=loadContext(); console.log(buildSystemPrompt(c.market.ofertaContent,c));`;
    const router = await new Promise(resolve => execFile(NODE, ['--input-type=module', '-e', script], {
      timeout: 30000, env: { ...process.env, CAREER_OPS_ROOT: scratch, CAREER_OPS_DATA_DIR: scratch },
    }, (error, stdout) => resolve({ error, stdout })));
    check(!router.error && router.stdout.includes(candidate) && router.stdout.includes('duodécimos') && router.stdout.includes('## Machine Summary'), 'OpenRouter uses the same PT context and candidate root');
  }
  for (const file of ['gemini-eval.mjs', 'openai-eval.mjs', 'ollama-eval.mjs', 'openrouter-runner.mjs']) {
    check(readFileSync(join(ROOT, file), 'utf8').includes('loadMarketContext'), `${file} shares market resolution`);
  }
} finally {
  await new Promise(resolve => server.close(resolve));
  rmSync(scratch, { recursive: true, force: true });
}
