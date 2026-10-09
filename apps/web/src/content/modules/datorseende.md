---
title: Datorseende
order: 14
summary: 'För en dator är en bild bara tal. Små filter hittar kanter, kanterna blir former, och till sist kommer ett svar.'
goal: 'Hur en dator hittar kanter och former i en bild med filter, hur det blir till ett svar, och varför modellen kan vara säker och ändå ha fel.'
interactive: 'Välj bild och filter, se var filtret svarar, och lägg till brus tills modellen svarar fel.'
stage: senare
status: publicerad
quiz:
  - kind: 'förståelse'
    see: 'seende#pixlar'
    q: 'Vad är en bild för en dator?'
    right: 'Ett rutnät av tal, ett eller tre per pixel'
    why: 'Varje pixel är ett tal för hur ljus den är, eller tre tal för rött, grönt och blått.'
    wrong:
      - text: 'En liten kopia av det den föreställer'
        why: 'Datorn har ingen bild i huvudet. Den har bara talen.'
      - text: 'En lista med ord som beskriver bilden'
        why: 'Orden kommer i så fall från en modell som tolkat talen. Själva bilden är bara tal.'
  - kind: 'förståelse'
    see: 'seende#filter'
    q: 'Vad gör ett filter i en bildmodell?'
    right: 'Det glider över bilden och svarar starkt där ett visst mönster finns, till exempel en kant'
    why: 'Filtret jämför sina vikter med varje liten bit av bilden. Där de passar blir svaret stort.'
    wrong:
      - text: 'Det gör bilden snyggare, som i en fotoapp'
        why: 'Samma ord, men här letar filtret efter mönster. Det ändrar inte bilden.'
      - text: 'Det tar bort det som inte är viktigt i bilden'
        why: 'Filtret tar inte bort något. Det ger en ny karta över var mönstret finns.'
  - kind: 'tillämpning'
    see: 'seende#brus'
    q: 'En kamera på en fabrik ska hitta trasiga delar. På natten blir bilderna brusiga, och modellen säger ofta ”hel” med 95 % säkerhet. Vad är klokast?'
    right: 'Testa modellen på brusiga nattbilder och träna den på sådana, och lita inte blint på säkerheten'
    why: 'Säkerheten säger hur lika bilden är det modellen sett, inte om den har rätt.'
    wrong:
      - text: 'Lita på svaret, 95 % är väldigt säkert'
        why: 'En modell kan vara säker och ändå ha fel, särskilt på bilder som skiljer sig från träningen.'
      - text: 'Sänka gränsen så att den säger trasig oftare'
        why: 'Det kan hjälpa lite, men det löser inte att modellen aldrig sett brusiga bilder.'
  - kind: 'förutsägelse'
    see: 'seende#kanter'
    q: 'Filtret för lodräta kanter glider över en kvadrat. Var blir svaret störst?'
    right: 'Längs kvadratens vänstra och högra sida'
    why: 'Där går det från mörkt till ljust i sidled, och det är just det filtret letar efter.'
    wrong:
      - text: 'Mitt i kvadraten, där den är ljusast'
        why: 'Mitt i är allt lika ljust. Filtret svarar på skillnad, inte på ljus.'
      - text: 'Längs över- och underkanten'
        why: 'De kanterna är vågräta. Där svarar det vågräta filtret.'
---

För en dator är en bild bara tal: ett rutnät med ett tal för hur ljus varje pixel är, eller tre tal för rött, grönt och blått. Att se något i bilden betyder att hitta mönster i talen.

Ett faltningsnätverk börjar med små filter, rutor med vikter som glider över bilden. Ett filter svarar starkt där det finns en lodrät kant, ett annat där det finns en vågrät. Nästa lager tittar på de kartorna och hittar hörn och kurvor, nästa ögon och hjul, och längst in hela föremål. Sist kommer ett svar: hur säker modellen är på varje sak den kan känna igen.

Säkerheten säger hur lik bilden är det modellen sett förut, inte om den har rätt. En bild som skiljer sig från träningen, med brus, konstigt ljus eller en ovanlig vinkel, kan få ett säkert men fel svar.

## Filmen visar

- Hur en bild blir tal.
- Hur ett filter glider över bilden och hittar kanter.
- Hur kanterna räknas ihop till ett svar.
- Hur brus kan få modellen att svara fel och ändå vara säker.

## Du provar själv

Välj bild och filter, och se var filtret svarar. Lägg till brus tills modellen svarar fel.

## Vad vi förenklar här

- Bilden är 16 × 16 pixlar i gråskala, och talen går från 0 till 9. Riktiga bilder har miljontals pixlar och tal från 0 till 255 per färg.
- Våra fyra filter är handskrivna. I ett riktigt nätverk lärs filtren in under träningen, och de är tusentals.
- Svaret räknas här direkt från kanterna, genom att jämföra med hur varje form brukar se ut. Riktiga nätverk har många lager mellan kanterna och svaret.
