import { DEFAULT_SETTINGS, LEVELS, SEED_WORDS } from "./data.js";
import {
  confidenceStatus,
  buildMeaningOptions,
  gradeChoice,
  gradeAnswer,
  parseVocabularyText,
  readStore,
  writeStore
} from "./logic.js";

const STORAGE_KEY = "ielts-study-pad-state-v1";
const OCR_THRESHOLD = 0.78;
const SESSION_SIZE = 10;

const app = document.querySelector("#app");
const storage = (() => {
  try {
    return window.localStorage;
  } catch {
    return { getItem: () => null, setItem: () => {} };
  }
})();
let ocrWorkerPromise = null;
let toastTimer = null;

const saved = readStore(storage, STORAGE_KEY, {});
const savedCards = Array.isArray(saved.cards) ? saved.cards : [];
const mergedCards = new Map(SEED_WORDS.map((card) => [card.id, card]));
savedCards.forEach((card) => mergedCards.set(card.id, card));
const state = {
  view: "dashboard",
  settings: { ...DEFAULT_SETTINGS, ...(saved.settings || {}) },
  cards: [...mergedCards.values()],
  mistakes: Array.isArray(saved.mistakes) ? saved.mistakes : [],
  progress: saved.progress && typeof saved.progress === "object" ? saved.progress : {},
  session: null
};

