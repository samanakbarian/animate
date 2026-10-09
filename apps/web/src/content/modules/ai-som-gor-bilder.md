---
title: AI som gör bilder
order: 13
summary: 'En bildmodell målar inte. Den börjar med brus och tar bort lite i taget, tills det som finns kvar passar texten.'
goal: 'Hur en bildmodell går från brus till bild steg för steg, varför de stora formerna kommer först, och varför samma text ger olika bilder.'
interactive: 'Välj text och startbrus och dra i stegen från brus till färdig bild.'
stage: senare
status: publicerad
quiz:
  - kind: 'förståelse'
    see: 'bilder#brus'
    q: 'Vad börjar en bildmodell som Stable Diffusion med?'
    right: 'Brus, alltså slumpade prickar, och texten du skrivit'
    why: 'Bilden växer fram ur bruset. Texten styr vad modellen letar efter.'
    wrong:
      - text: 'En tom vit duk som den målar på med penseldrag'
        why: 'Den målar inte. Den tar bort brus, steg för steg.'
      - text: 'En färdig bild från internet som den ändrar lite'
        why: 'Den hämtar ingen bild. Den har lärt sig mönster från många bilder och skapar en ny.'
  - kind: 'förståelse'
    see: 'bilder#traning'
    q: 'Hur har modellen lärt sig att ta bort brus?'
    right: 'Den har sett riktiga bilder få brus tillagt och övat på att gissa vilket brus det var'
    why: 'Träningen går baklänges: lägg till brus, gissa bruset, rätta gissningen.'
    wrong:
      - text: 'Någon har skrivit regler för hur himmel och berg ser ut'
        why: 'Ingen skriver sådana regler. Modellen lär sig mönstren ur bilderna.'
      - text: 'Den sparar alla bilder den sett och klipper ihop dem'
        why: 'Den sparar mönster i sina vikter, inte bilderna. Ibland kan den ändå återskapa en bild den sett många gånger.'
  - kind: 'tillämpning'
    see: 'bilder#fro'
    q: 'Du har fått en bild du gillar och vill göra en nästan likadan med en liten ändring i texten. Vad hjälper?'
    right: 'Behåll samma startbrus (frö) och ändra bara texten lite'
    why: 'Samma startbrus ger samma grund, så bara det texten ändrar blir annorlunda.'
    wrong:
      - text: 'Skriv samma text igen och hoppas'
        why: 'Med nytt startbrus blir det en ny bild, inte samma med en ändring.'
      - text: 'Ta färre steg'
        why: 'Färre steg ger en suddigare eller brusigare bild, inte en kontrollerad ändring.'
  - kind: 'förutsägelse'
    see: 'bilder#grovt'
    q: 'Du stoppar modellen halvvägs, efter 10 av 20 steg. Hur ser bilden ut?'
    right: 'Man ser de stora formerna och färgerna, men den är suddig och brusig'
    why: 'Det grova kommer först. Detaljer och skarpa kanter kommer i de sista stegen.'
    wrong:
      - text: 'Halva bilden är klar och halva är brus'
        why: 'Hela bilden växer fram samtidigt, inte en bit i taget.'
      - text: 'Den ser färdig ut, men med lite fel i detaljerna'
        why: 'Halvvägs finns fortfarande mycket brus kvar, och kanterna är suddiga.'
---

En bildmodell målar inte som en människa. Den börjar med brus, alltså slumpade prickar i alla färger, och en text som säger vad bilden ska visa. I varje steg gissar modellen vilket brus som inte passar texten och tar bort en del av det. Efter tjugo till femtio steg finns en bild kvar. Det kallas en diffusionsmodell.

De stora formerna kommer först: var himlen är, var marken är, var det ljusa och mörka ligger. Detaljerna kommer sist. Texten styr vad modellen letar fram, och startbruset avgör resten. Därför ger samma text en ny bild varje gång, om du inte återanvänder samma startbrus.

Modellen har lärt sig genom att se miljontals bilder med beskrivningar. Under träningen lades brus på bilderna, och modellen övade på att gissa vilket brus som lagts till.

## Filmen visar

- Hur en bild växer fram ur brus, steg för steg.
- Varför de stora formerna syns före detaljerna.
- Hur texten och startbruset påverkar vilken bild det blir.
- Hur träningen går åt andra hållet: från bild till brus.

## Du provar själv

Välj text och startbrus och dra i stegen. Se vad som syns först, och vad som ändras med ett nytt startbrus.

## Vad vi förenklar här

- I modulen finns bilden redan gömd i koden och visas fram. En riktig modell har ingen färdig bild, utan gissar i varje steg vilket brus som ska bort utifrån det den lärt sig.
- Bilden är 48 × 36 pixlar och vi tar 20 steg. Riktiga modeller gör bilder med miljontals pixlar, och arbetar ofta på en mindre, komprimerad version av bilden.
- Att det grova kommer först visar vi med oskärpa. I riktiga modeller blir det så av sig självt, för brus döljer detaljerna innan det döljer de stora formerna.
- Bilderna en modell gör speglar bilderna den tränats på, med deras brister och upphovsrätt.
