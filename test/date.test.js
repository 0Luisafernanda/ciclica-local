import test from "node:test";
import assert from "node:assert/strict";

import { addDays, daysBetween, parseISODate, toISODate } from "../src/domain/date.js";

test("date helpers treat ISO dates as local calendar days", () => {
  const start = parseISODate("2026-06-01");
  const end = addDays(start, 10);

  assert.equal(toISODate(start), "2026-06-01");
  assert.equal(daysBetween(start, end), 10);
});

test("toISODate formats the local day instead of UTC-shifting near midnight", () => {
  const localLateNight = new Date(2026, 6, 2, 23, 30, 0);

  assert.equal(toISODate(localLateNight), "2026-07-02");
});
