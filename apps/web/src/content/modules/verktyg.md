---
title: Verktyg
order: 16
summary: 'En språkmodell kan inte räkna exakt eller se dagens väder. Men den kan be programmet runt sig att köra ett verktyg.'
goal: 'Hur en språkmodell använder verktyg: den skriver ett anrop, programmet kör verktyget, och modellen svarar med resultatet.'
interactive: 'Välj fråga och vilka verktyg modellen får, och stega igenom anrop, resultat och svar.'
stage: senare
status: publicerad
quiz:
  - kind: 'förståelse'
    see: 'verktyg#programmet'
    q: 'Vem räknar ut svaret när en chattbot använder en miniräknare?'
    right: 'Miniräknaren. Programmet kör den och lägger in resultatet i samtalet'
    why: 'Modellen skriver bara anropet. Själva uträkningen görs av verktyget.'
    wrong:
      - text: 'Modellen, den har lärt sig räkna under träningen'
        why: 'Då hade den inte behövt verktyget. Stora tal gissar den fram, och då kan det bli fel.'
      - text: 'Användaren, som får räkna själv'
        why: 'Allt sker automatiskt. Programmet kör verktyget utan att du märker det.'
  - kind: 'förståelse'
    see: 'verktyg#anrop'
    q: 'Vad är ett verktygsanrop?'
    right: 'Text som modellen skriver och som säger vilket verktyg som ska köras och med vad'
    why: 'Modellen kan bara skriva text. Programmet runt den känner igen anropet och kör verktyget.'
    wrong:
      - text: 'En del av modellen som kan räkna och söka'
        why: 'Verktygen ligger utanför modellen. Modellen ber bara om att de ska köras.'
      - text: 'När du själv klickar på en knapp i appen'
        why: 'Det är modellen som skriver anropet, inte du.'
  - kind: 'tillämpning'
    see: 'verktyg#saknas'
    q: 'Du frågar en chattbot utan sökverktyg om resultatet i gårdagens match. Vad är klokast att göra med svaret?'
    right: 'Lita inte på det, och kontrollera det på en nyhetssajt'
    why: 'Utan verktyg kan modellen bara svara ur det den lärt sig, och gårdagens match fanns inte i träningen.'
    wrong:
      - text: 'Lita på det om svaret låter säkert'
        why: 'Modellen kan låta säker och ändå hitta på. Den kan inte veta det som hänt efter träningen.'
      - text: 'Fråga igen tills svaret blir detsamma två gånger'
        why: 'Samma gissning två gånger blir inte mer sann. Modellen saknar uppgiften.'
  - kind: 'förutsägelse'
    see: 'verktyg#valja'
    q: 'Modellen har tillgång till en miniräknare och får frågan ”Vem skrev Röda rummet?”. Vad händer?'
    right: 'Den svarar direkt utan att använda miniräknaren'
    why: 'Modellen väljer verktyg efter frågan. Här behövs inget, svaret finns i det den lärt sig.'
    wrong:
      - text: 'Den använder miniräknaren ändå, eftersom den finns'
        why: 'Modellen läser beskrivningen av verktyget och ser att det inte passar frågan.'
      - text: 'Den säger att den inte kan svara utan sökverktyg'
        why: 'Det här är allmän kunskap som finns i träningen. Inget verktyg behövs.'
---

En språkmodell skriver det som låter troligt. Det fungerar bra för språk, men sämre för exakta uträkningar, och den kan inte veta något som hänt efter träningen, till exempel dagens väder.

Därför får många modeller verktyg: en miniräknare, en sökmotor, en kalender. Modellen får en kort beskrivning av varje verktyg. När den behöver ett skriver den ett anrop, alltså text som säger vilket verktyg och vad det ska få. Programmet runt modellen känner igen anropet, kör verktyget och lägger in resultatet i samtalet. Sedan fortsätter modellen och skriver sitt svar med resultatet framför sig.

Modellen väljer själv om ett verktyg behövs, och ibland behövs flera anrop i rad. Det är samma idé som gör en agent möjlig. Svaret blir aldrig bättre än verktyget: får modellen fel resultat tillbaka kan svaret bli fel ändå.

## Filmen visar

- Varför en modell utan verktyg kan svara fel på en uträkning.
- Hur ett anrop går från modellen till programmet och verktyget, och hur resultatet kommer tillbaka.
- Att modellen väljer själv när ett verktyg behövs.
- Vad som händer när verktyget saknas.

## Du provar själv

Välj fråga och vilka verktyg modellen får. Stega igenom anrop, resultat och svar.

## Vad vi förenklar här

- Vädret i modulen är påhittat.
- Riktiga anrop skrivs i ett bestämt format, ofta JSON, och programmet kontrollerar dem innan något körs.
- Det felaktiga svaret utan miniräknare är ett exempel. Stora modeller räknar ofta rätt på enkla tal, men kan ta fel på långa uträkningar.
- Utan verktyg säger modellen här att den inte vet. Ibland gissar den i stället.
