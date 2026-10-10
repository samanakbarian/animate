# Devlogg

Nyaste överst. En post per arbetspass. Skriv för nästa agent: **vad**, **varför**, **vad som återstår**,
**fällor**. Håll varje post under ~25 rader. Detaljer finns i git-historiken (`git log --stat`).

---

## 2026-10-10 (2) – Spola i kortfilmen

**Vad**

- `packages/film/src/player.ts`: kontrollerna är nu en rad längs nederkanten med paus, en tidslinje
  (`input type=range`) och tiden. Pilarna ←/→ hoppar 10 s för alla (förut bara i dev-läge).
- Spolning: bilden är en ren funktion av t, så bara ljudet behöver göras om. `seekTo` tystar ljudmotorn och
  startar en ny från den nya tiden. Medan man drar visas den tiden, ljudet står still och inget schemaläggs.

**Fällor**

- Schemalägg inte ljud medan man drar i tidslinjen: att dra framåt 100 s schemalägger annars 100 s ljud på en gång.

---

## 2026-10-10 – Modul 18: AI och lagen (B-30, sjätte av åtta)

**Vad**

- `packages/module-ai-och-lagen`: AI-förordningens fyra nivåer som pyramid (förbjudet, hög risk, krav på öppenhet,
  låg risk) med nio exempel och förkortade krav per nivå. Sista kapitlet visar rättigheter enligt GDPR.
- Exemplen och kraven ligger i `rules.ts` och följer förordningen (EU) 2024/1689, artikel 5 (förbud), bilaga III
  (hög risk: anställning, utbildning, kreditprövning) och artikel 50 (chattbotar, deepfakes). Inga datum i bild,
  eftersom tillämpningen sker stegvis och kan skjutas upp.
- Lektion 8 ”AI och samhället” täcker nu AI och arbete och AI och lagen. Ordlistan: AI-förordningen, GDPR, deepfake.

**Återstår**

- Två moduler kvar i B-30: klimat, framtid. Upphovsrätt saknas medvetet (oklart rättsläge), kan bli en egen modul.

---

## 2026-10-09 (11) – Modul 17: AI och arbete (B-30, femte av åtta)

**Vad**

- `packages/module-arbete`: fyra jobb (kundtjänst, lärare, sjuksköterska, snickare) som en vecka av uppgifter.
  Varje uppgift har andel av veckan, hur svår den är för AI och sort (text, möten, händer). `jobs.ts` räknar vad
  AI gör, den nya uppgiften att granska (30 % av sparad tid) och tid som blir över.
- Kapitel: ett jobb är uppgifter, AI tar uppgifter, någon måste granska, olika jobb, bättre AI, din tur.
  Siffrorna är påhittade och det står både i bild och på modulsidan.
- Ny lektion 8 ”AI och samhället” på `/skola` (de kommande modulerna rätt, klimat och framtid kan läggas där).

**Fällor**

- Staplarna skalas mot den största uppgiften i alla jobb, annars sticker snickarens 60 % ut ur bild.

**Återstår**

- Tre moduler kvar i B-30: rätt, klimat, framtid.

---

## 2026-10-09 (10) – Modul 16: Verktyg (B-30, fjärde av åtta)

**Vad**

- `packages/module-verktyg`: fyra frågor (stort tal, väder, Röda rummet, Malmö mot Kiruna) och två verktyg
  (miniräknare, påhittat väder). `tools.ts` ger förloppet fråga → anrop → resultat → svar för varje val.
  Scenen visar samtalet och ett diagram modellen → programmet → verktyget med pil för det som händer.
- Kapitel: den gissar, ett anrop, programmet kör, svaret, modellen väljer, flera anrop, inget verktyg, din tur.
  Testerna låser manuset per kapitel.
- Lektionen ”AI som gör saker” börjar nu med Verktyg och har fått tid för Agentbyggaren (som saknades i
  tidsplanen). Ordlistans verktygsanrop pekar hit.

**Återstår**

- Fyra moduler kvar i B-30: arbete, rätt, klimat, framtid.

---

## 2026-10-09 (9) – Modul 15: Kontext (B-30, tredje av åtta)

**Vad**

- `packages/module-kontext`: ett samtal på 14 meddelanden där det första säger att hunden heter Ture. Ramen visar
  vad som ryms i kontextfönstret (räknat bakifrån). Kapitel: det modellen ser, tokens, samtalet växer, bortglömt,
  större fönster, minne är en anteckning, din tur.
