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
  - q: 'Vad har en språkmodell tränats att göra?'
    right: 'Gissa nästa token'
    wrong:
      - 'Slå upp svar i ett uppslagsverk'
      - 'Översätta ord för ord'
    why: 'Allt annat den kan bygger på att gissa nästa bit text väldigt bra.'
  - q: 'Vad händer när temperaturen höjs?'
    right: 'Mindre troliga ord väljs oftare och texten blir mer varierad'
    wrong:
      - 'Modellen blir snabbare'
      - 'Svaren blir alltid rätt'
    why: 'Låg temperatur ger säkra, förutsägbara val. Hög ger mer variation, men också fler konstiga ord.'
  - q: 'Varför kan samma början ge olika fortsättningar?'
    right: 'Nästa ord dras med lite slump bland de troliga'
    wrong:
      - 'Modellen glömmer vad den läst'
      - 'Den läser in nya texter varje gång'
    why: 'Modellen ger sannolikheter, och valet görs med slump. Samma slumpfrö ger samma text.'
  - q: 'Hur kan en modell som gissar nästa ord också sammanfatta?'
    right: 'För att gissa bra måste den fånga grammatik, fakta och sammanhang'
    wrong:
      - 'Den har ett eget program för varje uppgift'
      - 'Det kan den inte'
    why: 'En bra gissning kräver att man förstår texten hyfsat. Därför följer andra förmågor med.'
---

En språkmodell är ett stort neuralt nätverk som har tränats på väldigt mycket text för att gissa nästa token. Det låter enkelt, men för att gissa bra måste modellen fånga grammatik, fakta och sammanhang. Därför kan den också sammanfatta, översätta och svara på frågor.

## Filmen visar

- En mening som växer fram en token i taget.
- Vilka ord modellen tror kan komma härnäst, och hur troliga de är.
- Varför samma början kan ge olika fortsättningar.

## Du provar själv

Modulen kör en liten modell som tränats på en kort svensk text. Välj början, antal ord och temperatur, och byt slumpfrö för att få en ny text.
