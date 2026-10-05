// Gemensamma ritverktyg för modulscener i Canvas 2D: palett, typsnitt,
// en bildyta som hanterar pixeltäthet och textritning.

export const PALETTE = {
  bg: '#07090b',
  surface: '#0e1216',
  line: '#222a32',
  ink: '#e8ebee',
  dim: '#9aa5b0',
  cold: [157, 182, 214] as const,
  warm: [200, 100, 63] as const,
};

export const MONO = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
export const SANS = '"Inter", "Helvetica Neue", Arial, sans-serif';

export const rgba = (c: readonly number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

export interface Surface {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  /** Bredd och höjd i CSS-pixlar. */
  readonly width: number;
  readonly height: number;
  /** Stående yta (mobil)? */
  readonly tall: boolean;
  resize(width: number, height: number, dpr: number): void;
  clear(color?: string): void;
  text(s: string, x: number, y: number, size: number, color: string, align?: CanvasTextAlign, font?: string): number;
  dispose(): void;
}

/** Skapar en canvas i `host` som ritas i CSS-pixlar oavsett skärmens pixeltäthet. */
export function createSurface(host: HTMLElement): Surface {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;height:100%';
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;
  let W = 1,
    H = 1;
  return {
    canvas,
    ctx,
    get width() {
      return W;
    },
    get height() {
      return H;
    },
    get tall() {
      return H > W * 0.9;
    },
    resize(width, height, dpr) {
      W = width;
      H = height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },
    clear(color = PALETTE.bg) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, W, H);
    },
    /** Ritar text och returnerar dess bredd. */
    text(s, x, y, size, color, align = 'left', font = MONO) {
      ctx.font = `${size}px ${font}`;
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.textBaseline = 'middle';
      ctx.fillText(s, x, y);
      return ctx.measureText(s).width;
    },
    dispose() {
      canvas.remove();
    },
  };
}
