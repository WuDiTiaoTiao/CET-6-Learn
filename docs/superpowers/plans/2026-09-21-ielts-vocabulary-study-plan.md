# IELTS Vocabulary Study Pad Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive iPad-friendly PWA that reproduces the reference worksheet, accepts Scribble text or preserved ink, grades English vocabulary answers, and persists study progress locally.

**Architecture:** A static HTML/CSS/ES-module frontend keeps the app easy to open and install on iPad Safari. `src/logic.js` contains pure normalization, grading, import, and persistence helpers; `src/app.js` owns DOM state, worksheet rendering, Pencil canvas events, and the OCR adapter. The browser loads Tesseract.js lazily for ink recognition while Scribble remains a native text-input path.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript ES modules, Canvas Pointer Events, localStorage, Service Worker, Node's built-in `node:test` runner, Tesseract.js CDN for optional OCR.

**Spec:** `docs/superpowers/specs/2026-09-21-ielts-vocabulary-study-design.md`

## Global Constraints

- The default exercise is Chinese meaning -> handwritten English word.
- Landscape uses two worksheet columns; portrait uses one column.
- Scribble mode must remain usable without the OCR model.
- Ink recognition must preserve the drawing and expose a fallback text entry when OCR is unavailable.
- Low-confidence OCR is an uncertain state, never an automatic wrong result.
- The bundled sample pack is extendable through validated JSON/CSV import.
- Use ASCII source text except where Chinese vocabulary meanings are required.

---

### Task 1: Project Shell and Test Harness

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `styles.css`
- Create: `src/app.js`
- Create: `src/logic.js`
- Create: `src/data.js`
- Create: `tests/logic.test.mjs`

**Interfaces:**
- `src/data.js` exports `LEVELS`, `SEED_WORDS`, and `DEFAULT_SETTINGS`.
- `src/logic.js` exports `normalizeAnswer(value)`, `gradeAnswer(answer, expected)`, `parseVocabularyText(text, format)`, `readStore(storage, key, fallback)`, and `writeStore(storage, key, value)`.
- `src/app.js` imports those exports and mounts the application on `DOMContentLoaded`.

- [ ] **Step 1: Write failing pure-logic tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { gradeAnswer, normalizeAnswer, parseVocabularyText } from "../src/logic.js";

test("normalizes case, whitespace, apostrophes, and hyphens", () => {
  assert.equal(normalizeAnswer("  Well-being  "), "wellbeing");
});

test("grades an exact normalized answer", () => {
  assert.deepEqual(gradeAnswer(" OCEAN ", "ocean"), { status: "correct", normalized: "ocean" });
});

test("marks a non-matching answer wrong", () => {
  assert.equal(gradeAnswer("shore", "ocean").status, "wrong");
});

