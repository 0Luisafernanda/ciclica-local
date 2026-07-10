import test from "node:test";
import assert from "node:assert/strict";
import { getActionLearning, getActionPlan, getMomentInterpretation } from "../src/domain/actions.js";

test("getActionPlan gives a discreet two-minute pain action for work", () => {
  const plan = getActionPlan({
    focus: "pain",
    intensity: 6,
    context: "work",
    availableTime: "2",
  });

  assert.equal(plan.id, "pain-work-2");
  assert.equal(plan.durationMinutes, 2);
  assert.match(plan.title, /dolor/i);
  assert.ok(plan.steps.some((step) => /sentada|pies|exhala/i.test(step)));
  assert.ok(plan.why.length > 20);
});

test("getActionPlan adapts low-energy guidance to ten available minutes", () => {
  const plan = getActionPlan({
    focus: "lowEnergy",
    intensity: 7,
    context: "home",
    availableTime: "10",
  });

  assert.equal(plan.focus, "lowEnergy");
  assert.equal(plan.durationMinutes, 10);
  assert.notEqual(plan.id, "pain-work-2");
  assert.ok(plan.steps.length >= 3);
});

test("getActionPlan uses a concrete low-energy instruction instead of abstract copy", () => {
  const plan = getActionPlan({
    focus: "lowEnergy",
    intensity: 8,
    context: "home",
    availableTime: "30",
  });

  assert.match(plan.title, /quitar una tarea.*descansar/i);
  assert.doesNotMatch(plan.title, /proteger energía|resto del día/i);
});

test("getActionLearning separates helpful actions from uncertain ones", () => {
  const learning = getActionLearning([
    { action: { id: "heat-pain", title: "Calor local" }, feedback: "much" },
    { action: { id: "heat-pain", title: "Calor local" }, feedback: "some" },
    { action: { id: "walk-energy", title: "Pausa exterior" }, feedback: null },
  ]);

  assert.equal(learning.helpful[0].title, "Calor local");
  assert.equal(learning.helpful[0].tried, 2);
  assert.equal(learning.uncertain[0].title, "Pausa exterior");
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
