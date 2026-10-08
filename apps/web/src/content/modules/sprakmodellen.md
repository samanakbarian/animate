---
title: Språkmodellen
order: 5
summary: 'En språkmodell gissar nästa ord, och sedan nästa, och nästa.'
goal: 'Att en språkmodell förutsäger nästa token, och vad temperaturen gör med svaren.'
interactive: 'Låt en liten modell skriva ord för ord. Se sannolikheterna och ändra temperaturen.'
stage: mvp
status: publicerad
filmChapter: gpt3
quiz:
  - kind: 'förståelse'
    see: 'sprakmodellen#nasta'
    q: 'Vad har en språkmodell tränats att göra?'
    right: 'Gissa nästa token i en text'
    why: 'Allt annat den klarar bygger på att gissa nästa bit text väldigt bra.'
    wrong:
      - text: 'Slå upp svaret i en databas'
        why: 'Själva modellen slår inte upp något. Svaret växer fram en token i taget.'
      - text: 'Följa regler som programmerare skrivit för varje fråga'
        why: 'Ingen har skrivit regler för varje fråga. Modellen har lärt sig mönster ur text.'
  - kind: 'förståelse'
    see: 'sprakmodellen#ett-i-taget'
    q: 'Varför kan samma fråga ge olika svar?'
    right: 'Nästa token väljs med lite slump bland de troliga'
    why: 'Modellen ger sannolikheter, och valet görs med slump. Samma slumpfrö ger samma text.'
    wrong:
      - text: 'Modellen lär sig något nytt mellan gångerna'
        why: 'Modellen ändras inte när du använder den. Skillnaden kommer från slumpen.'
      - text: 'Den läser in nya texter från internet varje gång'
        why: 'Variationen kommer från slumpen i valet av nästa token, inte från nya texter.'
  - kind: 'tillämpning'
    see: 'sprakmodellen#temperatur'
    q: 'Du vill ha en sammanfattning som blir likadan varje gång. Vilken temperatur väljer du?'
    right: 'Låg temperatur'
    why: 'Låg temperatur väljer nästan alltid det troligaste, så svaren blir förutsägbara.'
    wrong:
      - text: 'Hög temperatur'
        why: 'Hög temperatur ger mer variation, alltså mindre likadana svar.'
      - text: 'Det spelar ingen roll'
        why: 'Temperaturen styr just hur mycket slump som får vara med.'
  - kind: 'förutsägelse'
    see: 'sprakmodellen#temperatur'
    q: 'Du drar temperaturen till max. Hur ändras texten?'
    right: 'Den blir mer slumpmässig och tappar snart tråden'
    why: 'Även osannolika ord väljs ofta, och då hänger texten inte ihop.'
    wrong:
      - text: 'Den blir mer korrekt'
        why: 'Mer slump gör inte texten mer korrekt, snarare tvärtom.'
      - text: 'Den blir kortare'
        why: 'Längden styrs av hur många ord du väljer, inte av temperaturen.'
---

En språkmodell är ett stort neuralt nätverk som har tränats på väldigt mycket text för att gissa nästa token. Det låter enkelt, men för att gissa bra måste modellen fånga grammatik, fakta och sammanhang. Därför kan den också sammanfatta, översätta och svara på frågor.

## Filmen visar

- En mening som växer fram en token i taget.
- Vilka ord modellen tror kan komma härnäst, och hur troliga de är.
- Varför samma början kan ge olika fortsättningar.

## Du provar själv

Modulen kör en liten modell som tränats på en kort svensk text. Välj början, antal ord och temperatur, och byt slumpfrö för att få en ny text.

## Vad vi förenklar här

- Modellen i modulen är inget neuralt nätverk. Den räknar hur ofta ord följer på varandra i en kort text. Den gissar nästa ord precis som stora modeller, men den förstår mycket mindre.
- Den arbetar med hela ord. Stora modeller arbetar med tokens, som ofta är delar av ord.
- Stora modeller tittar på tusentals tokens bakåt, inte bara de två senaste orden.
