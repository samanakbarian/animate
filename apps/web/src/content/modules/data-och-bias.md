---
title: Data och bias
order: 12
summary: 'En modell lär sig det som finns i datan, även det du inte menade. Och den fungerar bäst för dem som syns mest i den.'
goal: 'Varför en modell kan hitta genvägar i datan, varför ett bra snitt kan dölja att den fungerar sämre för vissa, och vad som hjälper.'
interactive: 'Ändra hur ofta vargarna står i snö och se vad modellen lär sig. Ändra hur mycket skånska som finns i träningen.'
stage: senare
status: publicerad
quiz:
  - kind: 'förståelse'
    see: 'bias-1#genvag'
    q: 'Varför lärde sig modellen att snö betyder varg?'
    right: 'I träningsbilderna stod nästan alla vargar i snö, så snön var en enkel genväg'
    why: 'Modellen lär sig det som skiljer grupperna i datan, inte det vi menade att den skulle lära sig.'
    wrong:
      - text: 'Någon programmerade in att vargar lever i snö'
        why: 'Ingen skrev någon regel. Modellen hittade sambandet själv i bilderna.'
      - text: 'Vargar är alltid i snö i verkligheten'
        why: 'Det är de inte. Det var bara så i just de här bilderna.'
  - kind: 'förståelse'
    see: 'bias-2#grupper'
    q: 'Vad kan ett bra snitt dölja?'
    right: 'Att modellen fungerar sämre för en grupp som är liten i datan'
    why: 'Snittet domineras av den stora gruppen. Delar man upp syns skillnaden.'
    wrong:
      - text: 'Ingenting, ett bra snitt betyder att den fungerar för alla'
        why: 'Med 95 % stockholmska blir snittet högt även om skånska förstås mycket sämre.'
      - text: 'Att modellen är för långsam'
        why: 'Snittet handlar om hur ofta den gör rätt, inte om fart.'
  - kind: 'tillämpning'
    see: 'bias-1#balans'
    q: 'En app ska känna igen hudåkommor från foton, men nästan alla träningsbilder kommer från personer med ljus hud. Vad är klokast?'
    right: 'Samla fler bilder från personer med mörkare hud och testa per grupp'
    why: 'Bättre data och test per grupp visar och minskar skillnaden.'
    wrong:
      - text: 'Använda appen ändå, snittet är högt'
        why: 'Ett högt snitt kan dölja att appen fungerar sämre för dem som var få i datan.'
      - text: 'Träna längre på samma bilder'
        why: 'Mer träning på samma snedvridna data lär modellen samma sak, bara säkrare.'
  - kind: 'förutsägelse'
    see: 'bias-1#test'
    q: 'Vargarna står i snö i 95 % av träningsbilderna. Vad händer när modellen ser en hund i snö?'
    right: 'Den gissar oftast varg'
    why: 'Snön väger tyngre än formen, så snöbilder blir ”varg”.'
    wrong:
      - text: 'Den gissar rätt, den har ju sett många hundar'
        why: 'Hundarna den sett stod nästan aldrig i snö. Snön tar över.'
      - text: 'Den vägrar svara'
        why: 'En sådan modell svarar alltid. Den kan inte säga att den är osäker av sig själv.'
---

En modell lär sig av exempel, och den lär sig allt som skiljer exemplen åt, även saker vi inte tänkt på. Om vargarna i bilderna nästan alltid står i snö kan modellen lära sig att snö betyder varg. Det kallas att modellen tar en genväg.

Samma sak händer med människor. En taligenkänning som mest har hört stockholmska förstår skånska sämre. En ansiktsigenkänning som mest har sett vissa ansikten gör fler fel på andra. Snittet kan ändå se bra ut, eftersom den stora gruppen väger tyngst. Det kallas bias, eller snedvridning.

Det som hjälper är bättre data, att testa på det svåra och att alltid dela upp resultatet per grupp.

## Filmen visar

- Hur en modell lär sig en genväg i datan, och hur den avslöjas av ett bra test.
- Hur ett högt snitt kan dölja att modellen fungerar sämre för en mindre grupp.

## Du provar själv

Ändra hur ofta vargarna står i snö och växla mellan träningsbilder och svåra testbilder. Ändra hur mycket skånska som finns i träningen.

## Vad vi förenklar här

- Bilderna i del 1 är punkter med två egenskaper, och modellen är en enda neuron. Riktiga bildmodeller ser miljontals pixlar, men kan ta precis samma sorts genvägar.
- Kurvan i del 2 är påhittad för att visa idén. Hur mycket data som behövs beror på uppgiften.
- Bias kommer inte bara från datan, utan också från vad man väljer att mäta och hur modellen används.
