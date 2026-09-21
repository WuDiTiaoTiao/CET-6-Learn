const LEVEL_IDS = new Set(["beginner", "intermediate", "advanced"]);

export function normalizeAnswer(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[-_\s]+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function gradeAnswer(answer, expected) {
  const normalized = normalizeAnswer(answer);
  if (!normalized) return { status: "empty", normalized };
  return {
    status: normalized === normalizeAnswer(expected) ? "correct" : "wrong",
    normalized
  };
}

export function confidenceStatus(confidence, threshold = 0.78) {
  return Number(confidence) >= threshold ? "confirmed" : "uncertain";
}

function parseCsvLine(line) {
  const fields = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"' && quoted) {
      field += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      fields.push(field.trim());
      field = "";
    } else {
      field += char;
    }
  }
  fields.push(field.trim());
  return fields;
}

function validateCard(card, index) {
  if (!card || typeof card !== "object") throw new Error(`第 ${index + 1} 行不是词卡对象`);
  const word = String(card.word ?? "").trim();
  const meaning = String(card.meaning ?? "").trim();
  const level = String(card.level ?? "").trim().toLowerCase();
  if (!word || !meaning) throw new Error(`第 ${index + 1} 行缺少 word 或 meaning`);
  if (!LEVEL_IDS.has(level)) throw new Error(`第 ${index + 1} 行的 level 必须是 beginner、intermediate 或 advanced`);
  return {
    id: String(card.id || word.toLowerCase().replace(/[^a-z0-9]+/g, "-")),
    word,
    meaning,
    level,
    phonetic: String(card.phonetic ?? ""),
    tags: Array.isArray(card.tags) ? card.tags : String(card.tags ?? "").split(";").map((tag) => tag.trim()).filter(Boolean),
    example: String(card.example ?? "")
  };
}

export function parseVocabularyText(text, format = "json") {
  if (format === "json") {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error("JSON 词包必须是数组");
    return parsed.map(validateCard);
  }

  const lines = String(text).replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error("CSV 至少需要表头和一行词卡");
  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());
  const required = ["word", "meaning", "level"];
  const missing = required.filter((field) => !headers.includes(field));
  if (missing.length) throw new Error(`CSV 缺少列：${missing.join("、")}`);
  return lines.slice(1).map((line, offset) => {
    const cells = parseCsvLine(line);
    const raw = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
    return validateCard(raw, offset + 1);
  });
}

export function readStore(storage, key, fallback) {
  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStore(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
