---
title: Träning
order: 2
summary: 'Hur ett nätverk blir bättre genom att mäta sina fel och ändra vikterna lite i taget.'
goal: 'Fel, lutning och upprepning. Varför träning liknar att gå nedför i dimma.'
interactive: 'En boll som rullar nedför ett fellandskap. Du väljer startpunkt och steglängd.'
stage: v2
status: publicerad
quiz:
  - q: 'Vad mäts under träningen?'
    right: 'Hur fel nätverkets gissning blev'
    wrong:
      - 'Hur snabb datorn är'
      - 'Hur många neuroner nätverket har'
    why: 'Felet är måttet som träningen försöker göra så litet som möjligt.'
  - q: 'Åt vilket håll flyttas vikterna?'
    right: 'Åt det håll där felet minskar'
    wrong:
      - 'Åt ett slumpmässigt håll'
      - 'Alltid uppåt'
    why: 'Lutningen visar vilket håll som är nedför. Vikterna flyttas en liten bit dit.'
  - q: 'Vad händer om steglängden är för stor?'
    right: 'Man studsar förbi målet'
    wrong:
      - 'Träningen blir alltid bättre'
      - 'Ingenting händer'
    why: 'För långa steg hoppar över dalen. För korta steg och träningen tar evigheter.'
  - q: 'Varför liknas träning vid att gå nedför i dimma?'
    right: 'Man ser bara lutningen där man står'
    wrong:
      - 'Det går alltid fort'
      - 'Man ser hela landskapet framför sig'
    why: 'Nätverket vet inte var målet ligger, bara vilket håll som lutar nedåt just nu.'
---

Ett otränat nätverk gissar på måfå. Träning går ut på att mäta hur fel gissningen blev och sedan flytta varje vikt en liten bit åt det håll där felet minskar. Det görs om och om igen, i stora modeller miljontals gånger.

Steglängden spelar stor roll. För korta steg och träningen tar evigheter. För långa steg och man studsar förbi målet.

## Vad vi förenklar här

- Fellandskapet har två vikter, så att det går att rita. En riktig modell har miljontals eller miljarder, och landskapet går inte att se.
- Här räknas felet på alla exempel varje steg. Stora modeller tränas på små högar av exempel i taget, vilket gör stegen lite skakiga.
- Moderna metoder ändrar steglängden under träningens gång. Här är den fast.
