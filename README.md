# feer-local

**Feer** — app desktop **local-first** y privada por defecto: entiende cómo estás ahora, prueba una acción y aprende qué te ayuda.

Open source. Se lanza hoy y se cambia mañana.

Repo: [github.com/luisaafernanda/feer-local](https://github.com/luisaafernanda/feer-local)

## Arrancar (desktop)

```bash
npm install
npm start
```

Abre una ventana Electron con la app.

## Arrancar (navegador)

```bash
npm run web
```

Abrir [http://localhost:4173](http://localhost:4173).

## Qué es (v0.1)

Una sola vista. Sin dashboard.

1. **Ciclo** — día estimado y fase (si hay fecha de periodo).
2. **Patrones** — solo con evidencia personal; si no hay, lo dice.
3. **Registro** — sangrado + síntomas con intensidad propia → acción concreta → feedback.
4. **Menú** — perfil, IA opcional (Ollama/OpenAI), exportar, borrar.

Datos en `localStorage`. Sin cuenta. Sin analytics. Sin sync.

## Tests

```bash
npm test
```

## Estructura

- `electron/main.cjs` — ventana desktop
- `src/components/NowView.js` — superficie principal
- `src/components/CheckInPanel.js` — registro del momento
- `src/domain/` — ciclo, acciones, reporte
- `src/state/store.js` — persistencia local

## Licencia

MIT — úsala, forkéala, cámbiala.
