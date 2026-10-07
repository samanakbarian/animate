# Devlogg

Nyaste överst. En post per arbetspass. Skriv för nästa agent: **vad**, **varför**, **vad som återstår**,
**fällor**. Håll varje post under ~25 rader. Detaljer finns i git-historiken (`git log --stat`).

---

## 2026-10-07 (7) – Loggan Glöd och tre teman

**Vad**

- Loggan är ”Glöd” (S2): i-pricken med två mjuka ringar och Nunito i ordbilden. Färgerna i `Logo.astro` kommer från
  temat. Mark, favicon, logo.svg, apple-touch-icon och og.png är omgjorda.
- Teman (ADR 0009): `mork`, `ljus` och `hacker` som CSS-variabler. Ett inline-skript i `<head>` sätter temat före
  första målningen, och knappen `ThemeToggle.astro` växlar och sparar. På mobil ligger knappen bredvid loggan och
  menyn på raden under.

**Fällor**

- Inline-skriptet i Base.astro lintas: `let`/`const` och `catch {}` med kommentar, annars blir `pnpm check` rött.
- Filmen, modulerna och spelen är alltid mörka. Det är avsiktligt (ADR 0009).

---

## 2026-10-07 (6) – Mjukare logga

**Vad**

- Loggan blev mjukare (S1 på designytan): böjda ingångar, rundare former, varmare orange (#e07a52), ljusare blå
  (#a9c4e4) och Nunito 800 i ordbilden (`@fontsource/nunito`, importeras bara i `Logo.astro`). Favicon, mark,
  logo, apple-touch-icon och og.png är omgjorda. ”Grundad av” är borttaget ur sidfoten. Grundaren finns kvar i
  JSON-LD, meta author, llms.txt, humans.txt och på om-sidan.
- Alternativen S2 (glöd) och S3 (pratbubbla) ligger på designytan.

---

## 2026-10-07 (5) – Hallucinationsjakten och loggförslag

**Vad**

- `game-hallucinationsjakten`: tre banor (fakta, påhittade detaljer, falska premisser) med åtta frågor var.
  Svaren ligger som data i `items.ts`, med en förklaring per fråga. Ordningen blandas med `api.rng`.
- Sex loggförslag (A–F) på en designyta (länk i STATUS): neuron-i, brickan, lager, nästa steg, monogram iA
  och två prickar. Inget är valt än. Sajten använder fortfarande A.

**Fällor**

- Fakta i spelet måste vara kontrollerbara. Undvik tvetydiga frågor (t.ex. hur många ben en ”bläckfisk” har,
  eller OS i Stockholm, där 1956 också räknas). Testet kräver att `why` börjar med Stämmer eller Påhittat.

---

## 2026-10-07 (4) – iLearnAI: namn, logga, grundare och sitemap

**Vad**

- Nytt namn: iLearnAI på ilearnai.se (ADR 0008 ersätter 0006).
- Logga: ett ”i” vars prick är en neuron. `public/mark.svg`, `logo.svg`, `favicon.svg`, `apple-touch-icon.png`
  och `og.png`. Sidhuvudet använder `components/Logo.astro`.
- Grundaren Saman Akbarian finns i `SITE.founder`. Uppgiften syns på om-sidan, i sidfoten, i JSON-LD
  (Organization, Person och WebSite), i `meta author` och i endpoints för `humans.txt` och `llms.txt`.
  `sitemap.xml` och `robots.txt` byggs ur innehållssamlingarna, så nya moduler och spel kommer med automatiskt.

**Fällor**

- PNG-bilderna renderades med Playwright från en HTML-mall med sajtens typsnitt (fontsource-filerna i
  node_modules). Mallen ligger inte i repot. Gör om den efter `og.png` om loggan ändras.

---

## 2026-10-07 (3) – Spelet Dra gränsen

**Vad**

- `game-dra-gransen`: spelaren drar en rak linje (två handtag, pekstyrning) som delar planet, precis som en neuron.
  ”Byt sida” vänder vilken sida som är blå. Fyra banor: två grupper, smal glipa, överlapp och ringen.
- `bestAccuracy` söker över vinklar (0,5°) med exakt tröskel per vinkel. Stjärnorna räknas mot den bästa
  möjliga linjen, så att även ringen (bäst under 80 %) kan ge tre stjärnor.
- Prickarna har ett fast frö per bana (`new Rng(100 + bana)`), inte `api.rng`, så att testerna gäller exakt
  de prickar spelaren ser. 107 tester.

**Fällor**

- Den blå sidan ritas som ett halvplan i världskoordinater och konverteras sedan. Ett rutnät gav synliga skarvar.

---

## 2026-10-07 (2) – Spelramverk, Gradientgolf och Slå maskinen

**Vad**

- `engine/game`: `GameDefinition` och `mountGame` (startskärm med banor och bästa resultat, poäng och status,
  resultat med stjärnor och länk till modulen). Bästa resultat sparas i localStorage, med reserv i minnet.
  Ljudeffekterna syntas direkt i `sfx.ts`. ADR 0007.
- `game-gradientgolf`: ett slag är tio steg gradientnedstigning, och spelaren väljer bara steglängden. Fyra banor,
  där bana 3 och 4 kräver att man byter steglängd för att komma ur gropen. Landskapet ritas av
  `module-traning/landscape.ts`, som modulen också använder nu.
- `game-sla-maskinen`: åtta rundor ur språkmodellens egen text. Bara lägen där modellen är osäker (under 75 %)
  eller har fel väljs. Maskinen väljer alltid sitt troligaste alternativ.
- Sajten: `content/games.json`, `lib/games.ts`, sidorna `/spel` och `/spel/<slug>`, spel på startsidan, länkar
  från modulsidorna och ”Spel” i menyn. 100 tester.

**Fällor**

- Gradientgolf bana 3: samma steglängd hela vägen fastnar alltid i gropen. Testerna låser det, så ändra inte
  `HOLES` utan att köra dem.
- Spelen ritar med väggklockan för animation, men utfallet räknas fram direkt vid slaget. Lägg inte spellogik i ritloopen.

---

## 2026-10-07 – LearnAI på learnai.se, backlogg

**Vad**

- Nytt namn och ny domän: LearnAI på learnai.se (ADR 0006). `SITE`, `astro.config.mjs`, om-sidan, sidhuvudet,
  README och AGENTS är uppdaterade. Filmen heter fortfarande NÄSTA STEG, och paketen heter fortfarande `@nastasteg/*`.
- Backlogg med featurelista och releaseplan som levande dokument (länk i STATUS och ROADMAP). Fyra releaser:
  R1 lansering, R2 spel (14 spelidéer, 8 i första omgången), R3 lärvägar, R4 skola. 32 rader med prio och status.

**Återstår**: R1, alltså driftsättning på learnai.se, statistik och test på riktiga enheter.

---

## 2026-10-06 (3) – Modul 9 och 10, ljud i modulerna

**Vad**

- `module-flera-agenter`: tolv delar fördelas på 1–4 agenter. Slarvfel hittas av en granskande agent, men fel i
  knepiga delar är blinda fläckar som granskaren delar. En människa hittar dem men kostar tid (5 → 9 enheter).
- `module-risker-och-sakerhet`, två delar. Del 1, säker men fel: kandidatsvar med sannolikheter, svaret låter lika
  säkert oavsett. En gräns gör att modellen säger ”vet inte” (0 fel, men Uppsala 1477 blir också ”vet inte”).
  Del 2, spärrar: 120 seedade förfrågningar, gräns, lurendrejeri (rollspel) och omträning.
- Ljud: `engine/module/sound.ts`. `moduleScore(def)` är en ren funktion av id och kapitel. `ModuleSound` skapar
  sin `AudioContext` först vid klick och startar om motorn vid sökning (hopp > 0,25 s). Ljudet spelar bara i
  filmläget. Knappen ljud på/av sparar valet i localStorage.
- Ingen modul är längre planerad. 88 tester.

**Fällor**

- Faktafrågor i del 1 måste stämma (Pippi, spindeln, Uppsala 1477, VM). De påhittade svaren är märkta som påhittade.

---

## 2026-10-06 (2) – Ljusare filmslut, kornfix och textgenomgång

**Vad**

- Filmkornet lades i linjärt rum, så nästan svarta pixlar hoppade upp till ~14 % i sRGB. På hög kvalitet (full
  pixeltäthet) såg hela bilden ut som brus. Nu läggs kornet i sRGB, är svagare och har fast storlek (~720 rader).
- Slutet (`scenes/ending.ts`): lampan slocknar 137,25 och tänds igen 138,5 (jämnt antal `LAMP_TOGGLES`). Ingen
  förstening eller upplösning. Människan sjunker ihop i mörkret och lyfter sedan blicken. Regnet tonar ut
  139–143,5, ljuset blir varmare och ljusare. Musiken: D-durpad + pianofras i stället för den fallande tonen.
  Ny text: ”Nästa steg är vårt att ta.” / ”Vart det leder är inte bestämt.”
- Texter: modul-md, sidor, ordlista och modulernas berättartexter är omskrivna (färre tankstreck, tretal och slagord).
  `STAGE_LABEL`/`STATUS_LABEL` är inte längre interna ord, och status visas bara när en modul inte är klar.

**Fällor**

- Berättartexten på mobil rymmer ungefär 145 tecken. Längre text täcker scenen.

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
