# 0005 – Projektminne för agenter: AGENTS.md, STATUS, DEVLOG

- **Status:** beslutad
- **Datum:** 2026-10-04

## Sammanhang

Arbetet görs till stor del av AI-agenter i separata sessioner. Att läsa in hela kodbasen varje gång kostar mycket tokens och tid.

## Beslut

- `AGENTS.md` (roten, `CLAUDE.md` importerar den): karta, kommandon och regler. Kort och stabil.
- `docs/STATUS.md`: nuläge, nästa uppgift och kända fällor. Under ~50 rader och uppdateras varje pass.
- `docs/DEVLOG.md`: en kort post per pass, nyaste överst.
- `docs/adr/`: ett beslut per fil.

## Konsekvenser

En ny agent kan orientera sig på ett par minuter. Kravet är disciplin: varje pass avslutas med att STATUS och DEVLOG uppdateras.