function saveAppState() {
  writeStore(storage, STORAGE_KEY, {
    settings: state.settings,
    cards: state.cards,
    mistakes: state.mistakes,
    progress: state.progress
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message, tone = "normal") {
  clearTimeout(toastTimer);
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = `toast ${tone === "error" ? "error" : ""}`;
  toast.textContent = message;
  document.body.append(toast);
  toastTimer = setTimeout(() => toast.remove(), 3600);
}

function masteredCount(levelId) {
  return state.cards
    .filter((card) => card.level === levelId)
    .filter((card) => state.progress[card.id]?.correct > 0).length;
}

function sampleCount(levelId) {
  return state.cards.filter((card) => card.level === levelId).length;
}

function topicCards(topic) {
  return state.cards.filter((card) => card.topic === topic || card.tags?.includes(topic));
}

function topicMasteredCount(topic) {
  return topicCards(topic).filter((card) => state.progress[card.id]?.correct > 0).length;
}

function levelCardMarkup(level) {
  const mastered = masteredCount(level.id);
  const available = sampleCount(level.id);
  const progress = available ? Math.round((mastered / available) * 100) : 0;
  return `
    <article class="level-card ${level.color}">
      <div>
        <div class="level-top">
          <div>
            <h2 class="level-label">${level.label}</h2>
            <p class="level-subtitle">${level.subtitle}</p>
          </div>
          <span class="level-target">目标 ${level.target.toLocaleString()} 词</span>
        </div>
        <p class="level-count">${mastered}<small> / ${available} 已掌握</small></p>
        <div class="progress-track" aria-label="${level.label}掌握进度"><span style="width:${progress}%"></span></div>
      </div>
      <div class="level-footer">
        <span class="level-meta">${available} 张已加载</span>
        <button class="button small primary" data-action="start" data-level="${level.id}">开始练习</button>
      </div>
    </article>`;
}

function topicCardMarkup(topic) {
  const available = topicCards(topic);
  const mastered = topicMasteredCount(topic);
  return `
    <article class="topic-card">
      <div class="topic-card-copy">
        <p class="eyebrow">Topic pack · Computer work</p>
        <h2>计算机工作 · 程序员常用英语</h2>
        <p>覆盖办公协作、软件开发、Git、部署与技术沟通，按初级到高级混合练习。</p>
      </div>
      <div class="topic-card-side">
        <strong>${mastered} <small>/ ${available.length} 已掌握</small></strong>
        <span>内置 ${available.length} 词</span>
        <button class="button small primary" data-action="start-topic" data-topic="computer-work">开始主题练习</button>
      </div>
    </article>`;
}

function shell(content) {
  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <button class="brand button ghost" data-action="home" aria-label="回到首页">
          <span class="brand-mark">I</span>
          <span class="brand-copy"><strong>IELTS / STUDY PAD</strong><span>用手写把词汇变成记忆</span></span>
        </button>
        <div class="top-actions">
          <button class="button small" data-action="mistakes">错词本 · ${state.mistakes.length}</button>
          <button class="button small" data-action="import">导入词包</button>
          <input id="import-file" class="hidden" type="file" accept=".json,.csv,application/json,text/csv" />
        </div>
      </header>
      ${content}
    </div>`;
  bindShellActions();
}

function renderDashboard() {
  const totalCompleted = state.settings.completedToday || 0;
  shell(`
    <section class="view dashboard-view">
      <div class="dashboard-intro">
        <div>
          <p class="eyebrow">Daily vocabulary practice</p>
          <h1 class="page-title">今天，从一页手写词卡开始。</h1>
          <p class="page-lede">看中文释义，在留白里写下英文。每次批改都会留下你的学习轨迹。</p>
        </div>
        <p class="intro-note">横屏像一张双栏词汇表，竖屏自动收拢成单栏。Apple Pencil 可以直接使用随手写。</p>
      </div>
      <div class="level-grid">${Object.values(LEVELS).map(levelCardMarkup).join("")}</div>
      <div class="topic-section">${topicCardMarkup("computer-work")}</div>
      <div class="stats-strip" aria-label="学习统计">
        <div class="stat"><strong>${totalCompleted}</strong><span>今日完成词数</span></div>
        <div class="stat"><strong>${state.settings.streak || 0}</strong><span>连续学习天数</span></div>
        <div class="stat"><strong>${state.mistakes.length}</strong><span>待复习错词</span></div>
      </div>
      <p class="sample-note">当前内置一组可立即体验的高频样例词卡。导入完整词包后，分级目标会继续沿用同一套批改和复习逻辑。</p>
    </section>`);
}

function buildSession(levelId, topic = "") {
  const available = topic ? topicCards(topic) : state.cards.filter((card) => card.level === levelId);
  const rotated = [...available].sort((a, b) => {
    const aScore = state.progress[a.id]?.correct || 0;
    const bScore = state.progress[b.id]?.correct || 0;
    return aScore - bScore || a.word.localeCompare(b.word);
  });
  const cards = rotated.slice(0, SESSION_SIZE);
  return {
    cards,
    answers: Object.fromEntries(cards.map((card) => [card.id, { text: "", selectedMeaning: "", inkDataUrl: "", ocrConfidence: null, ocrCandidate: "", confirmed: false }])),
    results: {},
    levelId,
    topic
  };
}

function practiceMarkup() {
  const level = state.session.topic ? { label: "主题词包", subtitle: "计算机工作 · 程序员英语" } : LEVELS[state.session.levelId];
  const mode = state.settings.inputMode;
  const exerciseMode = state.settings.exerciseMode;
  const isChoiceMode = exerciseMode === "word-to-meaning";
  const submittedResults = Object.values(state.session.results);
  const submittedCorrect = submittedResults.filter((result) => result.status === "correct").length;
  const submissionBanner = state.session.submitted ? `
        <div class="submission-banner">
          <span><strong>已完成批改</strong> · ${submittedCorrect} / ${state.session.cards.length} 正确</span>
          <button class="button small secondary" data-action="review">查看本组总结</button>
        </div>` : "";
  return `
    <section class="view practice-view" data-input-mode="${mode}">
      <div class="practice-head">
        <div>
          <p class="eyebrow">${level.label} · ${level.subtitle}</p>
          <h1 class="practice-title">${isChoiceMode ? "看英文，选择中文释义" : "看释义，写出英文单词"}</h1>
          <div class="practice-meta"><span>本组 ${state.session.cards.length} 词</span><span>·</span><span>第 1 页</span></div>
        </div>
        <div class="practice-actions">
          <div class="mode-switch exercise-switch" aria-label="练习方向">
            <button data-action="exercise-mode" data-exercise-mode="meaning-to-word" aria-pressed="${exerciseMode === "meaning-to-word"}">写英文</button>
            <button data-action="exercise-mode" data-exercise-mode="word-to-meaning" aria-pressed="${isChoiceMode}">选中文</button>
          </div>
          ${isChoiceMode ? "" : `<div class="mode-switch" aria-label="输入模式">
            <button data-action="mode" data-mode="scribble" aria-pressed="${mode === "scribble"}">随手写</button>
            <button data-action="mode" data-mode="ink" aria-pressed="${mode === "ink"}">保留笔迹</button>
          </div>`}
          <button class="button" data-action="back">返回首页</button>
          <button class="button primary" data-action="submit">${state.session.submitted ? "再次批改" : "提交批改"}</button>
        </div>
      </div>
      <div class="instruction-bar"><span><strong>${isChoiceMode ? "根据英文单词选择中文释义" : mode === "scribble" ? "用 Apple Pencil 直接书写" : "在格内书写，保留你的原笔迹"}</strong> · 每行一个答案</span><span>标准答案会在提交后显示</span></div>
      ${submissionBanner}
      <div class="worksheet" aria-label="IELTS 手写词汇表">
        <div class="worksheet-head"><span>NO.</span><span>${isChoiceMode ? "英文单词 / 语境" : "中文释义 / 语境"}</span><span>${isChoiceMode ? "选择中文释义" : "你的英文答案"}</span></div>
        <div class="worksheet-grid">${state.session.cards.map((card, index) => rowMarkup(card, index)).join("")}</div>
      </div>
      <div class="practice-foot"><span>手写内容只保存在当前设备。</span><span>完成后可在错词本里重新练习。</span></div>
    </section>`;
}

function rowMarkup(card, index) {
  const answer = state.session.answers[card.id];
  const result = state.session.results[card.id];
  const status = result?.status || "idle";
  const feedback = result ? resultLabel(result) : "等待作答";
  const isChoiceMode = state.settings.exerciseMode === "word-to-meaning";
  const options = isChoiceMode ? buildMeaningOptions(state.session.cards, card) : [];
  const choiceMarkup = isChoiceMode ? `
    <select class="meaning-select" aria-label="第 ${index + 1} 题中文释义">
      <option value="">选择中文释义</option>
      ${options.map((meaning) => `<option value="${escapeHtml(meaning)}" ${answer.selectedMeaning === meaning ? "selected" : ""}>${escapeHtml(meaning)}</option>`).join("")}
    </select>` : `
    <canvas class="answer-canvas" aria-label="${escapeHtml(card.word)} 手写区域"></canvas>
    <input class="answer-input" value="${escapeHtml(answer.text)}" placeholder="在这里写英文" autocapitalize="none" autocomplete="off" spellcheck="false" aria-label="第 ${index + 1} 题答案" />`;
  const promptMarkup = isChoiceMode ? `
        <div class="prompt-word">${escapeHtml(card.word)}</div>
        <div class="prompt-phonetic">${escapeHtml(card.phonetic)}</div>
        <p class="prompt-example">${escapeHtml(card.example)}</p>` : `
        <div class="prompt-meaning">${escapeHtml(card.meaning)}</div>
        <div class="prompt-phonetic">${escapeHtml(card.phonetic)}</div>
        <p class="prompt-example">${escapeHtml(card.example)}</p>`;
  return `
    <article class="worksheet-row" data-row-id="${escapeHtml(card.id)}">
      <div class="row-number">${String(index + 1).padStart(2, "0")}</div>
      <div class="prompt">
        ${promptMarkup}
      </div>
      <div class="answer-cell" data-mode="${state.settings.inputMode}" data-exercise-mode="${state.settings.exerciseMode}" data-status="${status}">
        ${choiceMarkup}
        ${result?.status === "wrong" ? `<span class="correct-answer">正确答案：${escapeHtml(isChoiceMode ? card.meaning : card.word)}</span>` : ""}
        <div class="cell-tools">
          <div class="cell-actions"><button class="cell-action" data-cell-action="clear">${isChoiceMode ? "清除选择" : "清空"}</button>${isChoiceMode ? "" : `<button class="cell-action" data-cell-action="ocr">识别</button>`}</div>
          <span class="cell-feedback">${escapeHtml(feedback)}</span>
        </div>
      </div>
    </article>`;
}

function resultLabel(result) {
  if (result.status === "correct") return "✓ 正确";
  if (result.status === "wrong") return "× 再记一次";
  if (result.status === "uncertain") return "？请确认识别";
  return state.settings.exerciseMode === "word-to-meaning" ? "请选择释义" : "请写下答案";
}

function renderPractice() {
  shell(practiceMarkup());
  state.session.cards.forEach((card) => {
    const row = app.querySelector(`[data-row-id="${CSS.escape(card.id)}"]`);
    if (row) mountAnswerCell(row, card);
  });
}

function renderReview() {
  const results = Object.values(state.session.results);
  const correct = results.filter((result) => result.status === "correct").length;
  const wrong = results.filter((result) => result.status === "wrong");
  const uncertain = results.filter((result) => result.status === "uncertain").length;
  const incomplete = results.filter((result) => result.status !== "correct");
  shell(`
    <section class="view review-view">
      <div class="review-card">
        <div class="review-kicker">本组完成</div>
        <div class="review-score">${correct}<small> / ${results.length} 正确</small></div>
        <p class="review-message">${uncertain ? `有 ${uncertain} 个答案需要确认识别结果。` : wrong.length ? "错词已经放入错词本，趁热再看一遍。" : incomplete.length ? `已完成 ${correct} 个，还有 ${incomplete.length} 个需要继续作答。` : "这一页全部通过，可以继续下一组。"}</p>
        ${incomplete.length ? `<div class="review-list">${incomplete.map((result) => `<div class="review-item"><span>${escapeHtml(result.word)} · ${resultLabel(result)}</span><strong>${escapeHtml(result.answer || "未填写")}</strong></div>`).join("")}</div>` : ""}
        <div class="review-actions">
          ${wrong.length ? `<button class="button secondary" data-action="retry">重练错词</button>` : ""}
          ${incomplete.length ? `<button class="button secondary" data-action="resume">继续这一页</button>` : ""}
          <button class="button primary" data-action="home">回到首页</button>
        </div>
      </div>
    </section>`);
}

function render() {
  if (state.view === "practice" && state.session) renderPractice();
  else if (state.view === "review" && state.session) renderReview();
  else renderDashboard();
}

function createInkController(canvas, onChange) {
  const context = canvas.getContext("2d");
  const strokes = [];
  let active = null;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#283a39";
    context.lineWidth = 2.1;
    redraw();
  }
  function point(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
  function redraw() {
    const rect = canvas.getBoundingClientRect();
    context.clearRect(0, 0, rect.width, rect.height);
    strokes.forEach((stroke) => {
      if (!stroke.length) return;
      context.beginPath();
      context.moveTo(stroke[0].x, stroke[0].y);
      stroke.slice(1).forEach((pointValue) => context.lineTo(pointValue.x, pointValue.y));
      context.stroke();
    });
  }
  canvas.addEventListener("pointerdown", (event) => {
    if (canvas.closest(".answer-cell")?.dataset.mode !== "ink") return;
    canvas.setPointerCapture(event.pointerId);
    active = [point(event)];
    strokes.push(active);
    redraw();
    onChange();
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!active) return;
    active.push(point(event));
    redraw();
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((eventName) => {
    canvas.addEventListener(eventName, () => {
      if (!active) return;
      active = null;
      onChange();
    });
  });
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();
  return {
    clear() { strokes.splice(0); redraw(); onChange(); },
    hasInk() { return strokes.length > 0; },
    toDataUrl() { return canvas.toDataURL("image/png"); }
  };
}

function mountAnswerCell(row, card) {
  const cell = row.querySelector(".answer-cell");
  const answer = state.session.answers[card.id];
  const select = row.querySelector(".meaning-select");
  if (select) {
    select.addEventListener("change", () => {
      answer.selectedMeaning = select.value;
      answer.text = select.value;
      if (state.session.results[card.id]) {
        delete state.session.results[card.id];
        cell.dataset.status = "idle";
        row.querySelector(".cell-feedback").textContent = "等待批改";
        row.querySelector(".correct-answer")?.remove();
      }
      saveAppState();
    });
    row.querySelector('[data-cell-action="clear"]').addEventListener("click", () => {
      select.value = "";
      answer.selectedMeaning = "";
      answer.text = "";
      delete state.session.results[card.id];
      cell.dataset.status = "idle";
      row.querySelector(".cell-feedback").textContent = "等待作答";
      row.querySelector(".correct-answer")?.remove();
      saveAppState();
    });
    return;
  }
  const input = row.querySelector(".answer-input");
  const canvas = row.querySelector(".answer-canvas");
  const ink = createInkController(canvas, () => {
    answer.inkDataUrl = ink.toDataUrl();
    saveAppState();
  });
  row.dataset.inkController = card.id;
  input.addEventListener("input", () => {
    answer.text = input.value;
    if (answer.ocrCandidate && input.value.trim() !== answer.ocrCandidate.trim()) answer.confirmed = true;
    if (state.session.results[card.id]) {
      delete state.session.results[card.id];
      cell.dataset.status = "idle";
      row.querySelector(".cell-feedback").textContent = "等待批改";
      row.querySelector(".correct-answer")?.remove();
    }
    saveAppState();
  });
  row.querySelector('[data-cell-action="clear"]').addEventListener("click", () => {
    input.value = "";
    answer.text = "";
    answer.inkDataUrl = "";
    answer.ocrConfidence = null;
    answer.ocrCandidate = "";
    answer.confirmed = false;
    ink.clear();
    delete state.session.results[card.id];
    cell.dataset.status = "idle";
    row.querySelector(".cell-feedback").textContent = "等待作答";
    row.querySelector(".correct-answer")?.remove();
  });
  row.querySelector('[data-cell-action="ocr"]').addEventListener("click", async () => {
    if (!ink.hasInk()) {
      showToast("请先在格内写下一个单词。", "error");
      return;
    }
    const feedback = row.querySelector(".cell-feedback");
    feedback.textContent = "识别模型加载中…";
    try {
      const result = await recognizeInk(ink.toDataUrl());
      answer.text = result.text;
      answer.ocrCandidate = result.text;
      answer.ocrConfidence = result.confidence;
      answer.confirmed = false;
      input.value = result.text;
      feedback.textContent = `识别 ${Math.round(result.confidence * 100)}%`;
      cell.dataset.status = confidenceStatus(result.confidence, OCR_THRESHOLD) === "uncertain" ? "uncertain" : "idle";
      showToast(result.confidence >= OCR_THRESHOLD ? "识别完成，可以提交批改。" : "识别置信度偏低，请修改或确认文字。", result.confidence >= OCR_THRESHOLD ? "normal" : "error");
    } catch (error) {
      feedback.textContent = "识别不可用";
      showToast(error.message || "OCR 暂时不可用，请使用随手写输入。", "error");
    }
  });
}

async function loadTesseract() {
  if (window.Tesseract) return window.Tesseract;
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("OCR 模型加载失败，请检查网络后重试。"));
    document.head.append(script);
  });
  return window.Tesseract;
}

async function recognizeInk(dataUrl) {
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = loadTesseract().then((tesseract) => tesseract.createWorker("eng"));
  }
  try {
    const worker = await ocrWorkerPromise;
    const { data } = await worker.recognize(dataUrl);
    return { text: data.text.trim().replace(/\s+/g, " "), confidence: Math.max(0, Math.min(1, Number(data.confidence || 0) / 100)) };
  } catch (error) {
    ocrWorkerPromise = null;
    throw new Error(error.message || "OCR 识别失败，请改用随手写。", { cause: error });
  }
}

function gradeRow(card) {
  const answer = state.session.answers[card.id];
  if (state.settings.exerciseMode === "word-to-meaning") {
    const selectedMeaning = answer.selectedMeaning.trim();
    if (!selectedMeaning) return { status: "empty", word: card.word, answer: "", correctAnswer: card.meaning };
    return { ...gradeChoice(selectedMeaning, card.meaning), word: card.word, answer: selectedMeaning, correctAnswer: card.meaning };
  }
  const text = answer.text.trim();
  if (!text) return { status: "empty", word: card.word, answer: "", correctAnswer: card.word };
  if (answer.ocrConfidence !== null && answer.ocrConfidence < OCR_THRESHOLD && !answer.confirmed) {
    return { status: "uncertain", word: card.word, answer: text, confidence: answer.ocrConfidence, correctAnswer: card.word };
  }
  return { ...gradeAnswer(text, card.word), word: card.word, answer: text, confidence: answer.ocrConfidence, correctAnswer: card.word };
}

function updateRowFeedback(card, result) {
  const row = app.querySelector(`[data-row-id="${CSS.escape(card.id)}"]`);
  if (!row) return;
  const cell = row.querySelector(".answer-cell");
  cell.dataset.status = result.status;
  row.querySelector(".cell-feedback").textContent = resultLabel(result);
  row.querySelector(".correct-answer")?.remove();
  if (result.status === "wrong") {
    const correct = document.createElement("span");
    correct.className = "correct-answer";
    correct.textContent = `正确答案：${result.correctAnswer || card.word}`;
    cell.append(correct);
  }
}

function submitSession() {
  const wasSubmitted = state.session.submitted === true;
  state.session.results = {};
  state.session.cards.forEach((card) => {
    const result = gradeRow(card);
    state.session.results[card.id] = result;
    updateRowFeedback(card, result);
    const existing = state.progress[card.id] || { attempts: 0, correct: 0 };
    existing.attempts += 1;
    if (result.status === "correct") existing.correct += 1;
    state.progress[card.id] = existing;
    if (result.status === "wrong" && !state.mistakes.includes(card.id)) state.mistakes.push(card.id);
  });
  const now = new Date().toISOString().slice(0, 10);
  if (state.settings.lastStudyDate !== now) {
    const previous = new Date();
    previous.setDate(previous.getDate() - 1);
    const previousKey = previous.toISOString().slice(0, 10);
    state.settings.streak = state.settings.lastStudyDate === previousKey ? (state.settings.streak || 0) + 1 : 1;
    state.settings.lastStudyDate = now;
  }
  if (!wasSubmitted) state.settings.completedToday += state.session.cards.length;
  saveAppState();
  state.session.submitted = true;
  state.view = "practice";
  renderPractice();
}

function openMistakes() {
  const cards = state.cards.filter((card) => state.mistakes.includes(card.id));
  if (!cards.length) {
    showToast("错词本还是空的，先完成一组练习吧。");
    return;
  }
  state.session = {
    cards: cards.slice(0, SESSION_SIZE),
    answers: Object.fromEntries(cards.slice(0, SESSION_SIZE).map((card) => [card.id, { text: "", selectedMeaning: "", inkDataUrl: "", ocrConfidence: null, ocrCandidate: "", confirmed: false }])),
    results: {},
    levelId: cards[0].level
  };
  state.view = "practice";
  renderPractice();
}

function bindShellActions() {
  app.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "home" || action === "back") {
        state.view = "dashboard";
        state.session = null;
        renderDashboard();
      } else if (action === "start") {
        state.settings.selectedLevel = button.dataset.level;
        state.session = buildSession(button.dataset.level);
        state.view = "practice";
        saveAppState();
        renderPractice();
      } else if (action === "submit") {
        submitSession();
      } else if (action === "review") {
        state.view = "review";
        renderReview();
      } else if (action === "mode") {
        state.settings.inputMode = button.dataset.mode;
        saveAppState();
        renderPractice();
      } else if (action === "exercise-mode") {
        state.settings.exerciseMode = button.dataset.exerciseMode;
        saveAppState();
        renderPractice();
      } else if (action === "start-topic") {
        state.session = buildSession("", button.dataset.topic);
        state.view = "practice";
        saveAppState();
        renderPractice();
      } else if (action === "mistakes") {
        openMistakes();
      } else if (action === "retry") {
        openMistakes();
      } else if (action === "resume") {
        state.view = "practice";
        renderPractice();
      } else if (action === "import") {
        app.querySelector("#import-file")?.click();
      }
    });
  });
  const importInput = app.querySelector("#import-file");
  importInput?.addEventListener("change", async () => {
    const file = importInput.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const format = file.name.toLowerCase().endsWith(".csv") ? "csv" : "json";
      const imported = parseVocabularyText(text, format);
      state.cards = imported;
      saveAppState();
      renderDashboard();
      showToast(`已导入 ${imported.length} 张词卡。`);
    } catch (error) {
      showToast(error.message || "词包格式不正确。", "error");
    } finally {
      importInput.value = "";
    }
  });
}

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
render();
