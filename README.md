# learnai.se

AI förklarat från grunden (sajten heter LearnAI). Ingången är kortfilmen **NÄSTA STEG**, en mörk 3D-film i kod om vägen
från människa till språkmodeller, AGI och ASI. Runt den byggs korta, interaktiva förklarmoduler.

```bash
pnpm install
pnpm dev        # hemsidan på http://localhost:4321
pnpm dev:film   # bara filmen på http://localhost:5173
pnpm check      # typecheck + lint + test
```

| Del              | Var                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------- |
| Hemsidan (Astro) | `apps/web`                                                                            |
| Kortfilmen       | `packages/film` – se dess [README](packages/film/README.md)                           |
| Delad motor      | `packages/engine`                                                                     |
| Export till MP4  | `tools/render` (`pnpm render`)                                                        |
| Dokumentation    | `docs/` – börja med [STATUS](docs/STATUS.md) och [ARCHITECTURE](docs/ARCHITECTURE.md) |

Arbetar du som AI-agent? Läs [AGENTS.md](AGENTS.md).
