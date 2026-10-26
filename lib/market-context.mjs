import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { isAbsolute, join, relative, resolve } from 'node:path';
import * as yaml from 'js-yaml';

const EVALUATION_FILES = ['oferta.md', 'angebot.md', 'offre.md', 'fursah.md', 'kyujin.md', 'is-ilani.md', 'naukri.md'];

/** Resolve market context from code, never from candidate-owned directories.
 * An invalid primary falls back to the base, never promotes a secondary market.
 */
export function resolveMarketModes(codeRoot, profileYaml = '', { warn = console.warn } = {}) {
  let profile;
  const source = String(profileYaml).replace(/^\uFEFF/, '');
  try { profile = source.trim() ? (yaml.load(source) || {}) : {}; }
  catch (err) { warn(`Could not parse config/profile.yml: ${err.message}`); }
  const raw = profile?.language?.modes_dir;
  const candidates = raw ? (Array.isArray(raw) ? raw : [raw]) : ['modes'];
  const root = realpathSync(codeRoot);
  const validate = (dir) => {
    if (typeof dir !== 'string' || !dir.trim() || isAbsolute(dir)) return null;
    const path = resolve(root, dir);
    if (!existsSync(path)) { warn(`modes_dir "${dir}" not found; skipping`); return null; }
    const rel = relative(root, realpathSync(path));
    if (rel === '..' || rel.startsWith('../') || rel.startsWith('..\\') || isAbsolute(rel)) {
      warn(`modes_dir "${dir}" escapes project root; skipping`); return null;
    }
    return relative(root, path).replaceAll('\\', '/');
  };
  const primary = validate(candidates[0]);
  const evaluationFile = primary && EVALUATION_FILES.find(file => existsSync(join(root, primary, file)));
  const extras = candidates.slice(1).map(validate).filter(Boolean);
  const directories = [...new Set(evaluationFile ? [primary, ...extras] : ['modes', ...(primary ? [primary] : []), ...extras])];
  if (primary && !evaluationFile) warn(`No matching evaluation file found in ${primary}; using default modes/oferta.md`);
  return { directories, evaluationFile: evaluationFile || 'oferta.md', primary: directories[0] };
}

/** Read the canonical contracts plus the selected market's supplement.
 * Portuguese files extend the common contracts, avoiding a drifting copy.
 */
export function loadMarketContext(codeRoot, profileYaml = '', options = {}) {
  const market = resolveMarketModes(codeRoot, profileYaml, options);
  const read = path => existsSync(join(codeRoot, path)) ? readFileSync(join(codeRoot, path), 'utf8').trim() : '';
  const sharedPaths = [...new Set(market.directories.flatMap(dir => dir === 'modes/pt'
    ? ['modes/_shared.md', 'modes/pt/_shared.md'] : [`${dir}/_shared.md`]))];
  const evaluationPath = `${market.primary}/${market.evaluationFile}`;
  const evaluationPaths = market.primary === 'modes/pt' ? ['modes/oferta.md', evaluationPath] : [evaluationPath];
  const combine = paths => paths.map(path => `<!-- context: ${path} -->\n${read(path)}`).join('\n\n');
  return { ...market, evaluationPath, sharedContent: combine(sharedPaths), ofertaContent: combine(evaluationPaths) };
}

export function loadMarketMode(codeRoot, profileYaml, mode, options = {}) {
  // Mode is a program identifier, never a path supplied by a posting.
  if (!/^[a-z-]+(?:\/[a-z-]+)?$/.test(mode)) throw new Error(`Invalid mode: ${mode}`);
  const market = resolveMarketModes(codeRoot, profileYaml, options);
  const localized = join(codeRoot, market.primary, `${mode}.md`);
  const baseline = join(codeRoot, 'modes', `${mode}.md`);
  const paths = market.primary === 'modes/pt' && existsSync(localized)
    ? [...new Set([baseline, localized])] : [existsSync(localized) ? localized : baseline];
  return paths.filter(existsSync).map(path => readFileSync(path, 'utf8').trim()).join('\n\n');
}
