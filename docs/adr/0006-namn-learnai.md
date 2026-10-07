# 0006 – Sajten heter LearnAI och ligger på learnai.se

- **Status:** ersatt av 0008
- **Datum:** 2026-10-07

## Sammanhang

Domänen nastasteg.se var upptagen. Produkten ska också växa från en film med moduler till en stor
utbildningssajt om AI med spel, lärvägar och skolmaterial (se backloggen i `docs/ROADMAP.md`).

## Beslut

Sajten heter **LearnAI** och ligger på **learnai.se**. Innehållet är fortfarande på svenska. Kortfilmen
behåller namnet **NÄSTA STEG**. Paketens interna namn (`@nastasteg/*`) byts inte.

## Konsekvenser

- Namn och domän sätts på ett ställe: `SITE` i `apps/web/src/lib/site.ts` och `site` i `apps/web/astro.config.mjs`.
- Paketnamnen `@nastasteg/*` syns inte för besökare. Att byta dem skulle röra varje import utan nytta.
- Äldre poster i devloggen nämner nastasteg.se. De lämnas som de är.
