import assert from "node:assert/strict";
import {
  calculateCrmMetrics,
  formatMoney,
  getDealValueInput,
  MAX_DEAL_VALUE_CENTS,
} from "../src/lib/crm-metrics";
import { dealValueSchema } from "../src/lib/validators/workspace";

const now = new Date("2026-10-18T12:00:00Z");
assert.equal(calculateCrmMetrics([], now).hasWonData, false);
assert.equal(calculateCrmMetrics([{ value: 1000, status: "LEAD", wonAt: null }], now).openPipeline, 1000);
assert.equal(calculateCrmMetrics([{ value: 1000, status: "CONTACTED", wonAt: null }], now).openPipeline, 1000);
const won = calculateCrmMetrics([{ value: 1000, status: "WON", wonAt: new Date("2026-10-05T00:00:00Z") }], now);
assert.equal(won.openPipeline, 0);
assert.equal(won.wonDealValue, 1000);
assert.equal(won.monthlyWon[9].wonValue, 1000);
const lost = calculateCrmMetrics([{ value: 1000, status: "LOST", wonAt: null }], now);
assert.equal(lost.openPipeline, 0);
assert.equal(lost.wonDealValue, 0);
assert.equal(lost.lostDealValue, 1000);

for (const [input, expectedCents] of [
  ["0", BigInt(0)],
  ["0.01", BigInt(1)],
  ["1250.50", BigInt(125_050)],
  ["1000000000.00", MAX_DEAL_VALUE_CENTS],
] as const) {
  assert.equal(dealValueSchema.parse(input), expectedCents);
}

for (const invalidValue of [
  "-0.01",
  "NaN",
  "Infinity",
  "1e3",
  "1.001",
  "1000000000.01",
]) {
  assert.equal(dealValueSchema.safeParse(invalidValue).success, false);
}

const decimalMetrics = calculateCrmMetrics(
  [
    { value: 0, valueCents: BigInt(1), status: "LEAD", wonAt: null },
    {
      value: 1250,
      valueCents: BigInt(125_050),
      status: "CONTACTED",
      wonAt: null,
    },
    {
      value: 50,
      valueCents: BigInt(5_025),
      status: "WON",
      wonAt: new Date("2026-10-05T00:00:00Z"),
    },
    {
      value: 10,
      valueCents: BigInt(1_099),
      status: "LOST",
      wonAt: null,
    },
  ],
  now,
);
assert.equal(decimalMetrics.openPipeline, 1250.51);
assert.equal(decimalMetrics.wonDealValue, 50.25);
assert.equal(decimalMetrics.lostDealValue, 10.99);
assert.equal(decimalMetrics.monthlyWon[9].wonValue, 50.25);
assert.equal(formatMoney(decimalMetrics.openPipeline), "$1,250.51");
assert.equal(formatMoney(0.01), "$0.01");
assert.equal(
  getDealValueInput({ value: 1250, valueCents: BigInt(125_050) }),
  "1250.50",
);
assert.equal(getDealValueInput({ value: 1250 }), "1250.00");
console.log("CRM metric acceptance tests passed.");
