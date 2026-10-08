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
  - kind: 'förståelse'
    see: 'fran-fortraning-till-assistent#fortranad'
    q: 'Vad kan en modell direkt efter förträningen?'
    right: 'Fortsätta en text'
    why: 'Ställer man en fråga kan den lika gärna svara med fler frågor, som i ett forum.'
    wrong:
      - text: 'Svara hjälpsamt på frågor'
        why: 'Det kommer först med finjusteringen.'
      - text: 'Ingenting, den är bara slumpmässig'
        why: 'Den har lärt sig mycket om språk, men bara att fortsätta text.'
  - kind: 'förståelse'
    see: 'fran-fortraning-till-assistent#aterkoppling'
    q: 'Vad lär sig modellen av människors jämförelser mellan svar?'
    right: 'Vilka sorters svar människor föredrar'
    why: 'Valen blir en belöning, och modellen dras mot svar som får hög belöning.'
    wrong:
      - text: 'Vad som är sant'
        why: 'Människor väljer det de föredrar. Ett övertygande fel kan också få höga betyg.'
      - text: 'Nya fakta som saknades'
        why: 'Jämförelserna lär ut vilken sorts svar som uppskattas, inte nya fakta.'
  - kind: 'tillämpning'
    see: 'fran-fortraning-till-assistent#formen'
    q: 'En finjusterad modell svarar självsäkert men fel. Vad i träningen kan förklara det?'
    right: 'Den har lärt sig hur ett svar ser ut, inte vad som är rätt'
    why: 'Ett självsäkert fel har samma form som ett rätt svar.'
    wrong:
      - text: 'Den har slutat gissa nästa token'
        why: 'Den gissar fortfarande nästa token. Det är så den skriver alla svar.'
      - text: 'Den har glömt allt från förträningen'
        why: 'Den minns det mesta. Problemet är att den svarar lika säkert när den inte vet.'
  - kind: 'förutsägelse'
    see: 'fran-fortraning-till-assistent#resultat'
    q: 'Du lägger till fler jämförelser där människor väljer det hjälpsamma svaret. Vad händer med sannolikheterna?'
    right: 'Hjälpsamma svar blir troligare på alla frågor'
    why: 'Belöningen gäller sorten av svar, så den följer med till nya frågor.'
    wrong:
      - text: 'Bara frågan du jämförde ändras'
        why: 'Modellen lär sig sorten av svar, inte ett svar per fråga.'
      - text: 'Alla svar blir lika troliga'
        why: 'Jämförelserna flyttar sannolikheten mot det som väljs. De jämnar inte ut den.'
---

Efter förträningen kan modellen bara fortsätta text. Ställer man en fråga är det lika troligt att den svarar med fler frågor. Därför tränas den vidare på exempel på samtal, där en fråga följs av ett bra svar.

Sedan får människor jämföra svar och välja det bästa. Av deras val lär sig modellen vilka sorters svar folk vill ha.

## Vad vi förenklar här

- Svaren och sannolikheterna är påhittade för att visa idén. Det är ingen riktig modell som tränas.
- Här finns fyra sorters svar. En riktig modell kan svara på oändligt många sätt.
- Återkopplingen kan göras på flera sätt. Ibland ersätts människorna delvis av andra modeller eller av skrivna regler.
