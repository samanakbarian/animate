import './style.css';
import { Film } from './film';
import type { Quality } from './fx/post';
import { AudioEngine, encodeWav, renderOffline } from './audio/engine';
import { DURATION } from './timeline';

const params = new URLSearchParams(location.search);
const exportMode = params.has('render');
const dev = params.has('dev');
const startAt = Number(params.get('t') ?? 0) || 0;

function detectQuality(): Quality {
  const q = params.get('q');
  if (q === 'low' || q === 'medium' || q === 'high') return q;
  const c = document.createElement('canvas');
  const gl = c.getContext('webgl2');
  if (!gl) return 'low';
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const name = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
  const mobile = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
  if (mobile) return 'low';
  if (/swiftshader|llvmpipe|software/i.test(name)) return 'low';
  if (/intel|iris|uhd|mali|adreno|powervr|apple gpu|radeon\(tm\) graphics|vega \d+ graphics/i.test(name)) return 'medium';
  return 'high';
}

async function main() {
  const app = document.getElementById('app')!;
  if (exportMode) {
    const w = Number(params.get('w') ?? 1920);
    const h = Number(params.get('h') ?? 1080);
    document.getElementById('start')?.classList.add('hidden');
    const film = new Film(app, { quality: (params.get('q') as Quality) || 'high', fixedSize: { w, h } });
    await document.fonts.ready;
    await film.warmup();
    // API för export/render.mjs
    (window as any).__film = {
      duration: DURATION,
      renderAt: (t: number) => {
        film.renderAt(t);
        return film.renderer.getContext().finish();
      },
      renderAudio: async (sampleRate = 48000) => {
        const buf = await renderOffline(sampleRate);
        const wav = new Uint8Array(encodeWav(buf));
        (window as any).__wav = wav;
        return wav.length;
      },
      wavChunk: (offset: number, len: number) => {
        const wav: Uint8Array = (window as any).__wav;
        let s = '';
        const end = Math.min(wav.length, offset + len);
        for (let i = offset; i < end; i += 0x8000) s += String.fromCharCode(...wav.subarray(i, Math.min(end, i + 0x8000)));
        return btoa(s);
      },
    };
    (window as any).__filmObj = film;
    (window as any).__ready = true;
    return;
  }

  const quality = detectQuality();
  const startEl = document.getElementById('start')!;
  const btn = startEl.querySelector('button')!;
  const status = startEl.querySelector('.status') as HTMLElement;
  const qInputs = startEl.querySelectorAll<HTMLInputElement>('input[name=q]');
  qInputs.forEach((i) => (i.checked = i.value === quality));

  let film: Film | null = null;
  const build = async (q: Quality) => {
    btn.disabled = true;
    status.textContent = 'förbereder…';
    await document.fonts.ready;
    app.innerHTML = '';
    film = new Film(app, { quality: q });
    await film.warmup((k) => (status.textContent = `förbereder ${Math.round(k * 100)} %`));
    film.renderAt(startAt);
    status.textContent = '';
    btn.disabled = false;
    return film;
  };
  let builtQ: Quality = quality;
  await build(quality);
  qInputs.forEach((i) =>
    i.addEventListener('change', async () => {
      builtQ = i.value as Quality;
      await build(builtQ);
    }),
  );

  btn.addEventListener('click', async () => {
    if (!film) return;
    startEl.classList.add('hidden');
    const ctx = new AudioContext({ latencyHint: 'playback' });
    await ctx.resume();
    const engine = new AudioEngine(ctx);
    let t0 = startAt;
    let paused = false;
    let pausedAt = 0;
    const begin = (t: number) => {
      engine.begin(t, ctx.currentTime + 0.12);
    };
    begin(t0);
    const devEl = dev ? Object.assign(document.createElement('div'), { id: 'dev' }) : null;
    if (devEl) document.body.appendChild(devEl);
    const seek = (t: number) => {
      t = Math.max(0, Math.min(DURATION - 0.01, t));
      engine.master.gain.cancelScheduledValues(0);
      // nytt ljudmotor-träd för att slippa redan schemalagda noder
      void ctx.close();
      location.search = `?${new URLSearchParams({ ...Object.fromEntries(params), t: t.toFixed(2), autoplay: '1' })}`;
    };
    if (dev) {
      window.addEventListener('keydown', (e) => {
        const now = paused ? pausedAt : ctx.currentTime - engine.origin;
        if (e.key === 'ArrowRight') seek(now + 5);
        if (e.key === 'ArrowLeft') seek(now - 5);
        if (e.key === ' ') {
          paused = !paused;
          if (paused) {
            pausedAt = now;
            void ctx.suspend();
          } else void ctx.resume();
        }
      });
    }

    // Adaptiv kvalitet: sänk upplösningen om bildrutorna tar för lång tid.
    let acc = 0, n = 0, last = performance.now();
    const loop = () => {
      const f = film!;
      const t = paused ? pausedAt : ctx.currentTime - engine.origin;
      const tc = Math.max(0, Math.min(DURATION, t));
      engine.scheduleUntil(tc + 0.4);
      f.renderAt(tc);
      const now = performance.now();
      const dt = now - last;
      last = now;
      if (tc > 1 && !paused) {
        acc += dt;
        n++;
        if (n >= 90) {
          const avg = acc / n;
          if (avg > 19) f.setDynamicScale(f.dynamicScale * 0.85);
          else if (avg < 13 && f.dynamicScale < 1) f.setDynamicScale(f.dynamicScale * 1.08);
          acc = 0;
          n = 0;
        }
      }
      if (devEl) devEl.textContent = `t ${tc.toFixed(2)}  ${(1000 / Math.max(1, dt)).toFixed(0)} fps  q=${builtQ} scale=${f.dynamicScale.toFixed(2)}`;
      if (tc < DURATION) requestAnimationFrame(loop);
      else {
        startEl.classList.remove('hidden');
        btn.textContent = 'SPELA IGEN';
        btn.onclick = () => location.reload();
      }
    };
    requestAnimationFrame(loop);
  });
  if (params.get('autoplay') === '1') {
    status.textContent = 'klicka för att fortsätta';
  }
}

main().catch((e) => {
  console.error(e);
  const s = document.querySelector('#start .status');
  if (s) s.textContent = 'Fel: ' + (e?.message ?? e);
});
