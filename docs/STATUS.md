# Status

_Uppdateras i slutet av varje arbetspass. Håll filen under ~50 rader._

**Senast uppdaterad:** 2026-10-04

## Nuläge

- Monorepo med pnpm: `apps/web` (Astro), `packages/engine`, `packages/film`, `packages/module-neuralt-natverk`, `tools/render`.
- Kortfilmen NÄSTA STEG spelas på startsidan (laddas lat).
- **Modulramverket finns** (`@nastasteg/engine/module/*`, ADR 0004): film med kapitel och berättartext,
  scrubbning, och reglage som pausar och låter besökaren styra. Stående layout på mobil.
- **Modul 1 är klar** (`/moduler/neuralt-natverk`, status publicerad): del 1 en neuron (64 s), del 2 ett
  2–H–1-nätverk som tränas deterministiskt i webbläsaren (74 s, reglage för dolda neuroner, steg, steglängd).
- Om-sidan har kontakt: saman.akbarian@gmail.com.
- 34 tester gröna. CI kör format, lint, typecheck, test och bygge.

## Nästa (i prioritetsordning)

1. **MP4-reserv för filmen:** rendera `out/nasta-steg.mp4` på en dator med GPU och visa den i `FilmPlayer.astro`
   för webbläsare utan WebGL2 och för svaga mobiler.
2. **Modul 5 – Språkmodellen** och **modul 8 – Agenten** (MVP), byggda på modulramverket.
3. Driftsättning: välj värd (t.ex. Cloudflare Pages eller Netlify) och peka nastasteg.se dit.

## Kända problem och fällor

- Byggmiljön för agenter saknar GPU: filmen renderas i mjukvara (~0,4 bilder/s). Använd `pnpm frames` sparsamt.
- 60 fps på integrerad grafik är inte uppmätt på riktig hårdvara.
- `pkill -f "astro preview"` i samma kommando som startar servern dödar det egna skalet. Starta servern som bakgrundsjobb.
- Moduler har inget ljud än (filmen har).
- `trainingRun(H, lr)` cachar per (H, steglängd); första anropet för en ny kombination tar några ms.

## Länkar

- Featurelista (levande dokument): https://claude.ai/code/artifact/a2829a1a-c962-40fe-b66b-3f2b7b33ddd1
- Förhandsvisning av sajten: https://claude.ai/artifact/DuRSaG1eVQ1VdJxCRfKPXG
- Roadmap i repot: `docs/ROADMAP.md`
