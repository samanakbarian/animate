---
title: Ord som tal
order: 3
summary: 'Hur text delas upp i bitar och hur varje bit blir en lista med tal.'
goal: 'Tokens och inbäddningar, och varför ord som används på liknande sätt hamnar nära varandra.'
interactive: 'Dela upp långa ord i tokens och räkna med ord på en karta: kung − man + kvinna.'
stage: v2
status: publicerad
quiz:
  - kind: 'förståelse'
    see: 'ord-som-tal#tokens'
    q: 'Varför görs text om till tal?'
    right: 'Ett neuralt nätverk kan bara räkna med tal'
    why: 'Varje token får ett nummer och sedan en lista med tal som nätverket räknar med.'
    wrong:
      - text: 'För att texten ska ta mindre plats'
        why: 'Det handlar inte om plats. Tal är det enda nätverket kan arbeta med.'
      - text: 'För att dölja texten för modellen'
        why: 'Inget döljs. Talen bär information om orden.'
  - kind: 'förståelse'
    see: 'ord-som-tal#karta'
    q: 'Vilka ord får liknande inbäddningar?'
    right: 'Ord som används i liknande sammanhang'
    why: '”Hund” och ”katt” förekommer i liknande meningar och hamnar därför nära varandra.'
    wrong:
      - text: 'Ord som stavas nästan likadant'
        why: '”Hund” och ”hundra” stavas nästan likadant men används helt olika. Det är användningen som räknas.'
      - text: 'Ord som är lika långa'
        why: 'Längden spelar ingen roll. Det är sammanhangen orden förekommer i som avgör.'
  - kind: 'tillämpning'
    see: 'ord-som-tal#karta'
    q: 'En modell har läst mycket text om husdjur. Var på kartan hamnar troligen ordet ”valp”?'
    right: 'Nära ”hund”'
    why: '”Valp” används i ungefär samma meningar som ”hund”.'
    wrong:
      - text: 'Nära ”vagn”, eftersom båda börjar på v'
        why: 'Bokstäverna spelar ingen roll för var ordet hamnar. Sammanhanget gör det.'
      - text: 'Långt från alla andra ord, eftersom det är ovanligt'
        why: 'Även ovanliga ord hamnar nära ord som används på liknande sätt.'
  - kind: 'förutsägelse'
    see: 'ord-som-tal#rakna'
    q: 'Du räknar kung − man + kvinna. Var hamnar pilen?'
    right: 'Nära drottning'
    why: 'Steget från man till kvinna är en riktning. Lägger man den till kung hamnar man vid drottning.'
    wrong:
      - text: 'Nära kvinna'
        why: 'Man drar bara bort det som skiljer man från kvinna. Det kungliga finns kvar.'
      - text: 'Tillbaka vid kung'
        why: 'Steget från man till kvinna flyttar pilen, så den hamnar inte på samma ställe.'
---

En dator kan bara räkna med tal. Därför delas texten först upp i bitar, så kallade tokens. Sedan får varje bit en lista med tal, en inbäddning. Ord som brukar förekomma i liknande sammanhang får liknande tal.

Det gör att man kan räkna med betydelser. Tar man kung, drar bort man och lägger till kvinna hamnar man nära drottning.

## Vad vi förenklar här

- Inbäddningarna här är handgjorda och har några få tal per ord. En riktig modell lär sig sina själv och har hundratals eller tusentals tal per token.
- Kartan visar en platt bild av något som har många fler dimensioner. Avstånd på kartan stämmer bara ungefär.
- Analogier som kung − man + kvinna fungerar ofta men inte alltid i riktiga modeller.
- Varje modell har sitt eget sätt att dela upp text i tokens.
