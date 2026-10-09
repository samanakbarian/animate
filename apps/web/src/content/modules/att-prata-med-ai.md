---
title: Att prata med AI
order: 11
summary: 'Hur frågan du ställer formar svaret, och varför du alltid ska läsa igenom det.'
goal: 'Vad en bra fråga (prompt) innehåller, varför en vag fråga ger ett vagt eller påhittat svar, och vad du alltid måste kontrollera.'
interactive: 'Bygg en fråga del för del och se hur svaret ändras. Det som modellen hittar på markeras.'
stage: mvp
status: publicerad
quiz:
  - kind: 'förståelse'
    see: 'att-prata-med-ai#uppgift'
    q: 'Varför hittar modellen ibland på detaljer, som en feber du aldrig haft?'
    right: 'Den fyller luckor i frågan med det som brukar stå i liknande texter'
    why: 'Modellen gissar det troligaste. Saknas uppgifter blir gissningen allmän eller påhittad.'
    wrong:
      - text: 'Den har läst din journal'
        why: 'Den vet ingenting om dig utöver det du skriver. Detaljerna kommer från vad som brukar stå i liknande mejl.'
      - text: 'Den vill att mejlet ska låta mer trovärdigt och ljuger med flit'
        why: 'Den har ingen avsikt. Den väljer det som låter rimligast, och då blir det ibland påhittat.'
  - kind: 'förståelse'
    see: 'att-prata-med-ai#sammanhang'
    q: 'Vad gör sammanhanget i en fråga?'
    right: 'Ger modellen det den behöver veta, så att den inte behöver gissa'
    why: 'Med provet i frågan behöver modellen inte hitta på en anledning. Mejlet ställer rätt fråga.'
    wrong:
      - text: 'Gör modellen smartare'
        why: 'Modellen är densamma. Den får bara bättre underlag att gissa utifrån.'
      - text: 'Ingenting, modellen vet redan sammanhanget'
        why: 'Den vet bara det som står i frågan, och ibland det som sagts tidigare i samma samtal.'
  - kind: 'tillämpning'
    see: 'att-prata-med-ai#format'
    q: 'Du vill ha tre middagsförslag utan kött som tar under 30 minuter. Vilken fråga fungerar bäst?'
    right: '”Ge tre vegetariska middagar som tar under 30 minuter, som en kort lista.”'
    why: 'Den säger vad, villkoren och formatet. Då behöver modellen inte gissa.'
    wrong:
      - text: '”Middag?”'
        why: 'För vag. Modellen vet inte om du vill ha ett recept, en lista eller tips på restauranger.'
      - text: '”Du är världens bästa kock. Svara så utförligt du kan.”'
        why: 'Det säger inget om vad du vill ha, och ”utförligt” ger lång text i stället för tre förslag.'
  - kind: 'förutsägelse'
    see: 'att-prata-med-ai#las-igenom'
    q: 'Du tar bort sammanhanget men behåller resten. Vad händer med svaret?'
    right: 'Modellen hittar på en anledning, och träffsäkerheten sjunker'
    why: 'Utan provet fyller modellen luckan med en påhittad feber.'
    wrong:
      - text: 'Ingenting, resten räcker'
        why: 'Sammanhanget var det som stoppade gissningen. Utan det kommer det påhittade tillbaka.'
      - text: 'Svaret blir längre men lika bra'
        why: 'Längden styrs av formatet. Det som ändras är att modellen hittar på i stället för att fråga om provet.'
---

Hur du frågar påverkar vad du får. En språkmodell gissar det mest troliga svaret utifrån det som står i frågan. Står det lite blir svaret allmänt, och saknas viktiga uppgifter fyller modellen ofta i med detaljer som låter rimliga men är påhittade.

En bra fråga säger vad du vill ha och till vem, ger det sammanhang som behövs, säger hur svaret ska se ut och visar gärna ett exempel. Men även med en bra fråga är det du som ansvarar för svaret. Läs igenom innan du använder det.

## Filmen visar

- Hur en vag fråga ger ett allmänt svar.
- Hur modellen fyller luckor med påhittade detaljer.
- Vad sammanhang, format och ett exempel gör med svaret.

## Du provar själv

Ta med eller ta bort delar av frågan och se hur mejlet ändras.

## Vad vi förenklar här

- Svaren i modulen är förskrivna för att visa idén. En riktig modell svarar olika varje gång och kan göra andra misstag.
- Det finns inga magiska ord. Det som hjälper är att vara tydlig, ge sammanhang och säga vad du vill ha.
- Skriv aldrig in känsliga uppgifter om dig själv eller andra i en AI-tjänst utan att veta vart de tar vägen.
