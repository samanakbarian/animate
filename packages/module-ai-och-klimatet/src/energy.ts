// Hur mycket el olika sorters AI-användning kräver, och vad det blir i
// koldioxid med olika el. Siffrorna är avrundade uppskattningar. De varierar
// mycket mellan modeller, datacenter och mätmetoder.
//
// Källor (avrundat):
// - kort textsvar ≈ 0,3 Wh: Epoch AI (2025) om GPT-4o, Google (2025) om Gemini 0,24 Wh.
// - bild ≈ 3 Wh: Luccioni m.fl., ”Power Hungry Processing” (2023).
// - kort film (5 s) ≈ 1 kWh: MIT Technology Review (2025), öppen videomodell.
// - långt svar med resonemang: ungefär tio gånger ett kort svar, grov uppskattning.
// - träna GPT-3 ≈ 1 300 MWh: Patterson m.fl. (2021).
// - el: Sverige ≈ 40 g CO₂/kWh, EU-snitt ≈ 250, kolkraft ≈ 800.

export interface Use {
  /** Kort namn till reglaget. */
  short: string;
  /** Rubrik i bild, i plural. */
  title: string;
  /** Wattimmar per gång. */
  wh: number;
}

export const USES: Use[] = [
  { short: 'kort svar', title: 'Korta textsvar', wh: 0.3 },
  { short: 'långt resonemang', title: 'Långa svar med resonemang', wh: 3 },
  { short: 'bild', title: 'Bilder', wh: 3 },
  { short: 'kort film', title: 'Korta filmer, 5 sekunder', wh: 1000 },
];

export interface Grid {
  title: string;
  /** Gram koldioxid per kilowattimme. */
  g: number;
}

export const GRIDS: Grid[] = [
  { title: 'Sverige', g: 40 },
  { title: 'EU-snitt', g: 250 },
  { title: 'Mest kolkraft', g: 800 },
];

/** Jämförelser i vardagen, i wattimmar. */
export const PHONE_WH = 15;
export const EV_WH_PER_KM = 180;
export const KETTLE_WH_PER_L = 100;
export const LED_W = 9;
/** Hushållsel i en lägenhet per år. */
export const APARTMENT_KWH = 2000;

/** Att träna GPT-3, en gång. */
export const TRAIN_MWH = 1300;
/** Ett tänkt antal korta svar per dag i hela världen. */
export const WORLD_ANSWERS = 1e9;

export interface YearResult {
  kwh: number;
  phones: number;
  evKm: number;
  liters: number;
  /** Andel av en lägenhets hushållsel. */
  apartment: number;
  /** Gram koldioxid per år för varje sorts el. */
  co2: number[];
}

/** Ett år av `perDay` gånger per dag. */
export function year(use: Use, perDay: number): YearResult {
  const wh = use.wh * perDay * 365;
  return {
    kwh: wh / 1000,
    phones: wh / PHONE_WH,
    evKm: wh / EV_WH_PER_KM,
    liters: wh / KETTLE_WH_PER_L,
    apartment: wh / 1000 / APARTMENT_KWH,
    co2: GRIDS.map((g) => (wh / 1000) * g.g),
  };
}

/** Efter hur många dagar användningen har krävt lika mycket el som träningen. */
export const daysToTraining = () => (TRAIN_MWH * 1e6) / (WORLD_ANSWERS * USES[0].wh);

/** Svenska tal: decimalkomma, mellanslag mellan tusental och högst tre värdesiffror. */
export function fmt(v: number): string {
  if (v === 0) return '0';
  if (v < 10) {
    const d = v < 1 ? 2 : 1;
    return v
      .toFixed(d)
      .replace(/\.?0+$/, '')
      .replace('.', ',');
  }
  const p = Math.pow(10, Math.max(0, Math.floor(Math.log10(v)) - 2));
  return String(Math.round(v / p) * p).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** Energi med lämplig enhet. */
export const fmtWh = (wh: number) => (wh < 1000 ? `${fmt(wh)} Wh` : wh < 1e6 ? `${fmt(wh / 1000)} kWh` : `${fmt(wh / 1e6)} MWh`);

/** Koldioxid med lämplig enhet. */
export const fmtCo2 = (g: number) => (g < 1000 ? `${fmt(g)} g` : g < 1e6 ? `${fmt(g / 1000)} kg` : `${fmt(g / 1e6)} ton`);
