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
  - q: 'Vad gör uppmärksamheten i en transformer?'
    right: 'Låter varje ord väga in de andra orden som verkar viktiga'
    wrong:
      - 'Läser ett ord i taget från vänster'
      - 'Tar bort onödiga ord ur texten'
    why: 'Varje ord jämför sig med alla andra och tar mest hänsyn till de som hör ihop med det.'
  - q: '”Katten låg på mattan, för den var trött.” Vad syftar ”den” på?'
    right: 'katten'
    wrong:
      - 'mattan'
      - 'ingenting'
    why: 'En matta kan inte vara trött. Uppmärksamheten är hur modellen kopplar ihop ”den” med katten.'
  - q: 'Hur läste äldre modeller text?'
    right: 'Ett ord i taget, från vänster till höger'
    wrong:
      - 'Alla ord samtidigt'
      - 'Baklänges'
    why: 'Transformern tittar på alla ord på en gång, hur långt ifrån varandra de än står.'
  - q: 'Varför har en transformer flera uppmärksamhetshuvuden?'
    right: 'Olika huvuden kan leta efter olika samband'
    wrong:
      - 'Ett huvud per ord i meningen'
      - 'För att bilderna ska bli snyggare'
    why: 'Ett huvud kan följa grammatik, ett annat vem som gör vad. Tillsammans fångar de mer.'
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
