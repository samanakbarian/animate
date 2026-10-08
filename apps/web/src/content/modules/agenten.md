---
title: Agenten
order: 8
summary: 'En språkmodell som får ett mål och verktyg, och jobbar på tills målet är nått.'
goal: 'Vad som skiljer en agent från en chatt: mål, verktyg och en loop.'
interactive: 'Följ en agent som bokar ett möte. Låt rummet vara upptaget eller kräv att en människa godkänner.'
stage: mvp
status: publicerad
filmChapter: today
quiz:
  - q: 'Vad skiljer en agent från en vanlig chatt?'
    right: 'Den har ett mål, verktyg och arbetar i en loop'
    wrong:
      - 'Den är alltid snabbare'
      - 'Den saknar språkmodell'
    why: 'En chatt svarar en gång. En agent fortsätter tills målet är nått eller den behöver fråga.'
  - q: 'Vilken är agentens loop?'
    right: 'Tänk, agera, observera'
    wrong:
      - 'Läs, skriv, glöm'
      - 'Fråga, vänta, sluta'
    why: 'Den planerar ett steg, utför det och tittar på resultatet innan nästa steg.'
  - q: 'Vad är ett verktyg för en agent?'
    right: 'Något den kan använda, till exempel kalender eller sökning'
    wrong:
      - 'En del av datorn som skruvas fast'
      - 'En människa som bestämmer åt den'
    why: 'Verktygen låter modellen göra saker i världen, inte bara skriva text.'
  - q: 'Varför kan en människa behöva godkänna vissa steg?'
    right: 'För att stoppa misstag innan de får följder'
    wrong:
      - 'För att agenten inte kan läsa'
      - 'För att det går fortare'
    why: 'Ett mejl som skickats går inte att ta tillbaka. Därför är vissa steg värda en kontroll.'
---

En agent är en språkmodell som får ett mål och tillgång till verktyg, till exempel kalender, sökning eller e-post. Den funderar på vad som behöver göras, gör det, tittar på resultatet och bestämmer nästa steg. Så fortsätter den tills målet är nått eller den behöver fråga någon.

## Filmen visar

- Loopen: tänk, agera, observera.
- Hur verktygen kopplas till modellen.
- Var en människa kan godkänna eller stoppa.

## Du provar själv

Ändra förutsättningarna och följ varje beslut i agentens logg.
