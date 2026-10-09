// Đọc Thơ: poem reader. Poem on the left (tap a line or a word), info and
// translations on the right. Clips come from ../audio (tools/make_voices.py
// treats each poem line as a sentence); the computer voice fills any gap.
(function () {
  const poems = window.VN_POEMS || [];
  const glossary = window.VN_GLOSSARY || { words: {}, phrases: {} };
  const voice = window.VNVoice;
  const $ = (id) => document.getElementById(id);
  const els = {
    poem: $("pm-poem"), page: $("pm-page"), title: $("pm-title"), titleEn: $("pm-title-en"),
    lines: $("pm-lines"), source: $("pm-source"), prev: $("pm-prev"), next: $("pm-next"),
    line: $("pm-line"), all: $("pm-all"), lineInfo: $("pm-line-info"), lineLabel: $("pm-line-label"),
    lineLabelEn: $("pm-line-label-en"), infoVi: $("pm-info-vi"), infoEn: $("pm-info-en"),
    words: $("pm-words"), notes: $("pm-notes")
  };
  const store = {
    get(k) { try { return localStorage.getItem("vnpoem:" + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem("vnpoem:" + k, v); } catch (e) { /* ignore */ } }
  };

  let poem = null;
  let current = -1;      // selected line (-1 = none yet)
  let pickedWord = null; // key of the tapped word
  let readingAll = false;
  let chain = 0;

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function beep() {
    document.dispatchEvent(new CustomEvent("educationstation:sound", { detail: { name: "beep" } }));
  }
  const key = (w) => voice.key(w);
  function tokens(text) { return text.split(/\s+/).filter(Boolean); }

  // ---------- poem (left) ----------
  function renderPoem() {
    els.page.textContent = "THƠ // TRANG " + poem.page;
    els.title.textContent = poem.title;
    els.titleEn.textContent = poem.titleEn || "";
    els.source.textContent = poem.source ? "(" + poem.source + ")" : "";
    els.lines.innerHTML = poem.lines.map(function (line, i) {
      const words = tokens(line.vi).map((w) =>
        '<button type="button" class="pm-word" data-word="' + escapeHtml(w) + '">' + escapeHtml(w) + "</button>").join(" ");
      return '<li class="pm-line" data-line="' + i + '"><span class="pm-num">' + (i + 1) + '</span><span class="pm-text">' + words + "</span></li>";
    }).join("");
  }

  // ---------- info (right) ----------
  function englishHtml(line, hits) {
    let html = escapeHtml(line.en);
    // mark the English that belongs to the tapped word
    hits.forEach(function (t) {
      const safe = escapeHtml(t);
      if (safe && html.indexOf(safe) !== -1) html = html.replace(safe, '<mark>' + safe + "</mark>");
    });
    return html;
  }

  function phrasesIn(line) {
    const ks = tokens(line.vi).map(key);
    return Object.keys(glossary.phrases || {}).filter(function (ph) {
      const parts = ph.split(" ");
      for (let i = 0; i + parts.length <= ks.length; i++) {
        if (parts.every((p, j) => ks[i + j] === p)) return true;
      }
      return false;
    });
  }

  function renderInfo() {
    if (current < 0) { els.lineInfo.hidden = true; return; }
    const line = poem.lines[current];
    const align = line.align || {};
    const hits = pickedWord && align[pickedWord] ? [].concat(align[pickedWord]) : [];
    els.lineInfo.hidden = false;
    els.lineLabel.textContent = "Dòng " + (current + 1);
    els.lineLabelEn.textContent = "Line " + (current + 1);
    els.infoVi.textContent = line.vi;
    els.infoEn.innerHTML = englishHtml(line, hits);

    const seen = [];
    const rows = [];
    tokens(line.vi).forEach(function (w) {
      const k = key(w);
      if (seen.indexOf(k) !== -1) return;
      seen.push(k);
      const e = glossary.words[k];
      rows.push('<li class="' + (k === pickedWord ? "is-picked" : "") + '" data-word="' + escapeHtml(k) + '">' +
        '<span class="w-vi">' + escapeHtml(k) + '</span><span class="w-en">' + escapeHtml(e ? e.en : "") + "</span></li>");
    });
    phrasesIn(line).forEach(function (ph) {
      const hit = pickedWord && ph.split(" ").indexOf(pickedWord) !== -1;
      rows.push('<li class="is-phrase' + (hit ? " is-picked" : "") + '" data-word="' + escapeHtml(ph) + '">' +
        '<span class="w-vi">' + escapeHtml(ph) + '</span><span class="w-en">' + escapeHtml(glossary.phrases[ph].en) + "</span></li>");
    });
    els.words.innerHTML = rows.join("");

    els.notes.innerHTML = (line.notes || []).map((n) =>
      '<p class="note"><span class="bi-vi">' + escapeHtml(n.vi) + '</span><span class="bi-en">' + escapeHtml(n.en) + "</span></p>").join("");
  }

  function markLeft() {
    els.lines.querySelectorAll(".pm-line").forEach(function (li, i) {
      li.classList.toggle("is-current", i === current);
      li.querySelectorAll(".pm-word").forEach((b) => b.classList.toggle("is-picked", i === current && key(b.dataset.word) === pickedWord));
    });
    els.prev.disabled = current <= 0;
    els.next.disabled = current >= poem.lines.length - 1;
    els.line.disabled = current < 0;
  }

  function select(i, word) {
    current = i;
    pickedWord = word || null;
    markLeft();
    renderInfo();
  }

  // ---------- speech ----------
  function stopAll() {
    readingAll = false;
    chain += 1;
    voice.stop();
    els.all.classList.remove("active");
    document.body.classList.remove("is-reading");
  }
  function sayLine(i, onend) {
    voice.sentence(poem.id, i, poem.lines[i].vi, onend);
  }
  function readAll() {
    if (readingAll) { stopAll(); return; }
    stopAll();
    readingAll = true;
    const id = chain;
    els.all.classList.add("active");
    document.body.classList.add("is-reading");
    const step = function (i) {
      if (id !== chain) return;
      if (i >= poem.lines.length) { stopAll(); return; }
      select(i);
      sayLine(i, function () { window.setTimeout(function () { step(i + 1); }, 450); });
    };
    step(0);
  }

  // ---------- events ----------
  els.lines.addEventListener("click", function (e) {
    const li = e.target.closest(".pm-line");
    if (!li) return;
    voice.unlock();
    stopAll();
    const i = Number(li.dataset.line);
    const w = e.target.closest(".pm-word");
    if (w) {
      select(i, key(w.dataset.word));
      voice.word(poem.id, w.dataset.word.replace(/[.,!?]/g, ""));
    } else {
      select(i);
      sayLine(i);
    }
  });
  els.words.addEventListener("click", function (e) {
    const li = e.target.closest("li");
    if (!li) return;
    voice.unlock();
    stopAll();
    const k = li.dataset.word;
    if (k.indexOf(" ") === -1) { select(current, k); }
    voice.word(poem.id, k); // phrases fall back to the computer voice
  });
  els.line.addEventListener("click", function () { voice.unlock(); stopAll(); if (current >= 0) { select(current); sayLine(current); } });
  els.prev.addEventListener("click", function () { voice.unlock(); stopAll(); beep(); if (current > 0) { select(current - 1); sayLine(current); } });
  els.next.addEventListener("click", function () {
    voice.unlock(); stopAll(); beep();
    if (current < poem.lines.length - 1) { select(current + 1); sayLine(current); }
  });
  els.all.addEventListener("click", function () { voice.unlock(); readAll(); });
  els.poem.addEventListener("change", function () { setPoem(Number(els.poem.value)); });

  function setPoem(i) {
    stopAll();
    poem = poems[i] || poems[0];
    store.set("poem", poem.id);
    current = 0; // start on line 1 so the info panel is never empty
    pickedWord = null;
    renderPoem();
    markLeft();
    renderInfo();
  }

  // ---------- start ----------
  if (!poems.length) { els.title.textContent = "No poems yet."; return; }
  els.poem.innerHTML = poems.map((p, i) => '<option value="' + i + '">Trang ' + p.page + " · " + escapeHtml(p.title) + "</option>").join("");
  els.poem.disabled = poems.length < 2;
  const saved = poems.findIndex((p) => p.id === store.get("poem"));
  els.poem.value = String(saved >= 0 ? saved : 0);
  setPoem(saved >= 0 ? saved : 0);
})();
