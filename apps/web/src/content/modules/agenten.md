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
  - kind: 'förståelse'
    see: 'agenten#mal'
    q: 'Vad skiljer en agent från en vanlig chatt?'
    right: 'Agenten får ett mål och tar själv flera steg med verktyg'
    why: 'I en chatt driver du samtalet en fråga i taget. En agent driver arbetet själv.'
    wrong:
      - text: 'Agenten har en större språkmodell'
        why: 'Samma modell kan användas i en chatt och i en agent. Skillnaden är mål, verktyg och loopen.'
      - text: 'Agenten kan inte göra fel'
        why: 'Agenter gör också fel, och felen kan få större följder eftersom agenten agerar.'
  - kind: 'förståelse'
    see: 'agenten#loopen'
    q: 'Vad är återkoppling för en agent?'
    right: 'Resultatet av ett steg, som agenten läser innan den väljer nästa'
    why: 'Det är ”observera” i loopen: tänk, agera, observera.'
    wrong:
      - text: 'Betyg som användaren ger efteråt'
        why: 'Det är återkoppling för träning. I loopen är det resultatet av agentens egna steg.'
      - text: 'En lista med alla steg, bestämd i förväg'
        why: 'En agent följer ingen färdig lista. Den väljer nästa steg utifrån resultatet.'
  - kind: 'tillämpning'
    see: 'agenten#manniska'
    q: 'En agent ska rensa din inkorg. Vilket steg bör kräva ditt godkännande?'
    right: 'Att radera mejl för gott'
    why: 'Det går inte att ångra. Sådana steg är värda en kontroll.'
    wrong:
      - text: 'Att läsa ämnesraderna'
        why: 'Att läsa ändrar ingenting och kan göras utan kontroll.'
      - text: 'Att flytta mejl till mappar'
        why: 'Det går lätt att ångra. Godkännande behövs mest för det som inte går att ta tillbaka.'
  - kind: 'förutsägelse'
    see: 'agenten#hinder'
    q: 'Slå på felet så att rummet är upptaget. Vad gör agenten?'
    right: 'Ser resultatet och gör en ny plan'
    why: 'Agenten läser resultatet av varje steg och anpassar planen.'
    wrong:
      - text: 'Bokar rummet ändå'
        why: 'Agenten läser resultatet av varje steg. Den ser att rummet är upptaget.'
      - text: 'Slutar och väntar på nya instruktioner'
        why: 'Den kan fortsätta själv med en ny plan. Den stannar och frågar inför steg som inte går att ångra.'
---

I en vanlig chatt ställer du en fråga och får ett svar. En agent är en språkmodell som i stället får ett mål och tillgång till verktyg, till exempel kalender, sökning eller e-post. Den funderar på vad som behöver göras, gör det, tittar på resultatet och bestämmer nästa steg. Så fortsätter den tills målet är nått eller den behöver fråga någon.

## Filmen visar

- Loopen: tänk, agera, observera.
- Hur verktygen kopplas till modellen.
- Var en människa kan godkänna eller stoppa.

## Du provar själv

Ändra förutsättningarna och följ varje beslut i agentens logg.

## Samtal eller agent?

|                    | Samtal                | Agent                                      |
| ------------------ | --------------------- | ------------------------------------------ |
| Utgångspunkt       | En fråga              | Ett mål                                    |
| Verktyg            | Inga, eller ett fåtal | Kalender, sökning, e-post, filer …         |
| Återkoppling       | Du läser svaret       | Agenten läser resultatet av sina egna steg |
| Vem driver arbetet | Du, en fråga i taget  | Agenten, flera steg i rad                  |
| Människans roll    | Ställer nästa fråga   | Godkänner viktiga steg, eller stoppar      |

Ju mer agenten får göra på egen hand, desto viktigare är det att bestämma vilka steg som kräver ett godkännande.

## Vad vi förenklar här

- Agenten i modulen är simulerad. Den följer samma loop som riktiga agenter, men varje steg är förbestämt.
- Riktiga agenter kan göra fel som är svårare att upptäcka, till exempel använda fel verktyg eller missförstå målet.
