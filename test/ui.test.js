import test from "node:test";
import assert from "node:assert/strict";
import { NowView } from "../src/components/NowView.js";
import { Shell } from "../src/components/Shell.js";
import { App } from "../src/components/App.js";

test("NowView keeps cycle context insight moment CTA and daily registration visible together", () => {
  const html = NowView(
    {
      profile: { lastPeriod: "2026-07-01", cycleLength: 28, regularity: "regular", contexts: [] },
      checkIns: [],
      entries: {},
    },
    new Date(2026, 6, 10, 12),
  );

  assert.match(html, /Día 10 de 28/);
  assert.match(html, /cycle-ring/);
  assert.match(html, /cycle-phase-timeline/);
  assert.match(html, /cycle-phase-marker/);
  assert.match(html, /Folicular|folicular/i);
  assert.match(html, /Próximo periodo/);
  assert.match(html, /29 de julio/);
  assert.match(html, /Lo que Ciclica está viendo/);
  assert.match(html, /¿Qué necesitas ahora\?/);
  assert.match(html, /open-checkin/);
  assert.match(html, /Necesito algo ahora/);
  assert.match(html, /¿Cómo estuvo hoy respecto a lo normal\?/);
  assert.match(html, /Como siempre/);
  assert.match(html, /Mejor/);
  assert.match(html, /Más difícil/);
  assert.match(html, /Empezó mi periodo/);
  assert.doesNotMatch(html, /Últimos 14 días|Mapa de 28 días|Configurar lo mínimo|FOR YOU TODAY/);
});

test("NowView expands the inline register only when the day changed", () => {
  const html = NowView(
    {
      profile: null,
      checkIns: [],
      entries: {
        "2026-07-10": { date: "2026-07-10", dailyState: "harder", dailySignals: ["pain"], dailyIntensity: "notable" },
      },
    },
    new Date(2026, 6, 10, 12),
  );

  assert.match(html, /¿Qué cambió\?/);
  assert.match(html, /Dolor/);
  assert.match(html, /Energía/);
  assert.match(html, /Ánimo/);
  assert.match(html, /Sueño/);
  assert.match(html, /Sangrado/);
  assert.match(html, /Leve/);
  assert.match(html, /Notable/);
  assert.match(html, /Fuerte/);
});

test("NowView places a personal evidence-based insight at the center", () => {
  const html = NowView(
    {
      profile: { lastPeriod: "2026-07-01", cycleLength: 28, regularity: "regular", contexts: [] },
      checkIns: [],
      entries: {
        "2026-07-02": { date: "2026-07-02", energy: 3, sleep: 4, pain: 1 },
        "2026-07-03": { date: "2026-07-03", energy: 4, sleep: 5, pain: 1 },
        "2026-07-04": { date: "2026-07-04", energy: 3, sleep: 4, pain: 2 },
      },
    },
    new Date(2026, 6, 10, 12),
  );

  assert.match(html, /La energía baja aparece junto con poco sueño/);
  assert.match(html, /3 de 3 días con energía baja/);
  assert.match(html, /confianza media/i);
});

test("NowView exposes missing cycle context instead of silently hiding it", () => {
  const html = NowView({ profile: null, checkIns: [], entries: {} }, new Date(2026, 6, 10, 12));

  assert.match(html, /Día del ciclo/);
  assert.match(html, /Sin estimar/);
  assert.match(html, /Añadir última fecha/);
  assert.match(html, /cycle-ring/);
  assert.match(html, /cycle-phase-timeline/);
});

test("NowView shows plan and feedback for an open moment instead of hiding the action loop", () => {
  const html = NowView({
    profile: null,
    entries: {},
    checkIns: [
      {
        id: "moment-1",
        createdAt: "2026-07-09T12:30:00.000Z",
        focus: "pain",
        intensity: 6,
        context: "work",
        availableTime: "2",
        action: {
          id: "pain-work-2",
          title: "Bajar el dolor sin dejar de trabajar",
          durationMinutes: 2,
          why: "Una razón concreta y útil para este momento.",
          steps: ["Apoya ambos pies.", "Exhala lentamente."],
        },
      },
    ],
  });

  assert.match(html, /Lo que Ciclica está viendo/);
  assert.match(html, /Falta saber si el dolor se repite/);
  assert.match(html, /Qué hacer ahora/);
  assert.match(html, /Bajar el dolor sin dejar de trabajar/);
  assert.match(html, /Prueba ahora/);
  assert.match(html, /¿Te ayudó\?/);
  assert.match(html, /Bastante/);
  assert.match(html, /Un poco/);
  assert.match(html, /open-checkin/);
  assert.match(html, /¿Cómo estuvo hoy respecto a lo normal\?/);
});

test("Shell exposes one product surface without primary navigation", () => {
  const html = Shell({
    content: "<p>contenido</p>",
    modal: "",
    aiModal: "",
    checkInPanel: "",
  });

  assert.match(html, /Ciclica/);
  assert.doesNotMatch(html, /Navegación principal|>Aprendizajes<|>Consulta</);
});

test("App mounts the check-in drawer alongside the single Now surface", () => {
  const html = App({
    profile: null,
    checkIns: [],
    entries: {},
    aiConfig: { provider: "ollama", ollama: { url: "", model: "" }, openai: { apiKey: "", model: "" } },
  });

  assert.match(html, /checkInLayer/);
  assert.match(html, /checkInForm/);
  assert.match(html, /Necesito algo ahora/);
  assert.match(html, /Un momento, no un formulario diario/);
  assert.doesNotMatch(html, />Aprendizajes<|>Consulta<|>Biblioteca</);
});
