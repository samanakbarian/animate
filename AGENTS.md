# AGENTS.md – orientering för AI-agenter och utvecklare

**ilearnai.se** (iLearnAI): en svensk sajt om hur AI fungerar. Ingången är kortfilmen NÄSTA STEG
(2 min 30 s, Three.js, syntad musik). Runt den finns förklarmoduler (neuralt nätverk,
språkmodell, agent …), lärspel och en ordlista. Allt innehåll är på svenska.

## Börja här (läs i den här ordningen, sluta när du vet nog)

1. `docs/STATUS.md` – nuläge, nästa uppgift och kända problem. **Alltid först.**
2. Senaste 2–3 posterna i `docs/DEVLOG.md` – vad som gjordes och varför.
3. `docs/ARCHITECTURE.md` – bara om uppgiften rör flera paket.
4. `docs/adr/` – bara om du överväger att ändra ett beslut som redan är taget.

Läs inte hela kodbasen. Gå direkt till filen som kartan nedan pekar på.

## Karta

| Sökväg                               | Vad                                                                           | Ändra här när …                          |
| ------------------------------------ | ----------------------------------------------------------------------------- | ---------------------------------------- |
| `apps/web`                           | Hemsidan (Astro, statisk)                                                     | sidor, layout, texter, moduler, ordlista |
| `apps/web/src/content/modules/*.md`  | En fil per förklarmodul (frontmatter = schema)                                | lägga till/ändra en modul                |
| `apps/web/src/content/glossary.json` | Ordlistan                                                                     | lägga till begrepp                       |
| `apps/web/src/content/paths.json`    | Lärvägar (`/lar/<id>`), steg av moduldelar, spel och quizfrågor               | ändra eller lägga till en lärväg         |
| `packages/engine`                    | Delad motor: tid, figurrigg, material, mark, regn, efterbehandling, ljudmotor | något som fler än en film behöver        |
| `packages/film`                      | Kortfilmen NÄSTA STEG (tidslinje, regi, scener, partitur, HUD, spelare)       | filmen                                   |
| `packages/module-<slug>`             | En förklarmodul: manus (`timeline.ts`) + scen (`scene.ts`), se ADR 0004       | en moduls film eller interaktion         |
| `apps/web/src/lib/interactive.ts`    | Register: vilka moduler som har film + reglage                                | ny modul ska synas på sajten             |
| `packages/game-<slug>`               | Ett lärspel (`game: GameDefinition`), se ADR 0007                             | ett spel                                 |
| `apps/web/src/content/games.json`    | Spelen på sajten + registret `apps/web/src/lib/games.ts`                      | nytt spel ska synas på sajten            |
| `tools/render`                       | Export till MP4 och stillbilder (Playwright + ffmpeg)                         | exportkedjan                             |
| `docs/`                              | Status, devlogg, arkitektur, ADR:er, roadmap                                  | efter varje arbetspass                   |

## Kommandon (pnpm, Node 22)

```bash
pnpm install
pnpm dev            # hemsidan, http://localhost:4321
pnpm dev:film       # filmen fristående, http://localhost:5173 (?dev&t=104&q=medium)
pnpm check          # typecheck + lint + test – kör före varje commit
pnpm format         # Prettier
pnpm build          # bygger hemsidan till apps/web/dist
pnpm frames -- 12 50 118 --w 1280 --h 720   # stillbilder av filmen till out/preview (snabb visuell kontroll)
pnpm module-frames -- agenten 15 40 --mobile # stillbilder av en modul på sajten (kör pnpm build först)
pnpm render         # hela filmen till out/nasta-steg.mp4 (kräver GPU för rimlig tid)
```

## Regler som inte får brytas

- **Determinism:** allt i filmer och moduler är en ren funktion av tiden `t`. Ingen `Math.random()`,
  inget som beror på bildfrekvens eller `Date.now()`. Använd `Rng`/`hash*` från `@nastasteg/engine/core/math`.
- **Beroenderiktning:** `web → film → engine`. Motorn importerar aldrig från en film. Filmspecifikt
  (tidslinje, partitur, texter) stannar i filmens paket.
- **Data före kod:** tider, texter och partitur ligger i datafiler/tabeller (`timeline.ts`, `score.ts`,
  `content/`). Logik läser dem.
- **Svenska** i all synlig text och i kodkommentarer. Identifierare på engelska.
- **Kvalitet:** `pnpm check` ska vara grönt. Visuella ändringar verifieras med `pnpm frames`.
- **Inga upphovsrättsskyddade** melodier, samplingar, karaktärer eller logotyper.

## Arbetsflöde för en agent

1. Läs `docs/STATUS.md`, välj uppgiften under ”Nästa”.
2. Gör ändringen. Små commits med beskrivande meddelanden (svenska går bra).
3. Kör `pnpm check` (och `pnpm frames` vid visuella ändringar).
4. **Innan du avslutar:** lägg en ny post överst i `docs/DEVLOG.md` och uppdatera `docs/STATUS.md`.
   Ett nytt arkitekturbeslut får en ADR i `docs/adr/` (kopiera mallen `0000-mall.md`).

Devloggen är projektets minne. Skriv den för nästa agent: vad som ändrades, varför, vad som
återstår, och fällor du gick i. Håll varje post kort.
