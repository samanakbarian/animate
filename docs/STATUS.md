# Status

_Uppdateras i slutet av varje arbetspass. Håll filen under ~50 rader._

**Senast uppdaterad:** 2026-10-09

## Nuläge

- **iLearnAI** på https://ilearnai.se (Netlify, gren master, HTTPS, www → ilearnai.se). Monorepo: `apps/web` (Astro),
  `packages/engine`, `packages/film`, `packages/module-*` (15), `packages/game-*` (12), `tools/render`.
- **Väg in:** startsidan leder till lärvägen `/lar/forsta-ai` (”Förstå hur AI fungerar på 20 minuter”, sex steg:
  neuron, nätverk, språkmodell, spelet Slå maskinen, agent, slutprov). Framsteg sparas lokalt; startsidan visar
  ”Fortsätt lärvägen”. Kortfilmen ligger under hjälten, med länk vidare efter filmen. Tre spel visas, resten på `/spel`.
- **Modul 11 – Att prata med AI** (B-21): en fråga byggs del för del (vad och till vem, sammanhang, format, exempel)
  och svaret markerar påhittat, allmänt, fyllnad och luckor. Spelet **Promptpusslet** (3 banor × 3 uppgifter).
- **Modul 12 – Data och bias** (B-20): del 1 varg eller hund (en riktig liten modell tränas och tar genvägen ”snö =
  varg”), del 2 taligenkänning per dialekt (snittet döljer skillnaden). Spelet **Snedvriden data** (välj träningsbilder).
- **Spelen Ordräknaren och Lär maskinen** (B-22): räkna nästa ord i en kort text som en språkmodell, och justera
  vikter för hand tills en neuron gör rätt (par uträknat med bredden-först-sökning). Elva spel totalt.
- **Spelet Agentbyggaren** (B-29): ge en agent verktyg och bestäm vad den måste fråga om. Tolv spel totalt.
- **Modul 13 – AI som gör bilder** (B-30): från brus till bild på 20 steg, texten styr och startbruset ger variation.
- **Modul 14 – Datorseende** (B-30): filter som hittar kanter, ett svar per form, och brus som ger ett säkert men fel svar.
- **Modul 15 – Kontext** (B-30): kontextfönstret, varför början av ett långt samtal glöms, och hur ”minne” fungerar.
- **Dagens AI-fråga** (B-24) på startsidan: en fråga per dag ur modulernas quiz (`lib/daily.ts`), svit i rad och
  märket Fem dagar i rad.
- **För skolan** (B-25): `/skola` med sju lektioner på 50 minuter som täcker alla moduler (`content/lessons.json`),
  tidsplan, diskussionsfrågor och facit med vanliga missförstånd. Utskrivbara. Länk i sidfoten.
- **Alla moduler** med film, reglage och ljud. Varje modul har ”Vad vi förenklar här” och ett quiz (förstå ×2,
  använd, förutsäg) där fel svar förklaras och länkar tillbaka till kapitlet i filmen.
- Pedagogiska rättelser: kausal uppmärksamhet i Transformern (reglaget ”Får titta”), Tokenjakten säger att färst
  bitar är en förenkling, Resonerande modeller lovar ingen garanti, Agenten jämför samtal och agent i en tabell.
- **Filmen:** statisk startskärm, 3D-motorn laddas först vid klick, fel visas med ”Försök igen”, paus, filmen i text.
- Tillgänglighet: 32 px reglage, kapiteltext till skärmläsare en gång (inte tecken för tecken), reducerad rörelse,
  tangentbord i Dra gränsen. Statistik utan kakor finns men är **avstängd** (ADR 0012).
- **Tre lärvägar** på `/lar` (B-18): Förstå hur AI fungerar (20 min), Hur skriver en chattbot? (25 min) och Kan man
  lita på AI? (20 min). Varje lärväg ger ett **diplom** att skriva ut eller spara som PDF (B-28). Menyn: Lärvägar.
- **Framsteg och märken** på `/framsteg` (B-19): tio märken i `content/badges.json`, regler i `lib/progress.ts`,
  allt läst ur webbläsarens lagring. Quizet säger till när man får ett nytt märke. Länk i sidfoten.
- 190 tester gröna. CI kör format, lint, typecheck, test och bygge på `master`.

## Nästa (i prioritetsordning)

1. **Videoreserven:** på en dator med GPU, kör
   `pnpm render -- --w 1280 --h 720 --crf 26 --out apps/web/public/film/nasta-steg.mp4` och committa filen
   (~20 MB). Spelaren använder den automatiskt utan WebGL2 och på svaga enheter. Filen finns **inte** än.
2. **Grundaren:** välj statistiktjänst (ADR 0012) och sätt `PUBLIC_STATS_URL` i Netlify. Byt repots standardgren
   till `master` på GitHub (i dag `ccr-f401e4bd-y1vmji`, CI körs bara på master).
3. Testa lärvägen med riktiga nybörjare. Mät avhopp per steg när statistiken är på.
4. B-30 nya moduler, en i taget (klar: bilder, datorseende, kontext; kvar: verktyg, arbete, rätt, klimat, framtid). Lärare: testa en lektion med en riktig klass. Skolmaterial: `docs/SKOLMATERIAL.md`.
5. Backend avvaktar (ADR 0011). Spärrvakten är pausad (exempeltexterna stoppas av säkerhetsfiltret).

## Kända problem och fällor

- Byggmiljön för agenter saknar GPU: filmen renderas i mjukvara (~0,4 bilder/s). Ingen MP4 kan göras här.
- Uppspelning på riktiga iOS- och Android-enheter är inte provad, bara i Chromium (desktop och mobil-viewport).
- Spelaren erbjuder bara låg och mellan kvalitet. Hög används bara vid export.
- `[hidden]` har `display: none !important` globalt; komponenter med `display: grid` döljs annars inte.
- Quizets `see` måste peka på ett kapitel som finns; `lib/quiz.test.ts` kontrollerar det.
- `.ns-game button:hover` (0,2,1) slår enkla klassväljare i spel; använd `.x button.y`.
- Astro 7:s `astro preview` är en delad demon. `pnpm module-frames` har egen statisk server.

## Länkar

- **Backlogg och releaseplan:** https://claude.ai/code/artifact/8fc1d0da-e959-46f2-9e61-5362ab172aae
- Roadmap i repot: `docs/ROADMAP.md` · Skolmaterial: `docs/SKOLMATERIAL.md` · Statistik: `docs/adr/0012-statistik.md`
