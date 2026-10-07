# 0007 – Spelramverk: spel styrs av spelaren, slumpen är seedad per bana

- **Status:** beslutad
- **Datum:** 2026-10-07

## Sammanhang

iLearnAI ska ha korta lärspel utöver modulerna (backloggen, R2). Modulerna är filmer som är en ren funktion
av tiden (ADR 0003, 0004). Ett spel styrs i stället av spelarens drag, och behöver banor, poäng och resultat.

## Beslut

- Ett spel är ett paket `packages/game-<slug>` som exporterar `game: GameDefinition`
  (`@nastasteg/engine/game/types`). `mountGame` i `engine/game/shell.ts` ger startskärm, banor, poäng,
  status, resultat med 1–3 stjärnor och bästa resultat (localStorage, med reserv i minnet).
- Utfallet är en ren funktion av (bana, spelarens drag). All slump kommer från `api.rng`, som är seedad
  per spel och bana. Animationer får använda väggklockan, men bara för att visa det som redan är bestämt.
- Ett spel får importera logik från en modul (t.ex. `module-traning/descent`). Det gör att spelet och
  modulen räknar likadant. Modulen exporterar då den delen med en egen rad i `exports`.
- Sajten: `content/games.json` (titel, sammanfattning, vad spelet lär ut, modul) och registret
  `apps/web/src/lib/games.ts`. Varje spel blir en egen chunk.

## Konsekvenser

- Logiken kan testas utan webbläsare, eftersom samma seed och samma drag ger samma resultat.
- Beroenderiktningen blir `web → game → module → engine`. En modul importerar aldrig ett spel.
- Spel med fritt rörelsespel i realtid (fysik per bildruta) passar inte modellen. Sådana får beräkna
  stegvis med fast tidssteg om de behövs.
