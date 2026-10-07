# Status

_Uppdateras i slutet av varje arbetspass. Håll filen under ~50 rader._

**Senast uppdaterad:** 2026-10-07

## Nuläge

- Sajten heter **iLearnAI** och ska ligga på **ilearnai.se** (ADR 0008). Logga, delningsbild, JSON-LD med grundaren
  Saman Akbarian, `sitemap.xml`, `robots.txt`, `llms.txt` och `humans.txt` finns. Målet: en stor utbildningssajt om AI med
  moduler, spel, lärvägar och skolmaterial. Se backloggen.

- Monorepo med pnpm: `apps/web` (Astro), `packages/engine`, `packages/film`, `packages/module-*` (10 st), `tools/render`.
- Kortfilmen NÄSTA STEG spelas på startsidan (laddas lat).
- **Modulramverket finns** (`@nastasteg/engine/module/*`, ADR 0004): film med kapitel och berättartext,
  scrubbning, och reglage som pausar och låter besökaren styra. Stående layout på mobil.
- **Modul 1 är klar** (`/moduler/neuralt-natverk`, status publicerad): del 1 en neuron (64 s), del 2 ett
  2–H–1-nätverk som tränas deterministiskt i webbläsaren (74 s, reglage för dolda neuroner, steg, steglängd).
- **Modul 5 – Språkmodellen** (80 s): en liten seedad trigrammodell på egen svensk text. Reglage för början,
  antal ord, temperatur och slumpfrö. **Modul 8 – Agenten** (84 s): en simulerad agent bokar ett möte i loopen
  tänk/agera/observera med verktyg. Reglage för fel (rummet upptaget) och människa i loopen.
- **Spel (R2 påbörjad):** spelramverket finns (`engine/game`, ADR 0007). Fyra spel på `/spel`: Gradientgolf (4 banor),
  Slå maskinen (2), Dra gränsen (4) och Hallucinationsjakten (3). Modulsidorna länkar till spelen.
- **Alla tio moduler är publicerade och interaktiva**, med ljud (lugnt syntat partitur per modul, knapp för av/på).
- Alla tre MVP-modulerna är publicerade.
- **Alla fem v2-moduler är publicerade:** Träning (gradientnedstigning i ett fellandskap), Ord som tal (tokens,
  inbäddningar, PCA-karta, analogier), Transformern (uppmärksamhet med tre huvuden), Resonerande modeller
  (tankesteg och kontroller, andel rätt mot budget) och Från förträning till assistent (tre skeden, återkoppling).
- Filmen har ett ljusare slut (lampan tänds igen, regnet upphör, D-dur). Filmkornet är fixat (gav brus i hög kvalitet).
- Texten på sajten, i modulerna och i ordlistan är genomgången: enklare språk, och beskrivningarna stämmer med modulerna.
- Om-sidan har kontakt: saman.akbarian@gmail.com.
- 111 tester gröna. CI kör format, lint, typecheck, test och bygge.

## Nästa (i prioritetsordning)

1. **MP4-reserv för filmen:** rendera `out/nasta-steg.mp4` på en dator med GPU och visa den i `FilmPlayer.astro`
   för webbläsare utan WebGL2 och för svaga mobiler.
2. Fler spel enligt backloggen (R2): Spärrvakten, Tokenjakten, Vem är ”den”?,
   AI-tidslinjen, och quiz i modulerna.
3. Driftsättning: `netlify.toml` finns. Sajten är driftsatt som eget Netlify-projekt (gren master, apps/web).
   Lägg till ilearnai.se där när domänen är köpt.
4. Besöksstatistik utan kakor och delningsbilder (og:image).

- Personligare stil (ADR 0010): Fraunces i rubriker, Atkinson Hyperlegible i brödtext, kursiva anteckningar, en färg per modul, rundade kort och prickat papper i ljust tema.
- Tre teman: mörk, ljus och hacker (ADR 0009). Knapp i sidhuvudet, valet sparas, annars följer sajten systemet.
- Loggan är ”Glöd” (S2): ett i vars prick glöder. Loggförslag på designytan: https://claude.ai/artifact/GyYAeyEsuZEHTN8KAcN1x7.

## Kända problem och fällor

- Byggmiljön för agenter saknar GPU: filmen renderas i mjukvara (~0,4 bilder/s). Använd `pnpm frames` sparsamt.
- 60 fps på integrerad grafik är inte uppmätt på riktig hårdvara.
- Astro 7:s `astro preview` körs som en delad demon (`astro preview stop`). `pnpm module-frames` har därför en egen statisk server.
- Node:s `fetch` mot localhost kan få ett felsvar från proxyn. Kontrollera status 200, inte bara att anropet lyckas.
- Spelaren erbjuder bara låg och mellan. Hög (full pixeltäthet, 4× MSAA) gav trasig bild hos användaren, orsaken är
  okänd (troligen minne eller MSAA på halvflyttal). Hög används bara vid export.
- `trainingRun(H, lr)` cachar per (H, steglängd); första anropet för en ny kombination tar några ms.

## Länkar

- **Backlogg och releaseplan (levande dokument): https://claude.ai/code/artifact/8fc1d0da-e959-46f2-9e61-5362ab172aae**
- Första featurelistan: https://claude.ai/code/artifact/a2829a1a-c962-40fe-b66b-3f2b7b33ddd1
- Förhandsvisning av sajten: https://claude.ai/artifact/DuRSaG1eVQ1VdJxCRfKPXG
- Roadmap i repot: `docs/ROADMAP.md`
