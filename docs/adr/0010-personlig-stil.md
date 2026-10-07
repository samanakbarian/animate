# 0010 – Personligare stil: serif, kursiva anteckningar och färg per modul

- **Status:** beslutad
- **Datum:** 2026-10-07

## Sammanhang

Sajten kändes AI-genererad: Inter överallt, små etiketter i versaler med stort bokstavsavstånd och likadana kort.

## Beslut

- Typsnitt: rubriker i Fraunces (variabel, `SOFT` 100) och brödtext i Atkinson Hyperlegible (`--font-display`,
  `--font-sans`). Inter finns kvar för filmen och modulscenerna.
- `.eyebrow` och `.note` är små anteckningar i kursiv Fraunces, i grått, inte versaler. (Handskriften Caveat
  provades först men kändes konstig och togs bort.) `.scribble` ger en handritad
  understrykning. Menyn har vanlig text, och sidan du är på markeras med en vågig understrykning.
- Varje modul har en egen färg (`MODULE_COLORS` i `lib/site.ts`), som syns i ”nr N” och i en färgklick på kortet.
  Kort, modulspelare och spel har 16 px rundade hörn. Ljust tema har ett svagt prickat papper.
- Hacker-temat skriver över typsnitten med mono.

## Konsekvenser

- Undvik nya etiketter i versaler med stort bokstavsavstånd. Använd `.eyebrow` eller en vanlig rubrik.
- Nya moduler får färg automatiskt efter ordning. Fler än tio färger börjar om från början.
