# IELTS Vocabulary Study Pad

## Goal

Build an iPad-friendly, installable web app that reproduces the user's reference worksheet pattern: each vocabulary item is a row with a blank answer cell for handwriting and a Chinese meaning prompt. The app accepts either iPad Scribble text input or preserved ink, grades the English answer, and tracks review progress locally.

## Product Scope

- Three cumulative levels: Beginner 2,000 words, Intermediate 4,500 words, Advanced approximately 8,500 words.
- Default exercise: read Chinese meaning and handwrite the English word.
- Additional modes are represented in the data model: English-to-Chinese and dictation.
- Landscape layout uses two worksheet columns; portrait layout uses one column.
- Each answer cell supports two input modes:
  - Scribble mode: an input layer receives iPadOS Pencil handwriting converted to text.
  - Ink mode: a canvas stores strokes and an OCR action returns a candidate transcription and confidence.
- Grading normalizes case, whitespace, apostrophes, and hyphens before comparing answers.
- High-confidence matches are marked correct. Low-confidence OCR results require confirmation instead of being marked wrong automatically.
- Wrong answers are saved to a local mistake book. Session progress and settings persist on-device.
- A JSON/CSV import surface is included so the prototype can be extended with the full vocabulary packages without changing the app UI.

## UX Structure

1. Dashboard: level cards, cumulative word targets, today's practice count, and recent mistake count.
2. Practice header: selected level, session progress, input mode switch, and submit/check action.
3. Worksheet: numbered rows, Chinese meaning, blank handwriting field, and per-row feedback.
4. Review state: score summary, mistakes, and retry action.

The visual language is a calm paper-and-ink study sheet: warm off-white background, thin ruled borders, black/graphite text, teal progress accents, and green/red grading marks. It uses responsive CSS so the worksheet remains usable with a Pencil in both orientations.

## Technical Design

- Static frontend: HTML, CSS, and JavaScript with no required build step.
- Pointer Events canvas for ink capture; device pixel ratio is handled so strokes remain crisp on iPad.
- Text input is positioned inside the same cell and remains compatible with Apple Scribble.
- OCR is isolated behind an `recognizeInk` adapter. The prototype uses a browser-loaded Tesseract.js worker when available and reports a clear setup state while the model loads.
- Local persistence uses `localStorage` for settings, session state, and mistakes. The imported vocabulary list is stored separately and can be replaced by a JSON/CSV import.
- A lightweight service worker caches the app shell for repeat offline use. OCR model caching is best-effort and requires the first network load.

## Data Model

```js
{
  id: "ocean",
  word: "ocean",
  meaning: "海洋；大海",
  phonetic: "/\u02c8\u0259\u028a.\u0283\u0259n/",
  level: "beginner",
  tags: ["geography", "environment"],
  example: "The ocean covers most of the Earth's surface."
}
```

The UI shows target counts even when the bundled sample pack is smaller; imported packs provide the full count and use the same schema.

## Error Handling

- Empty submission: keep the row active and show a short prompt.
- OCR unavailable or model loading: preserve the ink, expose the text-entry fallback, and never discard the drawing.
- Low OCR confidence: show the candidate text and ask the learner to confirm or edit.
- Import errors: report the row and field that failed validation without replacing the current pack.

## Verification

- Exercise flow: select a level, write/type answers, submit, see correct/incorrect/uncertain states, and open mistakes.
- Responsive checks: landscape two-column worksheet and portrait one-column worksheet.
- Persistence check: reload and confirm selected level, mode, progress, and mistakes remain.
- Ink check: pointer/mouse strokes render, clear, and remain attached to the correct row.
- Import check: valid JSON/CSV adds cards; malformed files leave the existing pack intact.
