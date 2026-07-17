import test from "node:test";
import assert from "node:assert/strict";

import { getCycleEstimate, getCycleNumber, getFindings, getInsight, getPersonalInsight, getPeriodStartDates } from "../src/domain/cycle.js";
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

test("cycle number follows period starts instead of calendar weeks", () => {
  const state = {
    ...baseState,
    profile: { ...baseState.profile, lastPeriod: "2026-05-01" },
    entries: {
      "2026-05-01": { date: "2026-05-01", periodStarted: true },
      "2026-05-30": { date: "2026-05-30", periodStarted: true },
    },
  };

  assert.deepEqual(getPeriodStartDates(state), ["2026-05-01", "2026-05-30"]);
  assert.equal(getCycleNumber(state, "2026-05-10"), 1);
  assert.equal(getCycleNumber(state, "2026-06-02"), 2);
  assert.equal(getCycleNumber(state, "2026-04-20"), null);
});

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

test("personal insight connects low energy with short sleep using observed evidence", () => {
  const state = {
    ...baseState,
    entries: {
      "2026-06-03": { date: "2026-06-03", pain: 1, energy: 3, sleep: 4, mood: "calm" },
      "2026-06-04": { date: "2026-06-04", pain: 2, energy: 4, sleep: 5, mood: "sensitive" },
      "2026-06-05": { date: "2026-06-05", pain: 1, energy: 3, sleep: 4, mood: "calm" },
      "2026-06-06": { date: "2026-06-06", pain: 0, energy: 8, sleep: 8, mood: "calm" },
    },
    checkIns: [],
  };

  const insight = getPersonalInsight(state, "2026-06-06");

  assert.equal(insight.status, "watching");
  assert.match(insight.headline, /energía baja.*poco sueño/i);
  assert.match(insight.evidence, /3 de 3 días con energía baja/i);
  assert.match(insight.body, /otro ciclo|se vuelve patrón/i);
});

test("personal insight admits cold start and says what Feer is observing", () => {
  const insight = getPersonalInsight(
    {
      ...baseState,
      entries: {},
      checkIns: [{ id: "one", focus: "pain", intensity: 6, createdAt: "2026-06-03T12:00:00Z" }],
    },
    "2026-06-03",
  );

  assert.equal(insight.status, "watching");
  assert.match(insight.headline, /falta saber.*dolor.*se repite/i);
  assert.match(insight.body, /Solo hay 1 registro de dolor/i);
  assert.match(insight.evidence, /1 momento/i);
  assert.doesNotMatch(insight.body, /fase folicular|energía más estable/i);
});

test("personal insight treats same-cycle companion links as emerging, not patterns", () => {
  const insight = getPersonalInsight(
    {
      ...baseState,
      entries: {},
      checkIns: [
        { id: "a", focus: "anxious", intensity: 6, companions: ["stressed"], phase: "luteal", cycleDay: 22, cycleNumber: 1, date: "2026-06-01", createdAt: "2026-06-01T12:00:00Z" },
        { id: "b", focus: "anxious", intensity: 7, companions: ["stressed"], phase: "luteal", cycleDay: 23, cycleNumber: 1, date: "2026-06-02", createdAt: "2026-06-02T12:00:00Z" },
        { id: "c", focus: "pain", intensity: 4, companions: [], phase: "follicular", cycleDay: 8, cycleNumber: 1, date: "2026-06-03", createdAt: "2026-06-03T12:00:00Z" },
      ],
    },
    "2026-06-03",
  );

  assert.equal(insight.status, "watching");
  assert.match(insight.headline, /estrés.*ansiedad/i);
  assert.match(insight.body, /otro ciclo|se vuelve patrón/i);
  assert.match(insight.evidence, /1 ciclo/);
});

