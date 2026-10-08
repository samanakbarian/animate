---
title: Flera agenter
order: 9
summary: 'När flera agenter delar upp arbetet, och var människan kommer in.'
goal: 'Hur arbete fördelas mellan agenter och vad ”människa i loopen” betyder.'
interactive: 'Slå av och på mänsklig granskning och se vad som händer med resultatet.'
stage: senare
status: publicerad
filmChapter: today
quiz:
  - kind: 'förståelse'
    see: 'flera-agenter#dela'
    q: 'Vad vinner man på att låta flera agenter dela på en uppgift?'
    right: 'De kan göra olika delar samtidigt'
    why: 'Uppdelningen går fortare, men varje del kan också bli fel.'
    wrong:
      - text: 'Fler agenter gör aldrig fel'
        why: 'Varje agent kan göra fel, och med många delar blir det troligt att något blir fel.'
      - text: 'Det blir alltid billigare'
        why: 'Fler agenter kostar mer beräkning. Det man främst vinner är tid.'
  - kind: 'förståelse'
    see: 'flera-agenter#blinda'
    q: 'Varför missar en granskande agent ibland samma fel som den första?'
    right: 'Den är samma sorts modell och har samma blinda fläckar'
    why: 'Det som kräver omdöme missar båda, eftersom de tänker likadant.'
    wrong:
      - text: 'Den hinner bara läsa hälften'
        why: 'Den går igenom allt. Problemet är att den ser samma saker som den första.'
      - text: 'Den granskar för snabbt'
        why: 'Det handlar inte om fart utan om att den tänker likadant.'
  - kind: 'tillämpning'
    see: 'flera-agenter#avvagning'
    q: 'Agenter skriver underlag för ett beslut om en skolas budget. Vad är klokast?'
    right: 'Låt en människa granska innan underlaget används'
    why: 'Mycket står på spel, och en människa ser andra saker än agenterna.'
    wrong:
      - text: 'Låt fler agenter granska och hoppa över människan'
        why: 'Fler granskare av samma sort hittar samma saker. De blinda fläckarna finns kvar.'
      - text: 'Lita på det, agenterna har granskat sig själva'
        why: 'Granskning mellan agenter hittar slarvfel men sällan fel som kräver omdöme.'
  - kind: 'förutsägelse'
    see: 'flera-agenter#granskare'
    q: 'Du slår av all granskning. Vad händer med antalet fel som blir kvar?'
    right: 'Det ökar'
    why: 'Utan granskning är det ingen som hittar felen.'
    wrong:
      - text: 'Det minskar, eftersom det går fortare'
        why: 'Det går fortare, men felen finns kvar.'
      - text: 'Det blir noll'
        why: 'Agenterna gör fortfarande fel. Utan granskning upptäcks de bara inte.'
---

Flera agenter kan arbeta med olika delar av en uppgift samtidigt och granska varandras arbete. Då blir frågan var en människa behövs, och vad som händer när ingen tittar.

## Vad vi förenklar här

- Laget och felen är simulerade, med fasta sannolikheter för slarvfel och blinda fläckar.
- I verkligheten är det svårt att veta hur ofta en granskande agent missar något. Därför behövs tester och människor som tar ansvar.
