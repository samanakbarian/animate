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
  - kind: 'förståelse'
    see: 'risker-1#hittar-pa'
    q: 'Vad betyder det att en AI hallucinerar?'
    right: 'Den hittar på något som låter trovärdigt'
    why: 'Modellen väljer det som låter rimligast, även när den inte vet.'
    wrong:
      - text: 'Den vägrar svara'
        why: 'Det är snarare tvärtom. Den svarar, men med något som inte stämmer.'
      - text: 'Den har blivit hackad'
        why: 'Hallucinationer kommer från hur modellen gissar text, inte från intrång.'
  - kind: 'förståelse'
    see: 'risker-1#syns-inte'
    q: 'Varför låter ett påhittat svar lika säkert som ett rätt?'
    right: 'Modellen skriver det troligaste svaret i samma ton, hur osäker den än är'
    why: 'Osäkerheten finns i sannolikheterna, men syns inte i texten.'
    wrong:
      - text: 'Den ljuger med flit'
        why: 'Den har ingen avsikt. Den väljer det som låter rimligast.'
      - text: 'Påhittade svar är alltid längre'
        why: 'Längden säger inget. Rätt och fel kan se exakt likadana ut.'
  - kind: 'tillämpning'
    see: 'risker-1#gissar'
    q: 'En chattbot ger dig en källa till ett skolarbete. Vad gör du?'
    right: 'Kontrollerar att källan finns och säger det som påstås'
    why: 'Påhittade källor är en vanlig sorts hallucination.'
    wrong:
      - text: 'Använder den, den lät säker'
        why: 'En säker ton säger ingenting om sanningen.'
      - text: 'Frågar chattboten om källan stämmer'
        why: 'Den kan bekräfta sitt eget fel lika säkert. Kontrollera i källan själv.'
  - kind: 'förutsägelse'
    see: 'risker-2#strikt'
    q: 'Du sänker gränsen för spärren mycket. Vad händer?'
    right: 'Mer skadligt stoppas, men också fler vanliga frågor'
    why: 'Riskvärdena överlappar, så en låg gräns träffar även ofarliga frågor.'
    wrong:
      - text: 'Bara skadliga frågor stoppas'
        why: 'Riskvärdena överlappar. En låg gräns stoppar även vanliga frågor.'
      - text: 'Ingenting stoppas längre'
        why: 'Det är tvärtom. En lägre gräns stoppar mer.'
---

En modell kan låta säker och ändå ha fel. Den kan återge fördomar från texten den tränats på, och den kan användas för att skada. Modulen visar hur sådana fel uppstår och hur man testar modeller för att hitta dem.

## Vad vi förenklar här

- Frågorna, svaren och sannolikheterna är påhittade för att visa idén.
- Spärren i del 2 är ett enkelt riskvärde med en gräns. Riktiga skydd består av flera lager: träning, regler, filter och människor som granskar.
- Att en modell anger hur säker den är betyder inte att den vet. Säkerheten kan själv vara fel.
