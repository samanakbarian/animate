// Del 1: en neuron som ett vardagsbeslut. Två saker vägs ihop med vikter,
// biasen läggs till, och lampan tänds om summan blir större än noll.
// Samma räkning som i del 2, bara utan planet.

export interface DecisionParams {
  /** Hur mycket solen skiner, 0–1. */
  sun: number;
  /** Hur mycket läxor som är kvar, 0–1. */
  homework: number;
  wSun: number;
  wHomework: number;
  b: number;
}

/** Brant övergång så att lampan i praktiken är av eller på. */
export const LAMP_GAIN = 6;

export function decide(p: DecisionParams) {
  const sun = p.wSun * p.sun;
  const homework = p.wHomework * p.homework;
  const z = sun + homework + p.b;
  return { sun, homework, z, lamp: 1 / (1 + Math.exp(-LAMP_GAIN * z)), yes: z > 0 };
}
