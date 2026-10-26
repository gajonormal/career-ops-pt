#!/usr/bin/env node
import { existsSync, readFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { getCareerOpsRoot } from './path-resolver.mjs';
import { withPipelineLock } from './pipeline-lock.mjs';
import { isMainModule } from './lib/is-main-module.mjs';

export function validateFeedback({ url, decision, reason = '' }) {
  if (typeof url !== 'string' || url.length > 2048) throw new Error('URL inválido.');
  const parsed = new URL(url);
  if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error('URL não suportado.');
  if (!['interested', 'not-interested', 'review'].includes(decision)) throw new Error('Decisão inválida.');
  if (typeof reason !== 'string' || reason.length > 1000) throw new Error('Motivo inválido (máximo 1000 caracteres).');
  parsed.hash = '';
  return { url: parsed.href, decision, reason: reason.trim() };
}

export function readFeedback(file) {
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8').split(/\r?\n/).filter(line => line.trim()).map(line => {
    const row = JSON.parse(line);
    return { ...validateFeedback(row), recorded_at: row.recorded_at };
  });
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) { console.log('node opportunity-feedback.mjs [add --url URL --decision interested|not-interested|review --reason MOTIVO] [--json]\nGuarda decisões locais; não altera filtros nem envia candidaturas.'); return; }
  const file = join(getCareerOpsRoot(), 'data', 'opportunity-feedback.jsonl');
  if (args[0] === 'add') {
    const values = {};
    for (let i = 1; i < args.length; i++) {
      if (args[i] === '--json') continue;
      const name = args[i];
      if (!['--url', '--decision', '--reason'].includes(name) || !args[i + 1]) throw new Error('Argumentos inválidos; consultar --help.');
      values[name.slice(2)] = args[++i];
    }
    const entry = { ...validateFeedback(values), recorded_at: new Date().toISOString() };
    mkdirSync(join(getCareerOpsRoot(), 'data'), { recursive: true });
    await withPipelineLock(file, () => {
      readFeedback(file); // Corrupt history is never silently replaced or extended.
      const existing = existsSync(file) ? readFileSync(file, 'utf8') : '';
      const separator = existing && !existing.endsWith('\n') ? '\n' : '';
      appendFileSync(file, separator + JSON.stringify(entry) + '\n', { encoding: 'utf8', mode: 0o600 });
    });
    console.log(JSON.stringify({ ok: true, entry }));
  } else {
    if (args.some(arg => arg !== '--json')) throw new Error('Argumentos inválidos; consultar --help.');
    const entries = readFeedback(file);
    console.log(JSON.stringify({ entries, latest: Object.fromEntries(entries.map(row => [row.url, row])) }));
  }
}
if (isMainModule(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });
