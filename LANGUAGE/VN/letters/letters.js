// Ghép Chữ: the "Em ráp vần" page after each "Em học ghép chữ" unit.
// The pair is put together (ch + a = cha), then each vowel choice makes a word
// (à: chà) with the page's sample sentence.
// LEARN: tap a vowel to hear its word and see its sentence, English under
//        every word.
// QUIZ:  the word is missing from each sentence; pick it from 6 choices.
//        "Tất cả" (comprehensive) mixes every unit's sentences in one quiz.
(function () {
  const units = window.VNBook.pick(window.VN_LETTERS); // this book only
  const voice = window.VNVoice;
  const $ = (id) => document.getElementById(id);
  const els = {
    unit: $("lt-unit"), page: $("lt-page"), build: $("lt-build"), num: $("lt-num"), hear: $("lt-hear"),
    box: $("lt-box"), sentence: $("lt-sentence"), en: $("lt-en"), note: $("lt-note"), verdict: $("lt-verdict"),
    choices: $("lt-choices"), prev: $("lt-prev"), next: $("lt-next"), prompt: $("lt-prompt"), score: $("lt-score"),
    correct: $("lt-correct"), total: $("lt-total"), done: $("lt-done"), doneCorrect: $("lt-done-correct"),
    doneTotal: $("lt-done-total"), missed: $("lt-missed"), again: $("lt-again")
  };
  const store = {
    get(k) { try { return localStorage.getItem("vnletters:" + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem("vnletters:" + k, v); } catch (e) { /* ignore */ } }
  };
  const CHOICES = 6;

  let unit = null;
  // Quiz only for now: kids skipped Learn, so they learn by exploring after
  // each answer (tap words, hear the sentence). Set to "learn" to bring it back.
  let mode = "quiz";
  let cur = -1;          // LEARN: card shown (-1 = the pair only); QUIZ: position in order
  let order = [];        // QUIZ: {u: unit, i: card index}, shuffled
  let allUnits = false;  // comprehensive quiz over every unit
  let answered = false;
  let score = { correct: 0, total: 0 };
  let missed = [];

  // ---------- helpers ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function beep(name) { document.dispatchEvent(new CustomEvent("educationstation:sound", { detail: { name: name || "beep" } })); }
  function bi(vi, en) { return '<span class="bi-vi">' + esc(vi) + '</span><span class="bi-en">' + esc(en) + "</span>"; }
  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function tokens(card) { return card.sentence.normalize("NFC").split(/\s+/).filter(Boolean); }
  function bare(w) { return w.replace(/[.,!?;:…]/g, ""); }
  function cardIndex() { return mode === "quiz" ? order[cur].i : cur; }
  // clip numbers (same order as tools/make_voices.py)
  function sentenceClip(i) { return i; }
  function wordClip(i) { return unit.cards.length + i; }
  function buildClip(j) { return 2 * unit.cards.length + j; }
  function spoken(card) { return card.say || card.sentence.replace(/…/g, "").trim(); }

  // The sentence, one button per word with its English underneath.
  // targetHtml decides how the card's word shows (lit, blank, or the pick).
  function sentenceHtml(card, targetHtml) {
    const ws = tokens(card);
    els.sentence.classList.toggle("is-long", card.sentence.length > 22);
    const len = card.targetLen || 1;
    const out = [];
    for (let i = 0; i < ws.length; i++) {
      const w = ws[i];
      if (w === "…") { out.push('<span class="lt-dots">…</span>'); continue; }
      if (i === card.target) {
        // the card's word (or phrase): one button, English joined underneath
        const part = ws.slice(i, i + len);
        const last = part[part.length - 1];
        const core = part.slice(0, -1).concat(bare(last)).join(" ");
        const tail = last.slice(bare(last).length);
        const en = card.targetEn || card.wordsEn.slice(i, i + len).filter(Boolean).join(" ");
        out.push('<button type="button" class="lt-word" data-target="1" data-word="' + esc(core) + '">' +
          '<span class="w-vi">' + targetHtml(core) + esc(tail) + '</span><span class="w-en">' + esc(en) + "</span></button>");
        i += len - 1;
        continue;
      }
      const core = bare(w);
      out.push('<button type="button" class="lt-word" data-word="' + esc(core) + '">' +
        '<span class="w-vi">' + esc(w) + '</span><span class="w-en">' + esc(card.wordsEn[i] || "") + "</span></button>");
    }
    return out.join("");
  }
  const lit = (w) => '<span class="lt-v">' + esc(w) + "</span>";

  function boxHtml(card) {
    const pair = unit.build[0].parts ? unit.build[0].parts[0] : unit.build[0].result;
    // Bài Bốn's rows: "ch + o" and its two words, as printed (no single word)
    if (card.words) {
      return '<span class="lt-eq">' + esc(pair) + " + " + esc(card.vowel) + '</span><span class="lt-learnwords">' + card.words.map(esc).join(" · ") + "</span>";
    }
    let html = '<span class="lt-eq">' + esc(pair) + " + " + esc(card.vowel) + ' = <b>' + esc(card.word) + "</b></span>";
    if (card.spell) html += '<span class="lt-spell">' + esc(card.spell) + "</span>";
    return html;
  }

  // ---------- rendering ----------
  function setupUnits() {
    els.unit.innerHTML = units.map((u, i) => '<option value="' + i + '">' + esc(u.title) + " · Trang " + u.page + "</option>").join("") +
      (units.length > 1 ? '<option value="all">Tất cả · All units</option>' : "");
    const savedId = store.get(window.VNBook.key("unit"));
    const saved = units.findIndex((u) => u.id === savedId);
    els.unit.value = savedId === "all" && units.length > 1 ? "all" : String(saved >= 0 ? saved : 0);
    els.unit.disabled = units.length < 2;
  }

  function renderBuild() {
    els.build.innerHTML = unit.build.map((b, j) =>
      '<button type="button" class="lt-pair" data-build="' + j + '">' +
      (b.parts ? '<span class="lt-parts">' + b.parts.map(esc).join(" + ") + " =</span>" : "") +
      '<span class="lt-result">' + esc(b.result) + "</span>" +
      (b.parts ? "" : '<span class="lt-sound">(' + esc(b.sound) + ")</span>") + "</button>").join("");
  }

  function startUnit() {
    allUnits = els.unit.value === "all";
    unit = allUnits ? units[0] : units[Number(els.unit.value) || 0];
    store.set(window.VNBook.key("unit"), allUnits ? "all" : unit.id);
    showPage();
    renderBuild();
    score = { correct: 0, total: 0 };
    missed = [];
    els.done.hidden = true;
    if (mode === "quiz") {
      const items = [];
      (allUnits ? units : [unit]).forEach((u) => u.cards.forEach((_, i) => items.push({ u: u, i: i })));
      order = shuffle(items);
      cur = 0;
    } else { cur = -1; }
    render();
  }

  function showPage() {
    els.page.textContent = (allUnits ? "TẤT CẢ · " : "") + unit.title.toUpperCase() + " // TRANG " + unit.page;
  }

  function quizWords(want) {
    const others = shuffle(unit.pool.filter((w) => w !== want)).slice(0, CHOICES - 1);
    return shuffle([want].concat(others));
  }

  function renderChoices() {
    if (mode === "learn") {
      els.choices.classList.remove("is-phrases");
      els.choices.style.gridTemplateColumns = "repeat(" + unit.cards.length + ", 1fr)";
      els.choices.innerHTML = unit.cards.map((c, i) =>
        '<button type="button" class="lt-choice" data-card="' + i + '">' +
        '<span class="c-vowel">' + esc(c.vowel) + '</span><span class="c-word">' + (c.words ? c.words.map(esc).join("<br>") : esc(c.word)) + "</span></button>").join("");
      return;
    }
    const card = unit.cards[order[cur].i];
    const list = quizWords(card.word);
    els.choices.classList.toggle("is-phrases", list.some((w) => w.indexOf(" ") !== -1));
    els.choices.style.gridTemplateColumns = "repeat(" + list.length + ", 1fr)";
    els.choices.innerHTML = list.map((w) =>
      '<button type="button" class="lt-choice" data-word="' + esc(w) + '"><span class="c-vowel">' + esc(w) + "</span></button>").join("");
  }

  function showNote(card) {
    const n = card && card.note;
    els.note.hidden = !n;
    els.note.innerHTML = n ? bi(n.vi, n.en) : "";
  }

  function render() {
    voice.stop();
    gapTurn += 1;
    // comprehensive quiz: each question brings its own unit (pair, choices, clips)
    if (mode === "quiz" && order.length && order[cur].u !== unit) {
      unit = order[cur].u;
      renderBuild();
    }
    if (mode === "quiz") showPage();
    answered = false;
    els.verdict.hidden = true;
    renderChoices();
    const learn = mode === "learn";
    els.prev.style.visibility = learn ? "" : "hidden";
    els.num.hidden = learn;
    els.score.hidden = learn;
    els.correct.textContent = score.correct;
    els.total.textContent = score.total;
    if (learn) {
      if (cur < 0) {
        els.box.innerHTML = unit.rule ? '<span class="lt-rule">' + bi("Chú ý: " + unit.rule.vi, "Note: " + unit.rule.en) + "</span>" : "";
        els.sentence.innerHTML = "";
        els.en.innerHTML = "&nbsp;";
        els.hear.hidden = true;
        showNote(null);
        els.prompt.innerHTML = bi("Chạm vào một vần", "Tap a vowel");
      } else {
        const card = unit.cards[cur];
        els.box.innerHTML = boxHtml(card);
        els.sentence.innerHTML = sentenceHtml(card, lit);
        els.en.textContent = card.en;
        els.hear.hidden = false;
        showNote(card);
        els.prompt.innerHTML = bi("Chạm vào từng chữ để nghe", "Tap any word to hear it");
        els.choices.querySelectorAll(".lt-choice").forEach((b) => b.classList.toggle("is-picked", Number(b.dataset.card) === cur));
      }
      els.prev.disabled = cur <= 0 && unitIndex() === 0;
      els.next.disabled = false;
      els.next.innerHTML = bi("Tiếp ▶", "Next");
      return;
    }
    const card = unit.cards[order[cur].i];
    els.num.textContent = (cur + 1) + "/" + order.length;
    els.box.innerHTML = bi("Chữ nào còn thiếu?", "Which word is missing?");
    els.sentence.innerHTML = sentenceHtml(card, () => '<span class="lt-blank">____</span>');
    els.en.textContent = card.en;
    els.hear.hidden = false; // before answering it reads the sentence with a pause for the blank
    showNote(null);
    els.next.disabled = true;
    els.prompt.innerHTML = bi("Chọn một chữ", "Pick a word");
    els.next.innerHTML = cur === order.length - 1 ? bi("Xong ✓", "Done") : bi("Tiếp ▶", "Next");
  }

  function unitIndex() { return units.indexOf(unit); }

  // QUIZ, before answering: read the sentence word by word and leave a pause
  // where the missing word goes, so listening doesn't give the answer away.
  let gapTurn = 0;
  function sayWithGap(card) {
    const turn = ++gapTurn;
    const ws = tokens(card).filter((w) => w !== "…").map(bare);
    const t = tokens(card).slice(0, card.target).filter((w) => w !== "…").length;
    const before = ws.slice(0, t).join(" ");
    const after = ws.slice(t + (card.targetLen || 1)).join(" ");
    const id = unit.id;
    const thenAfter = function () {
      window.setTimeout(function () {
        if (turn === gapTurn && !answered && after) voice.word(id, after);
      }, 800);
    };
    if (before) voice.word(id, before, thenAfter); else { voice.stop(); thenAfter(); }
  }

  // ---------- actions ----------
  function pickLearn(i) {
    cur = i;
    render();
    beep("good");
    voice.sentence(unit.id, wordClip(i), unit.cards[i].word);
  }

  function pickQuiz(w, btn) {
    if (answered) return;
    answered = true;
    const want = order[cur].i;
    const card = unit.cards[want];
    const good = w === card.word;
    score.total += 1;
    if (good) score.correct += 1; else missed.push(card);
    els.choices.querySelectorAll(".lt-choice").forEach(function (b) {
      b.classList.add(b.dataset.word === card.word ? "is-right" : (b === btn ? "is-wrong" : "is-dim"));
    });
    els.sentence.innerHTML = sentenceHtml(card, (right) =>
      good ? '<span class="lt-fill is-good">' + esc(right) + "</span>" :
        '<span class="lt-fill is-bad">' + esc(w) + '</span> <span class="lt-fill is-good">' + esc(right) + "</span>");
    els.verdict.hidden = false;
    els.verdict.className = "choose-verdict " + (good ? "is-good" : "is-bad");
    els.verdict.innerHTML = good ? bi("✓ Đúng rồi!", "That's right!") :
      bi("✗ Chưa đúng. Chữ đúng là “" + card.word + "”.", "Not quite. The missing word is “" + card.word + "”.");
    els.box.innerHTML = boxHtml(card);
    showNote(card);
    els.next.disabled = false;
    els.prompt.innerHTML = "";
    els.correct.textContent = score.correct;
    els.total.textContent = score.total;
    beep(good ? "good" : "error");
    voice.sentence(unit.id, sentenceClip(want), spoken(card));
  }

  function next() {
    if (mode === "learn") {
      if (cur < unit.cards.length - 1) { pickLearn(cur + 1); return; }
      const u = unitIndex();
      els.unit.value = String(u < units.length - 1 ? u + 1 : 0);
      startUnit(); beep(); return;
    }
    if (cur < order.length - 1) { cur += 1; render(); beep(); return; }
    els.doneCorrect.textContent = score.correct;
    els.doneTotal.textContent = score.total;
    els.missed.hidden = !missed.length;
    els.missed.innerHTML = missed.length ? '<h3 class="bi">' + bi("Ôn lại", "Look at these again") + "</h3><ul>" +
      missed.map((c) => "<li><b>" + esc(c.word) + "</b> — " + esc(c.sentence) + " · " + esc(c.en) + "</li>").join("") + "</ul>" : "";
    els.done.hidden = false;
    beep(score.correct === score.total ? "good" : "beep");
  }

  function prev() {
    if (cur > 0) { pickLearn(cur - 1); return; }
    const u = unitIndex();
    if (u > 0) { els.unit.value = String(u - 1); startUnit(); pickLearn(unit.cards.length - 1); }
  }

  function setMode(m) {
    mode = m;
    document.querySelectorAll(".mode-btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === m)));
    startUnit();
  }

  // ---------- events ----------
  els.choices.addEventListener("click", function (e) {
    const b = e.target.closest(".lt-choice");
    if (!b) return;
    voice.unlock();
    if (mode === "learn") pickLearn(Number(b.dataset.card)); else pickQuiz(b.dataset.word, b);
  });
  els.build.addEventListener("click", function (e) {
    const b = e.target.closest(".lt-pair");
    if (!b) return;
    voice.unlock();
    const j = Number(b.dataset.build);
    voice.sentence(unit.id, buildClip(j), unit.build[j].say || unit.build[j].sound);
  });
  els.sentence.addEventListener("click", function (e) {
    const w = e.target.closest(".lt-word");
    if (!w) return;
    voice.unlock();
    if (mode === "quiz" && !answered && w.dataset.target) return; // the blank stays silent
    els.sentence.querySelectorAll(".lt-word").forEach((x) => x.classList.toggle("is-tapped", x === w));
    voice.word(unit.id, w.dataset.word);
  });
  els.hear.addEventListener("click", function () {
    voice.unlock();
    const i = cardIndex();
    if (mode === "quiz" && !answered) { sayWithGap(unit.cards[i]); return; }
    if (i >= 0) voice.sentence(unit.id, sentenceClip(i), spoken(unit.cards[i]));
  });
  els.next.addEventListener("click", function () { voice.unlock(); next(); });
  els.prev.addEventListener("click", function () { voice.unlock(); prev(); });
  els.again.addEventListener("click", function () { beep(); startUnit(); });
  els.unit.addEventListener("change", startUnit);
  document.querySelectorAll(".mode-btn").forEach((b) => b.addEventListener("click", function () { beep(); setMode(b.dataset.mode); }));

  // ---------- start ----------
  if (!units.length) { els.box.textContent = "Chưa có bài. No units yet."; return; }
  setupUnits();
  setMode(mode);
})();
