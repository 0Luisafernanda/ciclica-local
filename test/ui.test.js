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
  assert.doesNotMatch(html, /confianza media|Media-baja| · /);
  assert.match(html, /Fase folicular/);
  assert.doesNotMatch(html, /probable|posible/);
  assert.match(html, /cycle-phase-name/);
  assert.match(html, /cycle-phase-meta/);
  assert.match(html, /cycle-ring-phase/);
  assert.match(html, /cycle-phase-legend-item is-current[^>]*>Folicular/);
  assert.doesNotMatch(html, /Ahora ·|cycle-phase-chip/);
  assert.match(html, /cycle-phase-timeline/);
  assert.match(html, /cycle-phase-marker/);
  assert.match(html, /Próximo periodo/);
  assert.match(html, /29 de julio/);
  assert.match(html, /Patrones/);
  assert.match(html, /section-label">Hoy</);
  assert.match(html, /daily-title-button[^>]*>\s*Cómo me siento\s*</);
  assert.match(html, /quiet-plus/);
  assert.match(html, /open-checkin/);
  assert.doesNotMatch(html, /Lo que Feer está viendo|Un momento, no un formulario|Sin evidencia|Necesito algo|¿Cómo te sientes\?|quiet-log/);
  assert.doesNotMatch(html, />(Momento|Anotar)</);
  assert.doesNotMatch(html, /\b(Bien|Normal|Difícil)\b/);
  assert.match(html, /Empezó mi periodo/);
  assert.doesNotMatch(html, /¿Qué cambió\?|¿Qué tanto\?|Como siempre|Más difícil|daily-choice-row/);
  assert.doesNotMatch(html, /Últimos 14 días|Mapa de 28 días|Configurar lo mínimo|FOR YOU TODAY/);
});

test("NowView keeps how I feel as a quiet open action without mood buttons", () => {
  const html = NowView(
    {
      profile: null,
      checkIns: [],
      entries: {
        "2026-07-10": { date: "2026-07-10", dailyState: "harder" },
      },
    },
    new Date(2026, 6, 10, 12),
  );

  assert.match(html, /Cómo me siento/);
  assert.match(html, /open-checkin/);
  assert.doesNotMatch(html, /\b(Bien|Normal|Difícil)\b/);
  assert.doesNotMatch(html, /¿Qué cambió\?|Sangrado|Notable|Fuerte|¿Cómo te sientes\?/);
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
  assert.doesNotMatch(html, /confianza media/i);
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

  assert.match(html, /Patrones/);
  assert.match(html, /Falta saber si el dolor se repite/);
  assert.match(html, /Qué hacer ahora/);
  assert.match(html, /Bajar el dolor sin dejar de trabajar/);
  assert.match(html, /Prueba ahora/);
  assert.match(html, /¿Te ayudó\?/);
  assert.match(html, /Bastante/);
  assert.match(html, /Un poco/);
  assert.match(html, /open-checkin/);
  assert.match(html, /¿Cómo te sientes\?|Cómo me siento/);
});

test("Shell exposes one product surface without primary navigation", () => {
  const html = Shell({
    content: "<p>contenido</p>",
    modal: "",
    aiModal: "",
    checkInPanel: "",
  });

  assert.match(html, /Feer/);
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
  assert.match(html, /quiet-plus/);
  assert.match(html, />Registro</);
  assert.match(html, /Sangrado/);
  assert.match(html, /Color/);
  assert.match(html, /Olor/);
  assert.match(html, /Cólicos/);
  assert.match(html, /Espalda/);
  assert.match(html, /name="bleeding"/);
  assert.match(html, /name="bleedingColor"/);
  assert.match(html, /name="bleedingOdor"/);
  assert.match(html, /name="symptom:cramps"/);
  assert.match(html, /name="symptom:backPain"/);
  assert.match(html, /checkin-log/);
  assert.match(html, /Digestión/);
  assert.match(html, /Continuar/);
  assert.match(html, /Día \d+|Sin día de ciclo/);
  assert.doesNotMatch(html, /También|Ahora pesa|Qué va junto|Qué tan presente|>Flujo</);
  assert.doesNotMatch(html, /Dónde estoy|Acompañan|checkin-stages/);
  assert.doesNotMatch(html, />Aprendizajes<|>Consulta<|>Biblioteca</);
});
