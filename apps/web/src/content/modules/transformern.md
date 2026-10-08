---
title: Transformern och uppmärksamhet
order: 4
summary: 'Byggstenen från 2017 som dagens språkmodeller vilar på.'
goal: 'Hur modellen avgör vilka ord i en mening som hör ihop.'
interactive: 'Välj en mening och ett ord och se vilka andra ord det ”tittar på”.'
stage: v2
status: publicerad
filmChapter: transformer
quiz:
  - kind: 'förståelse'
    see: 'transformern#titta'
    q: 'Vad gör uppmärksamheten i en transformer?'
    right: 'Låter varje ord väga in de andra orden som verkar viktiga för det'
    why: 'Så kan ”den” koppla ihop sig med det ord det syftar på.'
    wrong:
      - text: 'Markerar de viktigaste orden för läsaren'
        why: 'Uppmärksamheten är inget som visas för läsaren. Den är en del av hur modellen räknar.'
      - text: 'Tar bort ord som inte behövs'
        why: 'Inga ord tas bort. Mindre viktiga ord får bara lägre vikt.'
  - kind: 'förståelse'
    see: 'transformern#bakat'
    q: 'Vad skiljer en språkmodell som skriver text från en modell som läser en färdig text?'
    right: 'Språkmodellen får bara titta bakåt, på ord som redan finns'
    why: 'Ord som inte skrivits än döljs. Det kallas kausal uppmärksamhet.'
    wrong:
      - text: 'Språkmodellen läser texten baklänges'
        why: 'Den läser från början, men får inte titta framåt.'
      - text: 'Ingen skillnad, båda ser hela texten'
        why: 'En modell som läser färdig text ser hela meningen. En språkmodell som skriver ser bara bakåt.'
  - kind: 'tillämpning'
    see: 'transformern#huvuden'
    q: '”Barnet läste boken och det skrattade högt.” Vilket ord bör ”det” titta mest på?'
    right: 'barnet'
    why: 'En bok kan inte skratta, men ett barn kan.'
    wrong:
      - text: 'boken'
        why: '”Boken” står närmast, men det är barn som skrattar. Närhet räcker inte.'
      - text: 'läste'
        why: '”Det” syftar på något som kan skratta, alltså ett substantiv, inte ett verb.'
  - kind: 'förutsägelse'
    see: 'transformern#senare'
    q: 'Slå på ”bara bakåt” och välj ordet ”den” i meningen om katten som var trött. Var hamnar uppmärksamheten?'
    right: 'Ungefär lika mycket på katten och mattan'
    why: '”Den” kan inte se ”trött” än, så båda passar lika bra. Det reds ut när ”trött” kommer.'
    wrong:
      - text: 'Nästan bara på katten'
        why: 'Det händer bara när ”den” får se ”trött”. Med bara bakåt saknas ledtråden.'
      - text: 'Mest på ”trött”'
        why: '”Trött” kommer efter ”den” och är dolt när bara bakåt gäller.'
---

Äldre modeller läste text ett ord i taget och fick bära med sig allt de läst i ett slags minne. En transformer låter i stället varje ord jämföra sig direkt med de andra orden och väga in dem som verkar viktiga. Det kallas uppmärksamhet.

I meningen "katten låg på mattan, för den var trött" behöver modellen lista ut att "den" syftar på katten. Uppmärksamheten är hur den gör det.

## Full uppmärksamhet och bara bakåt

Det finns två sätt att låta orden titta på varandra. Med **full uppmärksamhet** ser varje ord hela meningen, även orden efter. Så fungerar modeller som läser en färdig text, till exempel för att sortera eller söka.

En **språkmodell** som skriver ett ord i taget kan inte titta framåt, för de orden finns inte än. Därför döljs (maskeras) framtida ord. Det kallas kausal uppmärksamhet. Då kan ”den” inte veta vad det syftar på förrän ”trött” eller ”mjuk” har kommit. Det är ordet som kommer sedan som tittar tillbaka och reder ut det. Prova reglaget ”Får titta” i modulen.

## Vad vi förenklar här

- Vikterna i modulen är handgjorda så att de går att förstå. En riktig modell lär sig dem, och huvudenas roller är sällan så tydliga.
- Riktiga modeller har många lager och dussintals huvuden per lager, och de arbetar med tokens snarare än hela ord.
- Uppmärksamhet visar vad modellen väger in, men den ger inte hela förklaringen till varför modellen svarar som den gör.
