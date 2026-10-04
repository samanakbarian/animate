// En enda artificiell neuron med två insignaler: z = w₁x₁ + w₂x₂ + b, y = σ(z).

export interface NeuronParams {
  x1: number;
  x2: number;
  w1: number;
  w2: number;
  b: number;
}

export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

/** Brantare sigmoid så att gränsen syns tydligt i planet [-1, 1]². */
export const GAIN = 4;

export function forward(p: NeuronParams): { z: number; y: number } {
  const z = p.w1 * p.x1 + p.w2 * p.x2 + p.b;
  return { z, y: sigmoid(GAIN * z) };
}

/**
 * Beslutsgränsen z = 0 som en linje klippt mot rutan [-1, 1]².
 * Returnerar null om linjen inte korsar rutan (eller om w₁ = w₂ = 0).
 */
export function boundary(w1: number, w2: number, b: number): [number, number, number, number] | null {
  const pts: [number, number][] = [];
  const add = (x: number, y: number) => {
    if (x >= -1 - 1e-9 && x <= 1 + 1e-9 && y >= -1 - 1e-9 && y <= 1 + 1e-9) pts.push([x, y]);
  };
  if (Math.abs(w2) > 1e-9) {
    add(-1, (-b + w1) / w2);
    add(1, (-b - w1) / w2);
  }
  if (Math.abs(w1) > 1e-9) {
    add((-b + w2) / w1, -1);
    add((-b - w2) / w1, 1);
  }
  if (pts.length < 2) return null;
  // två punkter längst ifrån varandra
  let best: [number, number, number, number] = [pts[0][0], pts[0][1], pts[1][0], pts[1][1]];
  let bd = -1;
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++) {
      const d = (pts[i][0] - pts[j][0]) ** 2 + (pts[i][1] - pts[j][1]) ** 2;
      if (d > bd) {
        bd = d;
        best = [pts[i][0], pts[i][1], pts[j][0], pts[j][1]];
      }
    }
  return best;
}
