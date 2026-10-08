---
title: Träning
order: 2
summary: 'Hur ett nätverk blir bättre genom att mäta sina fel och ändra vikterna lite i taget.'
goal: 'Fel, lutning och upprepning. Varför träning liknar att gå nedför i dimma.'
interactive: 'En boll som rullar nedför ett fellandskap. Du väljer startpunkt och steglängd.'
stage: v2
status: publicerad
quiz:
  - kind: 'förståelse'
    see: 'traning#landskap'
    q: 'Vad är felet under träningen?'
    right: 'Ett mått på hur långt nätverkets svar ligger från de rätta'
    why: 'Träningen går ut på att göra det måttet så litet som möjligt.'
    wrong:
      - text: 'Antalet buggar i programmet'
        why: 'Felet handlar om svaren, inte om koden. Ett felfritt program kan ge fel svar.'
      - text: 'Hur länge träningen har pågått'
        why: 'Tiden säger inget om hur bra svaren är. Det är felet som mäter det.'
  - kind: 'förståelse'
    see: 'traning#lutning'
    q: 'Vad visar gradienten?'
    right: 'Åt vilket håll felet ökar mest'
    why: 'Därför tar man ett steg åt motsatt håll, nedför.'
    wrong:
      - text: 'Var det lägsta felet finns'
        why: 'Gradienten känner bara lutningen där man står. Den vet inte var dalens botten är.'
      - text: 'Hur många steg som är kvar'
        why: 'Den säger vilket håll som lutar, inte hur långt det är kvar.'
  - kind: 'tillämpning'
    see: 'traning#for-langt'
    q: 'Felet hoppar upp och ner och blir aldrig mindre. Vad är klokast att ändra?'
    right: 'Minska steglängden'
    why: 'Ett fel som hoppar är det typiska tecknet på för långa steg som studsar över dalen.'
    wrong:
      - text: 'Öka steglängden'
        why: 'Längre steg gör studsandet värre.'
      - text: 'Träna längre utan att ändra något'
        why: 'Studsar bollen över dalen hjälper det inte att fortsätta på samma sätt.'
  - kind: 'förutsägelse'
    see: 'traning#grop'
    q: 'Bollen ligger i en liten grop och steglängden är kort. Vad händer om träningen får fortsätta?'
    right: 'Bollen blir kvar i gropen'
    why: 'I gropen lutar allt inåt, och korta steg tar sig aldrig över kanten.'
    wrong:
      - text: 'Den rullar till slut till det lägsta stället'
        why: 'Gradientnedstigning känner bara den närmaste lutningen. Den vet inte att det finns lägre mark längre bort.'
      - text: 'Den hoppar ur gropen av sig själv'
        why: 'Med korta steg finns inget som får den att hoppa. Det kräver längre steg eller slump.'
---

Ett otränat nätverk gissar på måfå. Träning går ut på att mäta hur fel gissningen blev och sedan flytta varje vikt en liten bit åt det håll där felet minskar. Det görs om och om igen, i stora modeller miljontals gånger.

Steglängden spelar stor roll. För korta steg och träningen tar evigheter. För långa steg och man studsar förbi målet.

## Vad vi förenklar här

- Fellandskapet har två vikter, så att det går att rita. En riktig modell har miljontals eller miljarder, och landskapet går inte att se.
- Här räknas felet på alla exempel varje steg. Stora modeller tränas på små högar av exempel i taget, vilket gör stegen lite skakiga.
- Moderna metoder ändrar steglängden under träningens gång. Här är den fast.
