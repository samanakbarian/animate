# 0001 – Monorepo med pnpm-workspaces

- **Status:** beslutad
- **Datum:** 2026-10-04

## Sammanhang

Hemsidan, filmen, kommande moduler och renderverktyget delar kod (motorn) och ska versioneras tillsammans.
npm 10 kraschade på peer-beroenden i workspaces (`edgesOut`).

## Beslut

Ett repo med pnpm-workspaces: `apps/*`, `packages/*`, `tools/*`. Interna beroenden anges med `workspace:*`.
Paketen exporterar TypeScript-källa direkt, utan eget byggsteg.

## Konsekvenser

En lockfil, en CI och atomära ändringar över paket. Alla måste använda pnpm (`packageManager` i package.json).
Paketen kan inte publiceras till npm som de är. Det behövs inte.
