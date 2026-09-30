# NÄSTA STEG

En mörk 3D-kortfilm i kod, 2 min 30 s. En ensam figur går från vänster till höger
genom evolutionen – människa → språkmodeller → AGI → ASI – och förändras medan den
går. Slutet visar att människan blir kvar och fasas ut.

Byggd med **Vite + TypeScript + Three.js** och **postprocessing** (pmndrs).
All musik är en egen komposition som syntas i kod med Web Audio API.

## Kom igång

```bash
npm install
npm run dev        # http://localhost:5173 – klicka SPELA (ljud kräver en interaktion)
npm run build      # typkontroll + produktionsbygge i dist/
npm run render     # hela filmen till out/nasta-steg.mp4 (se nedan)
```

### URL-parametrar

| Parameter | Betydelse |
|---|---|
| `?q=low\|medium\|high` | Tvinga kvalitetsläge (annars väljs det automatiskt utifrån GPU:n) |
| `?t=104` | Starta från en viss tidpunkt (sekunder) |
| `?dev` | Visar t, fps och kvalitet. `←`/`→` hoppar 5 s, mellanslag pausar |
| `?render=1&w=1920&h=1080` | Exportläge (används av `npm run render`) |

### Kvalitetslägen

| Läge | Upplösning | Skuggor | Spegling | Regn | MSAA | Skärpedjup |
|---|---|---|---|---|---|---|
| `high` | upp till 2× DPR | 2048 VSM | ½ upplösning | 9 000 | 4× | ja |
| `medium` | 1× | 1024 VSM | ⅓ upplösning | 6 000 | 2× | ja (lägre upplösning) |
| `low` | 0,8× | 1024 VSM | av (bara miljökarta) | 3 500 | – | nej |

Integrerad grafik (Intel/Iris/UHD, Apple GPU, AMD APU) får `medium` automatiskt och
mobiler `low`. Under uppspelning mäts bildtiden, och upplösningen sänks dynamiskt
(ned till 50 %) om den ligger över cirka 19 ms, så att filmen håller sig nära 60 fps.

## Export till MP4

```bash
npm run render                                    # 1920×1080, 30 fps, hela filmen
npm run render -- --fps 60                        # 60 fps
npm run render -- --from 105 --to 130 --out out/asi.mp4
npm run render -- --q medium --crf 20             # snabbare provrendering
RENDER_GL=swiftshader npm run render              # utan GPU (mycket långsamt)
```

Skriptet (`export/render.mjs`):

1. bygger sidan och serverar `dist/` lokalt,
2. startar headless Chromium (Playwright) med GPU aktiverad,
3. renderar ljudet med `OfflineAudioContext` och **samma sequencer** till `out/audio.wav`,
4. stegar `t` bildruta för bildruta och sparar varje bildruta som PNG i `out/frames/`,
5. sätter ihop bild och ljud med ffmpeg (`ffmpeg-static`) till H.264 + AAC i
   1920×1080, med svarta balkar i bilden för 2,39:1.

Flaggor: `--fps`, `--from`, `--to`, `--w`, `--h`, `--q`, `--crf`, `--preset`, `--out`,
`--keep-frames`, `--resume` (fortsätter en avbruten rendering) och `--skip-build`.
`CHROMIUM_PATH` pekar ut en egen Chromium-binär.

`node export/preview.mjs 12 47.5 118 --w 1280 --h 720` sparar enstaka bildrutor,
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
  timeline.ts          stegen, tider, årtal, rubriker, pratbubblor (datadriven)
  director.ts          kamera (tracking, handhållen, ASI-åkning, slutbild) och effektnivåer
  film.ts              bygger scenen och renderar en bildruta för ett t
  main.ts              startknapp, uppspelning, adaptiv kvalitet, export-API
  core/math.ts         seedad slump, brus, easing, integraler
  characters/
    rig.ts             procedurell riggad humanoid (avsmalnande kapslar, svarvad torso)
    animation.ts       gångcykel och gångstilar per steg
    looks.ts           material, proportioner och stil per steg
    cast.ts            alla figurer över tid: övergångar, ekon, trion, agenter, skärvor, ASI
  scenes/
    world.ts           mark, himmel, dimma, ljus, rekvisita per epok, lyktor
    ground.ts          våt asfalt (PBR), pölar med regnkrusningar, planar reflection
    props.ts           träd, stenar, berg, elstolpar, CRT-skärmar, serverrack, stad, ljuskäglor
    rain.ts            regn med rörelseoskärpa och stänk
    sky.ts             gradienthimmel, moln, blixt, dis
    structure.ts       ASI-strukturen (ikosaeder, kärna, ringar, skärvor, ljusstrålar)
    ending.ts          parkbänken, gatlyktan, förstening och vittring
    environment.ts     PMREM-miljökarta (HDRI-ersättare)
  fx/
    figureMaterial.ts  dissolve, glitch, hologram/fresnel, kretslinjer, nätverk, kod, sten
    particles.ts       partikelupplösning (sugs upp mot strukturen / blåser bort som damm)
    post.ts            ACES, 3D-LUT (kall/varm), bloom, DoF, kromatisk aberration, korn, vinjett
  audio/
    score.ts           partituret (D-moll, 96 BPM, Dm–B♭–Gm–A) som ren data
    instruments.ts     syntade instrument
    engine.ts          sequencer, regnautomation, offline-rendering, WAV
  hud/hud.ts           årtal, rubrik, underrad, kapitelräknare, pratbubblor, titelkort
export/
  render.mjs           npm run render
  preview.mjs          enstaka bildrutor
```

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
