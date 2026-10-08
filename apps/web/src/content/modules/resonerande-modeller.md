---
title: Resonerande modeller
order: 7
summary: 'Varför det hjälper att räkna i steg innan man svarar.'
goal: 'Att mellansteg och kontroller ger fler rätta svar på svåra uppgifter, och vad det kostar.'
interactive: 'Ge modellen fler eller färre tankesteg och se hur ofta den svarar rätt.'
stage: v2
status: publicerad
filmChapter: reasoning
quiz:
  - kind: 'förståelse'
    see: 'resonerande-modeller#steg'
    q: 'Vad gör en resonerande modell innan den svarar?'
    right: 'Skriver mellansteg, ofta utan att visa dem för dig'
    why: 'Många tjänster visar bara svaret eller en kort sammanfattning av resonemanget.'
    wrong:
      - text: 'Söker alltid upp svaret på internet'
        why: 'Resonemang handlar om att räkna i steg. Sökning är ett separat verktyg.'
      - text: 'Frågar en människa om lov'
        why: 'Det gör den inte av sig själv. Godkännanden byggs in i agenter.'
  - kind: 'förståelse'
    see: 'resonerande-modeller#steg'
    q: 'Varför kan mellansteg ge fler rätta svar?'
    right: 'Varje steg blir enklare, och fel kan upptäckas'
    why: 'Ett svårt problem blir flera lätta, och det finns tid att kontrollera.'
    wrong:
      - text: 'Modellen blir större när den tänker'
        why: 'Modellen är densamma. Den får bara mer text att bygga vidare på.'
      - text: 'Den lär sig nya saker medan den tänker'
        why: 'Ingen träning sker när den tänker. Den använder det den redan kan, i fler steg.'
  - kind: 'tillämpning'
    see: 'resonerande-modeller#pris'
    q: 'Vilken uppgift har mest nytta av att modellen resonerar länge?'
    right: 'Att lägga ett schema för tio personer med många villkor'
    why: 'Uppgifter i flera led blir lättare när de delas upp i steg.'
    wrong:
      - text: 'Att svara på vad Sveriges huvudstad heter'
        why: 'Ett svar modellen redan kan blir inte bättre av långt tänkande, bara långsammare.'
      - text: 'Att översätta ”hej” till franska'
        why: 'En enkel uppgift i ett steg tjänar knappt något på mellansteg.'
  - kind: 'förutsägelse'
    see: 'resonerande-modeller#kurva'
    q: 'Du ger modellen fler tankesteg på en svår uppgift. Vad händer i simuleringen?'
    right: 'Fler blir rätt, men inte alla'
    why: 'Fler steg hjälper, men varje steg kan också bli fel.'
    wrong:
      - text: 'Alla svar blir rätt'
        why: 'Även utskrivna steg kan bli fel. Fler steg är ingen garanti.'
      - text: 'Svaret kommer fortare'
        why: 'Fler steg tar längre tid, inte kortare.'
---

En resonerande modell skriver ner mellansteg innan den svarar, ungefär som man gör på papper när huvudräkningen inte räcker. Varje steg blir enklare, och modellen hinner upptäcka och rätta fel. Priset är tid: fler steg betyder längre väntan. Och fler steg är ingen garanti för rätt svar.

## Vad vi förenklar här

- Modellen i modulen är en leksaksmodell med påhittade felrisker. Den visar idén, inte hur en riktig modell räknar.
- Många tjänster visar inte modellens resonemang, eller bara en kort sammanfattning. Det som visas speglar inte alltid exakt hur modellen kom fram till svaret.
- Fler tankesteg hjälper oftast på uppgifter i flera led, men det är ingen garanti. En modell kan också resonera sig fram till fel svar.
