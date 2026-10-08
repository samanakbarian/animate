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
  - kind: 'förståelse'
    see: 'neuralt-natverk-0#vikter'
    q: 'Vad gör en artificiell neuron med talen den får in?'
    right: 'Multiplicerar varje tal med en vikt, lägger ihop och lägger till biasen'
    why: 'Sedan avgör summan hur starkt neuronen tänds.'
    wrong:
      - text: 'Jämför talen med exempel den har sparat'
        why: 'En neuron sparar inga exempel. Det den har lärt sig finns bara i vikterna.'
      - text: 'Väljer det största talet och skickar det vidare'
        why: 'Alla tal räknas, vart och ett gånger sin vikt. Ett litet tal med stor vikt kan väga tyngst.'
  - kind: 'förståelse'
    see: 'neuralt-natverk-2#traning'
    q: 'Vad ändras i ett nätverk när det tränas?'
    right: 'Vikterna, lite i taget'
    why: 'Formen på nätverket är densamma. Vikterna flyttas tills svaren blir bättre.'
    wrong:
      - text: 'Antalet neuroner växer efter hand'
        why: 'Antalet neuroner bestäms innan träningen och ändras inte av den.'
      - text: 'Träningsexemplen sparas i nätverket'
        why: 'Exemplen används för att justera vikterna, men sparas inte i nätverket.'
  - kind: 'tillämpning'
    see: 'neuralt-natverk-0#vikter'
    q: 'En neuron ska avgöra om ett mejl är skräppost. Ordet ”gratis” ska göra skräppost mer troligt. Vilken vikt ska ”gratis” ha?'
    right: 'En positiv vikt'
    why: 'En positiv vikt drar summan uppåt, mot ”ja, skräppost”, precis som solen i del 1.'
    wrong:
      - text: 'En negativ vikt'
        why: 'En negativ vikt drar summan nedåt, bort från ”skräppost”, som läxorna i del 1.'
      - text: 'Vikten noll'
        why: 'Med vikten noll spelar ordet ingen roll alls för beslutet.'
  - kind: 'förutsägelse'
    see: 'neuralt-natverk-0#bias'
    q: 'I del 1: solen skiner (1), inga läxor (0), vikten för sol är 2 och biasen −1. Lampan lyser. Du sänker biasen till −3. Vad händer?'
    right: 'Lampan släcks'
    why: 'Summan blir 2 − 3 = −1, alltså under noll.'
    wrong:
      - text: 'Lampan lyser starkare'
        why: 'En lägre bias drar summan nedåt, inte uppåt.'
      - text: 'Ingenting, biasen påverkar bara läxorna'
        why: 'Biasen läggs till hela summan, oavsett vad som kommer in.'
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
