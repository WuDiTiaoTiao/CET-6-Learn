import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildMeaningOptions,
  confidenceStatus,
  gradeChoice,
  gradeAnswer,
  normalizeAnswer,
  parseVocabularyText,
  readStore,
  writeStore
} from "../src/logic.js";

test("builds a Chinese meaning choice list with the answer first", () => {
  const cards = [
    { word: "ocean", meaning: "海洋；大海" },
    { word: "shore", meaning: "岸；滨" },
    { word: "tide", meaning: "潮汐；潮流" },
    { word: "coast", meaning: "海岸；海滨" }
  ];
  assert.deepEqual(buildMeaningOptions(cards, cards[0]), ["海洋；大海", "岸；滨", "潮汐；潮流", "海岸；海滨"]);
});

test("removes the programmer vocabulary pack from the catalog and dashboard", async () => {
  const [{ SEED_WORDS }, appSource] = await Promise.all([
    import("../src/data.js"),
    readFile(new URL("../src/app.js", import.meta.url), "utf8")
  ]);

  assert.ok(SEED_WORDS.every((card) => !card.topic && !card.tags.includes("computer-work")));
  assert.doesNotMatch(appSource, /computer-work|程序员常用英语|start-topic/);
});

test("uses a dedicated postgraduate entrance exam vocabulary pack", async () => {
  const { SEED_WORDS } = await import("../src/data.js");
  const examWords = SEED_WORDS.filter((card) => !card.topic);

  assert.ok(examWords.length >= 30);
  assert.ok(examWords.every((card) => card.tags.includes("postgraduate-exam")));
  assert.deepEqual(
    new Set(examWords.map((card) => card.level)),
    new Set(["beginner", "intermediate", "advanced"])
  );
  assert.ok(examWords.some((card) => card.word === "acquire"));
  assert.ok(examWords.some((card) => card.word === "phenomenon"));
  assert.ok(examWords.some((card) => card.word === "controversial"));
  assert.ok(!examWords.some((card) => card.word === "ocean"));
});

test("version-busts the PWA assets when switching the vocabulary catalog", async () => {
  const [index, appSource] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../src/app.js", import.meta.url), "utf8")
  ]);

  assert.match(index, /styles\.css\?v=kaoyan-3/);
  assert.match(index, /src\/app\.js\?v=kaoyan-3/);
  assert.match(appSource, /\.\/data\.js\?v=kaoyan-3/);
  assert.match(appSource, /\.\/logic\.js\?v=kaoyan-3/);
});

test("adds a pronunciation control to each vocabulary prompt", async () => {
  const [appSource, styles] = await Promise.all([
    readFile(new URL("../src/app.js", import.meta.url), "utf8"),
    readFile(new URL("../styles.css", import.meta.url), "utf8")
  ]);

  assert.match(appSource, /data-cell-action="speak"/);
  assert.match(appSource, /speechSynthesis/);
  assert.match(appSource, /lang = "en-US"/);
  assert.match(styles, /\.speak-action/);
});

test("normalizes case, whitespace, apostrophes, and hyphens", () => {
  assert.equal(normalizeAnswer("  Well-being  "), "wellbeing");
});

test("grades an exact normalized answer", () => {
  assert.deepEqual(gradeAnswer(" OCEAN ", "ocean"), { status: "correct", normalized: "ocean" });
});

test("marks a non-matching answer wrong", () => {
  assert.equal(gradeAnswer("shore", "ocean").status, "wrong");
});

test("grades a Chinese meaning choice without stripping Chinese characters", () => {
  assert.deepEqual(gradeChoice(" 海洋；大海 ", "海洋；大海"), { status: "correct", normalized: "海洋;大海" });
  assert.equal(gradeChoice("岸；滨", "海洋；大海").status, "wrong");
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
