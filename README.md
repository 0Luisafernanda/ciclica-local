# Feer

App desktop **local-first** para el ciclo: entiende cómo estás ahora, prueba una acción concreta y aprende qué te ayuda.

Privada por defecto. Sin cuenta. Sin analytics. Sin sync. Open source (MIT).

[github.com/luisaafernanda/feer-local](https://github.com/luisaafernanda/feer-local)

## Quick start

```bash
npm install
npm start    # Electron
npm run web  # http://localhost:4173
npm test
```

## What it does (v0.1)

One surface. No dashboard.

1. **Cycle** — estimated day and phase (if period date is set)
2. **Patterns** — only with personal evidence; otherwise it says so
3. **Check-in** — bleeding + symptoms → one concrete action → feedback
4. **Menu** — profile, optional AI (Ollama/OpenAI), export, delete

Data stays in `localStorage` (`feer:v1`).

## Layout

```
electron/main.cjs   Desktop window
src/components/     Shell, NowView, CheckIn, modals
src/domain/         Cycle, actions, report
src/state/          Local persistence
src/ui/             Event handlers
src/services/       Optional AI providers (config ready; generation not on the main surface yet)
test/               Product specs
```

## License

MIT
