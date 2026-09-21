import test from "node:test";
import assert from "node:assert/strict";
import {
  confidenceStatus,
  gradeAnswer,
  normalizeAnswer,
  parseVocabularyText,
  readStore,
  writeStore
} from "../src/logic.js";

test("normalizes case, whitespace, apostrophes, and hyphens", () => {
  assert.equal(normalizeAnswer("  Well-being  "), "wellbeing");
});

test("grades an exact normalized answer", () => {
  assert.deepEqual(gradeAnswer(" OCEAN ", "ocean"), { status: "correct", normalized: "ocean" });
});

test("marks a non-matching answer wrong", () => {
  assert.equal(gradeAnswer("shore", "ocean").status, "wrong");
});

test("returns empty for a blank answer", () => {
  assert.equal(gradeAnswer("", "ocean").status, "empty");
});

test("parses a valid JSON vocabulary pack", () => {
  const pack = parseVocabularyText('[{"word":"ocean","meaning":"海洋","level":"beginner"}]', "json");
  assert.equal(pack[0].word, "ocean");
});

test("parses CSV with quoted commas", () => {
  const pack = parseVocabularyText('word,meaning,level\ncoast,"海岸；海滨",beginner', "csv");
  assert.equal(pack[0].meaning, "海岸；海滨");
});

test("rejects invalid vocabulary rows", () => {
  assert.throws(() => parseVocabularyText('[{"word":"ocean","meaning":"海洋","level":"expert"}]', "json"), /level/);
});

test("maps OCR confidence to confirmed or uncertain", () => {
  assert.equal(confidenceStatus(0.78), "confirmed");
  assert.equal(confidenceStatus(0.62), "uncertain");
});

test("round-trips state through storage and falls back on malformed JSON", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
  assert.equal(writeStore(storage, "state", { mistakes: ["ocean"] }), true);
  assert.deepEqual(readStore(storage, "state", {}), { mistakes: ["ocean"] });
  values.set("broken", "not-json");
  assert.deepEqual(readStore(storage, "broken", { safe: true }), { safe: true });
});
