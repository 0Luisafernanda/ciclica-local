import test from "node:test";
import assert from "node:assert/strict";
import {
  getActionPlan,
  getMomentInterpretation,
  pickPrimarySymptom,
} from "../src/domain/actions.js";

test("getActionPlan gives a discreet two-minute pain action", () => {
  const plan = getActionPlan({
    focus: "pain",
    intensity: 6,
    availableTime: "2",
  });

  assert.equal(plan.id, "pain-2");
  assert.equal(plan.durationMinutes, 2);
  assert.match(plan.title, /dolor/i);
  assert.ok(plan.steps.some((step) => /sentada|pies|exhala/i.test(step)));
  assert.ok(plan.why.length > 20);
});

test("getActionPlan uses a dedicated plan for other signals", () => {
  const plan = getActionPlan({
    focus: "other",
    intensity: 5,
    availableTime: "2",
  });

  assert.equal(plan.id, "other-2");
  assert.equal(plan.focus, "other");
  assert.match(plan.title, /nombrar|necesit/i);
});

test("pickPrimarySymptom keeps per-symptom intensity and prefers cramps", () => {
  const primary = pickPrimarySymptom([
    { id: "anxious", intensity: 10 },
    { id: "cramps", intensity: 5 },
  ]);

  assert.equal(primary.focus, "pain");
  assert.equal(primary.intensity, 5);
  assert.equal(primary.symptomId, "cramps");
  assert.ok(primary.signals.includes("pain"));
  assert.ok(primary.signals.includes("anxious"));
});

test("getActionPlan adapts low-energy guidance to ten available minutes", () => {
  const plan = getActionPlan({
    focus: "lowEnergy",
    intensity: 7,
    availableTime: "10",
  });

  assert.equal(plan.focus, "lowEnergy");
  assert.equal(plan.durationMinutes, 10);
  assert.notEqual(plan.id, "pain-2");
  assert.ok(plan.steps.length >= 3);
});

test("getActionPlan uses a concrete low-energy instruction instead of abstract copy", () => {
  const plan = getActionPlan({
    focus: "lowEnergy",
    intensity: 8,
    availableTime: "30",
  });

  assert.match(plan.title, /quitar una tarea.*descansar/i);
  assert.doesNotMatch(plan.title, /proteger energía|resto del día/i);
});

test("getMomentInterpretation names repetition without pretending certainty", () => {
  const interpretation = getMomentInterpretation(
    { focus: "pain", intensity: 7, context: "work" },
    [
      { focus: "pain", intensity: 5 },
      { focus: "pain", intensity: 6 },
      { focus: "lowEnergy", intensity: 7 },
    ],
  );

  assert.match(interpretation.headline, /dolor/i);
  assert.match(interpretation.body, /tres/i);
  assert.match(interpretation.confidence, /posible|media|inicial/i);
  assert.match(interpretation.caution, /consulta|atención/i);
});
