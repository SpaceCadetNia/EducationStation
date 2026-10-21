// Nghĩa Là Gì?: see a Vietnamese term, pick its English meaning.
// PRACTICE: try any answer, each one is explained; free navigation.
// QUIZ: terms in random order, one pick each, score and a list to review at the end.
(function () {
  const sets = window.VNBook.pick(window.VN_MEANINGS); // this book only
  const glossary = window.VN_GLOSSARY || { words: {}, phrases: {} };
  const voice = window.VNVoice;
  const CHOICES = 4;
  const $ = (id) => document.getElementById(id);
  const els = {
    set: $("mn-set"), page: $("mn-page"), instrVi: $("mn-instr-vi"), instrEn: $("mn-instr-en"),
    num: $("mn-num"), hear: $("mn-hear"), term: $("mn-term"), verdict: $("mn-verdict"),
    explain: $("mn-explain"), parts: $("mn-parts"), gloss: $("mn-gloss"), answers: $("mn-answers"),
    prev: $("mn-prev"), next: $("mn-next"), prompt: $("mn-prompt"), score: $("mn-score"),
    correct: $("mn-correct"), total: $("mn-total"), done: $("mn-done"), doneCorrect: $("mn-done-correct"),
    doneTotal: $("mn-done-total"), missed: $("mn-missed"), again: $("mn-again")
  };
  const store = {
    get(k) { try { return localStorage.getItem("vnmeaning:" + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem("vnmeaning:" + k, v); } catch (e) { /* ignore */ } }
  };

  let set = null;
  let mode = store.get("mode") === "quiz" ? "quiz" : "practice";
  let order = [];      // term indexes in the order they are shown
  let pos = 0;         // position in order
  let choices = [];    // per position: list of English strings (shuffled)
  let solved = false;  // the right answer has been picked / quiz item answered
  let score = { correct: 0, total: 0 };
  let missed = [];     // quiz: terms answered wrong

  // ---------- helpers ----------
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function beep(name) {
    document.dispatchEvent(new CustomEvent("educationstation:sound", { detail: { name: name || "beep" } }));
  }
  function bi(vi, en) {
    return '<span class="bi-vi">' + escapeHtml(vi) + '</span><span class="bi-en">' + escapeHtml(en) + "</span>";
  }
  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function words(text) { return text.split(/\s+/).filter(Boolean); }
  function bare(w) { return voice.key(w.replace(/[.,!?;:]/g, "")); }
  function term() { return set.terms[order[pos]]; }

  // Right answer plus wrong ones: the term's own "distractors", else other terms' meanings.
  function makeChoices(t) {
    const pool = (t.distractors && t.distractors.length ? t.distractors :
      set.terms.filter((x) => x !== t).map((x) => x.en)).filter((en) => en !== t.en);
    return shuffle([t.en].concat(shuffle(pool).slice(0, CHOICES - 1)));
  }

  // Break a term into glossary pieces: longest known phrase first, else the word.
  // If one phrase is the whole term, show its words instead (that's the lesson).
  function pieces(text) {
    const ws = words(text);
    const keys = ws.map(bare);
    const out = [];
    for (let i = 0; i < ws.length;) {
      let took = 0;
      for (let n = Math.min(4, ws.length - i); n >= 2 && !took; n--) {
        if (n === ws.length) continue; // whole term: split it up
        const ph = keys.slice(i, i + n).join(" ");
        if (glossary.phrases && glossary.phrases[ph]) { out.push({ vi: ws.slice(i, i + n).join(" "), en: glossary.phrases[ph].en }); took = n; }
      }
      if (!took) {
        const e = glossary.words && glossary.words[keys[i]];
        out.push({ vi: ws[i], en: e ? e.en : "" });
        took = 1;
      }
      i += took;
    }
    return out.map((p) => ({ vi: p.vi.replace(/[.,!?;:]/g, ""), en: p.en }));
  }

  // ---------- rendering ----------
  function setupSets() {
    els.set.innerHTML = sets.map((s, i) =>
      '<option value="' + i + '">Trang ' + s.page + " · " + escapeHtml(s.title) + "</option>").join("");
    const saved = sets.findIndex((s) => s.id === store.get(window.VNBook.key("set")));
    els.set.value = String(saved >= 0 ? saved : 0);
    els.set.disabled = sets.length < 2;
  }

  function startSet() {
    set = sets[Number(els.set.value) || 0];
    store.set(window.VNBook.key("set"), set.id);
    els.page.textContent = set.title.toUpperCase() + " // TRANG " + set.page;
    els.instrVi.textContent = set.instructions || "";
    els.instrEn.textContent = set.instructionsEn || "";
    const idx = set.terms.map((_, i) => i);
    order = mode === "quiz" ? shuffle(idx) : idx;
    choices = order.map((i) => makeChoices(set.terms[i]));
    pos = 0;
    score = { correct: 0, total: 0 };
    missed = [];
    els.done.hidden = true;
    render();
  }

  function render() {
    const t = term();
    solved = false;
    voice.stop();
    els.num.textContent = (pos + 1) + "/" + order.length;
    els.term.innerHTML = words(t.vi).map((w) =>
      '<button type="button" class="ch-word" data-word="' + escapeHtml(w) + '">' + escapeHtml(w) + "</button>").join(" ");
    els.term.classList.toggle("is-long", t.vi.length > 16);
    els.verdict.hidden = true;
    els.explain.hidden = true;
    els.parts.hidden = true;
    els.gloss.hidden = true;
    const list = choices[pos];
    els.answers.classList.toggle("is-long", list.some((en) => en.length > 28));
    els.answers.innerHTML = list.map((en, i) =>
      '<button type="button" class="mn-answer" data-i="' + i + '">' + escapeHtml(en) + "</button>").join("");
    els.prev.disabled = pos === 0;
    els.prev.style.visibility = mode === "quiz" ? "hidden" : ""; // no going back to re-answer
    updateNav();
    updateScore();
  }

  function updateNav() {
    const last = pos === order.length - 1;
    if (mode === "practice") {
      els.next.disabled = false;
      els.prompt.innerHTML = solved ? bi("Đọc lại và nhớ nghĩa", "Say it again and remember the meaning") :
        bi("Nghĩa là gì?", "What does it mean?");
    } else {
      els.next.disabled = !solved;
      els.prompt.innerHTML = solved ? "" : bi("Chọn nghĩa đúng", "Pick the right meaning");
    }
    els.next.innerHTML = last ? bi("Xong ✓", "Done") : bi("Tiếp ▶", "Next");
  }

  function updateScore() {
    els.score.hidden = mode !== "quiz";
    els.correct.textContent = score.correct;
    els.total.textContent = score.total;
  }

  function showParts(t) {
    const ps = t.parts ? t.parts.map((x) => ({ vi: x[0], en: x[1] })) : pieces(t.vi);
    els.parts.innerHTML = ps.map((p) => '<span class="mn-part">' + bi(p.vi, p.en || "…") + "</span>").join("") +
      (t.note ? '<p class="meaning-note">' + escapeHtml(t.note) + "</p>" : "");
    els.parts.hidden = false;
  }

  // What the picked English belongs to, if it is another term on this page.
  function explainWrong(en) {
    const other = set.terms.find((x) => x.en === en);
    return other ? "<i>“" + escapeHtml(en) + "”</i> là <b>" + escapeHtml(other.vi.replace(/[.!?]$/, "")) + "</b>" +
      '<br><span class="bi-en">“' + escapeHtml(en) + "” is " + escapeHtml(other.vi.replace(/[.!?]$/, "")) + "</span>" : "";
  }

  // ---------- actions ----------
  function pick(i, btn) {
    voice.unlock();
    const t = term();
    const en = choices[pos][i];
    const good = en === t.en;
    if (mode === "quiz" && solved) return;
    els.verdict.hidden = false;
    els.verdict.className = "choose-verdict " + (good ? "is-good" : "is-bad");
    if (mode === "practice") {
      btn.classList.add(good ? "is-right" : "is-wrong");
      if (good) {
        solved = true;
        els.verdict.innerHTML = bi("✓ Đúng rồi!", "That's right!");
        els.explain.hidden = true;
        showParts(t);
        els.answers.querySelectorAll(".mn-answer:not(.is-right)").forEach((b) => b.classList.add("is-dim"));
        voice.sentence(set.id, order[pos], t.vi);
        beep("good");
      } else {
        els.verdict.innerHTML = bi("✗ Chưa đúng, thử lại", "Not this one, try again");
        const why = explainWrong(en);
        els.explain.innerHTML = why;
        els.explain.hidden = !why;
        beep("beep");
      }
      updateNav();
      return;
    }
    // quiz: one pick, then show the right answer and its parts
    solved = true;
    score.total += 1;
    if (good) score.correct += 1; else missed.push(t);
    els.answers.querySelectorAll(".mn-answer").forEach(function (b) {
      const e = choices[pos][Number(b.dataset.i)];
      if (e === t.en) b.classList.add("is-right");
      else if (b === btn) b.classList.add("is-wrong");
      else b.classList.add("is-dim");
    });
    els.verdict.innerHTML = good ? bi("✓ Đúng rồi!", "That's right!") :
      bi("✗ Chưa đúng. Nghĩa là “" + t.en + "”.", "Not quite. It means “" + t.en + "”.");
    els.explain.hidden = true;
    showParts(t);
    voice.sentence(set.id, order[pos], t.vi);
    beep(good ? "good" : "error");
    updateNav();
    updateScore();
  }

  function go(to) {
    pos = to;
    render();
    beep();
    voice.unlock();
    voice.sentence(set.id, order[pos], term().vi); // inside the tap, so it can play
  }

  function next() {
    if (pos < order.length - 1) { go(pos + 1); return; }
    if (mode === "quiz") {
      els.doneCorrect.textContent = score.correct;
      els.doneTotal.textContent = score.total;
      els.missed.hidden = !missed.length;
      els.missed.innerHTML = missed.length ? '<h3 class="bi">' + bi("Ôn lại", "Look at these again") + "</h3><ul>" +
        missed.map((t) => "<li><b>" + escapeHtml(t.vi) + "</b> — " + escapeHtml(t.en) + "</li>").join("") + "</ul>" : "";
      els.done.hidden = false;
      beep(score.correct === score.total ? "good" : "beep");
    } else {
      go(0);
    }
  }

  function setMode(m) {
    mode = m;
    store.set("mode", m);
    document.querySelectorAll(".mode-btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === m)));
    startSet();
  }

  function showGloss(word) {
    const k = bare(word);
    const e = glossary.words && glossary.words[k];
    els.gloss.innerHTML = e ? "<b>" + escapeHtml(k) + "</b> — " + escapeHtml(e.en) +
      (e.note ? ' <span class="gloss-note">(' + escapeHtml(e.note) + ")</span>" : "") : "";
    els.gloss.hidden = !e;
  }

  // ---------- events ----------
  els.answers.addEventListener("click", function (e) {
    const b = e.target.closest(".mn-answer");
    if (b) pick(Number(b.dataset.i), b);
  });
  els.term.addEventListener("click", function (e) {
    const w = e.target.closest(".ch-word");
    if (!w) return;
    voice.unlock();
    els.term.querySelectorAll(".ch-word").forEach((x) => x.classList.toggle("is-tapped", x === w));
    // Quiz: hear the word, but no meaning until it's answered.
    if (mode === "practice" || solved) showGloss(w.dataset.word);
    voice.word(set.id, bare(w.dataset.word));
  });
  els.hear.addEventListener("click", function () { voice.unlock(); voice.sentence(set.id, order[pos], term().vi); });
  els.next.addEventListener("click", next);
  els.prev.addEventListener("click", function () { if (pos > 0) go(pos - 1); });
  els.again.addEventListener("click", function () { beep(); startSet(); });
  els.set.addEventListener("change", startSet);
  document.querySelectorAll(".mode-btn").forEach((b) => b.addEventListener("click", function () { beep(); setMode(b.dataset.mode); }));

  // ---------- start ----------
  if (!sets.length) {
    els.term.textContent = "Chưa có bài. No pages yet.";
    els.answers.innerHTML = "";
    return;
  }
  setupSets();
  setMode(mode);
})();
