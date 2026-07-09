import test from "node:test";
import assert from "node:assert/strict";

import { getCycleEstimate, getFindings, getInsight } from "../src/domain/cycle.js";
import { buildPlainReport, buildReportHTML } from "../src/domain/report.js";

const baseState = {
  activeView: "today",
  onboardingDismissed: true,
  profile: {
    lastPeriod: "2026-06-01",
    cycleLength: 28,
    regularity: "regular",
    contexts: [],
  },
  entries: {},
};

test("cycle estimate uses transparent confidence and hides ovulation confidence when fertility focus is disabled", () => {
  const state = {
    ...baseState,
    profile: { ...baseState.profile, contexts: ["noFertility"] },
  };

  const estimate = getCycleEstimate(state, new Date(2026, 5, 14));

  assert.equal(estimate.phase, "ovulatory");
  assert.equal(estimate.confidence, "Oculta");
  assert.match(estimate.summary, /no anticoncepcion/i);
});

test("insight flags high pain and poor sleep before generic phase actions", () => {
  const state = {
    ...baseState,
    entries: {
      "2026-06-03": { date: "2026-06-03", bleeding: "medium", pain: 8, energy: 3, sleep: 3, mood: "sad", note: "" },
      "2026-06-04": { date: "2026-06-04", bleeding: "light", pain: 2, energy: 5, sleep: 6, mood: "calm", note: "" },
      "2026-06-05": { date: "2026-06-05", bleeding: "none", pain: 1, energy: 7, sleep: 8, mood: "calm", note: "" },
    },
  };

  const insight = getInsight(state, "2026-06-03");

  assert.match(insight.actions[0], /Dolor alto hoy/);
  assert.match(insight.actions[1], /Sueno bajo hoy/);
  assert.ok(Array.isArray(insight.lines));
  assert.match(insight.lines.at(-1), /hipotesis local, no un diagnostico/i);
});

test("clustered symptoms without a profile get a connecting insight, not a flat fact list", () => {
  const state = {
    activeView: "today",
    onboardingDismissed: true,
    profile: null,
    entries: {
      "2026-06-03": { date: "2026-06-03", bleeding: "none", pain: 7, energy: 4, sleep: 6, mood: "irritable", skin: "breakout", note: "cara brotada" },
    },
  };

  const insight = getInsight(state, "2026-06-03");
  const joined = insight.lines.join(" ");

  assert.equal(insight.title, "Un patron que vale la pena notar");
  assert.equal(insight.lines.length, 3);
  assert.match(joined, /mismo vaiven hormonal/i);
  assert.match(joined, /dolor alto \(7\/10\)/);
});

test("a single mild symptom does not trigger the cluster insight", () => {
  const state = {
    activeView: "today",
    onboardingDismissed: true,
    profile: null,
    entries: {
      "2026-06-03": { date: "2026-06-03", bleeding: "none", pain: 2, energy: 6, sleep: 7, mood: "calm", skin: "none", note: "" },
    },
  };

  const insight = getInsight(state, "2026-06-03");

  assert.equal(insight.title, "Registro de hoy guardado");
  assert.doesNotMatch(insight.lines.join(" "), /vaiven hormonal/i);
});

test("findings keep clinical language cautious for SOMP/SOP and high pain", () => {
  const state = {
    ...baseState,
    profile: { ...baseState.profile, contexts: ["somp"] },
    entries: {
      "2026-06-03": { date: "2026-06-03", bleeding: "heavy", pain: 9, energy: 2, sleep: 4, mood: "sad", note: "" },
    },
  };

  const findings = getFindings(state).flat().join("\n");

  assert.match(findings, /Dolor alto registrado/);
  assert.match(findings, /SOMP\/SOP/);
  assert.doesNotMatch(findings, /diagnostico definitivo/i);
});

test("HTML report escapes persisted profile and note data before rendering", () => {
  const state = {
    ...baseState,
    profile: {
      lastPeriod: `<img src=x onerror=alert(1)>`,
      cycleLength: `28<script>alert(1)</script>`,
      regularity: `<svg onload=alert(1)>`,
      contexts: ["somp", `unknown<script>alert(1)</script>`],
    },
    entries: {
      "2026-06-03": { date: "2026-06-03", bleeding: "heavy", pain: 9, energy: 2, sleep: 4, mood: "sad", note: `<script>alert(1)</script>` },
    },
  };

  const html = buildReportHTML(state);

  assert.doesNotMatch(html, /<img|<script|<svg/i);
  assert.match(html, /&lt;img/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

test("plain report omits unknown context keys and preserves readable known labels", () => {
  const state = {
    ...baseState,
    profile: { ...baseState.profile, contexts: ["somp", "unknown-key"] },
  };

  const report = buildPlainReport(state);

  assert.match(report, /SOMP\/SOP/);
  assert.doesNotMatch(report, /unknown-key|undefined/);
});