- `context.ts` är ren logik; testerna låser manuset (glömt vid 40 s, minns med större fönster och med minne).
- Lektionen ”Använda AI klokt” täcker nu också Kontext (tidsplanen omräknad till 50 min). Ordlistan: minne;
  kontextfönster pekar nu på Kontext.

**Fällor**

- Frågan räknas bara in i fönstret när den syns, annars stämmer inte ”använt” med raderna.
- För många rader slås ihop till ”… n meddelanden till”, men första meddelandet (hunden) visas alltid.

**Återstår**

- Fem moduler kvar i B-30: verktyg, arbete, rätt, klimat, framtid.

---

## 2026-10-09 (8) – Modul 14: Datorseende (B-30, andra av åtta)

**Vad**

- `packages/module-datorseende`: en form på 16 × 16 pixlar, fyra handskrivna kantfilter på 3 × 3 som glider över
  bilden, en profil över hur mycket av varje sorts kant bilden har, och ett svar per form (jämförelse med fyra
  förebilder). Kapitel: bild är tal, filtret glider, olika kanter, räkna ihop, svar, andra former, säker men fel.
- `vision.ts` är ren logik med tester: alla former känns igen utan brus, och med 60 % brus svarar modellen
  ”cirkel 98 %” på kvadraten. Det är poängen i kapitlet ”Säker, men fel”.
- Lektion 7 heter nu ”AI och bilder” och täcker båda bildmodulerna. Ordlistan: datorseende, filter, faltningsnätverk.

**Fällor**

- Med vanlig summa av |svar| liknade alla former varandra, för varje filter svarar lite på alla vinklar. Varje
  pixel räknas därför bara till det filter som svarar starkast.
- Mobilen: talen i pixlarna går inte att läsa i liten bild, så bilden visas stor i första kapitlet.

**Återstår**

- Sex moduler kvar i B-30: kontext, verktyg, arbete, rätt, klimat, framtid.

---

## 2026-10-09 (7) – Modul 13: AI som gör bilder (B-30, första av åtta)

**Vad**

- `packages/module-ai-som-gor-bilder`: en bild på 48 × 36 pixlar växer fram ur brus på 20 steg. Kapitel: brus,
  lite i taget, grovt först, texten styr, nytt brus ger ny bild, träningen går baklänges, din tur.
- `diffuse.ts` är ren logik: målbild per text och frö, lådoskärpa (så att det grova kommer först) och brus.
  ”Brus kvar” är samma kurva som bilden använder. Tester låser manuset (annan text vid 46 s, nytt frö vid 58 s).
- Modulsidan med quiz och ”Vad vi förenklar här” (målbilden finns redan i koden). Ordlistan: diffusionsmodell, brus.
- Ny lektion 7 på `/skola` (testet kräver att lektionerna täcker alla moduler). Hela kartan kräver nu 13 quiz.

**Fällor**

- Mobilen: bild, stegrad och brusrad fick inte plats ovanför texten. På mobil står brus % i stegraden.

**Återstår**

- Sju moduler kvar i B-30: datorseende, kontext, verktyg, arbete, rätt, klimat, framtid.

---

## 2026-10-09 (6) – Spelet Agentbyggaren (B-29)

**Vad**

- `packages/game-agentbyggaren`: tre banor (boka middag, städa inkorgen, skriva en rapport). Spelaren kryssar för
  vilka verktyg agenten får använda och vilka som kräver godkännande. Agenten kör sedan och loggen visar GÖR,
  FRÅGAR, STOPPAD, OJ, FAST och ONÖDIGT.
- Poäng: klart +5, något du inte ville −4, varje fråga −1, onödigt verktyg −1. `bestScore` prövar alla
  kombinationer, så stjärnorna jämförs med det bästa möjliga. Tester i `scenario.test.ts`.
- Kopplat till modulen Agenten, lektionen om AI som gör saker och märket Spelmästare (nu tolv spel).

**Återstår**

- Nästa: B-30, nya moduler, en i taget.

---

## 2026-10-09 (5) – Lektioner för skolan (B-25)

**Vad**

- `content/lessons.json` (samling `lessons`): sex lektioner på 50 minuter. Test: varje lektion summerar till 50 minuter,
  tillsammans täcker de alla moduler, och alla spel finns.
