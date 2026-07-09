import test from "node:test";
import assert from "node:assert/strict";

import { buildRecommendationMessages, parseRecommendations } from "../src/services/recommendations.js";

test("recommendation prompt carries the real logged data and cycle irregularity", () => {
  const state = {
    profile: { lastPeriod: "2026-06-25", cycleLength: 28, regularity: "irregular", contexts: ["somp"] },
    entries: {
      "2026-07-08": { date: "2026-07-08", bleeding: "none", pain: 7, energy: 6, sleep: 7, mood: "irritable", skin: "breakout", note: "colicos fuertes" },
    },
  };

  const messages = buildRecommendationMessages(state, "2026-07-08");
  const userContent = messages.find((m) => m.role === "user").content;

  assert.match(userContent, /dolor 7\/10/);
  assert.match(userContent, /irritable/);
  assert.match(userContent, /brotes/);
  assert.match(userContent, /irregular/);
  assert.match(userContent, /SOMP\/SOP/);
  assert.match(userContent, /colicos fuertes/);
});

test("recommendation prompt without profile says the phase is unknown instead of guessing", () => {
  const state = { profile: null, entries: {} };

  const messages = buildRecommendationMessages(state, "2026-07-08");
  const userContent = messages.find((m) => m.role === "user").content;

  assert.match(userContent, /fase desconocida/i);
  assert.match(userContent, /Sin registro hoy/);
});

test("parseRecommendations strips bullets and numbering and caps at four lines", () => {
  const raw = "1. Toma agua durante el dia\n- Camina 20 minutos suaves\n• Prefiere comidas tibias\n3) Estira la zona lumbar\nQuinta linea que sobra";

  const lines = parseRecommendations(raw);

  assert.equal(lines.length, 4);
  assert.equal(lines[0], "Toma agua durante el dia");
  assert.equal(lines[1], "Camina 20 minutos suaves");
  assert.equal(lines[2], "Prefiere comidas tibias");
  assert.equal(lines[3], "Estira la zona lumbar");
});
