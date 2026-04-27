import assert from "node:assert/strict";
import test from "node:test";

import { calculateGoal } from "../src/services/goalCalculator.js";

test("calculateGoal returns months and yearly breakdown", () => {
  const result = calculateGoal({
    targetAmount: 80000,
    monthlySavings: 2000,
    startDate: "2026-01-01",
    amountSaved: 0,
    avgMonthlyLosses: 0
  });

  assert.equal(result.months_needed, 40);
  assert.equal(result.years, 3);
  assert.equal(result.remaining_months, 4);
  assert.equal(result.delay_months, 0);
  assert.equal(result.is_impossible, false);
});

test("calculateGoal marks impossible when losses are above monthly savings", () => {
  const result = calculateGoal({
    targetAmount: 10000,
    monthlySavings: 1000,
    startDate: "2026-01-01",
    amountSaved: 2000,
    avgMonthlyLosses: 1200
  });

  assert.equal(result.is_impossible, true);
  assert.equal(result.months_with_losses, null);
  assert.equal(result.delay_months, null);
});

