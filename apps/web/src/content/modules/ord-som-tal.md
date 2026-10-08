---
title: Ord som tal
order: 3
summary: 'Hur text delas upp i bitar och hur varje bit blir en lista med tal.'
goal: 'Tokens och inbäddningar, och varför ord som används på liknande sätt hamnar nära varandra.'
interactive: 'Dela upp långa ord i tokens och räkna med ord på en karta: kung − man + kvinna.'
stage: v2
status: publicerad
quiz:
  - q: 'Varför delas text upp i tokens?'
    right: 'Datorn räknar med tal, och varje bit får ett eget nummer'
    wrong:
      - 'För att rätta stavfel'
      - 'För att texten ska ta mindre plats på skärmen'
    why: 'En token är en bit text, ofta ett ord eller en del av ett ord, som får ett nummer.'
  - q: 'Vad är en inbäddning?'
    right: 'En lista med tal som beskriver en token'
    wrong:
      - 'En bild av ordet'
      - 'En översättning till engelska'
    why: 'Inbäddningen placerar ordet i ett rum där närhet betyder liknande användning.'
  - q: 'Vilka ord får liknande inbäddningar?'
    right: 'Ord som används i liknande sammanhang'
    wrong:
      - 'Ord som börjar på samma bokstav'
      - 'Ord som är lika långa'
    why: '”Hund” och ”katt” förekommer i liknande meningar och hamnar därför nära varandra.'
  - q: 'Kung minus man plus kvinna hamnar nära …'
    right: 'drottning'
    wrong:
      - 'prinsessa'
      - 'slott'
    why: 'Skillnaden mellan man och kvinna blir en riktning i rummet som man kan räkna med.'
---

En dator kan bara räkna med tal. Därför delas texten först upp i bitar, så kallade tokens. Sedan får varje bit en lista med tal, en inbäddning. Ord som brukar förekomma i liknande sammanhang får liknande tal.

Det gör att man kan räkna med betydelser. Tar man kung, drar bort man och lägger till kvinna hamnar man nära drottning.
