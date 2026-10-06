# Devlogg

Nyaste överst. En post per arbetspass. Skriv för nästa agent: **vad**, **varför**, **vad som återstår**,
**fällor**. Håll varje post under ~25 rader. Detaljer finns i git-historiken (`git log --stat`).

---

## 2026-10-06 – Version 2-modulerna (fem st)

**Vad**

- `module-transformern`: uppmärksamhet = softmax(q·k/√d) med tre huvuden (syftning, närhet, vem gör vad) på tre
  meningar. Bågar mellan ord och en uppmärksamhetsmatris.
- `module-ord-som-tal`: tokenisering (längsta prefix), sexdimensionella inbäddningar, PCA-karta och analogier
  (kung − man + kvinna ≈ drottning) med cosinuslikhet.
- `module-traning`: felyta med en böjd dal och en grop. Gradientnedstigning (60 steg) och felkurva. Kapitel visar för
  korta steg, för långa steg (studs, flyger iväg) och att fastna i gropen.
- `module-resonerande-modeller`: leksaksmodell där skrivna steg har liten felrisk, steg ”i huvudet” stor, och
  överbliven budget blir kontroller. Diagram: andel rätt på 100 seedade uppgifter per budget (46 % → 100 %).
- `module-fran-fortraning-till-assistent`: fyra sorters svar per fråga, logits per skede, och belöning per sort
  som lärs med Bradley–Terry från seedade jämförelser (10 % brus).
- Alla registrerade och publicerade. 70 tester.

**Fällor**

- Mobil (4:5): berättartexten täcker nedre ~25 %. Håll innehållet ovanför ~0,72 H. Slå hellre ihop rader
  (t.ex. kontroller utan fynd) än att krympa text.
- Testa narrativet: filmens kapitel förutsätter vissa utfall (t.ex. att äggen får ett fel som kontroll 1 hittar).
  Tester låser dem, så en ändrad seed syns direkt.

**Återstår**: varmare filmslut, textgenomgång. Se STATUS.

---

## 2026-10-05 – Modul 5 (Språkmodellen) och modul 8 (Agenten)

**Vad**

- `engine/module/canvas.ts`: delad palett, typsnitt och `createSurface` (canvas med DPR, `text()` som ger bredden).
  Modul 1 använder den inte än (egen kopia av paletten). Byt när den ändå röras.
- `module-sprakmodellen`: egen svensk text (`corpus.ts`), trigram med interpolation (0,72/0,25/0,03),
  temperatur som p^(1/T) och sampling via `hash2(frö, steg)`. Scen: token-rutor med id, topp 8-staplar, och den
  dragna token glider in. 80 s, 6 kapitel.
- `module-agenten`: `scenario({failure, approval})` är ren data (18 händelser i fullt läge). Scen: loopdiagram
  med människa utanför, verktygschips och logg som skrivs fram. 84 s, 7 kapitel.
- `tools/render/module-frames.mjs` (`pnpm module-frames -- <slug> <t…> [--part N] [--mobile]`).
- Moduler 5 och 8 publicerade. 45 tester.

**Fällor**

- Testa språkmodellen mot vad texten faktiskt innehåller. ”regnet” följs lika ofta av punkt som av ”faller”.
- Astro 7:s preview är en demon som lever kvar mellan körningar (se STATUS).

**Återstår**: MP4-reserv (kräver GPU), driftsättning och v2-moduler. Se STATUS.

---

## 2026-10-04 (3) – Modul 1 del 2: ett nätverk lär sig

**Vad**

- `network.ts`: 2 → H → 1 (tanh, sigmoid ut), korsentropi, full-batch gradientnedstigning. Seedat dataset
  (40 punkter innanför en cirkel och 40 utanför) och seedade startvikter. `computeRun` (ren) och `trainingRun`
  (cachad per H och steglängd) sparar vikter och fel för steg 0–800. Filmen visar ”steg n” som funktion av t.
- `scene-network.ts`: nätverksdiagram, planet med data (felklassade får en ring), gränsen via marching squares,
  de dolda neuronernas linjer (streckade) och felkurva med ”steg · fel · % rätt”.
- `timeline-network.ts`: 74 s i 6 kapitel. En neuron misslyckas (74 %), sedan fyra dolda neuroner från
  slumpade vikter (44 %), träning till 100 %, och till sist linjerna inuti.
- Modulpaket exporterar nu `parts: ModuleDefinition[]`, och `ModuleStage.astro` monterar en spelare per del
  med rubrik. Modul 1 har status `publicerad`. 34 tester (bl.a. ”H = 1 når < 80 %, H = 4 når ≥ 95 %”).

**Fällor**

- Värmekartans kantpixlar gav trappsteg. Gränsen ritas därför som vektor (marching squares) ovanpå.
- `hold` i nyckelrutor = värdet hoppar vid nyckelns tid. Använd två nycklar tätt (22 → 22,01) för hopp.

