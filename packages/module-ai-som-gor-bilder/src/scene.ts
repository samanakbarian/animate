// Bilden i pixlar till vänster (överst på mobil). Bredvid: texten som styr,
// hur många steg som tagits och hur mycket brus som finns kvar.

import { PALETTE as C, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { GH, GW, PROMPTS, STEPS, frame, noiseLeft } from './diffuse';
import { TRAINING } from './timeline';

export function createScene(host: HTMLElement): ModuleScene {
  const S = createSurface(host);
  const { ctx } = S;
  const pix = document.createElement('canvas');
  pix.width = GW;
  pix.height = GH;
  const pctx = pix.getContext('2d')!;
  const data = pctx.createImageData(GW, GH);

  function paint(prompt: number, seed: number, step: number) {
    const img = frame(prompt, seed, step);
    for (let i = 0; i < GW * GH; i++) {
      for (let ch = 0; ch < 3; ch++) data.data[i * 4 + ch] = Math.round(Math.min(1, Math.max(0, img[i * 3 + ch])) * 255);
      data.data[i * 4 + 3] = 255;
    }
    pctx.putImageData(data, 0, 0);
  }

  function render(t: number, params: Params, mode: Mode) {
    const W = S.width,
      H = S.height,
      T = S.tall;
    const s = T ? W / 54 : Math.min(W, H * 1.78) / 100;
    const prompt = Math.round(params.prompt),
      seed = Math.round(params.seed),
      step = params.step;
    const training = mode === 'film' && t >= TRAINING.start && t < TRAINING.end;
    S.clear();
    paint(prompt, seed, step);

    // bildens plats
    const iw = T ? Math.min(W * 0.84, H * 0.44 * (GW / GH)) : Math.min(W * 0.5, H * 0.58 * (GW / GH));
    const ih = iw * (GH / GW);
    const ix = T ? (W - iw) / 2 : W * 0.06;
    const iy = T ? H * 0.1 : H * 0.08;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(pix, ix, iy, iw, ih);
    ctx.strokeStyle = C.line;
    ctx.strokeRect(ix - 0.5, iy - 0.5, iw + 1, ih + 1);

    // panelen: på mobil texten ovanför bilden och stegen under, annars till höger
    const px = T ? ix : ix + iw + 5 * s;
    const pw = T ? iw : W * 0.94 - px;
    const textY = T ? H * 0.05 : iy + 1.5 * s;
    S.text('TEXT', px, textY, 1.3 * s, C.dim);
    S.text(
      `”${PROMPTS[prompt]}”`,
      px + (T ? 7 * s : 0),
      textY + (T ? 0 : 3.4 * s),
      (T ? 2.1 : 2.3) * s,
      C.ink,
      'left',
      'Inter, sans-serif',
    );

    const sy = T ? iy + ih + 3.5 * s : iy + 12 * s;
    const left = noiseLeft(step);
    S.text(training ? (T ? 'TRÄNING' : 'TRÄNING · BRUS LÄGGS TILL') : 'STEG', px, sy, 1.3 * s, training ? rgba(C.warm, 1) : C.dim);
    const stepText = `${Math.round(step)} av ${STEPS}`;
    S.text(T ? `${stepText} · brus ${Math.round(left * 100)} %` : stepText, px + pw, sy, 1.5 * s, C.ink, 'right');
    const gap = 0.35 * s,
      bw = (pw - gap * (STEPS - 1)) / STEPS;
    for (let i = 0; i < STEPS; i++) {
      const on = i < Math.round(step);
      ctx.fillStyle = on ? rgba(training ? C.warm : C.cold, 0.85) : C.line;
      ctx.fillRect(px + i * (bw + gap), sy + 2 * s, bw, 1.6 * s);
    }

    // på mobil räcker raden ovanför, så texten under bilden får plats
    if (T) return;
    const ny = sy + 7 * s;
    S.text('BRUS KVAR', px, ny, 1.3 * s, C.dim);
    S.text(`${Math.round(left * 100)} %`, px + pw, ny, 1.5 * s, C.ink, 'right');
    ctx.fillStyle = C.line;
    ctx.fillRect(px, ny + 2 * s, pw, 1.6 * s);
    ctx.fillStyle = rgba(C.warm, 0.8);
    ctx.fillRect(px, ny + 2 * s, pw * left, 1.6 * s);

    const hint = training
      ? 'Riktig bild + brus. Modellen övar på att gissa bruset.'
      : `Startbrus nr ${seed}. Samma brus och text ger alltid samma bild.`;
    S.text(hint, px, ny + 7 * s, 1.35 * s, C.dim, 'left', 'Inter, sans-serif');
  }

  return { resize: S.resize, render, dispose: S.dispose };
}
