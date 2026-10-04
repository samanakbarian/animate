# 0004 – Moduler: film som kan pausas och styras

- **Status:** föreslagen
- **Datum:** 2026-10-04

## Sammanhang

Varje förklarmodul ska börja som en kort film och sedan låta besökaren styra modellen själv
(dra i vikter, välja nästa ord, följa en agent).

## Beslut (förslag)

En modul är ett paket med `timeline` (som filmen) och en mängd **parametrar** (vikter, temperatur …).
Scenen renderas från `(t, params)`. Under film styr tidslinjen parametrarna, och vid paus tar reglagen över.
Riktiga minimodeller (små nätverk) körs i webbläsaren och har seedad initiering.

## Konsekvenser

Motorn behöver ett gemensamt modulramverk (spelare, reglage-UI, paus/scrub). Byggs med modul 1 som
första användare och generaliseras när modul 2 kommer.
