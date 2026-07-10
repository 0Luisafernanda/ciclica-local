import test from "node:test";
import assert from "node:assert/strict";
import { NowView } from "../src/components/NowView.js";
import { Shell } from "../src/components/Shell.js";

test("NowView starts with one contextual check-in surface instead of a dashboard", () => {
  const html = NowView({ profile: null, checkIns: [], entries: {} });

  assert.match(html, /¿Cómo estás ahora\?/);
  assert.match(html, /Contarle a Ciclica/);
  assert.doesNotMatch(html, /Últimos 14 días|Mapa de 28 días|Configurar lo mínimo/);
});

test("NowView condenses interpretation, one action and feedback into the same surface", () => {
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

  assert.match(html, /Puede influir/);
  assert.match(html, /Prueba ahora/);
  assert.match(html, /¿Te ayudó\?/);
  assert.doesNotMatch(html, /Momentos de hoy|Qué puede estar influyendo|Qué hacer ahora/);
});

test("Shell exposes one product surface without primary navigation", () => {
  const html = Shell({
    state: {},
    active: "now",
    content: "<p>contenido</p>",
    modal: "",
    aiModal: "",
    checkInPanel: "",
  });

  assert.match(html, /Ciclica/);
  assert.doesNotMatch(html, /Navegación principal|>Aprendizajes<|>Consulta</);
});
