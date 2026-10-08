# 0012 – Statistik utan kakor

- **Status:** föreslagen (koden finns, avstängd tills tjänst är vald)
- **Datum:** 2026-10-08

## Sammanhang

Vi vill veta om besökare lär sig något: börjar de en modul, rör de reglagen, ser de klart, gör de quizet,
går de vidare, och var avbryter de lärvägen. Vi vill inte ha kakor, samtyckesrutor, id:n eller personuppgifter,
och ingen egen backend (ADR 0011 avvaktar).

## Beslut

`apps/web/src/lib/track.ts` skickar bara händelsens namn och en slug (t.ex. `/h/module_start/agenten`) till
en räknartjänst med pixel-API, en GET per händelse. Inga id:n, ingen fritext (osäkra värden filtreras bort).
Besökare med Do Not Track eller Global Privacy Control räknas inte. Avstängt tills `PUBLIC_STATS_URL` sätts.

Rekommendation: **GoatCounter** (kakfri, öppen källkod, gratis för små icke-kommersiella sajter, kan
självhostas). Alternativ: Plausible (betald, EU), Netlify Analytics (serverloggar, inga händelser).
Sidvisningar räknas inte av koden i dag; GoatCounters skript kan läggas till om grundaren vill.

Händelser: `module_start`, `module_interact`, `module_end`, `module_next`, `quiz_done`, `path_start`,
`path_step`, `path_complete`, `path_leave`.

## Konsekvenser

- Grundaren måste välja tjänst, skapa konto och sätta `PUBLIC_STATS_URL` i Netlify. Nämn statistiken på om-sidan.
- `path_leave` skickas vid `pagehide` och kan saknas på vissa mobiler. Siffran är en undre gräns.
- Vill vi en dag följa en enskild elevs framsteg krävs konto och backend (ADR 0011), inte den här lösningen.
