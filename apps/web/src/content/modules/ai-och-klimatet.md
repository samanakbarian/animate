---
title: AI och klimatet
order: 19
summary: 'Varje svar från en AI räknas fram i ett datacenter och kräver el. Hur mycket beror på vad du gör, och utsläppen beror på elen.'
goal: 'Varför AI kräver el, varför en film kräver mycket mer än ett textsvar, varför användningen till slut kräver mer än träningen, och varför elen avgör utsläppen.'
interactive: 'Välj vad du gör, hur många gånger per dag och var elen kommer från, och se vad det blir på ett år.'
stage: senare
status: publicerad
quiz:
  - kind: 'förståelse'
    see: 'ai-och-klimatet#datacenter'
    q: 'Varför kräver det el när du frågar en AI något?'
    right: 'Svaret räknas fram av datorer i ett datacenter'
    why: 'Varje token kräver beräkningar, och datorerna och kylningen drivs med el.'
    wrong:
      - text: 'Svaret hämtas färdigt från internet'
        why: 'Svaret räknas fram varje gång, en token i taget. Det är det som kräver el.'
      - text: 'Det kräver bara el när modellen tränas'
        why: 'Träningen kräver mycket el, men varje svar kräver också beräkningar.'
  - kind: 'förståelse'
    see: 'ai-och-klimatet#traning'
    q: 'En AI-tjänst används av miljontals människor. Vad kräver mest el med tiden?'
    right: 'Användningen, eftersom svaren blir så många'
    why: 'Ett svar kräver lite, men miljarder svar om dagen kommer snart ikapp träningen.'
    wrong:
      - text: 'Träningen, för den görs om varje gång du frågar'
        why: 'Modellen tränas innan den släpps, inte när du frågar.'
      - text: 'Ingenting, AI kräver nästan ingen el'
        why: 'Ett svar kräver lite, men lite gånger många blir mycket.'
  - kind: 'tillämpning'
    see: 'ai-och-klimatet#olika'
    q: 'Du vill att din AI-användning ska kräva mindre el. Vad gör störst skillnad?'
    right: 'Att inte göra bilder och filmer i onödan'
    why: 'En kort film kan kräva tusentals gånger mer el än ett kort textsvar.'
    wrong:
      - text: 'Att skriva kortare frågor'
        why: 'Det gör liten skillnad. Vad du ber om spelar mycket större roll.'
      - text: 'Att stänga av skärmen medan du väntar på svaret'
        why: 'Det mesta av elen går åt i datacentret, inte i din telefon eller dator.'
  - kind: 'förutsägelse'
    see: 'ai-och-klimatet#elen'
    q: 'Du byter från svensk el till mest kolkraft men gör lika många frågor. Vad händer?'
    right: 'Lika mycket el, men ungefär tjugo gånger mer koldioxid'
    why: 'Kolkraft släpper ut mycket mer koldioxid för varje kilowattimme.'
    wrong:
      - text: 'Det krävs mer el'
        why: 'Hur mycket el ett svar kräver beror på beräkningen, inte på var elen kommer från.'
      - text: 'Ingenting ändras'
        why: 'Elen är densamma, men utsläppen beror på hur den har gjorts.'
---

AI körs i datacenter, stora hallar fulla av datorer. Varje svar räknas fram en token i taget, och det kräver el. Datorerna blir varma, och värmen kyls bort, ofta med vatten.

Ett kort textsvar kräver ungefär 0,3 wattimmar, ungefär som en LED-lampa som lyser i två minuter. Långa svar med resonemang och bilder kräver ungefär tio gånger mer, och en kort film kan kräva tusentals gånger mer. För en person är textsvaren lite el. Men tjänsterna används av hundratals miljoner människor, så tillsammans blir det mycket. Att träna en modell kräver mycket el en gång, men med tiden kräver användningen ännu mer.

Hur mycket koldioxid det blir beror på hur elen har gjorts. Svensk el kommer mest från vatten, kärnkraft och vind och ger lite utsläpp. El från kolkraft ger ungefär tjugo gånger mer. Datacenter står i dag för ungefär en och en halv procent av all el i världen, och andelen väntas växa snabbt med AI.

AI kan också användas för klimatet, till exempel för snabbare väderprognoser, för att förutsäga sol och vind i elnätet och för att leta efter nya material till batterier. Men samma teknik används också för att hitta mer olja och gas.

## Filmen visar

- Varför ett svar från en AI kräver el.
- Hur mycket el ett textsvar, ett resonemang, en bild och en kort film kräver.
- Vad tjugo frågor om dagen blir på ett år, jämfört med vardagssaker.
- Varför användningen till slut kräver mer el än träningen.
- Varför samma el ger olika mycket utsläpp beroende på hur den har gjorts.

## Du provar själv

Välj vad du gör, hur många gånger per dag och var elen kommer från. När blir det mycket?

## Vad vi förenklar här

- Alla siffror är avrundade uppskattningar. Företagen redovisar sällan exakt hur mycket el deras modeller kräver, och det skiljer mycket mellan modeller och datacenter.
- Ett kort svar på 0,3 Wh bygger på uppskattningar för stora chattjänster 2025. Siffran för film kommer från mätningar på en öppen videomodell.
- Vi räknar bara elen i datacentret. Att tillverka datorerna och bygga datacentren ger också utsläpp, och kylningen kräver vatten.
- Var datacentret står vet du sällan. Det kan ligga i ett annat land än du.
- Miljarden svar om dagen är ett tänkt, avrundat tal.
