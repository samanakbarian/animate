# 0002 – Astro för hemsidan

- **Status:** beslutad
- **Datum:** 2026-10-04

## Sammanhang

Sajten är mest text och bilder (bra för SEO och snabb laddning), med några tunga interaktiva öar
(filmen, moduler med WebGL).

## Beslut

Astro i statiskt läge. Interaktiva delar är klient-öar som laddas lat. Innehållet ligger i content collections med zod-schema.

## Konsekvenser

Nästan noll JS på textsidor. Filmen och modulerna förblir ramverksfria (ren TS + Three.js) och kan
monteras var som helst. React eller liknande behövs inte för nuvarande behov.