test("parses a valid JSON vocabulary pack", () => {
  const pack = parseVocabularyText('[{"word":"ocean","meaning":"海洋","level":"beginner"}]', "json");
  assert.equal(pack[0].word, "ocean");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL because `src/logic.js` and the package script do not yet exist.

- [ ] **Step 3: Create the static shell and minimal data module**

Create `package.json` with `{ "type": "module", "scripts": { "test": "node --test" } }`. Create `index.html` with a semantic app root, linked stylesheet, module script, and manifest link. Define the three cumulative level targets and at least 24 representative seed words (including the reference words `ocean`, `marine`, `navigation`, `gulf`, `beach`, `coast`, `shore`, `tide`, `current`, `brook`, `stream`, `stony`, `vertical`, and `steep`).

- [ ] **Step 4: Implement the pure logic helpers**

`normalizeAnswer` trims, lowercases, removes apostrophes/hyphens, and collapses whitespace. `gradeAnswer` returns `{ status: "empty" | "correct" | "wrong", normalized }`. `parseVocabularyText` accepts JSON arrays or CSV with a header containing `word,meaning,level`; validate every row before returning and throw a readable error without mutating state. `readStore` and `writeStore` safely wrap JSON localStorage access.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS for normalization, grading, JSON parsing, and invalid input coverage.

### Task 2: Reference Worksheet Layout and Dashboard

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `src/app.js`

**Interfaces:**
- `renderDashboard()` renders level cards from `LEVELS` and the current local progress.
- `renderWorksheet()` renders the current cards into `.worksheet-grid` and calls `mountAnswerCell(row, card)` for every row.
- `setView(view)` switches between `dashboard`, `practice`, and `review` without a page reload.

- [ ] **Step 1: Add the semantic regions**

Add an app header, dashboard view, practice view, worksheet grid, review summary, level selector, mode segmented control, import button, and hidden file input. Keep every primary action as a real button with an accessible label.

- [ ] **Step 2: Style the worksheet against the reference**

Use warm paper background, thin ruled borders, teal numbering, compact row height, and a blank answer cell with a subtle baseline. Use CSS grid with two columns at `min-width: 900px` and one column below it. Keep answer cells at a stable `min-height` so writing does not resize rows.

- [ ] **Step 3: Implement dashboard selection and responsive rendering**

Selecting a level stores `selectedLevel`, creates a 10-card session from the selected pack, and opens practice. Dashboard cards display target counts and sample-pack availability without claiming the complete pack is bundled.

- [ ] **Step 4: Manually verify the shell**

Run a static server with `npx serve . -l 4173` or the repository's available equivalent and check that the dashboard opens, level buttons work, and the worksheet changes from two columns to one column when the viewport narrows.

### Task 3: Scribble and Ink Answer Cells

**Files:**
- Modify: `src/app.js`
- Modify: `styles.css`

**Interfaces:**
- `mountAnswerCell(row, card)` creates the input and ink layers for a row.
- `createInkController(canvas, onChange)` returns `{ clear(), hasInk(), toDataUrl() }` and emits stroke changes.
- `getRowAnswer(row)` returns the current typed answer or OCR-confirmed answer.
- `clearRow(row)` clears both text and ink without clearing other rows.

- [ ] **Step 1: Add a text layer for Apple Scribble**

Use a normal `<input autocapitalize="none" autocomplete="off" spellcheck="false">` inside every answer cell. Add `input` and `change` handlers that keep `answers[rowId].text` current and hide the empty-state hint once typing begins.

- [ ] **Step 2: Add a pointer-event canvas layer**

Scale the canvas by `devicePixelRatio`, use `pointerdown/pointermove/pointerup`, call `setPointerCapture`, and draw a graphite stroke. Store each cell's data URL only when the row is submitted or persisted so frequent pointer events do not cause excessive storage writes.

- [ ] **Step 3: Add cell controls**

Provide clear and OCR buttons inside each cell. Clear resets text, strokes, feedback, and the stored answer. OCR leaves the canvas visible and puts the recognized candidate into the input for confirmation.

- [ ] **Step 4: Verify Pencil-compatible interaction with a mouse fallback**

Use desktop pointer events to draw, clear, and type in two separate rows. Confirm that clearing one row leaves every other row unchanged.

### Task 4: Grading, OCR Adapter, and Review Flow

**Files:**
- Modify: `src/app.js`
- Modify: `styles.css`
- Modify: `src/logic.js`

**Interfaces:**
- `recognizeInk(dataUrl)` returns `Promise<{ text: string, confidence: number }>` and throws a typed setup error when Tesseract cannot load.
- `gradeRow(rowId)` uses `gradeAnswer` and returns a row result with `status`, `answer`, and `confidence`.
- `submitSession()` grades all rows, records mistakes, and opens review.

- [ ] **Step 1: Add confidence-aware result tests**

Extend `tests/logic.test.mjs` with a helper test that maps confidence `>= 0.78` to `confirmed` and lower confidence to `uncertain`; verify wrong answers are the only results recorded in the mistake list.

- [ ] **Step 2: Implement the OCR adapter**

Lazy-load `https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js` on first OCR click, create an English worker, recognize the cell PNG, and return trimmed text plus a normalized 0-1 confidence. Show model-loading status in the cell and keep the ink if loading fails.

- [ ] **Step 3: Implement row feedback**

Render `correct`, `wrong`, `uncertain`, and `empty` feedback with distinct labels. For uncertain results, put the candidate in the input and require the learner to edit or confirm before final grading.

- [ ] **Step 4: Implement submit and review**

Submit all ten cards, count confirmed correct answers, append wrong cards to `mistakes`, increment `completedToday`, and render a review summary with retry-wrong and back-to-dashboard actions.

- [ ] **Step 5: Run tests and manually exercise the full flow**

Run: `npm test` and the local server. Verify one correct typed answer, one wrong answer, one empty row, one low-confidence state, and retry-wrong behavior.

### Task 5: Persistence, Import, and PWA Shell

**Files:**
- Create: `manifest.webmanifest`
- Create: `sw.js`
- Modify: `index.html`
- Modify: `src/app.js`
- Modify: `src/logic.js`
- Modify: `styles.css`

**Interfaces:**
- `saveAppState()` writes settings, progress, mistakes, and imported cards.
- `loadAppState()` restores the same shape with safe defaults.
- `handleImport(file)` validates JSON/CSV, replaces only on success, and displays an error message otherwise.

- [ ] **Step 1: Add persistence tests**

Use a fake storage object in `tests/logic.test.mjs` to verify `writeStore` then `readStore` round-trips progress and returns the fallback when stored JSON is malformed.

- [ ] **Step 2: Persist app state**

Save on level/mode changes, row input changes after a short debounce, session submit, mistake updates, and successful imports. On startup, merge saved values with `DEFAULT_SETTINGS` and the seed pack.

- [ ] **Step 3: Implement import**

Accept `.json` and `.csv`, parse using `parseVocabularyText`, require `word`, `meaning`, and a valid level, and show the imported card count. On failure, keep the existing pack and show the first invalid row.

- [ ] **Step 4: Add installable app metadata and caching**

Create a manifest with app name, standalone display, portrait-primary orientation, and theme colors; register `sw.js` to cache `index.html`, `styles.css`, `src/app.js`, `src/logic.js`, `src/data.js`, and the manifest. Do not cache external OCR until it has loaded successfully.

- [ ] **Step 5: Verify reload and offline shell**

Run `npm test`, reload after selecting a level and completing a session, and confirm the state remains. With the service worker registered, reload after disconnecting network and confirm the shell and Scribble path remain usable.

### Task 6: Final Verification and Handoff

**Files:**
- Create: `README.md`
- Create: `design-qa.md`

- [ ] **Step 1: Document iPad use**

Explain opening the local app, adding it to the home screen, choosing Scribble or Ink mode, loading a vocabulary pack, and the first-use network requirement for OCR.

- [ ] **Step 2: Run the complete verification**

Run `npm test`, start the local server, inspect dashboard/practice/review, test both responsive breakpoints, and confirm there are no console errors from the app shell. Record any OCR model limitation as a known note rather than hiding it.

- [ ] **Step 3: Write the QA result**

Create `design-qa.md` with `final result: passed` only after the reference-like worksheet layout and primary interactions are working; otherwise record the exact blocked item and avoid claiming full completion.

- [ ] **Step 4: Hand off the local preview**

Keep the local server running and provide the local URL plus the exact files created and tests run.
