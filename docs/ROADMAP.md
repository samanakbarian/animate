# Roadmap

Backloggen med featurelista och releaseplan (levande dokument):
https://claude.ai/code/artifact/8fc1d0da-e959-46f2-9e61-5362ab172aae

Den första featurelistan: https://claude.ai/code/artifact/a2829a1a-c962-40fe-b66b-3f2b7b33ddd1

Här spåras det som är byggt. Bocka av och länka till devloggen.

## Lansering (MVP)

- [x] Kortfilmen NÄSTA STEG (realtid i webbläsaren, MP4-export)
- [x] Hemsidans skal: startsida med filmen, moduler, ordlista (22 begrepp), om
- [ ] MP4-reserv för filmen (spelaren är klar, videofilen återstår – kräver GPU, se STATUS)
- [x] Modulramverk: film som kan pausas och styras (ADR 0004)
- [x] Modul 1 – Neuralt nätverk (del 1: en neuron, del 2: ett nätverk som tränas i webbläsaren)
- [x] Modul 5 – Språkmodellen (liten seedad trigrammodell, temperatur, slumpfrö)
- [x] Modul 8 – Agenten (simulerad agent: tänk/agera/observera, fel och människa i loopen)
- [x] Namn och domän: iLearnAI på ilearnai.se (ADR 0008)
- [x] Logga, delningsbild, sitemap, robots.txt, llms.txt och grundare i strukturerad data
- [x] Driftsättning på ilearnai.se (Netlify, HTTPS, www → apex)

## Version 2

- [x] Moduler: Träning, Ord som tal, Transformern, Resonerande modeller, Från förträning till assistent
- [ ] Klickbara kapitel i filmen som länkar till moduler
- [ ] Tidslinje 1943–2026
- [ ] Engelska

## Spel (R2)

- [x] Spelramverk (ADR 0007), spelsida och länkar till modulerna
- [x] Gradientgolf
- [x] Slå maskinen
- [x] Dra gränsen
- [x] Hallucinationsjakten
- [x] Tokenjakten
- [x] Vem är ”den”?
- [x] AI-tidslinjen
- [ ] Spärrvakten (pausad)

## Lärande (R3)

- [x] Quiz i varje modul: förstå, använd, förutsäg, med länk tillbaka till kapitlet
- [x] Lärväg ”Förstå hur AI fungerar på 20 minuter” med framsteg i webbläsaren
- [x] ”Vad vi förenklar här” i alla moduler
- [ ] Fler lärvägar, märken (B-19)
- [ ] Skolmaterial (förslag i `docs/SKOLMATERIAL.md`)
- [ ] Statistik påslagen (ADR 0012, väntar på val av tjänst)

## Senare

- [x] Moduler: Flera agenter, Risker och säkerhet (två delar)
- [x] Ljud i modulerna (`module/sound.ts`)
- [ ] Fråga sajten (svarar bara från sajtens innehåll)
- [ ] Lärarmaterial, inloggning, framsteg och diplom
