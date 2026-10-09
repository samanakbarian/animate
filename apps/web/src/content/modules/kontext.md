---
title: Kontext
order: 15
summary: 'En chattbot ser bara det som får plats i dess kontextfönster. Det som faller utanför finns inte för den.'
goal: 'Vad ett kontextfönster är, varför en chattbot glömmer början av ett långt samtal, och hur ”minne” i chattjänster fungerar.'
interactive: 'Ändra fönstrets storlek, hur långt samtalet är och om minnet är på, och se när modellen glömmer.'
stage: senare
status: publicerad
quiz:
  - kind: 'förståelse'
    see: 'kontext#fonster'
    q: 'Vad är ett kontextfönster?'
    right: 'Den text modellen kan se på en gång när den skriver sitt svar'
    why: 'Allt modellen ska ta hänsyn till, din fråga, tidigare meddelanden och instruktioner, måste rymmas där.'
    wrong:
      - text: 'Fönstret i appen där du skriver'
        why: 'Samma ord, men här är det hur mycket text modellen kan se, mätt i tokens.'
      - text: 'Allt modellen har lärt sig under träningen'
        why: 'Det som lärts in finns i vikterna. Fönstret är det den ser just nu.'
  - kind: 'förståelse'
    see: 'kontext#minne'
    q: 'En chattjänst ”minns” att du har en hund, också i nya samtal. Hur går det till?'
    right: 'Tjänsten har sparat en anteckning som läggs in i fönstret varje gång'
    why: 'Minnet är text som läggs först i fönstret. Själva modellen har inte ändrats.'
    wrong:
      - text: 'Modellen tränades om på ditt samtal'
        why: 'Modellen ändras inte av ett samtal. Vikterna är desamma.'
      - text: 'Modellen tänker på dig mellan samtalen'
        why: 'Modellen gör ingenting mellan samtalen. Den räknar bara när den får text.'
  - kind: 'tillämpning'
    see: 'kontext#langt'
    q: 'Du har chattat länge om en uppsats och märker att boten inte längre följer instruktionerna du gav i början. Vad hjälper?'
    right: 'Upprepa det viktigaste, eller börja ett nytt samtal med en kort sammanfattning'
    why: 'Då ligger instruktionerna i fönstret igen, nära slutet där de syns.'
    wrong:
      - text: 'Skriv att den ska skärpa sig'
        why: 'Det den inte ser kan den inte följa, hur du än formulerar dig.'
      - text: 'Vänta en stund och fråga igen'
        why: 'Tiden spelar ingen roll. Det som räknas är vad som ryms i fönstret.'
  - kind: 'förutsägelse'
    see: 'kontext#storre'
    q: 'Samtalet är 200 tokens långt och hunden nämns i första meddelandet. Vad händer om fönstret är 120 tokens?'
    right: 'Början faller utanför, så modellen vet inte vad hunden heter'
    why: 'Det senaste får plats först. Det äldsta försvinner när fönstret är fullt.'
    wrong:
      - text: 'Modellen läser de första 120 tokens och missar slutet'
        why: 'Det är tvärtom. Det senaste behövs för att svara, så det är början som faller bort.'
      - text: 'Modellen kommer ihåg hunden ändå, den är viktig'
        why: 'Modellen väljer inte vad som är viktigt att spara. Det som är utanför finns inte för den.'
---

En språkmodell ser bara en begränsad mängd text åt gången. Det kallas kontextfönstret och mäts i tokens, ungefär ordbitar. Allt som ska påverka svaret måste rymmas där: dina meddelanden, modellens egna svar, instruktioner och dokument du klistrat in.

När ett samtal blir längre än fönstret faller det äldsta bort. Modellen glömmer inte på samma sätt som en människa. Texten finns helt enkelt inte i det den ser. Dagens största modeller rymmer hela böcker, men fönstret tar alltid slut någon gång, och även inom fönstret kan detaljer långt bak få mindre uppmärksamhet.

Modellen lär sig inget av samtalet. När en chattjänst ”minns” dig har den sparat korta anteckningar som läggs in i fönstret i nästa samtal. Det är bra att veta vad som sparas, och att du ofta kan se och ta bort det.

## Filmen visar

- Vad ett kontextfönster är och hur det mäts i tokens.
- Hur början av ett långt samtal faller utanför.
- Hur ett större fönster och en minnesanteckning hjälper.

## Du provar själv

Ändra fönstrets storlek, hur långt samtalet är och om minnet är på. När glömmer modellen hunden?

## Vad vi förenklar här

- Vi räknar en token per tre tecken. Riktiga tokens är ordbitar som en tokeniserare väljer, se modulen Ord som tal.
- Fönstret här är 40 till 300 tokens. Riktiga fönster rymmer tusentals till miljontals tokens.
- Svaret tar också plats i fönstret, och tjänster lägger till egna instruktioner. Det räknar vi inte med.
- När modellen inte ser något kan den lika gärna gissa som säga att den inte vet.
- Tjänster gör olika när samtalet blir för långt: en del klipper bort början, andra sammanfattar den.
