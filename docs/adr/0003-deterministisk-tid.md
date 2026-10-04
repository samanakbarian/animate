# 0003 – All animation och allt ljud är funktioner av t

- **Status:** beslutad
- **Datum:** 2026-09-30

## Sammanhang

Filmer ska kunna exporteras bildruta för bildruta, scrubbas och pausas. Moduler ska kunna styras interaktivt.

## Beslut

Allt som syns och hörs beräknas från tiden `t`. Ingen `Math.random()`, ingen delta-tid.
Ackumulerade storheter förberäknas som integraler, och slump kommer från seedade generatorer.
Ljudet är ett partitur av händelser som schemaläggs i realtid eller offline.

## Konsekvenser

Export, sökning och test blir enkla, och samma `t` ger pixelidentisk bild.
Fysik och simulering måste skrivas som slutna uttryck eller förberäknas. Interaktiva lägen lägger
användarens indata ovanpå `t` (se 0004).
