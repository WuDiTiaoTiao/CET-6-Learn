# Design QA

final result: passed

## Evidence

- Chrome headless loaded `http://127.0.0.1:4173/` and rendered the dashboard title, three level cards, and actions.
- Desktop screenshot checked at 1365 x 900: level cards form a three-column dashboard and the worksheet uses two columns.
- Narrow screenshot checked at 768 x 1024: the dashboard cards stack and the worksheet switches to a single column.
- Chrome DevTools Protocol interaction checked: selecting a level created 10 worksheet rows, 10 text inputs, and 10 canvases; entering the first row's expected word and submitting opened review with `1 / 10 正确`.
- Node test suite passed: 9 tests covering normalization, grading, JSON/CSV import, confidence state, and persistence.

## Known Limitation

The external Tesseract.js model path was not exercised in offline verification. The UI keeps the ink and exposes the fallback text layer when the model cannot load; first OCR use requires network access as documented in `README.md`.
