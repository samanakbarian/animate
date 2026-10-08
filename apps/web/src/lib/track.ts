// Integritetsvänlig statistik. Inga kakor, inga id:n och inga personuppgifter:
// bara händelsens namn och vilken modul, vilket spel eller vilket steg det gäller.
//
// Avstängd tills en tjänst är vald (se docs/adr/0012-statistik.md). Sätt
// PUBLIC_STATS_URL i Netlify till t.ex. https://ilearnai.goatcounter.com för att slå på.
// Besökare med ”Do Not Track” eller ”Global Privacy Control” räknas aldrig.

export type TrackEvent =
  | 'module_start'
  | 'module_interact'
  | 'module_end'
  | 'module_next'
  | 'quiz_done'
  | 'path_start'
  | 'path_step'
  | 'path_complete'
  | 'path_leave';

/** Bara korta id:n (slugs) tillåts som detaljer, så att inget personligt kan följa med. */
export type TrackProps = Record<string, string | number>;

const SAFE = /^[a-z0-9-]{1,60}$/;

/** Sökvägen som räknas, t.ex. ”/h/module_start/agenten”. Okända eller osäkra värden tas bort. */
export function eventPath(name: TrackEvent, props: TrackProps = {}): string {
  const parts = Object.keys(props)
    .sort()
    .map((k) => String(props[k]))
    .filter((v) => SAFE.test(v));
  return ['/h', name, ...parts].join('/');
}

export function optedOut(nav: { doNotTrack?: string | null; globalPrivacyControl?: boolean } = navigator): boolean {
  return nav.doNotTrack === '1' || nav.globalPrivacyControl === true;
}

export function track(name: TrackEvent, props: TrackProps = {}): void {
  const base = import.meta.env.PUBLIC_STATS_URL as string | undefined;
  if (import.meta.env.DEV) console.debug('[statistik]', eventPath(name, props));
  if (!base || typeof navigator === 'undefined' || optedOut(navigator as Navigator & { globalPrivacyControl?: boolean })) return;
  // GoatCounters pixel-API: en GET-förfrågan per händelse, e=true betyder ”händelse”, inte sidvisning.
  const url = `${base.replace(/\/$/, '')}/count?p=${encodeURIComponent(eventPath(name, props))}&e=true`;
  try {
    if (!navigator.sendBeacon?.(url)) void fetch(url, { mode: 'no-cors', keepalive: true });
  } catch {
    // statistik får aldrig störa besöket
  }
}
