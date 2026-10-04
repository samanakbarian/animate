# @nastasteg/film – kortfilmen NÄSTA STEG

En mörk 3D-kortfilm i kod, 2 min 30 s. En ensam figur går från vänster till höger
genom evolutionen – människa → språkmodeller → AGI → ASI – och förändras medan den
går. Slutet visar att människan blir kvar och fasas ut.

Byggd med **Vite + TypeScript + Three.js** och **postprocessing** (pmndrs).
All musik är en egen komposition som syntas i kod med Web Audio API.

## Kom igång

```bash
pnpm install          # i repo-roten
pnpm dev:film         # fristående dev-sida, http://localhost:5173
pnpm build:film       # bygger packages/film/dist (används av export)
pnpm render           # hela filmen till out/nasta-steg.mp4 (se nedan)
```

### URL-parametrar

| Parameter                 | Betydelse                                                         |
| ------------------------- | ----------------------------------------------------------------- |
| `?q=low\|medium\|high`    | Tvinga kvalitetsläge (annars väljs det automatiskt utifrån GPU:n) |
| `?t=104`                  | Starta från en viss tidpunkt (sekunder)                           |
| `?dev`                    | Visar t, fps och kvalitet. `←`/`→` hoppar 5 s, mellanslag pausar  |
| `?render=1&w=1920&h=1080` | Exportläge (används av `pnpm render`)                             |

### Kvalitetslägen

| Läge     | Upplösning      | Skuggor  | Spegling             | Regn  | MSAA | Skärpedjup            |
| -------- | --------------- | -------- | -------------------- | ----- | ---- | --------------------- |
| `high`   | upp till 2× DPR | 2048 VSM | ½ upplösning         | 9 000 | 4×   | ja                    |
| `medium` | 1×              | 1024 VSM | ⅓ upplösning         | 6 000 | 2×   | ja (lägre upplösning) |
| `low`    | 0,8×            | 1024 VSM | av (bara miljökarta) | 3 500 | –    | nej                   |

Integrerad grafik (Intel/Iris/UHD, Apple GPU, AMD APU) får `medium` automatiskt och
mobiler `low`. Under uppspelning mäts bildtiden, och upplösningen sänks dynamiskt
(ned till 50 %) om den ligger över cirka 19 ms, så att filmen håller sig nära 60 fps.

## Export till MP4

```bash
pnpm render                                       # 1920×1080, 30 fps, hela filmen
pnpm render -- --fps 60                        # 60 fps
pnpm render -- --from 105 --to 130 --out out/asi.mp4
pnpm render -- --q medium --crf 20             # snabbare provrendering
RENDER_GL=swiftshader pnpm render                  # utan GPU (mycket långsamt)
```

Skriptet (`tools/render/render.mjs`):

1. bygger filmens fristående sida och serverar `packages/film/dist/` lokalt,
2. startar headless Chromium (Playwright) med GPU aktiverad,
3. renderar ljudet med `OfflineAudioContext` och **samma sequencer** till `out/audio.wav`,
4. stegar `t` bildruta för bildruta och sparar varje bildruta som PNG i `out/frames/`,
5. sätter ihop bild och ljud med ffmpeg (`ffmpeg-static`) till H.264 + AAC i
   1920×1080, med svarta balkar i bilden för 2,39:1.

Flaggor: `--fps`, `--from`, `--to`, `--w`, `--h`, `--q`, `--crf`, `--preset`, `--out`,
`--keep-frames`, `--resume` (fortsätter en avbruten rendering) och `--skip-build`.
`CHROMIUM_PATH` pekar ut en egen Chromium-binär.

`pnpm frames -- 12 47.5 118 --w 1280 --h 720` sparar enstaka bildrutor,
vilket passar bra för snabb granskning.

## Determinism

Allt styrs av en enda tidsvariabel `t` (sekunder). `Film.renderAt(t)` är en ren funktion
av `t`: samma `t` ger samma bild, oavsett bildfrekvens eller renderingsordning (testat
med pixelidentiska hashar vid hopp fram och tillbaka).

- Ingen `Math.random()`. All slump går via seedade generatorer (`core/math.ts`: `Rng`,
  `hash1/2/3`, värdebrus).
- Integrerade storheter, som figurens position (∫ gånghastighet), regnets fas
  (∫ regnhastighet) och kamerans följning, förberäknas som tabeller och slås upp i O(1).
- Shaders får `t` som uniform (filmkorn, glitch, blink, krusningar och partiklar).
- Ljudet schemaläggs från samma händelselista (`audio/score.ts`) i realtid och offline.
  I realtid är ljudklockan master, så bild och ljud hålls i synk.

## Struktur

```
src/
  index.ts       publikt API: mountPlayer, mountRenderTarget, STEPS …
  player.ts      startskärm, ljud, renderingsloop, exportläge
  film.ts        bygger scenen och renderar en bildruta för ett t
  timeline.ts    stegen, tider, årtal, rubriker, pratbubblor (datadriven)
  director.ts    kamera och effektnivåer som funktioner av t
  characters/    cast (alla figurer över tid) och looks (material per steg)
  scenes/        world (epokerna), structure (ASI), ending (bänken)
  audio/score.ts partituret som ren data (+ rainLevel, filmScore)
  hud/hud.ts     årtal, rubrik, kapitelräknare, pratbubblor, titelkort
  main.ts        fristående dev-/exportsida (index.html)
```

Generella delar (figurrigg, material, mark, regn, efterbehandling, ljudmotor)
ligger i `@nastasteg/engine`. Se `docs/ARCHITECTURE.md` i repo-roten.

## Anteckningar

- **Figuren** är en egen procedurell modell med mjuka former (avsmalnande kapslar och
  svarvade torsoformer, inga lådor), riggad med leder i en hierarki. Alla steg använder
  samma rigg och skiljer sig i proportioner, material, rörelsestil och effekter. Därför
  blir dissolve-övergångarna sömlösa.
- **Övergångar** sker på taktgränserna: under 0,6 s sveper en brusig, glödande kant från
  fötterna uppåt medan det gamla steget löses upp och det nya byggs upp. Samtidigt kommer
  RGB-glitch, scanline-ryck, ett glitch-ljud och en cymbal.
- **Bloom** har tröskeln 1,0 i HDR, så bara självlysande material (med emissive > 1)
  blommar.
- **Färggradering** sker via procedurellt genererade 3D-LUT:ar: en kall bas och en varm
  variant som blandas in för människan och Claude-stegen.
- **HUD och pratbubblor** ligger i HTML/CSS inom bildytan. Bubblorna klampas mot bildytans
  kanter och skalas med dess bredd. I stående läge används ett högre bildformat (~0,8:1) i
  stället för 2,39:1.
- **Ljud**: inga samplingar. Allt (hjärtslag, trummor, bas, pad, lead, drone, riser, piano,
  lampklick och slutslag) syntas med oscillatorer, filtrerat seedat brus, waveshaper-
  distorsion och en genererad rumsklang.
