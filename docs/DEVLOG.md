# Devlogg

Nyaste överst. En post per arbetspass. Skriv för nästa agent: **vad**, **varför**, **vad som återstår**,
**fällor**. Håll varje post under ~25 rader. Detaljer finns i git-historiken (`git log --stat`).

---

## 2026-10-04 – Monorepo, hemsida och agentdokumentation

**Vad**

- Repot omstrukturerat till pnpm-monorepo: `apps/web` (Astro 7), `packages/engine`, `packages/film`,
  `tools/render`. Filerna flyttades med `git mv`, så historiken följer med.
- Motorn frikopplad från filmen: `AudioEngine(ctx, score)` tar ett `Score` (events, duration,
  ambience). Pad/stab får ackordtoner via `NoteEvent.notes` i stället för hårdkodade ackord.
- Filmen har ett publikt API (`mountPlayer`, `mountRenderTarget`, `supportsRealtime`). Bildytan
  storleksanpassas efter behållaren (ResizeObserver), och CSS:en är avgränsad till `.ns-player`.
- Hemsida: startsida med filmen som lat klient-ö, modulöversikt, modulsidor, ordlista och om-sida.
  Innehållet ligger i content collections med zod-schema.
- Verktyg: ESLint (flat config), Prettier, Vitest (22 tester), GitHub Actions CI, `.editorconfig`, `.nvmrc`.
- Dokumentation: `AGENTS.md`, `CLAUDE.md`, `docs/STATUS.md`, `ARCHITECTURE.md`, `ROADMAP.md` och ADR 0001–0005.

**Varför**: filmen ska bli en del av produkten nastasteg.se. Flera filmer och moduler ska dela motor.

**Fällor**

- npm 10 kraschar (`edgesOut`) på peer-beroenden i workspaces. Därför används pnpm.
- `pnpm frames -- …`: pnpm skickar med `--` bokstavligt, och verktygen filtrerar bort det.
- Playwright-skript måste ligga där `playwright` går att resolva (`tools/render/`).

**Återstår**: se `docs/STATUS.md` → Nästa.

---

## 2026-10-01 – Ny musik och tystare regn

- Regnet sänkt i två omgångar (nu ≈ −16 dB jämfört med första versionen).
- Musiken omskriven: breakbeat (kick 1/”och”/3), clap, spökslag, tom-fills var fjärde takt, distade
  ackordstötar, ny rytmisk melodi och pumpande ducking av musikbussen på varje kick.
- Mindre bas: basen ligger i ett högre register med högpass, ingen sub-oktav, och mixen har en lågshelf på −5 dB.
  Uppmätt: <120 Hz sjönk 4,7 dB.

## 2026-09-30 – Kortfilmen NÄSTA STEG v2

- 3D-kortfilm (2 min 30 s) i Three.js + postprocessing enligt spec: procedurell riggad figur, 14 steg
  med dissolve-övergångar i takt, våt asfalt med planar reflection, regn, volymetriska ljuskäglor,
  ACES + 3D-LUT, bloom, skärpedjup och korn. ASI-sekvens och slut på parkbänken.
- Syntad musik (D-moll, 96 BPM) via Web Audio, samma partitur i realtid och offline.
- Export: Playwright stegar `t`, OfflineAudioContext ger WAV och ffmpeg gör MP4. Verifierat på ett utsnitt (105–109 s).
- Determinism verifierad: samma `t` ger pixelidentisk bild oavsett renderingsordning.