- `/skola` och `/skola/<id>`: mål, förberedelser, tidsplan, länkar, diskussionsfrågor och facit (modulernas quiz med
  förklaringar och vanliga missförstånd). Utskrift döljer sidhuvud och fäller ut facit.

**Återstår**

- Testa med en riktig klass. Klassläge och uppdrag (B-26, B-27) kräver backend.

---

## 2026-10-09 (4) – Dagens AI-fråga (B-24)

**Vad**

- `DailyQuestion.astro` på startsidan. Alla quizfrågor skickas med som data och webbläsaren väljer dagens med
  `lib/daily.ts` (dagnummer sedan 2026-01-01, fast blandad ordning, alla frågor innan någon upprepas).
- Svit i `localStorage` (`ilearnai-daily`), dagens svar sparas så att det visas igen efter omladdning.
- Ny regeltyp för märken: `streak`. Märket Fem dagar i rad.

**Fällor**

- Datumet används bara för att välja fråga på sajten. Determinismregeln gäller filmer och moduler.

---

## 2026-10-09 (3) – Spelen Ordräknaren och Lär maskinen (B-22)

**Vad**

- `packages/game-ordraknaren`: en kort text i `counts.ts`, frågor om vanligaste nästa ord (ett och två ord bakåt) och
  sannolikhet. Allt räknas ur texten; testet kräver entydiga svar.
- `packages/game-lar-maskinen`: heltalsvikter och bias, alla kombinationer av insignaler som exempel, ledtråd enligt
  perceptronregeln. Banans par räknas med bredden-först-sökning (1, 2, 4 drag). `lowerIsBetter`.

**Fällor**

- Små texter ger lätt oavgjort mellan nästa ord. Lägg hellre till en mening i texten än byt fråga gång på gång.
- Långa etiketter i smala rutor täcker knapparna; lägg etiketten på egen rad.

---

## 2026-10-09 (2) – Modul Data och bias och spelet Snedvriden data (B-20)

**Vad**

- `packages/module-data-och-bias`: `learn.ts` är en riktig liten modell (logistisk regression, gradientnedstigning,
  seedad data) med form och snö som egenskaper. Med 95 % vargar i snö: 97 % rätt på träningen, 32 % på svåra
  testbilder. Balanserat: 96 %. Testerna låser siffrorna som manuset påstår. Del 2: förenklad inlärningskurva per dialekt.
- `packages/game-snedvriden-data` importerar `@nastasteg/module-data-och-bias/learn` (spel → modul → motor).
- Märken uppdaterade (12 moduler, 9 spel). Ordlistan: Bias.

**Fällor**

- Etiketter i sifferpanelen måste vara korta, annars krockar de med procenten på datorbredd.

---

## 2026-10-09 – Modul Att prata med AI och spelet Promptpusslet (B-21)

**Vad**

- `packages/module-att-prata-med-ai`: ett mejl till mentorn byggs upp av fyra delar i frågan. Svaren är förskrivna per
  kombination (`prompt.ts`), med typerna ok, allmänt, påhittat, fyllnad och lucka. Kapitlet ”Läs igenom” tar bort
  sammanhanget igen för att visa att påhittet kommer tillbaka. Order 11, stage mvp (syns under Grunderna).
- `packages/game-promptpusslet`: välj bitar till en fråga; behövd bit +1, fälla −1, fluff 0. Genomgång bit för bit.
- Märkena Hela kartan (11 moduler) och Spelmästare (8 spel) uppdaterade. Ordlistan: Prompt.

**Fällor**

- Etiketter inne i löptext på canvas krockar med raden ovanför. Använd en förklaring under texten i stället.
- Testet för märken läser modulerna med `import.meta.glob`, så det behöver inte ändras när en modul läggs till.

---

## 2026-10-08 (6) – Två lärvägar till och diplom (B-18, B-28)

**Vad**

- Lärvägarna ”Hur skriver en chattbot?” och ”Kan man lita på AI?” i `content/paths.json`, sidan `/lar` med alla
  lärvägar och hur långt man kommit. Slutrubrik (`doneTitle`) och länkar vidare (`next`) är nu data, inte kod.
- Diplom: namn (sparas inte), lärvägens titel, de tre insikterna och datum. Utskrift via `print()` med en klass på
  `body` som döljer allt utom diplomet. Webbläsaren sparar som PDF.
- Två nya märken (Inifrån, Källkritisk). Testerna kontrollerar alla lärvägar: minuter, moduldelar, spel och frågor.

