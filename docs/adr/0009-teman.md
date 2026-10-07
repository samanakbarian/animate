# 0009 – Tre teman: mörk, ljus och hacker

- **Status:** beslutad
- **Datum:** 2026-10-07

## Sammanhang

Sajten var bara mörk, som filmen. Alla besökare vill inte ha det, och skolor och dagsljus gynnar ett ljust tema.

## Beslut

- Tre teman sätts med `data-theme` på `<html>`: `mork` (standard), `ljus` och `hacker` (grönt på svart, allt i mono).
  Färgerna är CSS-variabler i `apps/web/src/styles/global.css`, även loggans (`--logo-ink`, `--logo-accent`, `--logo-word`).
- Ett litet skript i `<head>` (Base.astro) sätter temat före första målningen. Det använder sparat val
  (`localStorage['ns-theme']`), och annars systemets ljust/mörkt. Knappen `ThemeToggle.astro` växlar
  mörk → ljus → hacker och sparar valet.
- Filmen, modulspelaren och spelen behåller sin mörka bildyta i alla teman, som en bioduk. Deras scener
  ritar med motorns fasta palett.

## Konsekvenser

- Ny sidstil ska bara använda variablerna (`--bg`, `--surface`, `--line`, `--ink`, `--dim`, `--cold`, `--warm`),
  aldrig hårdkodade färger.
- Om modulernas scener ska följa temat senare behöver `PALETTE` i `engine/module/canvas.ts` läsas från temat.
  Det är inte gjort.
