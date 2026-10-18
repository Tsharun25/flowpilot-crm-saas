import assert from "node:assert/strict";
import { calculateCrmMetrics } from "../src/lib/crm-metrics";

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
console.log("CRM metric acceptance tests passed.");