---

## 2026-10-04 (2) – Modulramverk och modul 1 del 1

**Vad**

- `@nastasteg/engine/module/*`: `ModuleDefinition` (params, nyckelrutor, kapitel, scen), rena funktioner för
  nyckelrutor, `ModuleController` (film/explore, injicerad klocka) och `mountModulePlayer` (scen, berättartext,
  scrubbning med kapitelmarkeringar, reglage, ”Fortsätt filmen”, ”Återställ reglagen”). CSS i `player.css`
  under `.ns-module`. Container query ger stående 4:5-yta på smala skärmar.
- `packages/module-neuralt-natverk`: en neuron (z = w₁x₁ + w₂x₂ + b, y = σ(4z)), en 64 s film i 5 kapitel,
  och en Canvas 2D-scen med diagram och plan med beslutsgräns. Staplad layout när ytan är stående.
- Hemsidan: `ModuleStage.astro` monterar modulen från registret `src/lib/interactive.ts` (egen chunk per modul).
  Modul 1 har status `under-arbete`.
- Om-sidan: kontakt saman.akbarian@gmail.com (användaren skrev ”saman akbarian@gmail.com”, tolkat som punkt).
- ADR 0004 beslutad. 30 tester.

**Fällor**

- Exportmönstret `"./*": "./src/*.ts"` matchar inte CSS. Därför har `./module/player.css` en egen rad före den.
- Scenen får CSS-pixlar i `resize`. Använd `ctx.setTransform(dpr…)` och rita i CSS-pixlar.

**Återstår**: del 2 av modul 1 (tränat nätverk), se STATUS.

---

## 2026-10-04 – Monorepo, hemsida och agentdokumentation

**Vad**

- Repot omstrukturerat till pnpm-monorepo: `apps/web` (Astro 7), `packages/engine`, `packages/film`,
  `tools/render`. Filerna flyttades med `git mv`, så historiken följer med.
- Motorn frikopplad från filmen: `AudioEngine(ctx, score)` tar ett `Score` (events, duration,
  ambience). Pad/stab får ackordtoner via `NoteEvent.notes` i stället för hårdkodade ackord.
- Filmen har ett publikt API (`mountPlayer`, `mountRenderTarget`, `supportsRealtime`). Bildytan
  storleksanpassas efter behållaren (ResizeObserver), och CSS:en är avgränsad till `.ns-player`.
- Hemsida: startsida med filmen som lat klient-ö, modulöversikt, modulsidor, ordlista och om-sida.
  Innehållet ligger i content collections med zod-schema.
- Verktyg: ESLint (flat config), Prettier, Vitest (22 tester), GitHub Actions CI, `.editorconfig`, `.nvmrc`.
- Dokumentation: `AGENTS.md`, `CLAUDE.md`, `docs/STATUS.md`, `ARCHITECTURE.md`, `ROADMAP.md` och ADR 0001–0005.

**Varför**: filmen ska bli en del av produkten nastasteg.se. Flera filmer och moduler ska dela motor.

**Fällor**

- npm 10 kraschar (`edgesOut`) på peer-beroenden i workspaces. Därför används pnpm.
- `pnpm frames -- …`: pnpm skickar med `--` bokstavligt, och verktygen filtrerar bort det.
- Playwright-skript måste ligga där `playwright` går att resolva (`tools/render/`).

**Återstår**: se `docs/STATUS.md` → Nästa.

---

## 2026-10-01 – Ny musik och tystare regn

- Regnet sänkt i två omgångar (nu ≈ −16 dB jämfört med första versionen).
- Musiken omskriven: breakbeat (kick 1/”och”/3), clap, spökslag, tom-fills var fjärde takt, distade
  ackordstötar, ny rytmisk melodi och pumpande ducking av musikbussen på varje kick.
- Mindre bas: basen ligger i ett högre register med högpass, ingen sub-oktav, och mixen har en lågshelf på −5 dB.
  Uppmätt: <120 Hz sjönk 4,7 dB.

## 2026-09-30 – Kortfilmen NÄSTA STEG v2

- 3D-kortfilm (2 min 30 s) i Three.js + postprocessing enligt spec: procedurell riggad figur, 14 steg
  med dissolve-övergångar i takt, våt asfalt med planar reflection, regn, volymetriska ljuskäglor,
  ACES + 3D-LUT, bloom, skärpedjup och korn. ASI-sekvens och slut på parkbänken.
- Syntad musik (D-moll, 96 BPM) via Web Audio, samma partitur i realtid och offline.
- Export: Playwright stegar `t`, OfflineAudioContext ger WAV och ffmpeg gör MP4. Verifierat på ett utsnitt (105–109 s).
- Determinism verifierad: samma `t` ger pixelidentisk bild oavsett renderingsordning.
