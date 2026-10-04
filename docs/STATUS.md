# Status

_Uppdateras i slutet av varje arbetspass. Håll filen under ~50 rader._

**Senast uppdaterad:** 2026-10-04

## Nuläge

- Monorepo med pnpm: `apps/web` (Astro), `packages/engine`, `packages/film`, `tools/render`.
- Kortfilmen NÄSTA STEG är klar och spelas på startsidan (laddas lat när sidan är ledig).
- Hemsidan har startsida, modulöversikt, en sida per modul (platshållare för film), ordlista (20 begrepp) och om-sida.
- 10 moduler finns som innehållsfiler. Alla har status `planerad`; tre är märkta för lansering (`stage: mvp`).
- CI (GitHub Actions) kör format, lint, typecheck, test och bygge. 22 tester gröna.

## Nästa (i prioritetsordning)

1. **MP4-reserv för filmen:** rendera `out/nasta-steg.mp4` på en dator med GPU, lägg den (eller en CDN-länk)
   i `FilmPlayer.astro` för webbläsare utan WebGL2 och för mobiler med svag grafik.
2. **Modulramverk i motorn:** gemensam ”scen + tidslinje + interaktivt läge” så att en modul kan spelas
   som film och sedan pausas och styras med reglage (se ADR 0004). Bygg det med modul 1 som första användare.
3. **Modul 1 – Neuralt nätverk** (MVP): film + ett riktigt litet nätverk som tränas i webbläsaren.
4. **Modul 5 – Språkmodellen** och **modul 8 – Agenten** (MVP).
5. Driftsättning: välj värd (statisk sajt, t.ex. Cloudflare Pages eller Netlify) och peka nastasteg.se dit.

## Kända problem och fällor

- Byggmiljön för agenter saknar GPU: rendering går i mjukvara (~0,4 bilder/s). Använd `pnpm frames` med
  få tidpunkter för visuell kontroll; en hel MP4 tar timmar där.
- 60 fps på integrerad grafik är inte uppmätt på riktig hårdvara.
- `vite`-varning om stor chunk för filmen är väntad (laddas lat, ~200 kB gzip).

## Länkar

- Featurelista (levande dokument): https://claude.ai/code/artifact/a2829a1a-c962-40fe-b66b-3f2b7b33ddd1
- Roadmap i repot: `docs/ROADMAP.md`
