# 0011 – Backend: Firebase i Google Cloud (föreslagen, avvaktar)

- **Status:** föreslagen – avvaktar. Bygg inget förrän produktens riktning är bestämd.
- **Datum:** 2026-10-07

## Sammanhang

Sajten är helt statisk. R3 och R4 i backloggen (konton, framsteg mellan enheter, klassläge, uppdrag, diplom)
och ”Fråga sajten” kräver en backend. Grundaren kör redan Google Cloud för sida377.se. Supabase var första
förslaget, men ett konto och en faktura väger tyngre.

## Förslag

- **Firebase i ett eget projekt** (skilt från sida377), med data i en EU-region:
  - Authentication för inloggning med e-postlänk (vuxna, lärare).
  - Firestore för framsteg, märken, klasser och uppdrag, med säkerhetsregler i databasen.
  - Cloud Functions eller Cloud Run för det som kräver hemligheter (AI-assistenten), med nycklar i Secret Manager.
- Sajten förblir statisk (Astro). Den ligger på Netlify, och Firebase Hosting är ett alternativ längre fram.
- Principer:
  - Man lär sig utan konto. Framsteg sparas först lokalt och synkas vid inloggning.
  - Elever skapar inga konton: de går in med klasskod och smeknamn.
  - Minimal persondata, allt går att radera, och en integritetspolicy finns före första inloggningen.
- Ordning:
  1. Inloggning och synk (R3).
  2. Klasser och uppdrag (R4).
  3. Fråga sajten, med gränser per besökare och kostnadstak.

## Konsekvenser

- Firestore är en dokumentdatabas. Om behovet blir tungt relationellt (rapporter, statistik över klasser) finns
  Cloud Run och Cloud SQL, som dock kostar från dag ett.
- Firebase web-konfiguration är publik. Säkerheten ligger i säkerhetsreglerna, som måste testas.
