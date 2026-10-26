#!/usr/bin/env node
// Discovery review. Explicit --verify/--save opt-ins; never writes applications.
import { readFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import * as yaml from 'js-yaml';
import { getCareerOpsRoot } from './path-resolver.mjs';
import { isMainModule } from './lib/is-main-module.mjs';
import { buildLocationFilter, buildCountryEligibilityFilter, atomicWriteFile } from './scan.mjs';
import { buildTitleFilter, foldAccents } from './title-keywords.mjs';
import { assessPortugalEligibility } from './lib/us-work-eligibility.mjs';
import { assessSeniority } from './lib/job-seniority.mjs';
import { assessHiringRestrictions } from './lib/hiring-restrictions.mjs';
import { withPipelineLock } from './pipeline-lock.mjs';
import { commuteOptions } from './lib/commute-options.mjs';

const text = value => typeof value === 'string' ? value : '';
const folded = value => foldAccents(text(value)).toLowerCase();
const tokens = value => folded(value).replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const containsPlace = (location, place) => (` ${tokens(location)} `).includes(` ${tokens(place)} `);

export function reviewOpportunities(jobs, config, profile) {
  if (!Array.isArray(jobs)) throw new Error('O ficheiro deve conter uma lista JSON de anúncios.');
  const country = text(profile?.location?.country);
  if (folded(country) !== 'portugal') throw new Error('Este piloto requer location.country: Portugal no perfil.');
  const titleFilter = buildTitleFilter(config?.title_filter);
  const locationFilter = buildLocationFilter(config?.location_filter);
  const countryFilter = buildCountryEligibilityFilter(config?.country_eligibility_filter, country);
  const nearby = (profile?.location?.nearby_locations || []).filter(place => typeof place === 'string' && place.trim());
  const seen = new Set();
  const rows = jobs.map((raw, index) => {
    if (!raw || typeof raw !== 'object' || !text(raw.title).trim()) throw new Error(`Anúncio ${index + 1}: título em falta.`);
    let url;
    try { url = new URL(raw.url); } catch { throw new Error(`Anúncio ${index + 1}: URL inválido.`); }
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error(`Anúncio ${index + 1}: URL não suportado.`);
    url.hash = '';
    const duplicate = seen.has(url.href);
    seen.add(url.href);
    const job = { title: raw.title.trim(), company: text(raw.company), url: url.href, location: text(raw.location), description: text(raw.description) };
    const reasons = [];
    if (!titleFilter(job.title)) reasons.push('title');
    if (!locationFilter(job.location, job.url, job.title)) reasons.push('location');
    if (!countryFilter(job.description)) reasons.push('country-requirement');
    if (duplicate) reasons.push('duplicate-url');
    const places = nearby.filter(place => containsPlace(job.location, place));
    const geography = places.length ? 'nearby-listed' : /\b(?:remote|remoto|remota)\b/i.test(job.location) ? 'remote-unconfirmed' : job.location ? 'other-location' : 'unknown';
    const experienceRequirements = [...job.description.matchAll(/\b(?:at least |minimum of |mínimo de )?\d{1,2}(?:\s*[-–]\s*\d{1,2}|\+)?\s*(?:years?|anos)\s+(?:of |de )?(?:[\p{L}/-]+\s+){0,3}(?:experience|experiência)\b/giu)].map(match => match[0]);
    const hiring = assessHiringRestrictions(job.description, { country, authorizedIn: profile?.location?.authorized_in || [] });
    const eligibility = assessPortugalEligibility(job, { authorizedInPortugal: profile?.compensation?.autorizacao_trabalho_pt === true, usWorkAuthorized: profile?.location?.us_work_authorized, usResident: profile?.location?.us_resident });
    if (hiring.status === 'ineligible' || (hiring.status === 'unknown' && eligibility.status === 'eligible')) {
      eligibility.status = hiring.status;
      eligibility.evidence = hiring.restrictions.find(row => row.status === hiring.status)?.evidence || '';
      eligibility.rule = 'explicit-hiring-restriction';
    }
    return {
      ...job,
      discovery_pass: reasons.length === 0,
      exclusion_reasons: reasons,
      eligibility,
      hiring,
      seniority: assessSeniority(job),
      liveness: { result: 'unverified', reason: 'Ainda não consultado na fonte.' },
      geography: { category: geography, matched_places: places, travel_feasibility: 'unconfirmed', routes: commuteOptions(job.location, profile?.location?.commute_reference_bases || [profile?.location?.city].filter(Boolean)) },
      experience_requirements: [...new Set(experienceRequirements)],
      ...(typeof raw.expected_discovery_pass === 'boolean' ? { expected_discovery_pass: raw.expected_discovery_pass } : {}),
    };
  });
  const labeled = rows.filter(row => typeof row.expected_discovery_pass === 'boolean');
  const tp = labeled.filter(row => row.expected_discovery_pass && row.discovery_pass).length;
  const fp = labeled.filter(row => !row.expected_discovery_pass && row.discovery_pass).length;
  const fn = labeled.filter(row => row.expected_discovery_pass && !row.discovery_pass).length;
  // No guessed relevance score: stable groups, original order within each group.
  const order = row => !row.discovery_pass || row.eligibility.status === 'ineligible' ? 100 : ({ junior: 0, unknown: 10, stretch: 20, conflicting: 30, experienced: 40 }[row.seniority.level]) + (row.geography.category === 'nearby-listed' ? 0 : row.geography.category === 'remote-unconfirmed' ? 1 : 2);
  rows.sort((a, b) => order(a) - order(b));
  return {
    version: 'careerops.discovery-review@1',
    generated_at: new Date().toISOString(),
    scope: 'discovery-seniority-country-liveness',
    limitations: ['Validade apenas confirmada nas fontes efetivamente consultadas com --verify; os restantes anúncios ficam por verificar. Não substitui a avaliação de competências, salário, blacklist ou histórico de candidaturas.', 'A elegibilidade é preliminar; confirmar país de contratação e condições na fonte.', 'Localidades configuradas não são distâncias nem tempos de viagem. Não se excluem vagas pela distância.'],
    counts: { total: rows.length, discovery_pass: rows.filter(row => row.discovery_pass).length, unknown_eligibility: rows.filter(row => row.eligibility.status === 'unknown').length },
    metrics: { labeled: labeled.length, true_positive: tp, false_positive: fp, false_negative: fn, precision: tp + fp ? tp / (tp + fp) : null, recall: tp + fn ? tp / (tp + fn) : null },
    rows,
  };
}

export function formatReview(result) {
  const cell = value => text(value).replace(/[\r\n|]/g, ' ').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([\\`*_\[\]()!])/g, '\\$1');
  const labels = { eligible: 'Compatível com Portugal (preliminar)', ineligible: 'Incompatível', unknown: 'Por confirmar' };
  const reasons = { title: 'Título fora dos filtros', location: 'Localização fora dos filtros', 'country-requirement': 'Requisito de país incompatível', 'duplicate-url': 'URL duplicado' };
  const rules = { 'missing-description': 'Descrição em falta', 'hiring-country-unconfirmed': 'País de contratação por confirmar', 'candidate-authorization-unconfirmed': 'Autorização do candidato por confirmar', 'explicit-us-requirement': 'Requisito americano obrigatório', 'explicit-hiring-restriction': 'Restrição explícita de contratação' };
  const levels = { junior: 'Júnior', stretch: 'Mais exigente', experienced: 'Experiente', conflicting: 'Título e requisitos em conflito', unknown: 'Por confirmar' };
  const live = { active: 'Aberto na última consulta', expired: 'Expirado', uncertain: 'Verificação inconclusiva', unverified: 'Por verificar' };
  return [
    '# Piloto de pesquisa de oportunidades', '',
    `${result.counts.total} anúncios; ${result.counts.discovery_pass} passam os filtros de descoberta; ${result.counts.unknown_eligibility} com elegibilidade por confirmar.`, '',
    ...result.limitations.map(note => `- ${note}`), '',
    '| Empresa / função | Localização | Descoberta | Elegibilidade | Evidência / motivo | Senioridade | Validade | Fonte |',
    '|---|---|---|---|---|---|---|---|',
    ...result.rows.map(row => `| ${cell(row.company)} — ${cell(row.title)} | ${cell(row.location) || 'Por confirmar'} | ${row.discovery_pass ? 'Rever' : cell(row.exclusion_reasons.map(reason => reasons[reason] || reason).join(', '))} | ${labels[row.eligibility.status]} | ${cell(row.eligibility.evidence) || cell(rules[row.eligibility.rule] || row.eligibility.rule)} | ${levels[row.seniority.level]}: ${cell(row.experience_requirements.join('; ')) || 'Consultar descrição'} | ${live[row.liveness.result]} | ${row.url.replace(/[|()[\]]/g, char => '%' + char.charCodeAt(0).toString(16).toUpperCase())} |`),
    '', `Métricas: ${result.metrics.labeled} anúncios com classificação de referência. Precisão: ${result.metrics.precision === null ? 'não medida' : result.metrics.precision.toFixed(3)}; cobertura da amostra: ${result.metrics.recall === null ? 'não medida' : result.metrics.recall.toFixed(3)}.`, '',
  ].join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('node review-opportunities.mjs --input anuncios.json [--json] [--verify] [--verify-limit 30] [--save]\nLista JSON: [{title,url,company,location,description,expected_discovery_pass?}].\n--verify consulta as fontes; --save guarda a revisão local para a interface. Não escreve candidaturas.');
    return;
  }
  const flags = new Set(['--input', '--json', '--verify', '--save', '--verify-limit']);
  for (let i = 0; i < args.length; i++) {
    if (!flags.has(args[i])) throw new Error(`Argumento desconhecido: ${args[i]}`);
    if (['--input', '--verify-limit'].includes(args[i]) && (!args[++i] || args[i].startsWith('--'))) throw new Error('Argumento exige um valor.');
  }
  const index = args.indexOf('--input');
  if (index < 0) throw new Error('Indica --input anuncios.json; consulta --help.');
  const root = getCareerOpsRoot();
  const profile = yaml.load(readFileSync(process.env.CAREER_OPS_PROFILE || join(root, 'config/profile.yml'), 'utf8'));
  const config = yaml.load(readFileSync(process.env.CAREER_OPS_PORTALS || join(root, 'portals.yml'), 'utf8'));
  const input = JSON.parse(readFileSync(resolve(args[index + 1]), 'utf8'));
  const result = reviewOpportunities(Array.isArray(input) ? input : input?.rows, config, profile);
  if (args.includes('--verify')) {
    const { verifyOpportunities } = await import('./lib/opportunity-verification.mjs');
    const limitIndex = args.indexOf('--verify-limit');
    result.rows = await verifyOpportunities(result.rows, { limit: limitIndex < 0 ? 30 : Number(args[limitIndex + 1]) });
  }
  if (args.includes('--save')) {
    const file = join(root, 'data', 'opportunity-review.json');
    mkdirSync(join(root, 'data'), { recursive: true });
    await withPipelineLock(file, () => atomicWriteFile(file, JSON.stringify(result, null, 2) + '\n'));
  }
  console.log(args.includes('--json') ? JSON.stringify(result, null, 2) : formatReview(result));
}

if (isMainModule(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
