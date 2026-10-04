#!/usr/bin/env node
// Snabb förhandsvisning: sparar enstaka bildrutor som PNG.
//   pnpm frames -- 12 47.5 118 --out out/preview --w 1280 --h 720
import { createServer } from 'node:http';
import { existsSync, mkdirSync, createReadStream, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Repo-roten; utdata hamnar i out/ där.
const root = resolve(fileURLToPath(import.meta.url), '../../..');
const filmDir = join(root, 'packages/film');
const argv = process.argv.slice(2).filter((a) => a !== '--');
const opt = (k, d) => {
  const i = argv.indexOf('--' + k);
  return i >= 0 ? argv[i + 1] : d;
};
const times = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--'))).map(Number);
const W = Number(opt('w', 1280)),
  H = Number(opt('h', 720));
const out = resolve(root, opt('out', 'out/preview'));
const q = opt('q', 'high');
mkdirSync(out, { recursive: true });
const dist = join(filmDir, 'dist');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  const p = join(dist, url === '/' ? 'index.html' : url);
  if (!existsSync(p) || statSync(p).isDirectory()) {
    res.writeHead(404);
    return res.end();
  }
  res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' });
  createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const { chromium } = await import('playwright');
const browser = await chromium.launch({
  headless: true,
  executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined,
  args:
    process.env.RENDER_GL === 'swiftshader'
      ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
      : ['--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('console', (m) => {
  if ((m.type() === 'error' || m.type() === 'warning') && !/useProgram|GL Driver Message/.test(m.text()))
    console.log('[page]', m.text().slice(0, 4000));
});
page.on('pageerror', (e) => console.log('[page error]', e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/?render=1&w=${W}&h=${H}&q=${q}`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 0 });
for (const t of times) {
  const t0 = Date.now();
  await page.evaluate((tt) => window.__film.renderAt(tt), t);
  const f = join(out, `t${t.toFixed(2).padStart(6, '0')}.png`);
  await page.screenshot({ path: f });
  console.log(f, `${Date.now() - t0} ms`);
}
await browser.close();
server.close();
