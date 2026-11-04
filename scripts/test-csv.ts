import assert from "node:assert/strict";
import { createCsv, safeCsvCell } from "../src/lib/csv";

assert.equal(safeCsvCell('A "quoted" value'), '"A ""quoted"" value"');
assert.equal(safeCsvCell("=2+2"), '"\'=2+2"');
assert.equal(safeCsvCell(" +SUM(A1:A2)"), '"\' +SUM(A1:A2)"');
assert.equal(safeCsvCell(null), '""');

const csv = createCsv(["Name", "Note"], [["José", "Line 1\nLine 2"]]);
assert.ok(csv.startsWith("\uFEFF"));
assert.equal(csv, '\uFEFF"Name","Note"\r\n"José","Line 1\nLine 2"\r\n');

console.log("CSV safety tests passed.");
