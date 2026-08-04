#!/usr/bin/env node
// Repo verification — the checks docs/definition-of-done.md promises.
// No dependencies beyond the sass devDependency; everything else is grep-grade
// checks of the repo's own hard rules (docs/frontend-rules.md).
//
//   FAIL (exit 1): built CSS out of sync · raw colour outside the tokens file
//   raw width @media outside _breakpoints.scss · inline styles in templates
//   unbalanced structural tags
//   WARN (exit 0): href="#" counts · images without srcset (the top port task)

import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync, mkdtempSync } from 'node:fs';
import { join, relative } from 'node:path';
import { tmpdir } from 'node:os';

const root = new URL('..', import.meta.url).pathname;
let failures = 0;
const fail = (msg) => { failures++; console.error('FAIL  ' + msg); };
const warn = (msg) => console.warn('warn  ' + msg);
const ok = (msg) => console.log('ok    ' + msg);

const walk = (dir, ext) =>
  readdirSync(join(root, dir)).flatMap((name) => {
    const p = join(root, dir, name);
    if (statSync(p).isDirectory()) return walk(join(dir, name), ext);
    return name.endsWith(ext) ? [p] : [];
  });

// 1. Built CSS in sync with the SCSS — css/main.css is committed (GitHub Pages
// serves it), so a stale build ships stale styles.
{
  const out = join(mkdtempSync(join(tmpdir(), 'gp-verify-')), 'main.css');
  execFileSync('npx', ['--no-install', 'sass', 'scss/main.scss', out, '--no-source-map', '--quiet-deps', '--quiet'], { cwd: root, stdio: ['ignore', 'ignore', 'ignore'] });
  const built = readFileSync(out, 'utf8');
  const committed = readFileSync(join(root, 'css/main.css'), 'utf8');
  built === committed ? ok('css/main.css matches a fresh sass build') : fail('css/main.css is OUT OF SYNC — run npm run build and commit it');
}

// 2. Raw colour values outside scss/tokens/_colors.scss. rgba($token, a) is
// legal anywhere (an alpha applied TO a token); literal channels are not.
{
  const bad = [];
  for (const f of walk('scss', '.scss')) {
    if (f.endsWith('tokens/_colors.scss')) continue;
    readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      const code = line.split('//')[0];
      if (/(rgba?|hsla?)\(\s*\d/.test(code)) bad.push(`${relative(root, f)}:${i + 1} literal colour function`);
      const noTokens = code.replace(/#\{\$[^}]*\}/g, ''); // strip #{$token} interpolations
      if (/#[0-9a-fA-F]{3,8}\b/.test(noTokens)) bad.push(`${relative(root, f)}:${i + 1} hex literal`);
    });
  }
  bad.length ? bad.forEach((b) => fail('colour outside tokens: ' + b)) : ok('no raw colour outside tokens/_colors.scss');
}

// 3. Raw width media queries outside abstracts/_breakpoints.scss —
// respond-to()/respond-between()/short() are the only sanctioned writers.
// prefers-* feature queries are allowed anywhere (reduced motion etc.).
{
  const bad = [];
  for (const f of walk('scss', '.scss')) {
    if (f.endsWith('abstracts/_breakpoints.scss')) continue;
    readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      // prefers-* feature queries are fine anywhere; so is a query keyed to
      // $container-max-width — abstracts/_variables.scss sanctions testing
      // against that variable ("anything keyed to 'the page has stopped
      // growing'"), and the breakpoint map cannot express it.
      if (/@media/.test(line) && !/prefers-|\$container-max-width/.test(line)) bad.push(`${relative(root, f)}:${i + 1}`);
    });
  }
  bad.length ? bad.forEach((b) => fail('raw @media: ' + b)) : ok('no raw width @media outside _breakpoints.scss');
}

// 4 + 5 + warnings, per template.
{
  const pages = [join(root, 'index.html'), ...walk('templates', '.html')];
  const tags = ['div', 'section', 'article', 'main', 'header', 'footer', 'form', 'fieldset', 'details', 'ul', 'ol'];
  let styleBad = 0, balanceBad = 0, hashTotal = 0, srcsetMissing = [];
  for (const f of pages) {
    // Comments and script bodies talk ABOUT markup ("<details> wrapper is the
    // theme's") — strip both so only rendered tags are counted.
    const src = readFileSync(f, 'utf8')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<script[\s\S]*?<\/script>/g, '<script></script>');
    const name = relative(root, f);
    const styles = [...src.matchAll(/style="([^"]*)"/g)].filter((m) => !/^--animate-delay:/.test(m[1]));
    if (styles.length) { styleBad++; fail(`inline style in ${name}: ${styles.length}× (first: ${styles[0][1].slice(0, 40)})`); }
    for (const t of tags) {
      const open = (src.match(new RegExp(`<${t}(\\s|>)`, 'g')) || []).length;
      const close = (src.match(new RegExp(`</${t}>`, 'g')) || []).length;
      if (open !== close) { balanceBad++; fail(`unbalanced <${t}> in ${name}: ${open} open / ${close} close`); }
    }
    hashTotal += (src.match(/href="#"/g) || []).length;
    if (/<img /.test(src) && !/srcset/.test(src)) srcsetMissing.push(name);
  }
  if (!styleBad) ok('no inline styles beyond --animate-delay');
  if (!balanceBad) ok('structural tags balance in every page');
  warn(`href="#" placeholders across pages: ${hashTotal} (expected in the prototype — real routes listed in docs/handover.md)`);
  if (srcsetMissing.length) warn(`no srcset in ${srcsetMissing.length} page(s) — the #1 port task (LESSONS.md, docs/handover.md)`);
}

console.log(failures ? `\n${failures} failure(s)` : '\nverify: all checks passed');
process.exit(failures ? 1 : 0);
