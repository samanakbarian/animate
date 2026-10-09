// Del 2: taligenkänning tränad på två dialekter. En förenklad inlärningskurva:
// ju fler inspelningar av en dialekt, desto bättre förstår modellen den. Snittet
// räknas på testet, där dialekterna förekommer lika ofta som i träningen.

export const TOTAL_HOURS = 1000;

/** Andel rätt för en dialekt med `hours` timmar inspelningar (förenklad kurva). */
export const accuracyFor = (hours: number) => 0.97 - 0.45 * Math.exp(-hours / 90);

export function speechResult(shareB: number) {
  const hoursB = TOTAL_HOURS * shareB;
  const a = accuracyFor(TOTAL_HOURS - hoursB),
    b = accuracyFor(hoursB);
  return { a, b, average: (1 - shareB) * a + shareB * b, gap: a - b };
}
