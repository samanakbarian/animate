---
title: Neuralt nätverk
order: 1
summary: 'Hur många små räkneenheter tillsammans kan lära sig att sortera saker.'
goal: 'Vad en artificiell neuron, en vikt och ett lager är, varför de liknas vid hjärnan, och hur några tal in blir ett svar ut.'
interactive: 'Bestäm om du ska gå ut med hjälp av en neuron. Dra sedan i vikterna och se ett litet nätverk tränas.'
stage: mvp
status: publicerad
filmChapter: human
quiz:
  - q: 'Vad gör en artificiell neuron med talen den får in?'
    right: 'Multiplicerar varje tal med en vikt och lägger ihop'
    wrong:
      - 'Sparar dem i ett minne till senare'
      - 'Sorterar dem i storleksordning'
    why: 'Varje tal gånger sin vikt, sedan summan plus biasen. Är summan stor nog tänds neuronen.'
  - q: 'Var sitter det ett neuralt nätverk ”kan”?'
    right: 'I vikterna'
    wrong:
      - 'I antalet lager'
      - 'I färdiga svar som sparats i förväg'
    why: 'Träning ändrar vikterna. Två nätverk med samma form men olika vikter gör helt olika saker.'
  - q: 'Hur kan en ensam neuron dela upp planet?'
    right: 'Med en rak linje'
    wrong:
      - 'Med en cirkel'
      - 'Med vilken form som helst'
    why: 'En neuron drar bara raka gränser. För böjda gränser behövs fler neuroner i lager.'
  - q: 'Hur lik är en artificiell neuron en nervcell i hjärnan?'
    right: 'Den lånar idén men är mycket enklare'
    wrong:
      - 'Den är en exakt kopia'
      - 'De har ingenting gemensamt'
    why: 'Signaler in, en summa och en signal ut är idén. Riktiga nervceller är mycket mer komplicerade.'
---

Det som kallas AI i dag bygger nästan alltid på **artificiella neurala nätverk**. Namnet kommer från hjärnan. En nervcell tar emot signaler från andra celler genom sina dendriter. Blir signalerna tillsammans tillräckligt starka skickar cellen en egen signal vidare genom axonet.

En artificiell neuron härmar den idén, men med tal: några tal in, en vikt för varje tal, en summa och ett tal ut. Den är mycket enklare än en riktig nervcell, och ett nätverk fungerar inte som en hjärna. Liknelsen handlar om idén, inte om biologin.

Ett neuralt nätverk är många sådana neuroner ordnade i lager. Allt nätverket "kan" sitter i vikterna.

## Filmen visar

- En nervcell i hjärnan och hur en artificiell neuron härmar den.
- En neuron som ett vardagsbeslut: sol och läxor ger poäng, och en lampa tänds om summan blir över noll.
- Samma neuron som en karta: den drar en rak gräns mellan det som tänder lampan och det som inte gör det.
- Varför en neuron inte räcker när gränsen är böjd.
- Ett nätverk med några dolda neuroner som tränas, steg för steg, tills nästan alla prickar hamnar rätt.

## Du provar själv

Ändra antalet neuroner eller steglängden och se vad som händer med träningen.

## Vad vi förenklar här

- Nätverket i modulen har en handfull neuroner. Stora modeller har miljarder vikter.
- Lampan är antingen tänd eller släckt. Riktiga neuroner i ett nätverk ger oftast ett tal på en skala.
- Liknelsen med hjärnan gäller idén. Hjärnans nervceller fungerar på många sätt som ett nätverk inte gör.
