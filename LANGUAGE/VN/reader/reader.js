// Vietnamese read-along. Plays pre-generated clips from ../audio (VieNeu-TTS,
// see ../tools/make_voices.py) when a recorded voice is chosen, otherwise the
// browser's speechSynthesis in vi-VN. Reads one sentence, all sentences, or a
// single tapped word, highlighting the word being spoken.
(function () {
  const lesson = (window.VN_LESSONS || [])[0];
  const synth = window.speechSynthesis;
  const $ = (id) => document.getElementById(id);
  const els = {
    title: $("rd-title"), num: $("rd-num"), vi: $("rd-vi"), en: $("rd-en"), gloss: $("rd-gloss"),
    list: $("rd-list"), play: $("rd-play"), words: $("rd-words"), all: $("rd-all"), prev: $("rd-prev"), next: $("rd-next"),
    rate: $("rd-rate"), rateLabel: $("rd-rate-label"), english: $("rd-english"),
    voiceBtn: $("rd-voice-btn"), voiceName: $("rd-voice-name"), panel: $("rd-voice-panel"),
    status: $("rd-voice-status"), select: $("rd-voice-select"), allVoices: $("rd-voice-all"),
    test: $("rd-voice-test"), close: $("rd-voice-close"),
    source: $("rd-source"), sourceStatus: $("rd-source-status")
  };
  const recorded = ((window.VN_AUDIO && window.VN_AUDIO.voices) || []).filter((v) => v.lessons && v.lessons[lesson.id]);
  const player = new Audio();
  player.preload = "auto";
  if ("preservesPitch" in player) player.preservesPitch = true;
  const store = {
    get(k) { try { return localStorage.getItem("vnreader:" + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem("vnreader:" + k, v); } catch (e) { /* ignore */ } }
  };

  let index = 0;
  let voices = [];
  let voice = null;
  let playingAll = false;
  let showEnglish = store.get("english") !== "off";
  let wordSpans = [];
  let chainId = 0; // bumped by stopAll() to cancel a word-by-word read
  let source = null; // recorded voice id, or "tts"

  // ---------- voices ----------
  function isVietnamese(v) { return /^vi([-_]|$)/i.test(v.lang); }

  function rankVoice(v) {
    let score = 0;
    if (/premium|enhanced|natural|neural/i.test(v.name)) score += 4;
    if (/google/i.test(v.name)) score += 2;
    if (/linh/i.test(v.name)) score += 1;
    if (v.localService) score += 1;
    return score;
  }

  function loadVoices() {
    if (!synth) return;
    voices = synth.getVoices();
    const vi = voices.filter(isVietnamese).sort((a, b) => rankVoice(b) - rankVoice(a));
    const saved = store.get("voice");
    voice = vi.find((v) => v.voiceURI === saved) || vi[0] || null;

    els.select.innerHTML = vi.length
      ? vi.map((v) => '<option value="' + escapeHtml(v.voiceURI) + '">' + escapeHtml(v.name + " (" + v.lang + ")") + "</option>").join("")
      : '<option value="">No Vietnamese voice found</option>';
    if (voice) els.select.value = voice.voiceURI;

    els.allVoices.innerHTML = voices.map((v) =>
      "<li" + (isVietnamese(v) ? ' class="is-vi"' : "") + ">" + escapeHtml(v.name) + " — " + escapeHtml(v.lang) + (v.localService ? "" : " (online)") + "</li>"
    ).join("");

    updateVoiceStatus(vi.length);
    if (source) updateSourceLabel();
  }

  function updateVoiceStatus(viCount) {
    if (!synth) {
      els.voiceName.textContent = "No speech";
      els.status.textContent = "This browser has no text-to-speech (speechSynthesis) support.";
      els.voiceBtn.classList.add("warn");
      return;
    }
    if (voice) {
      els.voiceName.textContent = voice.name;
      els.voiceBtn.classList.remove("warn");
      els.status.textContent = "Found " + viCount + " Vietnamese voice" + (viCount === 1 ? "" : "s") + ". Using: " + voice.name + ".";
    } else {
      els.voiceName.textContent = "No Vietnamese voice";
      els.voiceBtn.classList.add("warn");
      els.status.innerHTML = "No Vietnamese voice is installed. The browser will guess, and it will sound wrong.<br>" +
        "Mac: System Settings → Accessibility → Spoken Content → System voice → Manage Voices → Vietnamese (Linh).<br>" +
        "iPad/iPhone: Settings → Accessibility → Spoken Content → Voices → Vietnamese.<br>Then reload this page.";
    }
  }

  // ---------- sources (recorded clips vs computer voice) ----------
  // With recorded voices, only those are offered; the computer voice is just a
  // silent fallback for any missing clip. Without recordings, computer voice only.
  function setupSources() {
    const saved = store.get("source");
    const ids = recorded.map((v) => v.id);
    source = ids.includes(saved) ? saved : (ids[0] || "tts");
    els.source.innerHTML = recorded.length
      ? recorded.map((v) => '<option value="' + escapeHtml(v.id) + '">' + escapeHtml(v.label) + "</option>").join("")
      : '<option value="tts">Computer voice (text-to-speech)</option>';
    els.source.value = source;
    els.source.disabled = recorded.length < 2;
    updateSourceLabel();
  }

  function currentRecorded() {
    return source === "tts" ? null : recorded.find((v) => v.id === source) || null;
  }

  function updateSourceLabel() {
    const rec = currentRecorded();
    if (rec) {
      els.voiceName.textContent = rec.label;
      els.voiceBtn.classList.remove("warn");
      els.sourceStatus.textContent = "Playing recorded clips. Words or sentences without a clip use the computer voice.";
    } else {
      els.sourceStatus.textContent = recorded.length ? "" : "No recorded voices yet. Run “Make Voices.command” in the VN folder.";
      updateVoiceStatus(voices.filter(isVietnamese).length);
    }
  }

  function clipFor(kind, key) {
    const rec = currentRecorded();
    if (!rec) return null;
    const data = rec.lessons[lesson.id];
    const path = kind === "sentence" ? data.sentences[key] : data.words[key];
    return path ? "../audio/" + encodeURI(path) : null;
  }

  // Play a clip. onTime(fraction) drives the estimated word highlight.
  function playClip(url, opts) {
    opts = opts || {};
    if (synth) synth.cancel();
    player.pause();
    player.onended = function () { clearSpeaking(); if (opts.onend) opts.onend(); };
    player.onerror = function () { if (opts.onerror) opts.onerror(); };
    player.ontimeupdate = opts.onTime ? function () {
      if (player.duration) opts.onTime(player.currentTime / player.duration);
    } : null;
    player.src = url;
    player.playbackRate = Math.max(0.5, Number(els.rate.value) / 0.8);
    document.body.classList.add("is-speaking");
    const p = player.play();
    if (p && p.catch) p.catch(function () { clearSpeaking(); if (opts.onerror) opts.onerror(); });
  }

  // Estimate which word is playing by spreading the clip over the letters.
  function highlightByFraction(fraction) {
    const lengths = wordSpans.map((w) => w.dataset.word.length + 1);
    const total = lengths.reduce((a, b) => a + b, 0);
    let acc = 0;
    const target = fraction * total * 1.05;
    let idx = wordSpans.length - 1;
    for (let i = 0; i < lengths.length; i++) { acc += lengths[i]; if (target < acc) { idx = i; break; } }
    wordSpans.forEach((w, i) => w.classList.toggle("speaking", i === idx));
  }

  function wordKey(word) {
    return word.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase().normalize("NFC");
  }

  // ---------- speaking ----------
  function speak(text, opts) {
    if (!synth) return;
    opts = opts || {};
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "vi-VN";
    if (voice) u.voice = voice;
    u.rate = Number(els.rate.value);
    u.onboundary = opts.onboundary || null;
    u.onend = function () { clearSpeaking(); if (opts.onend) opts.onend(); };
    u.onerror = function () { clearSpeaking(); playingAll = false; updateAllButton(); };
    document.body.classList.add("is-speaking");
    synth.speak(u);
  }

  function clearSpeaking() {
    document.body.classList.remove("is-speaking");
    wordSpans.forEach((s) => s.classList.remove("speaking"));
  }

  function speakSentence(onend) {
    const text = lesson.sentences[index][0];
    const clip = clipFor("sentence", index);
    if (clip) {
      playClip(clip, { onTime: highlightByFraction, onend: onend, onerror: function () { speakSentenceTts(text, onend); } });
      return;
    }
    speakSentenceTts(text, onend);
  }

  function speakSentenceTts(text, onend) {
    let lastSpan = null;
    speak(text, {
      onboundary: function (event) {
        if (event.name && event.name !== "word") return;
        const span = wordSpans.find((s) => event.charIndex >= +s.dataset.start && event.charIndex < +s.dataset.end);
        if (!span) return;
        if (lastSpan) lastSpan.classList.remove("speaking");
        span.classList.add("speaking");
        lastSpan = span;
      },
      onend: onend
    });
  }

  // Word by word: plays each word's own clip (or TTS) with exact highlighting.
  // Useful when the model gets a whole sentence wrong but single words right.
  function speakWords(onend) {
    const id = ++chainId;
    const spans = wordSpans.slice();
    let i = 0;
    const next = function () {
      if (id !== chainId) return;
      if (i >= spans.length) { clearSpeaking(); if (onend) onend(); return; }
      const span = spans[i++];
      spans.forEach((s) => s.classList.toggle("speaking", s === span));
      const plain = span.dataset.word.replace(/[.,!?]/g, "");
      const clip = clipFor("word", wordKey(plain));
      const after = function () { if (id === chainId) window.setTimeout(next, 220); };
      if (clip) playClip(clip, { onend: after, onerror: function () { speak(plain, { onend: after }); } });
      else speak(plain, { onend: after });
      document.body.classList.add("is-speaking");
      spans.forEach((s) => s.classList.toggle("speaking", s === span));
    };
    next();
  }

  function playAll() {
    if (playingAll) { stopAll(); return; }
    playingAll = true;
    updateAllButton();
    index = 0;
    render();
    const step = function () {
      if (!playingAll) return;
      speakSentence(function () {
        if (!playingAll) return;
        if (index >= lesson.sentences.length - 1) { stopAll(); return; }
        window.setTimeout(function () {
          if (!playingAll) return;
          index += 1;
          render();
          step();
        }, 700);
      });
    };
    step();
  }

  function stopAll() {
    playingAll = false;
    chainId += 1;
    if (synth) synth.cancel();
    player.pause();
    clearSpeaking();
    updateAllButton();
  }

  function updateAllButton() {
    els.all.textContent = playingAll ? "■ Dừng" : "▶▶ Đọc hết";
    els.all.classList.toggle("active", playingAll);
  }

  // ---------- rendering ----------
  function highlightFocus(word) {
    if (!lesson.focus) return escapeHtml(word);
    const re = new RegExp("(" + lesson.focus + ")", "gi");
    return escapeHtml(word).replace(re, '<span class="focus">$1</span>');
  }

  // ---------- English matching + glossary ----------
  const glossary = window.VN_GLOSSARY || { words: {}, phrases: {} };

  function alignFor(key) {
    const a = (lesson.align && lesson.align[index]) || {};
    const v = a[key];
    return v ? (Array.isArray(v) ? v : [v]) : [];
  }

  // Wrap each aligned English phrase in a span so it can light up.
  function englishHtml(en) {
    const a = (lesson.align && lesson.align[index]) || {};
    const texts = Array.from(new Set([].concat.apply([], Object.values(a)))).sort((x, y) => y.length - x.length);
    const ranges = [];
    texts.forEach(function (t) {
      const re = new RegExp("(^|[^\\p{L}])(" + t.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&") + ")(?=$|[^\\p{L}])", "u");
      const m = re.exec(en);
      if (!m) return;
      const start = m.index + m[1].length, end = start + t.length;
      if (ranges.some((r) => start < r.end && end > r.start)) return;
      ranges.push({ start: start, end: end, text: t });
    });
    ranges.sort((x, y) => x.start - y.start);
    let html = "", pos = 0;
    ranges.forEach(function (r) {
      html += escapeHtml(en.slice(pos, r.start)) + '<span class="en-part" data-text="' + escapeHtml(r.text) + '">' + escapeHtml(r.text) + "</span>";
      pos = r.end;
    });
    return html + escapeHtml(en.slice(pos));
  }

  // Light up the English for the word being spoken, else the last tapped word.
  function syncEnglish() {
    const active = els.vi.querySelector(".word.speaking") || els.vi.querySelector(".word.picked");
    const hits = active ? alignFor(wordKey(active.dataset.word)) : [];
    els.en.querySelectorAll(".en-part").forEach(function (sp) {
      sp.classList.toggle("en-hit", hits.indexOf(sp.dataset.text) !== -1);
    });
  }

  function showGloss(word) {
    const key = wordKey(word);
    const entry = glossary.words && glossary.words[key];
    const words = lesson.sentences[index][0].split(/\s+/).map(wordKey);
    const lines = [];
    if (entry) lines.push("<b>" + escapeHtml(key) + "</b> — " + escapeHtml(entry.en) + (entry.note ? ' <span class="gloss-note">(' + escapeHtml(entry.note) + ")</span>" : ""));
    Object.keys(glossary.phrases || {}).forEach(function (ph) {
      const parts = ph.split(" ");
      if (parts.indexOf(key) === -1) return;
      for (let i = 0; i + parts.length <= words.length; i++) {
        if (parts.every((p, j) => words[i + j] === p)) {
          lines.push("<b>" + escapeHtml(ph) + "</b> — " + escapeHtml(glossary.phrases[ph].en));
          break;
        }
      }
    });
    els.gloss.innerHTML = lines.join("<br>");
    els.gloss.hidden = !lines.length || !showEnglish;
  }

  function render() {
    const [vi, en] = lesson.sentences[index];
    els.num.textContent = index + 1;
    const parts = [];
    const re = /\S+/g;
    let m;
    while ((m = re.exec(vi))) {
      parts.push('<button type="button" class="word" data-start="' + m.index + '" data-end="' + (m.index + m[0].length) + '" data-word="' + escapeHtml(m[0]) + '">' + highlightFocus(m[0]) + "</button>");
    }
    els.vi.innerHTML = parts.join(" ");
    wordSpans = Array.from(els.vi.querySelectorAll(".word"));
    els.en.innerHTML = englishHtml(en);
    els.en.hidden = !showEnglish;
    els.gloss.hidden = true;
    els.gloss.innerHTML = "";
    els.prev.disabled = index === 0;
    els.next.disabled = index === lesson.sentences.length - 1;
    Array.from(els.list.children).forEach((b, i) => b.classList.toggle("current", i === index));
  }

  function renderList() {
    els.list.innerHTML = lesson.sentences.map((s, i) =>
      '<button type="button" class="list-item" data-index="' + i + '"><span class="list-num">' + (i + 1) + "</span><span>" + highlightFocus(s[0]) + "</span></button>"
    ).join("");
  }

  function go(i, autoplay) {
    stopAll();
    index = Math.max(0, Math.min(lesson.sentences.length - 1, i));
    render();
    if (autoplay) speakSentence();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function beep() {
    document.dispatchEvent(new CustomEvent("educationstation:sound", { detail: { name: "beep" } }));
  }

  // ---------- events ----------
  function clearPicked() {
    wordSpans.forEach((s) => s.classList.remove("picked"));
    els.gloss.hidden = true;
  }
  els.play.addEventListener("click", function () { stopAll(); clearPicked(); speakSentence(); });
  els.all.addEventListener("click", function () { clearPicked(); playAll(); });
  els.words.addEventListener("click", function () { stopAll(); clearPicked(); speakWords(); });
  els.prev.addEventListener("click", function () { beep(); go(index - 1, false); });
  els.next.addEventListener("click", function () { beep(); go(index + 1, false); });
  els.list.addEventListener("click", function (e) {
    const b = e.target.closest(".list-item");
    if (b) go(+b.dataset.index, true);
  });
  els.vi.addEventListener("click", function (e) {
    const w = e.target.closest(".word");
    if (!w) return;
    stopAll();
    wordSpans.forEach((s) => s.classList.remove("speaking", "picked"));
    w.classList.add("speaking", "picked");
    showGloss(w.dataset.word);
    const plain = w.dataset.word.replace(/[.,!?]/g, "");
    const clip = clipFor("word", wordKey(plain));
    if (clip) playClip(clip, { onerror: function () { speak(plain); } });
    else speak(plain);
  });

  els.rate.value = store.get("rate") || els.rate.value;
  els.rateLabel.textContent = Number(els.rate.value).toFixed(2).replace(/0$/, "") + "×";
  els.rate.addEventListener("input", function () {
    els.rateLabel.textContent = Number(els.rate.value).toFixed(2).replace(/0$/, "") + "×";
    store.set("rate", els.rate.value);
  });

  function applyEnglish() {
    els.english.textContent = "English: " + (showEnglish ? "on" : "off");
    els.english.setAttribute("aria-pressed", String(showEnglish));
    els.en.hidden = !showEnglish;
    if (!showEnglish) els.gloss.hidden = true;
  }
  els.english.addEventListener("click", function () {
    beep();
    showEnglish = !showEnglish;
    store.set("english", showEnglish ? "on" : "off");
    applyEnglish();
  });

  els.voiceBtn.addEventListener("click", function () {
    beep();
    loadVoices();
    els.panel.hidden = !els.panel.hidden;
    els.voiceBtn.setAttribute("aria-expanded", String(!els.panel.hidden));
  });
  els.close.addEventListener("click", function () { els.panel.hidden = true; els.voiceBtn.setAttribute("aria-expanded", "false"); });
  els.select.addEventListener("change", function () {
    voice = voices.find((v) => v.voiceURI === els.select.value) || voice;
    if (voice) store.set("voice", voice.voiceURI);
    updateVoiceStatus(voices.filter(isVietnamese).length);
  });
  els.test.addEventListener("click", function () { speak("Xin chào, em bé."); });
  els.source.addEventListener("change", function () {
    stopAll();
    source = els.source.value;
    store.set("source", source);
    updateSourceLabel();
  });

  document.addEventListener("keydown", function (e) {
    if (e.target.matches("input, select")) return;
    if (e.key === "ArrowRight") go(index + 1, true);
    else if (e.key === "ArrowLeft") go(index - 1, true);
    else if (e.key === " ") { e.preventDefault(); stopAll(); speakSentence(); }
  });

  window.addEventListener("pagehide", function () { if (synth) synth.cancel(); });

  new MutationObserver(syncEnglish).observe(els.vi, { subtree: true, attributes: true, attributeFilter: ["class"] });

  // ---------- start ----------
  els.title.textContent = lesson.title + (lesson.focus ? " · " + lesson.focus : "");
  renderList();
  render();
  applyEnglish();
  loadVoices();
  setupSources();
  if (synth && "onvoiceschanged" in synth) synth.addEventListener("voiceschanged", loadVoices);
  // Some browsers fill the voice list late without firing voiceschanged.
  window.setTimeout(loadVoices, 600);
  window.setTimeout(loadVoices, 2000);
})();
