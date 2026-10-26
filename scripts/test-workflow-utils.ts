import assert from "node:assert/strict";
import { createCsv, safeCsvCell } from "../src/lib/csv";
import { parseDateOnly } from "../src/lib/validators/workspace";

assert.equal(parseDateOnly("") , null);
assert.equal(parseDateOnly("2026-10-20")?.toISOString(), "2026-10-20T00:00:00.000Z");
assert.equal(safeCsvCell("=2+2"), '"\'=2+2"');
assert.equal(safeCsvCell("বাংলা, \"quoted\"\nline"), '"বাংলা, ""quoted""\nline"');
const csv = createCsv(["Name", "Value"], [["Ågency", "+SUM(A1:A2)"]]);
assert.ok(csv.startsWith("\uFEFF"));
assert.ok(csv.includes("Ågency"));
assert.ok(csv.includes("'+SUM"));
console.log("Workflow date and CSV safety tests passed.");