**Fällor**

- I Astro försvinner mellanslaget mellan text och ett `{uttryck}` på nästa rad. Skriv `{' '}`.

---

## 2026-10-08 (5) – Framsteg och märken (B-19)

**Vad**

- `/framsteg`: lärvägar, moduler (utforskad, quizresultat), spel (banor med resultat) och åtta märken. Allt läses
  ur `localStorage` (`lib/progress.ts`, rena funktioner med tester). Knapp för att rensa.
- Märkena är data (`content/badges.json`, samling `badges`) med regeltyper: quizzes, perfect, explored, games, path.
  Ett test kontrollerar att alla märken går att få med innehållet som finns.
- Modul räknas som utforskad (`ilearnai-seen-<slug>`) när besökaren rör ett reglage eller ser klart.
- Quizet visar ”Nytt märke: …” genom att jämföra lagringen före och efter.

**Fällor**

- `getCollection('badges')` sorterar efter id. Sidan sorterar om efter ordningen i JSON-filen.

---

## 2026-10-08 (4) – Granskningen: läranderesa, korrekthet, film, tillgänglighet

**Vad**

- Driftsättning kontrollerad (HTTPS, www, robots, sitemap, 404). Fel hittat och rättat: canonical slutade på `.html`.
  Repots standardgren är `ccr-f401e4bd-y1vmji`, inte `master` – grundaren behöver byta i GitHub.
- Filmen: statisk startskärm, filmpaketet laddas vid klick, ljud skapas i klicket (iOS), fel och tappat WebGL-
  sammanhang ger ”Försök igen”, videoreserv förberedd men filen saknas, filmen i text.
- Korrekthet: kausal uppmärksamhet (Transformern, ”Vem är den”), Tokenjakten, Resonerande modeller, Agenten,
  Gradientgolf (riktning/lutning stod omvänt). ”Vad vi förenklar här” i alla tio moduler.
- Quiz: 40 nya frågor (förstå, förstå, använd, förutsäg), förklaring per alternativ, hopp till kapitlet.
- Lärväg `/lar/forsta-ai` och ny startsida. ”På gång” stod över publicerade moduler (STAGE_LABEL), rättat.
- Tillgänglighet och statistik (ADR 0012, avstängd). Skolmaterial: förslag i `docs/SKOLMATERIAL.md`.

**Fällor**

- Mjuk scroll avbryts när en modul laddas in och sidan växer. Lärvägen scrollar direkt.
- Webbappen saknar Node-typer: tester i `apps/web` läser filer med `import.meta.glob`, inte `node:fs`.

---

## 2026-10-08 (3) – Quiz i modulerna, kortare om-sida

**Vad**

- Quiz i slutet av varje modul (B-17): `quiz` i modulens frontmatter (fråga, rätt svar, fel svar, förklaring, max
  160 tecken), `ModuleQuiz.astro` på modulsidan. Alternativen blandas med en hash av frågan, så ordningen är fast.
  Bästa resultat sparas i `localStorage` (`ilearnai-quiz-<slug>`), tänkt för framsteg (B-19).
- Om-sidan berättar inte längre hur sajten är byggd, och filmens startskärm säger inte ”i kod”. Grundaren vill att
  texterna handlar om AI, inte om tekniken bakom sajten.

**Fällor**

- Rätt svar hamnade sällan först med hashen (7 av 40). Det gör inget, men byt hash om fördelningen blir skev.

---

## 2026-10-08 (2) – Spelet AI-tidslinjen

**Vad**

- `packages/game-ai-tidslinjen`: lägg händelser i AI:s historia i rätt ordning, ett kort i taget (som kortspelet
  Timeline). Första kortet ligger redan. Fel placering läggs ändå på rätt plats så att tidslinjen alltid stämmer.
  Tre banor: milstolpar 1943–2022, upp och ner (AI-vintrar) och det senaste 2009–2024. Lodrät lista, fungerar på mobil.
- Årtalen i `events.ts` är kontrollerade; inom en bana får två händelser inte ha samma år (testat).

**Återstår**

- Spelet täcker roadmap-punkten ”Tidslinje 1943–2026” delvis. En egen tidslinjesida kan återanvända `events.ts`.

---

## 2026-10-08 – Liknelsen med hjärnan i modul 1

**Vad**

