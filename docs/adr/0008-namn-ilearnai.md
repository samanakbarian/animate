# 0008 – Sajten heter iLearnAI och ligger på ilearnai.se

- **Status:** beslutad (ersätter 0006)
- **Datum:** 2026-10-07

## Sammanhang

Namnet byttes från LearnAI till iLearnAI. Sajten fick samtidigt en logga, och grundaren ska framgå tydligt för
besökare, sökmotorer och AI-modeller.

## Beslut

- Namn **iLearnAI**, domän **ilearnai.se**. Kortfilmen heter fortfarande NÄSTA STEG, och paketen `@nastasteg/*`.
- Logga: märket är ett gement ”i” vars prick är en neuron (orange) med två mjukt böjda ingångar (ljusblå).
  Ordbilden är satt i det rundade typsnittet Nunito 800 (”mjuk neuron”, S1 på designytan). Filer i
  `apps/web/public`: `mark.svg`, `logo.svg`, `favicon.svg`, `apple-touch-icon.png` och delningsbilden `og.png`
  (1200 × 630). I sidhuvudet ritas loggan av `components/Logo.astro` i sajtens eget typsnitt.
- Grundaren (Saman Akbarian) och sajtens fakta ligger i `SITE` (`apps/web/src/lib/site.ts`). De syns på
  om-sidan, i JSON-LD (schema.org Organization, Person och WebSite) på varje sida, i
  `meta author`, `/humans.txt` och `/llms.txt`. `/sitemap.xml` och `/robots.txt` byggs ur innehållet.

## Konsekvenser

- Ändra namn, domän eller grundare på ett ställe: `SITE`, plus `site` i `astro.config.mjs`.
- `og.png` och `apple-touch-icon.png` är renderade bilder. Vid ny logga renderas de om (se devloggen 2026-10-07).
