import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(__dirname, '..');
const require = createRequire(import.meta.url);
const pkg = require(join(pkgRoot, 'package.json'));

const outDir = process.argv[2] || 'public';
const absOut = join(pkgRoot, outDir);
mkdirSync(absOut, { recursive: true });

let gitSha = process.env.GIT_SHA?.trim() || '';
if (!gitSha) {
  try {
    gitSha = execSync('git rev-parse --short HEAD', {
      cwd: pkgRoot,
      encoding: 'utf8',
    }).trim();
  } catch {
    gitSha = '';
  }
}

const deployVersion =
  process.env.DEPLOY_VERSION?.trim() || gitSha || pkg.version || '0.0.0';

const payload = {
  name: pkg.name,
  version: pkg.version,
  deployVersion,
  gitSha: gitSha || null,
  builtAt: new Date().toISOString(),
};

writeFileSync(join(absOut, 'version.json'), `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${join(absOut, 'version.json')}`);
