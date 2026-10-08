---
title: Risker och säkerhet
order: 10
summary: 'Påhittade fakta, fördomar och missbruk, och hur man testar modeller.'
goal: 'Vanliga fel och risker, och hur forskare arbetar för att göra modeller säkrare.'
interactive: 'Hitta felet i ett svar som låter säkert men är fel.'
stage: senare
status: publicerad
filmChapter: asi
quiz:
  - q: 'Vad kallas det när en AI hittar på något som låter säkert?'
    right: 'Hallucination'
    wrong:
      - 'Inbäddning'
      - 'Uppmärksamhet'
    why: 'Modellen gissar trovärdig text. Ibland blir den trovärdig men falsk.'
  - q: 'Varför kan en modell ha fördomar?'
    right: 'Den har lärt sig av text som innehåller fördomar'
    wrong:
      - 'Den väljer dem med flit'
      - 'Det kan den inte ha'
    why: 'Modellen speglar texten den tränats på, både det bra och det dåliga.'
  - q: 'Säger en säker ton att svaret stämmer?'
    right: 'Nej, tonen säger ingenting om sanningen'
    wrong:
      - 'Ja, alltid'
      - 'Bara om svaret är långt'
    why: 'Ett påhittat svar kan låta precis lika säkert som ett rätt. Kontrollera viktiga fakta.'
  - q: 'Hur letar forskare efter fel i modeller?'
    right: 'De testar dem medvetet med svåra och knepiga frågor'
    wrong:
      - 'De väntar på att någon klagar'
      - 'De läser alla vikter för hand'
    why: 'Systematiska tester hittar svagheter innan modellen används på riktigt.'
---

En modell kan låta säker och ändå ha fel. Den kan återge fördomar från texten den tränats på, och den kan användas för att skada. Modulen visar hur sådana fel uppstår och hur man testar modeller för att hitta dem.

## Vad vi förenklar här

- Frågorna, svaren och sannolikheterna är påhittade för att visa idén.
- Spärren i del 2 är ett enkelt riskvärde med en gräns. Riktiga skydd består av flera lager: träning, regler, filter och människor som granskar.
- Att en modell anger hur säker den är betyder inte att den vet. Säkerheten kan själv vara fel.
