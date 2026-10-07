# Arkitektur

## Lager och beroenderiktning

```
apps/web ──┬──▶ packages/film ─────────────────┬──▶ packages/engine
(Astro)    │    (en film: data + regi)          │    (generisk motor, inga film-/modulberoenden)
           ├──▶ packages/module-<slug> ─────────┤
           │    (en förklarmodul: manus + scen)  │
           └──▶ packages/game-<slug> ───────────┘
                (ett lärspel; får läsa logik från en modul, ADR 0007)
tools/render ── bygger och styr packages/film/dist via Playwright
```

- Pilarna är tillåtna importer. Motorn får aldrig importera från en film eller från webben.
- Paketen konsumeras som TypeScript-källa (`exports` pekar på `src/*.ts`). Inget eget byggsteg:
  Vite/Astro transpilerar. Det håller dev-loopen snabb och källkartorna exakta.

## packages/engine – vad hör hemma här

| Modul                            | Ansvar                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| `core/math`                      | Seedad slump (`Rng`, `hash*`), brus, easing, `Integral` (position = ∫ hastighet)      |
| `figure/rig`, `figure/animation` | Procedurell humanoid med leder, gångcykel och stilar                                  |
| `fx/figureMaterial`              | PBR-material med effekter via `onBeforeCompile` (dissolve, glitch, fresnel, sten …)   |
| `fx/particles`                   | Partikelupplösning av en figur                                                        |
| `scene/*`                        | Mark med planar reflection, regn, himmel, miljökarta, rekvisita och shaderbitar       |
| `render/post`                    | Efterbehandling: ACES, 3D-LUT, bloom, skärpedjup, kromatisk aberration, korn          |
| `audio/*`                        | `Score`-typer, syntinstrument, sequencer (realtid + offline) och WAV                  |
| `module/*`                       | Modulramverket: typer, nyckelrutor, `ModuleController`, `mountModulePlayer` + CSS     |
| `module/canvas`                  | Palett, typsnitt och `createSurface` (canvas med pixeltäthet) för modulscener         |
| `module/sound`                   | `moduleScore(def)` (syntat partitur ur id + kapitel) och `ModuleSound` (spelar det)   |
| `game/*`                         | Spelramverket: `GameDefinition`, `mountGame`, bästa resultat, ljudeffekter (ADR 0007) |

Tumregel: flytta något till motorn först när en **andra** film eller modul behöver det.

## Tidsmodellen (det viktigaste kontraktet)

Allt som syns och hörs är en ren funktion av `t` (sekunder):

- `Film.renderAt(t)` sätter hela scenen utifrån `t` och renderar. Samma `t` ger samma bild.
- Ackumulerade storheter (position, regnfas, kamerans följning) förberäknas med `Integral` och slås upp i O(1).
- Shaders får `t` som uniform. Ingen delta-tid någonstans.
- Ljud: partituret är en sorterad lista `NoteEvent[]`. I realtid schemaläggs ett fönster framåt
  (`scheduleUntil`), och ljudklockan är master för bilden. Offline schemaläggs allt på en `OfflineAudioContext`.

Det är detta som gör att export till MP4 (bildruta för bildruta) och sökning i tiden fungerar,
och att modulerna senare kan pausas och scrubbas.

## Rendering per bildruta (film)

1. `cast.update(t)`: vilka figurer som syns, pose, material och övergångar.
2. Scenobjekt (struktur, slutscen) och `cameraAt(t)` (regi).
3. `world.update(...)`: stämning per epok, dimma, ljus och lyktor.
4. Planar reflection (separat rendering, halv upplösning), sedan composer:
   RenderPass → [DoF, bloom] (HDR) → CinemaEffect (ACES, LUT, CA, glitch, korn, vinjett, toning).
5. HUD (HTML) uppdateras från `t`.

## apps/web

- Astro, helt statisk (`output: static`). Varje sida är HTML, och filmen är en klient-ö som laddas när
  sidan är ledig (`requestIdleCallback`). Spelaren bygger scenen först vid klick på SPELA.
- Innehåll i content collections (`src/content.config.ts` är schemat):
  - `modules`: en Markdown-fil per modul, med frontmatter för titel, ordning, mål, interaktion,
    `stage` (`mvp`/`v2`/`senare`) och `status`.
  - `glossary`: JSON. Varje begrepp kan peka på en modul.
- Designtokens finns i `src/styles/global.css` (mörk, kall palett och sparsam terrakotta).

## Lägga till …

- **ett begrepp:** en post i `glossary.json` (`id`, `term`, `definition`, valfri `module`).
- **en modul (text):** en ny `.md` i `content/modules`. Sidan genereras automatiskt.
- **en modul med film/interaktion:** kopiera `packages/module-neuralt-natverk` (manus i `timeline.ts`,
  scen i `scene.ts` med `createSurface`, ren logik med tester), exportera `parts: ModuleDefinition[]`, lägg till paketet
  som beroende i `apps/web` och en rad i `apps/web/src/lib/interactive.ts`. Se ADR 0004.
- **en ny film:** ett nytt paket som `packages/film`: tidslinje, regi, partitur och spelare. Återanvänd motorn.

## Kvalitetsgrindar

`pnpm check` (typecheck, lint, test) och `pnpm format:check` körs i CI på varje PR.
Testerna låser det deterministiska kontraktet: tidslinjen, partituret och matematiken.
