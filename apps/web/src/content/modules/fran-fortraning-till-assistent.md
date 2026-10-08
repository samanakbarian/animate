---
title: Från förträning till assistent
order: 6
summary: 'Hur en modell som bara fortsätter text blir en assistent som svarar.'
goal: 'Förträning, finjustering och träning med mänsklig återkoppling.'
interactive: 'Jämför samma modells svar i tre skeden och se hur människors val flyttar sannolikheterna.'
stage: v2
status: publicerad
filmChapter: chatgpt
quiz:
  - q: 'Vad kan en modell direkt efter förträningen?'
    right: 'Fortsätta text'
    wrong:
      - 'Föra samtal som en hjälpsam assistent'
      - 'Söka på internet'
    why: 'Ställer man en fråga kan den lika gärna svara med fler frågor, som i en lista med frågor.'
  - q: 'Vad tränas modellen på vid finjusteringen?'
    right: 'Exempel på samtal där en fråga följs av ett bra svar'
    wrong:
      - 'Ännu mer slumpmässig text från nätet'
      - 'Bara bilder'
    why: 'Exemplen lär modellen formen: fråga in, hjälpsamt svar ut.'
  - q: 'Vad gör människorna i träningen med mänsklig återkoppling?'
    right: 'Jämför svar och väljer det bästa'
    wrong:
      - 'Skriver om modellens kod'
      - 'Ändrar varje vikt för hand'
    why: 'Valen blir träningsdata. Modellen dras mot sådana svar som folk föredrar.'
  - q: 'Vad lär sig modellen av människornas val?'
    right: 'Vilka sorters svar folk vill ha'
    wrong:
      - 'Exakt vad som är sant'
      - 'Att alltid svara så kort som möjligt'
    why: 'Återkopplingen handlar om vad som uppskattas, inte om sanning. Därför kan fel ändå slinka igenom.'
---

Efter förträningen kan modellen bara fortsätta text. Ställer man en fråga är det lika troligt att den svarar med fler frågor. Därför tränas den vidare på exempel på samtal, där en fråga följs av ett bra svar.

Sedan får människor jämföra svar och välja det bästa. Av deras val lär sig modellen vilka sorters svar folk vill ha.
