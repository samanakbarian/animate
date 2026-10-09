# Skolmaterial – möjlig fortsättning

_Lektionerna finns nu på `/skola` (B-25, `content/lessons.json`). Det som står under ”Senare” är inte byggt._

## Idé: lektioner av befintligt innehåll

En lektion är en lärväg för klassrummet: samma datamodell som `content/paths.json` (steg av moduldelar,
spel och quizfrågor), plus det läraren behöver. Inget nytt ramverk krävs för att börja.

| Lektion (40–60 min)         | Steg                                                               | Diskussionsfråga                                |
| --------------------------- | ------------------------------------------------------------------ | ----------------------------------------------- |
| 1. Hur lär sig en maskin?   | Neuralt nätverk del 1 och 3, Dra gränsen, Träning, Gradientgolf    | Vad är skillnaden mellan regler och exempel?    |
| 2. Hur skriver en chattbot? | Ord som tal, Tokenjakten, Språkmodellen, Slå maskinen              | Varför kan samma fråga ge olika svar?           |
| 3. Kan man lita på AI?      | Risker del 1, Hallucinationsjakten, Från förträning till assistent | Hur kontrollerar du ett svar du inte kan själv? |
| 4. AI som gör saker         | Agenten, Flera agenter, Resonerande modeller                       | Vilka beslut ska en människa alltid fatta?      |

## Vad läraren behöver (utan inloggning)

- En lärarsida per lektion: mål, tidsplan, förberedelser, diskussionsfrågor och facit till quizen.
- Utskrivbart elevblad (PDF via webbläsarens utskrift, egen print-CSS).
- Koppling till läroplanen (t.ex. teknik och samhällskunskap på högstadiet, programmering på gymnasiet).

## Senare, med backend (ADR 0011)

- Klasskod i stället för elevkonton: läraren ser hur många som är klara, inte vem.
- Lärarkonto, sparade klasser och resultat kräver personuppgiftsbiträdesavtal och dataskyddsanalys
  (elever är ofta under 16). Bygg inte förrän grundaren bestämt riktning.

## Nästa steg om grundaren säger ja

1. Utöka schemat för `paths` med `audience: 'elev' | 'lärare'`, `discussion` och `prep`.
2. Skriv lektion 1 och testa den med en riktig klass.
3. Lägg till sidan `/skola` med lektionerna.