test("personal insight names a repeating multi-companion combination within one cycle as emerging", () => {
  const insight = getPersonalInsight(
    {
      ...baseState,
      entries: {},
      checkIns: [
        { id: "a", focus: "pain", intensity: 8, companions: ["shortSleep", "stressed"], phase: "luteal", cycleDay: 20, cycleNumber: 1, date: "2026-06-01", createdAt: "2026-06-01T12:00:00Z" },
        { id: "b", focus: "pain", intensity: 9, companions: ["shortSleep", "stressed"], phase: "luteal", cycleDay: 21, cycleNumber: 1, date: "2026-06-02", createdAt: "2026-06-02T12:00:00Z" },
        { id: "c", focus: "anxious", intensity: 5, companions: ["bleeding"], phase: "menstrual", cycleDay: 2, cycleNumber: 1, date: "2026-06-03", createdAt: "2026-06-03T12:00:00Z" },
      ],
    },
    "2026-06-03",
  );

  assert.equal(insight.status, "watching");
  assert.match(insight.headline, /dolor.*sueño corto y estrés|dolor.*estrés y sueño corto/i);
  assert.match(insight.evidence, /1 ciclo/);
});

test("personal insight treats same-cycle phase clustering as emerging", () => {
  const insight = getPersonalInsight(
    {
      ...baseState,
      entries: {},
      checkIns: [
        { id: "a", focus: "pain", intensity: 8, companions: [], phase: "menstrual", cycleDay: 1, cycleNumber: 1, date: "2026-06-01", createdAt: "2026-06-01T12:00:00Z" },
        { id: "b", focus: "pain", intensity: 9, companions: [], phase: "menstrual", cycleDay: 2, cycleNumber: 1, date: "2026-06-02", createdAt: "2026-06-02T12:00:00Z" },
        { id: "c", focus: "pain", intensity: 7, companions: [], phase: "menstrual", cycleDay: 3, cycleNumber: 1, date: "2026-06-03", createdAt: "2026-06-03T12:00:00Z" },
      ],
    },
    "2026-06-03",
  );

  assert.equal(insight.status, "watching");
  assert.match(insight.headline, /dolor.*menstrual/i);
  assert.match(insight.body, /otro ciclo|se vuelve patrón/i);
});

test("personal insight requires distinct cycles for a defensive menstrual pattern", () => {
  const insight = getPersonalInsight(
    {
      ...baseState,
      profile: { ...baseState.profile, lastPeriod: "2026-05-01" },
      entries: {
        "2026-05-01": { date: "2026-05-01", periodStarted: true },
        "2026-05-30": { date: "2026-05-30", periodStarted: true },
      },
      checkIns: [
        { id: "a", focus: "pain", intensity: 8, companions: [], phase: "menstrual", cycleDay: 2, cycleNumber: 1, date: "2026-05-02", createdAt: "2026-05-02T12:00:00Z" },
        { id: "b", focus: "pain", intensity: 9, companions: [], phase: "menstrual", cycleDay: 1, cycleNumber: 2, date: "2026-05-30", createdAt: "2026-05-30T12:00:00Z" },
        { id: "c", focus: "pain", intensity: 7, companions: [], phase: "menstrual", cycleDay: 2, cycleNumber: 2, date: "2026-05-31", createdAt: "2026-05-31T12:00:00Z" },
      ],
    },
    "2026-06-03",
  );

  assert.equal(insight.status, "pattern");
  assert.match(insight.headline, /dolor.*menstrual.*ciclo tras ciclo/i);
  assert.match(insight.evidence, /2 ciclos/);
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

test("consult report includes actions tried and whether they helped", () => {
  const state = {
    ...baseState,
    checkIns: [
      {
        createdAt: "2026-07-09T12:00:00.000Z",
        focus: "pain",
        intensity: 7,
        action: { id: "pain-work-2", title: "Bajar el dolor sin dejar de trabajar" },
        feedback: "some",
      },
    ],
  };

  const html = buildReportHTML(state);
  const plain = buildPlainReport(state);

  assert.match(html, /Acciones probadas/);
  assert.match(html, /Bajar el dolor sin dejar de trabajar/);
  assert.match(plain, /ayudó un poco/i);
});
