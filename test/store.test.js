import test from "node:test";
import assert from "node:assert/strict";
import { normalizeState } from "../src/state/store.js";

test("normalizeState migrates old view names and adds check-ins without losing entries", () => {
  const state = normalizeState({
    activeView: "today",
    entries: { "2026-07-09": { date: "2026-07-09", pain: 4 } },
  });

  assert.equal(state.activeView, "now");
  assert.deepEqual(state.checkIns, []);
  assert.equal(state.entries["2026-07-09"].pain, 4);
});

test("normalizeState maps patterns to learning and preserves explicit AI disablement", () => {
  const state = normalizeState({
    activeView: "patterns",
    aiConfig: { provider: null },
  });

  assert.equal(state.activeView, "learning");
  assert.equal(state.aiConfig.provider, null);
});
