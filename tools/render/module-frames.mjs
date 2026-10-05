#!/usr/bin/env node
// Stillbilder av en modul på hemsidan – snabb visuell kontroll.
//
//   pnpm module-frames -- sprakmodellen 5 30 55 --part 1 --w 1280 --h 900 --mobile
//
// Bygger INTE sajten: kör `pnpm build` först. Serverar apps/web/dist själv,
// spolar modulens del (--part, 1-baserad) till varje tid och sparar scenen
// som PNG i out/module-frames/<slug>/. Fel i konsolen skrivs ut.

import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '../../..');
const argv = process.argv.slice(2).filter((a) => a !== '--');
const opt = (k, d) => {
  const i = argv.indexOf('--' + k);
  return i >= 0 ? argv[i + 1] : d;
};
const flag = (k) => argv.includes('--' + k);
const positional = argv.filter(
  (a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--') && !['--mobile'].includes(argv[i - 1])),
);
const [slug, ...timesRaw] = positional;
if (!slug) {
  console.error('Användning: pnpm module-frames -- <slug> <t1> <t2> … [--part 1] [--w 1280] [--h 900] [--mobile]');
  process.exit(1);
}
const times = timesRaw.map(Number);
const part = Number(opt('part', 1));
const W = Number(opt('w', 1280));
const H = Number(opt('h', 900));
const out = resolve(root, opt('out', `out/module-frames/${slug}`));
mkdirSync(out, { recursive: true });

// Egen statisk server för apps/web/dist (Astro 7:s preview körs som delad demon).
const dist = join(root, 'apps/web/dist');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
};
const server = createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p.endsWith('/')) p += 'index';
  let file = join(dist, p);
  if (!extname(file)) file += '.html';
  if (!file.startsWith(dist) || !existsSync(file) || statSync(file).isDirectory()) {
    res.writeHead(404);
    return res.end();
  }
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const { chromium } = await import('playwright');
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium',
  args: ['--enable-unsafe-swiftshader'],
});
const errors = [];
const viewports = [['desktop', W, H]];
if (flag('mobile')) viewports.push(['mobil', 390, 844]);
try {
  for (const [name, vw, vh] of viewports) {
    const page = await browser.newPage({ viewport: { width: vw, height: vh } });
    page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
    page.on('console', (m) => m.type() === 'error' && errors.push(`${name}: ${m.text()}`));
    await page.goto(`${base}/moduler/${slug}`);
    const sel = `.module-part:nth-of-type(${part}) .nsm-stage`;
    await page.waitForSelector(sel, { timeout: 15000 });
    for (const t of times) {
      await page.evaluate(
        ([p, tt]) => {
          const r = document.querySelectorAll('.nsm-scrub input')[p - 1];
          r.value = String(tt);
          r.dispatchEvent(new Event('input'));
        },
        [part, t],
      );
      await page.waitForTimeout(350);
      const file = join(out, `${name}-del${part}-t${String(t).padStart(5, '0')}.png`);
      await (await page.$(sel)).screenshot({ path: file });
      console.log(file);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) errors.push(`${name}: sidan scrollar i sidled`);
  }
} finally {
  await browser.close();
  server.close();
}
if (errors.length) {
  console.error('Fel:', errors);
  process.exitCode = 1;
} else console.log('Inga fel i konsolen.');
