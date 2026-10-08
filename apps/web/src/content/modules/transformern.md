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

Äldre modeller läste text ett ord i taget, från vänster till höger. En transformer låter i stället varje ord jämföra sig med alla andra ord i texten och väga in de som verkar viktiga. Det kallas uppmärksamhet.

I meningen "katten låg på mattan, för den var trött" behöver modellen lista ut att "den" syftar på katten. Uppmärksamheten är hur den gör det.
