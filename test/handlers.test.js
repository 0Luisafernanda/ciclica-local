import test from "node:test";
import assert from "node:assert/strict";
import { getExportState, mergeDailyLogIntoEntry, mergeMomentIntoEntry } from "../src/ui/handlers.js";

test("mergeMomentIntoEntry keeps existing daily data and maps the current focus", () => {
  const entry = mergeMomentIntoEntry(
    { date: "2026-07-09", bleeding: "light", pain: 2, energy: 7, sleep: 6, mood: "calm", skin: "none", note: "antes" },
    { focus: "pain", intensity: 8, note: "ahora", createdAt: "2026-07-09T15:00:00.000Z" },
    "2026-07-09",
  );

  assert.equal(entry.pain, 8);
  assert.equal(entry.energy, 7);
  assert.equal(entry.bleeding, "light");
  assert.equal(entry.note, "ahora");
});

test("mergeMomentIntoEntry maps companions into comparable entry signals", () => {
  const entry = mergeMomentIntoEntry(
    null,
    { focus: "pain", intensity: 7, companions: ["shortSleep", "bleeding"], note: "", createdAt: "2026-07-09T15:00:00.000Z" },
    "2026-07-09",
  );

  assert.equal(entry.pain, 7);
  assert.equal(entry.sleep, 4);
  assert.equal(entry.bleeding, "light");
});

test("mergeMomentIntoEntry maps low energy and anxious focus without inventing other values", () => {
  const energyEntry = mergeMomentIntoEntry(null, { focus: "lowEnergy", intensity: 7, note: "" }, "2026-07-09");
  const moodEntry = mergeMomentIntoEntry(energyEntry, { focus: "anxious", intensity: 5, note: "" }, "2026-07-09");

  assert.equal(energyEntry.energy, 3);
  assert.equal(moodEntry.mood, "anxious");
  assert.equal(moodEntry.pain, 0);
});

test("daily log maps a single feeling tap into comparable signals", () => {
  const harder = mergeDailyLogIntoEntry(
    { date: "2026-07-10", note: "previa", skin: "none" },
    "2026-07-10",
    { dailyState: "harder", dailySignals: [], dailyIntensity: null },
  );

  assert.equal(harder.dailyState, "harder");
  assert.equal(harder.energy, 3);
  assert.equal(harder.sleep, 4);
  assert.equal(harder.pain, 4);
  assert.equal(harder.note, "previa");
});

test("daily log still honors legacy signal and intensity details", () => {
  const entry = mergeDailyLogIntoEntry(
    { date: "2026-07-10", note: "previa", skin: "none" },
    "2026-07-10",
    { dailyState: "harder", dailySignals: ["pain", "sleep"], dailyIntensity: "notable" },
  );

  assert.equal(entry.dailyState, "harder");
  assert.deepEqual(entry.dailySignals, ["pain", "sleep"]);
  assert.equal(entry.pain, 6);
  assert.equal(entry.sleep, 4);
  assert.equal(entry.note, "previa");
});

test("getExportState excludes the OpenAI API key without mutating live state", () => {
  const state = {
    entries: {},
    aiConfig: {
      provider: "openai",
      openai: { apiKey: "secret-key", model: "gpt-4o-mini" },
      ollama: { url: "http://localhost:11434", model: "llama3.2" },
    },
  };

  const exported = getExportState(state);

  assert.equal(exported.aiConfig.openai.apiKey, "");
  assert.equal(exported.aiConfig.openai.model, "gpt-4o-mini");
  assert.equal(state.aiConfig.openai.apiKey, "secret-key");
});
