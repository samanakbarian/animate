# 0004 – Moduler: film som kan pausas och styras

- **Status:** beslutad
- **Datum:** 2026-10-04

## Sammanhang

Varje förklarmodul ska börja som en kort film och sedan låta besökaren styra modellen själv
(dra i vikter, välja nästa ord, följa en agent).

## Beslut

En modul är ett paket `packages/module-<slug>` som default-exporterar en `ModuleDefinition`
(`@nastasteg/engine/module/types`):

- `params`: reglagen (id, etikett, min/max/steg, standardvärde).
- `tracks`: nyckelrutor per parameter (`linear`/`smooth`/`hold`) – filmens manus.
- `chapters`: kapitel med berättartext. `exploreCaption` visas i utforskaläget.
- `createScene(host)`: en scen som ritar `render(t, params, mode)`. Valfri teknik (Canvas 2D, Three.js …).

`ModuleController` (ingen DOM, injicerad klocka) har två lägen. I **film** räknas parametrarna fram från
nyckelrutorna vid `t`. I **explore** gäller besökarens värden, och de startar från filmens värden där den pausades.
Ett reglage som rörs växlar till explore. När filmen tar slut går spelaren automatiskt över i explore.
`mountModulePlayer(el, def)` bygger scen, berättartext, uppspelningsrad med kapitelmarkeringar och reglage.

## Konsekvenser

Scenen är en ren funktion av `(t, params)`, så determinism och export fungerar som för filmen.
Hemsidan registrerar moduler i `apps/web/src/lib/interactive.ts`, och varje modul blir en egen chunk.
Ljud i moduler finns inte än. Det kan läggas till som ett `Score` per modul.
