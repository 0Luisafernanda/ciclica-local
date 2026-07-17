import test from "node:test";
import assert from "node:assert/strict";
import { normalizeState } from "../src/state/store.js";

test("normalizeState keeps entries and adds check-ins without multi-view state", () => {
  const state = normalizeState({
    activeView: "today",
    entries: { "2026-07-09": { date: "2026-07-09", pain: 4 } },
  });

  assert.equal(state.activeView, undefined);
  assert.deepEqual(state.checkIns, []);
  assert.equal(state.entries["2026-07-09"].pain, 4);
});

test("normalizeState preserves explicit AI disablement and drops legacy view keys", () => {
  const state = normalizeState({
    activeView: "patterns",
    aiConfig: { provider: null },
  });

  assert.equal(state.activeView, undefined);
  assert.equal(state.aiConfig.provider, null);
  assert.equal(state.aiRecs, undefined);
});
