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
