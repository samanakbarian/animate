# Status

_Uppdateras i slutet av varje arbetspass. Håll filen under ~50 rader._

**Senast uppdaterad:** 2026-10-04

## Nuläge

- Monorepo med pnpm: `apps/web` (Astro), `packages/engine`, `packages/film`, `packages/module-neuralt-natverk`, `tools/render`.
- Kortfilmen NÄSTA STEG spelas på startsidan (laddas lat).
- **Modulramverket finns** (`@nastasteg/engine/module/*`, ADR 0004): film med kapitel och berättartext,
  scrubbning, och reglage som pausar och låter besökaren styra. Stående layout på mobil.
- **Modul 1, del 1** (en neuron, 64 s) ligger live på `/moduler/neuralt-natverk`. Status: under arbete.
- Om-sidan har kontakt: saman.akbarian@gmail.com.
- 30 tester gröna. CI kör format, lint, typecheck, test och bygge.

## Nästa (i prioritetsordning)

1. **Modul 1, del 2:** ett litet nätverk (2–4–1) som tränas i webbläsaren. Visa felet som sjunker och
   gränsen som böjer sig. Lägg det som nya kapitel i samma modul eller som en andra scen.
   Träningen måste vara deterministisk (seedad init, fast steglängd, förberäknade steg per t).
2. **MP4-reserv för filmen:** rendera `out/nasta-steg.mp4` på en dator med GPU och visa den i `FilmPlayer.astro`
   för webbläsare utan WebGL2 och för svaga mobiler.
3. **Modul 5 – Språkmodellen** och **modul 8 – Agenten** (MVP), byggda på modulramverket.
4. Driftsättning: välj värd (t.ex. Cloudflare Pages eller Netlify) och peka nastasteg.se dit.

## Kända problem och fällor

- Byggmiljön för agenter saknar GPU: filmen renderas i mjukvara (~0,4 bilder/s). Använd `pnpm frames` sparsamt.
- 60 fps på integrerad grafik är inte uppmätt på riktig hårdvara.
- `pkill -f "astro preview"` i samma kommando som startar servern dödar det egna skalet. Starta servern som bakgrundsjobb.
- Moduler har inget ljud än (filmen har).

## Länkar

- Featurelista (levande dokument): https://claude.ai/code/artifact/a2829a1a-c962-40fe-b66b-3f2b7b33ddd1
- Förhandsvisning av sajten: https://claude.ai/artifact/DuRSaG1eVQ1VdJxCRfKPXG
- Roadmap i repot: `docs/ROADMAP.md`