- Del 1 i modul 1 börjar nu med en nervcell (0–14 s): dendriter, cellkropp och axon, signaler som färdas in och
  cellen som skjuter var 2,5 s. Kapitlet ”En förenklad kopia” visar vad delarna motsvarar (tal in, summa, signal ut).
  Nervcellen tonar sedan över i beslutsdiagrammet på samma plats. Del 1 är nu 70 s; beslutsdelens tider ligger
  efter `BIO_END` i `timeline-beslut.ts`.
- Modultexten förklarar att sajten handlar om artificiella neurala nätverk, och att liknelsen gäller idén, inte biologin.
  Ordlistan har ett nytt begrepp, ”Artificiellt neuralt nätverk”.

---

## 2026-10-07 (11) – Paus i filmen och en enklare början på modul 1

**Vad**

- Filmen går att pausa för alla: knapp och tid nere till höger, klick i bilden eller mellanslag (bara när filmen
  syns). Pausen fanns förut bara i dev-läget och tog fel tid: `now()` lästes efter att `paused` satts.
- Modul 1 har en ny del 1, ”Ett enkelt beslut” (`beslut.ts`, `timeline-beslut.ts`, `scene-beslut.ts`): ska du gå ut
  och spela fotboll? Sol och läxor ger poäng via vikter, biasen är hur sugen du är, och en lampa tänds om summan
  är över noll. En tallinje visar nej/ja. Grundaren tyckte att ”en rak linje som tänder saker” var svår att förstå.
- Den gamla del 1 är nu del 2, ”Samma neuron som en karta”, med texter som bygger vidare på lampan och förklarar
  att linjen är där summan är noll. Nätverket är del 3. Modul-id:n är oförändrade (`neuralt-natverk-1`, `-2`).

**Fällor**

- `formatNumber(-0)` ger ”−0,0”. Scenen skriver 0 utan tecken.

---

## 2026-10-07 (10) – Spelet Vem är ”den”?

**Vad**

- `packages/game-vem-ar-den`: klicka på ordet som ett pronomen syftar på. Efter valet visas ett tänkt
  uppmärksamhetshuvud som staplar ovanför orden. Tre banor: grammatiken hjälper, Winograd-par (”ett ord ändrar
  allt”, blandas inte så att paren står ihop) och långt bort. I två av paren väljer huvudet fel (`headWrong`), testat.
- Datan i `sentences.ts`: `[rätt ord]` och `{pronomen}` markeras i texten, `attn` ger vikter för några ord.

**Fällor**

- Klassen `.after` användes både för ord efter pronomenet och för svarsrutan; `querySelector('.after')` tog fel element.
- `.ns-game button:hover` (0,2,1) slår `.vd .vd-word` (0,2,0). Använd `.vd button.vd-word`.

---

## 2026-10-07 (9) – Spelet Tokenjakten

**Vad**

- `packages/game-tokenjakten`: spelaren klipper ord i tokens med banans ordförråd (enskilda tecken finns alltid).
  Rätt = så få bitar som möjligt (dynamisk programmering i `bestSplit`). Efter svaret visas tokeniserarens
  uppdelning och påhittade men fasta token-id:n. Fyra banor: ordbitar, sammansatta ord, mellanslag, siffror och stavfel.
- Spelskalet visar inte längre ”nytt rekord” när poängen är 0.
- Spärrvakten är struken tills vidare: exempeltexterna stoppades av säkerhetsfiltret.

**Fällor**

- Spelskalets knappstil slår igenom på allt som är `<button>`. Springorna mellan tecknen behöver `.tj .tj-gap{all:unset}`.
- `align-content: center` med `overflow:auto` klipper toppen på mobil. Använd `safe center`.

---

## 2026-10-07 (8) – Personligare design

**Vad**

- Ny typografi och känsla (ADR 0010): Fraunces, Atkinson Hyperlegible och Caveat (fontsource). Handskrivna
  anteckningar i stället för etiketter i versaler, handritad understrykning i startsidans rubrik, vågig markering
  i menyn, färg och ”nr N” per modul, streckade spelkort, rundade hörn och prickat papper i ljust tema.
- Startsidan: avsnittsrubrikerna ”Börja här” och ”Eller lär dig genom att spela” har handskrivna kommentarer.

**Fällor**

- `.eyebrow` används på många ställen (sidhuvuden och `dt`). Ändringen slår igenom överallt, även i modulernas
  delrubriker (`ModuleStage.astro`).

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
