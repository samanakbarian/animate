#!/usr/bin/env node
// Renderar filmen till MP4 (H.264, 1920×1080 med svarta balkar för 2,39:1).
//
//   pnpm render                          # hela filmen, 30 fps
//   pnpm render -- --fps 60           # 60 fps
//   pnpm render -- --from 100 --to 110 --out out/asi.mp4
//   pnpm render -- --q medium         # snabbare testrendering
//
// 1. Bygger filmens fristående sida (packages/film) och serverar dess dist/ lokalt.
// 2. Startar headless Chromium (Playwright) med GPU aktiverad.
// 3. Stegar t bildruta för bildruta och sparar varje bildruta som PNG.
// 4. Renderar ljudet separat med OfflineAudioContext (samma sequencer) till WAV.
// 5. Sätter ihop bild och ljud med ffmpeg.

import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, rmSync, writeFileSync, createReadStream, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Repo-roten; utdata hamnar i out/ där.
const root = resolve(fileURLToPath(import.meta.url), '../../..');
const filmDir = join(root, 'packages/film');
const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a !== '--')
    .reduce((acc, a, i, arr) => {
      if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
      return acc;
    }, []),
);
const fps = Number(args.fps ?? 30);
const W = Number(args.w ?? 1920);
const H = Number(args.h ?? 1080);
const from = Number(args.from ?? 0);
const to = Number(args.to ?? 150);
const quality = args.q ?? 'high';
const outFile = resolve(root, args.out ?? 'out/nasta-steg.mp4');
const framesDir = resolve(root, args.frames ?? 'out/frames');
const keepFrames = !!args['keep-frames'];
const skipBuild = !!args['skip-build'];

let ffmpeg = 'ffmpeg';
try {
  ffmpeg = (await import('ffmpeg-static')).default || 'ffmpeg';
} catch {
  // ffmpeg-static saknas – använd ffmpeg från PATH.
}

function log(...a) {
  console.log('[render]', ...a);
}

// --- 1. Bygg och servera
if (!skipBuild) {
  log('bygger…');
  const r = spawnSync('pnpm', ['--filter', '@nastasteg/film', 'build'], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
const dist = join(filmDir, 'dist');
const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
};
const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  let p = join(dist, url === '/' ? 'index.html' : url);
  if (!p.startsWith(dist) || !existsSync(p) || statSync(p).isDirectory()) {
    res.writeHead(404);
    return res.end();
  }
  res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' });
  createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
log(`serverar dist/ på http://127.0.0.1:${port}`);

// --- 2. Headless Chromium med GPU
const { chromium } = await import('playwright');
const gpuArgs =
  (process.env.RENDER_GL ?? 'gpu') === 'swiftshader'
    ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
    : ['--enable-gpu', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--use-angle=default', '--enable-unsafe-swiftshader'];
const launchOpts = { headless: true, args: [...gpuArgs, '--autoplay-policy=no-user-gesture-required', '--hide-scrollbars'] };
if (process.env.CHROMIUM_PATH) launchOpts.executablePath = process.env.CHROMIUM_PATH;
else if (existsSync('/opt/pw-browsers/chromium')) launchOpts.executablePath = '/opt/pw-browsers/chromium';
const browser = await chromium.launch(launchOpts);
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on('console', (m) => {
  if ((m.type() === 'error' || m.type() === 'warning') && !/GL Driver Message|favicon/.test(m.text())) console.log('[page]', m.text());
});
page.on('pageerror', (e) => console.log('[page error]', e.message));
await page.goto(`http://127.0.0.1:${port}/?render=1&w=${W}&h=${H}&q=${quality}`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 0 });
const renderer = await page.evaluate(() => {
  const gl = document.querySelector('canvas').getContext('webgl2');
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
});
log('GPU:', renderer);
if (/swiftshader|llvmpipe/i.test(renderer)) log('OBS: mjukvarurendering – det kommer att gå långsamt.');

// --- 4. Ljud (görs först, går snabbt)
mkdirSync(join(root, 'out'), { recursive: true });
const wavPath = resolve(root, 'out/audio.wav');
log('renderar ljud med OfflineAudioContext…');
const wavLen = await page.evaluate(() => window.__film.renderAudio(48000));
const chunks = [];
const CH = 4 * 1024 * 1024;
for (let o = 0; o < wavLen; o += CH)
  chunks.push(Buffer.from(await page.evaluate(([a, b]) => window.__film.wavChunk(a, b), [o, CH]), 'base64'));
writeFileSync(wavPath, Buffer.concat(chunks));
log(`ljud: ${wavPath} (${(wavLen / 1e6).toFixed(1)} MB)`);

// --- 3. Bildrutor
if (existsSync(framesDir) && !args['resume']) rmSync(framesDir, { recursive: true, force: true });
mkdirSync(framesDir, { recursive: true });
const first = Math.round(from * fps);
const last = Math.round(to * fps);
const started = Date.now();
for (let f = first; f < last; f++) {
  const file = join(framesDir, `f${String(f - first).padStart(6, '0')}.png`);
  if (args['resume'] && existsSync(file)) continue;
  const t = f / fps;
  await page.evaluate((tt) => window.__film.renderAt(tt), t);
  await page.screenshot({ path: file, type: 'png', clip: { x: 0, y: 0, width: W, height: H } });
  if ((f - first) % Math.max(1, fps) === 0) {
    const done = f - first + 1;
    const el = (Date.now() - started) / 1000;
    const eta = (el / done) * (last - f - 1);
    log(`bildruta ${done}/${last - first}  t=${t.toFixed(2)}s  ${(done / el).toFixed(2)} bilder/s  kvar ~${Math.round(eta)} s`);
  }
}
await browser.close();
server.close();

// --- 5. ffmpeg
log('sätter ihop med ffmpeg…');
const ff = spawn(
  ffmpeg,
  [
    '-y',
    '-framerate',
    String(fps),
    '-i',
    join(framesDir, 'f%06d.png'),
    '-ss',
    String(from),
    '-t',
    String(to - from),
    '-i',
    wavPath,
    '-map',
    '0:v',
    '-map',
    '1:a',
    '-c:v',
    'libx264',
    '-preset',
    args.preset ?? 'slow',
    '-crf',
    String(args.crf ?? 16),
    '-pix_fmt',
    'yuv420p',
    '-profile:v',
    'high',
    '-movflags',
    '+faststart',
    '-vf',
    `scale=${W}:${H}:flags=lanczos,format=yuv420p`,
    '-c:a',
    'aac',
    '-b:a',
    '256k',
    '-shortest',
    outFile,
  ],
  { stdio: 'inherit' },
);
const code = await new Promise((r) => ff.on('close', r));
if (code !== 0) {
  console.error('ffmpeg misslyckades');
  process.exit(code ?? 1);
}
if (!keepFrames) rmSync(framesDir, { recursive: true, force: true });
log(`klart: ${outFile}`);
