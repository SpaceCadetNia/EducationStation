// Chọn Từ: workbook "pick the word that fits" pages as a game.
// LEARN: try the options and see what each does to the sentence (English);
//        free navigation, nothing is locked.
// PRACTICE: pick once per sentence; counts correct / total.
(function () {
  const sets = window.VN_WORKBOOK || [];
  const glossary = window.VN_GLOSSARY || { words: {}, phrases: {} };
  const voice = window.VNVoice;
  const $ = (id) => document.getElementById(id);
  const els = {
    set: $("ch-set"), page: $("ch-page"), instrVi: $("ch-instr-vi"), instrEn: $("ch-instr-en"),
    num: $("ch-num"), kind: $("ch-kind"), hear: $("ch-hear"), sentence: $("ch-sentence"), en: $("ch-en"),
    verdict: $("ch-verdict"), gloss: $("ch-gloss"), options: $("ch-options"),
    prev: $("ch-prev"), next: $("ch-next"), prompt: $("ch-prompt"), score: $("ch-score"),
    correct: $("ch-correct"), total: $("ch-total"), done: $("ch-done"),
    doneCorrect: $("ch-done-correct"), doneTotal: $("ch-done-total"), again: $("ch-again")
  };
  const store = {
    get(k) { try { return localStorage.getItem("vnchoose:" + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem("vnchoose:" + k, v); } catch (e) { /* ignore */ } }
  };

  let set = null;
  let mode = store.get("mode") === "practice" ? "practice" : "learn";
  let index = 0;
  let picked = null;        // option index shown in the sentence right now
  let tried = new Set();    // LEARN: options tried for this item
  let answered = false;     // PRACTICE: answered this item
  let order = [];           // PRACTICE: shuffled option order per item
  let score = { correct: 0, total: 0 };

  // ---------- helpers ----------
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function beep(name) {
    document.dispatchEvent(new CustomEvent("educationstation:sound", { detail: { name: name || "beep" } }));
  }
  // Same rule as tools/make_voices.py fill_blank().
  function fillWord(item, opt) {
    const vi = item.options[opt].vi;
    return item.sentence.indexOf("___") === 0 ? vi.charAt(0).toUpperCase() + vi.slice(1) : vi;
  }
  function filled(item, opt) {
    return item.sentence.replace("___", fillWord(item, opt));
  }
  // Clip index = position of this option among all options of the page.
  function flatIndex(itemIndex, opt) {
    let n = 0;
    for (let i = 0; i < itemIndex; i++) n += set.items[i].options.length;
    return n + opt;
  }
  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  // Vietnamese on top, English underneath: the same pattern as the options.
  function bi(vi, en) {
    return '<span class="bi-vi">' + escapeHtml(vi) + '</span><span class="bi-en">' + escapeHtml(en) + "</span>";
  }
  function words(text) {
    return text.split(/\s+/).filter(Boolean);
  }

  // ---------- rendering ----------
  function setupSets() {
    els.set.innerHTML = sets.map((s, i) =>
      '<option value="' + i + '">Trang ' + s.page + " · " + escapeHtml(s.title) + "</option>").join("");
    const saved = sets.findIndex((s) => s.id === store.get("set"));
    els.set.value = String(saved >= 0 ? saved : 0);
    els.set.disabled = sets.length < 2;
  }

  function startSet() {
    set = sets[Number(els.set.value) || 0];
    store.set("set", set.id);
    els.page.textContent = set.title.toUpperCase() + " // TRANG " + set.page;
    els.instrVi.textContent = set.instructions || "";
    els.instrEn.textContent = set.instructionsEn || "";
    index = 0;
    score = { correct: 0, total: 0 };
    order = set.items.map((it) => shuffle(it.options.map((_, i) => i)));
    els.done.hidden = true;
    renderItem();
  }

  function sentenceHtml(item, opt) {
    const parts = item.sentence.split("___");
    const wordSpans = (text) => words(text).map((w) =>
      '<button type="button" class="ch-word" data-word="' + escapeHtml(w) + '">' + escapeHtml(w) + "</button>").join(" ");
    let blank;
    if (opt === null) {
      blank = '<span class="ch-blank">&nbsp;</span>';
    } else {
      const good = item.options[opt].correct;
      blank = '<span class="ch-fill ' + (good ? "is-good" : "is-bad") + '">' +
        words(fillWord(item, opt)).map((w) => '<button type="button" class="ch-word" data-word="' + escapeHtml(w) + '">' + escapeHtml(w) + "</button>").join(" ") +
        "</span>";
    }
    // Punctuation right after the blank sticks to it ("___." → "giữ nhà.").
    const after = parts[1] || "";
    const punct = (after.match(/^[.,!?]+/) || [""])[0];
    const rest = after.slice(punct.length);
    return [wordSpans(parts[0]), blank + escapeHtml(punct), wordSpans(rest)].filter(Boolean).join(" ");
  }

  function englishHtml(opt) {
    const o = set.items[index].options[opt];
    const r = escapeHtml(o.result);
    const hl = escapeHtml(o.hl || "");
    return hl && r.indexOf(hl) !== -1 ? r.replace(hl, '<mark class="' + (o.correct ? "is-good" : "is-bad") + '">' + hl + "</mark>") : r;
  }

  function renderItem() {
    const item = set.items[index];
    picked = null;
    tried = new Set();
    answered = false;
    voice.stop();
    els.num.textContent = (index + 1) + "/" + set.items.length;
    // workbook "câu a / câu b" pages: say what kind of exercise this is
    els.kind.hidden = !item.kind;
    els.kind.innerHTML = item.kind === "a" ? bi("Câu a · Điền vào chỗ trống", "Fill in the blank") :
      item.kind === "b" ? bi("Câu b · Đặt câu bằng miệng", "Make a sentence (sample shown)") : "";
    els.sentence.innerHTML = sentenceHtml(item, null);
    els.en.innerHTML = "&nbsp;";
    els.verdict.hidden = true;
    els.gloss.hidden = true;
    els.hear.hidden = true;
    const optOrder = mode === "practice" ? order[index] : item.options.map((_, i) => i);
    els.options.innerHTML = optOrder.map((i) =>
      '<button type="button" class="ch-option" data-opt="' + i + '">' +
      '<span class="opt-vi">' + escapeHtml(item.options[i].vi) + "</span>" +
      (mode === "learn" ? '<span class="opt-en">' + escapeHtml(item.options[i].en) + "</span>" : "") +
      "</button>").join("");
    els.prev.disabled = index === 0;
    els.prev.style.visibility = mode === "practice" ? "hidden" : ""; // no going back to re-answer
    updateNav();
    updateScore();
  }

  function updateNav() {
    const item = set.items[index];
    const last = index === set.items.length - 1;
    if (mode === "learn") {
      const all = tried.size >= item.options.length;
      els.next.disabled = false; // Learn mode: move freely between sentences
      if (item.options.length === 1) {
        // one given word: fill it in (a) or see a sample sentence (b)
        els.prompt.innerHTML = tried.size === 0 ? bi("Chạm vào từ cho sẵn", "Tap the given words") :
          item.kind === "b" ? bi("Em đặt một câu khác bằng miệng", "Now make up your own sentence out loud") :
          bi("Đọc lại cả câu", "Read the whole sentence again");
      } else {
        els.prompt.innerHTML = tried.size === 0 ? bi("Chọn một từ", "Pick a word") :
          all ? bi("Từ nào hợp nghĩa?", "Which one makes sense?") : bi("Thử từ kia", "Now try the other one");
      }
    } else {
      els.next.disabled = !answered;
      els.prompt.innerHTML = answered ? "" : bi("Chọn từ đúng", "Pick the word that fits");
    }
    els.next.innerHTML = last ? bi("Xong ✓", "Done") : bi("Tiếp ▶", "Next");
  }

  function updateScore() {
    els.score.hidden = mode !== "practice";
    els.correct.textContent = score.correct;
    els.total.textContent = score.total;
  }

  function showOption(opt, speak) {
    const item = set.items[index];
    const o = item.options[opt];
    picked = opt;
    els.sentence.innerHTML = sentenceHtml(item, opt);
    els.en.innerHTML = englishHtml(opt);
    els.verdict.hidden = false;
    els.verdict.className = "choose-verdict " + (o.correct ? "is-good" : "is-bad");
    els.verdict.innerHTML = item.kind === "b" ? bi("Câu mẫu", "Sample sentence") :
      o.correct ? bi("✓ Hợp nghĩa", "Makes sense") : bi("✗ Không hợp nghĩa", "Doesn't make sense");
    els.gloss.hidden = true;
    els.hear.hidden = false;
    els.options.querySelectorAll(".ch-option").forEach((b) => b.classList.toggle("is-picked", Number(b.dataset.opt) === opt));
    if (speak) voice.sentence(set.id, flatIndex(index, opt), filled(item, opt));
  }

  // ---------- actions ----------
  function pick(opt) {
    voice.unlock();
    const item = set.items[index];
    if (mode === "learn") {
      showOption(opt, true);
      tried.add(opt);
      beep(item.options[opt].correct ? "good" : "beep");
      updateNav();
      return;
    }
    if (answered) { showOption(opt, true); return; }
    answered = true;
    score.total += 1;
    const good = item.options[opt].correct;
    if (good) score.correct += 1;
    beep(good ? "good" : "error");
    els.options.querySelectorAll(".ch-option").forEach(function (b) {
      const i = Number(b.dataset.opt);
      if (item.options[i].correct) b.classList.add("is-answer");
      else if (i === opt) b.classList.add("is-wrong");
    });
    // Show the sentence that makes sense (and say it).
    const right = item.options.findIndex((o) => o.correct);
    showOption(good ? opt : right, true);
    if (!good) {
      els.verdict.className = "choose-verdict is-bad";
      els.verdict.innerHTML = bi("✗ Chưa đúng. Từ đúng là “" + item.options[right].vi + "”.", "Not quite. The right one is “" + item.options[right].vi + "”.");
    }
    updateNav();
    updateScore();
  }

  function next() {
    if (index < set.items.length - 1) { index += 1; renderItem(); beep(); return; }
    if (mode === "practice") {
      els.doneCorrect.textContent = score.correct;
      els.doneTotal.textContent = score.total;
      els.done.hidden = false;
      beep(score.correct === score.total ? "good" : "beep");
    } else {
      index = 0; renderItem();
    }
  }

  function setMode(m) {
    mode = m;
    store.set("mode", m);
    document.querySelectorAll(".mode-btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === m)));
    startSet();
  }

  function showGloss(word) {
    const k = voice.key(word);
    const e = glossary.words && glossary.words[k];
    const lines = [];
    if (e) lines.push("<b>" + escapeHtml(k) + "</b> — " + escapeHtml(e.en) + (e.note ? ' <span class="gloss-note">(' + escapeHtml(e.note) + ")</span>" : ""));
    // phrases that are in the current sentence and contain this word
    const shown = words(els.sentence.textContent).map(voice.key);
    Object.keys(glossary.phrases || {}).forEach(function (ph) {
      const parts = ph.split(" ");
      if (parts.indexOf(k) === -1) return;
      for (let i = 0; i + parts.length <= shown.length; i++) {
        if (parts.every((p, j) => shown[i + j] === p)) { lines.push("<b>" + escapeHtml(ph) + "</b> — " + escapeHtml(glossary.phrases[ph].en)); break; }
      }
    });
    els.gloss.innerHTML = lines.join("<br>");
    els.gloss.hidden = !lines.length;
  }

  // ---------- events ----------
  els.options.addEventListener("click", function (e) {
    const b = e.target.closest(".ch-option");
    if (b) pick(Number(b.dataset.opt));
  });
  els.sentence.addEventListener("click", function (e) {
    const w = e.target.closest(".ch-word");
    if (!w) return;
    voice.unlock();
    els.sentence.querySelectorAll(".ch-word").forEach((x) => x.classList.toggle("is-tapped", x === w));
    showGloss(w.dataset.word);
    voice.word(set.id, w.dataset.word.replace(/[.,!?]/g, ""));
  });
  els.hear.addEventListener("click", function () {
    voice.unlock();
    if (picked !== null) voice.sentence(set.id, flatIndex(index, picked), filled(set.items[index], picked));
  });
  els.next.addEventListener("click", next);
  els.prev.addEventListener("click", function () { if (index > 0) { index -= 1; renderItem(); beep(); } });
  els.again.addEventListener("click", function () { beep(); startSet(); });
  els.set.addEventListener("change", startSet);
  document.querySelectorAll(".mode-btn").forEach((b) => b.addEventListener("click", function () { beep(); setMode(b.dataset.mode); }));

  // ---------- start ----------
  if (!sets.length) {
    els.sentence.textContent = "No workbook pages yet.";
    return;
  }
  setupSets();
  setMode(mode);
})();
