(function () {
  if (document.body.dataset.game !== "vowel-customs") return;

  const $ = (id) => document.getElementById(id);
  const scene = $("vc-scene");
  const pax = $("vc-pax");
  const bubble = $("vc-bubble");
  const sentenceNode = $("vc-sentence");
  const translator = $("vc-translator");
  const wordNode = $("vc-word");
  const promptNode = $("vc-prompt");
  const hintButton = $("vc-hint");
  const hintNode = $("vc-hint-text");
  const choicesNode = $("vc-choices");
  const resultNode = $("vc-result");
  const nextButton = $("vc-next");
  const stamp = $("vc-stamp");
  const link = $("vc-link");
  const linkPath = $("vc-link-path");
  const linkStart = $("vc-link-start");
  const linkEnd = $("vc-link-end");
  const ready = $("vc-ready");
  const feedback = $("vc-feedback");
  const stageNode = $("vc-stage");
  const progressNode = $("vc-progress");
  const scoreNode = $("vc-score");
  const streakNode = $("vc-streak");

  // Older Safari (iPadOS 15 and earlier) has no container-query units, so the
  // CSS width min(100cqw, 150cqh) is dropped and the scene collapses to a dot.
  // Size the 3:2 scene from its holder here instead.
  if (!(window.CSS && CSS.supports && CSS.supports("width", "1cqw"))) {
    const holder = scene.parentElement;
    const fitScene = function () {
      const w = holder.clientWidth;
      const h = holder.clientHeight;
      if (!w || !h) return;
      const width = Math.floor(Math.min(w, h * 1.5));
      scene.style.width = width + "px";
      scene.style.height = Math.floor(width / 1.5) + "px";
    };
    if (window.ResizeObserver) new ResizeObserver(fitScene).observe(holder);
    window.addEventListener("resize", fitScene);
    fitScene();
  }

  // ---------- Vowel sounds ----------
  // Lowercase key = short vowel, uppercase key = long vowel.
  const SOUNDS = {
    a: { mark: "ă", name: "short a", key: "apple" },
    e: { mark: "ĕ", name: "short e", key: "egg" },
    i: { mark: "ĭ", name: "short i", key: "igloo" },
    o: { mark: "ŏ", name: "short o", key: "octopus" },
    u: { mark: "ŭ", name: "short u", key: "umbrella" },
    A: { mark: "ā", name: "long a", key: "acorn" },
    E: { mark: "ē", name: "long e", key: "eagle" },
    I: { mark: "ī", name: "long i", key: "ice" },
    O: { mark: "ō", name: "long o", key: "ocean" },
    U: { mark: "ū", name: "long u", key: "unicorn" }
  };
  const SHORT = ["a", "e", "i", "o", "u"];
  const LONG = ["A", "E", "I", "O", "U"];

  const STAGES = [
    { name: "Short", sounds: SHORT, goal: 6, intro: "Stage 1: short vowels, like apple, egg, igloo, octopus, umbrella." },
    { name: "Long", sounds: LONG, goal: 6, intro: "Stage 2: long vowels say their own name, like acorn, eagle, ice, ocean, unicorn." },
    { name: "Mixed", sounds: SHORT.concat(LONG), goal: Infinity, intro: "Stage 3: short and long vowels mixed together." }
  ];

  // Word spelling markup: [..] = the letters making the vowel sound,
  // (..) = a silent letter (the magic e). {w} in a sentence = the word.
  const WORDS = [
    // short a
    { w: "c[a]t", s: "a", say: "I am bringing my pet {w} on the trip." },
    { w: "m[a]p", s: "a", say: "My {w} shows the way to the moon." },
    { w: "h[a]t", s: "a", say: "Please do not squish my space {w}." },
    { w: "b[a]g", s: "a", say: "This {w} is full of moon snacks." },
    { w: "j[a]m", s: "a", say: "I packed a jar of star {w}." },
    { w: "v[a]n", s: "a", say: "My family drove here in a blue {w}." },
    { w: "cr[a]b", s: "a", say: "There is a space {w} in my box." },
    { w: "fl[a]g", s: "a", say: "I wave my planet {w} hello." },
    // short e
    { w: "b[e]d", s: "e", say: "I need a soft {w} after this trip." },
    { w: "p[e]t", s: "e", say: "Can my {w} come with me?" },
    { w: "[e]gg", s: "e", say: "I carry one green {w} from home." },
    { w: "j[e]t", s: "e", say: "I flew here on a fast {w}." },
    { w: "w[e]b", s: "e", say: "A spider made a {w} on my bag." },
    { w: "n[e]st", s: "e", say: "My bird is waiting in her {w}." },
    { w: "t[e]nt", s: "e", say: "We will camp in a {w} on Mars." },
    { w: "sl[e]d", s: "e", say: "I brought a {w} for the ice moon." },
    // short i
    { w: "p[i]g", s: "i", say: "My little {w} likes space mud." },
    { w: "f[i]sh", s: "i", say: "This {w} swims in a bubble tank." },
    { w: "s[i]x", s: "i", say: "I have {w} socks in my suitcase." },
    { w: "l[i]d", s: "i", say: "Please keep the {w} on my box." },
    { w: "k[i]t", s: "i", say: "I carry a fix-it {w} for my robot." },
    { w: "g[i]ft", s: "i", say: "I have a {w} for my friend." },
    { w: "m[i]lk", s: "i", say: "I drink moon {w} every day." },
    { w: "sh[i]p", s: "i", say: "My {w} is parked at gate nine." },
    // short o
    { w: "b[o]x", s: "o", say: "There is a robot in this {w}." },
    { w: "p[o]t", s: "o", say: "I cook soup in a big {w}." },
    { w: "s[o]ck", s: "o", say: "I lost one {w} on the rocket." },
    { w: "f[o]x", s: "o", say: "My pet {w} has a fluffy tail." },
    { w: "m[o]p", s: "o", say: "I clean my ship with a {w}." },
    { w: "fr[o]g", s: "o", say: "A {w} hopped into my bag." },
    { w: "r[o]ck", s: "o", say: "I found a shiny space {w}." },
    { w: "cl[o]ck", s: "o", say: "My {w} beeps when it is time to go." },
    // short u
    { w: "c[u]p", s: "u", say: "I need a {w} of warm cocoa." },
    { w: "b[u]s", s: "u", say: "I rode the space {w} to get here." },
    { w: "s[u]n", s: "u", say: "Your {w} is so bright today." },
    { w: "b[u]g", s: "u", say: "A tiny {w} is riding on my hat." },
    { w: "r[u]g", s: "u", say: "I rolled up my {w} to bring along." },
    { w: "dr[u]m", s: "u", say: "I play the {w} in my space band." },
    { w: "d[u]ck", s: "u", say: "My rubber {w} goes in the bath." },
    { w: "pl[u]m", s: "u", say: "I am eating a purple {w}." },
    // long a
    { w: "c[a]k(e)", s: "A", say: "I baked a {w} for my aunt." },
    { w: "r[ai]n", s: "A", say: "Does it {w} on your planet?" },
    { w: "d[ay]", s: "A", say: "What a great {w} to fly!" },
    { w: "g[a]t(e)", s: "A", say: "Which {w} is my rocket at?" },
    { w: "sn[ai]l", s: "A", say: "My pet {w} is very slow." },
    { w: "tr[ay]", s: "A", say: "I carry my snacks on a {w}." },
    { w: "pl[a]t(e)", s: "A", say: "I need a {w} for my space pizza." },
    { w: "c[a]p(e)", s: "A", say: "My hero {w} flaps when I run." },
    // long e
    { w: "f[ee]t", s: "E", say: "My {w} are tired from walking." },
    { w: "tr[ee]", s: "E", say: "I am bringing a tiny {w} to plant." },
    { w: "l[ea]f", s: "E", say: "I found a gold {w} on Venus." },
    { w: "s[ee]d", s: "E", say: "This {w} will grow a space flower." },
    { w: "b[ee]", s: "E", say: "A {w} is buzzing near my head." },
    { w: "j[ee]p", s: "E", say: "I will drive a moon {w}." },
    { w: "b[ea]ch", s: "E", say: "I want to visit your {w}." },
    { w: "t[ea]m", s: "E", say: "My {w} plays space soccer." },
    // long i
    { w: "b[i]k(e)", s: "I", say: "I folded my {w} into my bag." },
    { w: "k[i]t(e)", s: "I", say: "I want to fly my {w} up high." },
    { w: "p[ie]", s: "I", say: "Would you like some apple {w}?" },
    { w: "n[igh]t", s: "I", say: "I will sleep here for one {w}." },
    { w: "sl[i]d(e)", s: "I", say: "Is there a {w} at the park?" },
    { w: "f[i]v(e)", s: "I", say: "I have {w} bags to check." },
    { w: "l[igh]t", s: "I", say: "My helmet has a bright {w}." },
    { w: "d[i]m(e)", s: "I", say: "I only have one {w} left." },
    // long o
    { w: "b[oa]t", s: "O", say: "I sailed here on a star {w}." },
    { w: "h[o]m(e)", s: "O", say: "I miss my {w} on Pluto." },
    { w: "r[o]p(e)", s: "O", say: "I tie my bags with a {w}." },
    { w: "t[oa]st", s: "O", say: "I ate {w} for breakfast." },
    { w: "b[o]n(e)", s: "O", say: "My space dog wants a {w}." },
    { w: "n[o]s(e)", s: "O", say: "My {w} is cold from the trip." },
    { w: "r[oa]d", s: "O", say: "Which {w} goes to the city?" },
    { w: "sn[ow]", s: "O", say: "There is pink {w} on my planet." },
    // long u
    { w: "c[u]b(e)", s: "U", say: "I brought an ice {w} for my drink." },
    { w: "m[u]l(e)", s: "U", say: "My {w} carries my bags." },
    { w: "m[u]sic", s: "U", say: "I love to play loud {w}." },
    { w: "c[u]t(e)", s: "U", say: "Look at my {w} baby robot!" },
    { w: "h[u]g(e)", s: "U", say: "My suitcase is {w}." },
    { w: "f[u]s(e)", s: "U", say: "My ship needs a new {w}." },
    { w: "t[u]b(e)", s: "U", say: "I squeeze space food from a {w}." },
    { w: "fl[u]t(e)", s: "U", say: "I play the {w} for the stars." }
  ];

  // Alien alphabet: one glyph per letter, so a word is always written the
  // same way (sharp-eyed kids may crack the code).
  const GLYPHS = {
    a: "⏃", b: "⏚", c: "☊", d: "⎅", e: "⟒", f: "⎎", g: "☌", h: "⊑", i: "⟟", j: "⟊", k: "☍", l: "⌰", m: "⋔",
    n: "⋏", o: "⍜", p: "⌿", q: "⍾", r: "⍀", s: "⌇", t: "⏁", u: "⎍", v: "⎐", w: "⍙", x: "⌖", y: "⊬", z: "⋉"
  };

  const PAX_COUNT = 12;

  // ---------- State ----------
  let stageIndex = 0;
  let stageCorrect = 0;
  let score = 0;
  let streak = 0;
  let current = null;
  let answered = false;
  let busy = false;
  let lastPax = 0;
  const recentWords = [];
  let hintUsed = false;

  // ---------- Helpers ----------
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function playSound(name) {
    if (window.EducationStationSound && window.EducationStationSound.play) {
      return window.EducationStationSound.play(name);
    }
    document.dispatchEvent(new CustomEvent("educationstation:sound", { detail: { name } }));
    return null;
  }

  function plain(markup) {
    return markup.replace(/[\[\]()]/g, "");
  }

  function alienize(word) {
    return word.split("").map((ch) => GLYPHS[ch] || ch).join("");
  }

  function escapeHtml(text) {
    return text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));
  }

  // c[a]k(e) -> c<b class=vowel>a</b>k<i class=silent>e</i>
  function markedWord(markup) {
    return escapeHtml(markup)
      .replace(/\[([^\]]+)\]/g, '<b class="vowel-letters">$1</b>')
      .replace(/\(([^)]+)\)/g, '<i class="silent-letters">$1</i>');
  }

  // ---------- Speech ----------
  let voice = null;
  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    const voices = window.speechSynthesis.getVoices();
    voice = voices.find((v) => /en-US/i.test(v.lang) && /Samantha|Google US|Aria|Jenny/i.test(v.name)) ||
      voices.find((v) => /en-US/i.test(v.lang)) ||
      voices.find((v) => /^en/i.test(v.lang)) || null;
  }
  if ("speechSynthesis" in window) {
    pickVoice();
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
  }

  function speak(text, rate) {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (voice) utterance.voice = voice;
      utterance.lang = "en-US";
      utterance.rate = rate || 0.85;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      // Speech is a bonus; the game works without it.
    }
  }

  // The sound's classroom name in its own colour (long = amber, short =
  // green, same as the answer buttons), so the name sticks to the sound.
  function soundTag(key, nameOnly) {
    const sound = SOUNDS[key];
    const kind = key === key.toUpperCase() ? "long" : "short";
    return '<span class="sound-tag sound-' + kind + '">' + (nameOnly ? "" : sound.mark + " ") + sound.name + "</span>";
  }

  // ---------- Link line ----------
  // Boxes the alien word in the bubble and the decoded word in the
  // translator, joined by a line, so it's clear one is the other.
  let linkVisible = false;

  function showLink() {
    linkVisible = true;
    link.removeAttribute("hidden"); // SVG elements have no .hidden property
    wordNode.classList.add("linked");
    link.classList.remove("link-drawn");
    positionLink();
    void link.getBoundingClientRect();
    link.classList.add("link-drawn");
  }

  function hideLink() {
    linkVisible = false;
    link.setAttribute("hidden", "");
    link.classList.remove("link-drawn");
    wordNode.classList.remove("linked");
  }

  function positionLink() {
    const alien = document.getElementById("vc-alien");
    if (!linkVisible || !alien) return;
    const box = scene.getBoundingClientRect();
    const a = alien.getBoundingClientRect();
    const w = wordNode.getBoundingClientRect();
    link.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);
    const x1 = a.left + a.width / 2 - box.left;
    const y1 = a.bottom - box.top + 3;
    const x2 = w.left + w.width / 2 - box.left;
    const y2 = w.top - box.top - 3;
    const bend = Math.max(30, (y2 - y1) * 0.5);
    linkPath.setAttribute("d", "M" + x1 + " " + y1 + " C" + x1 + " " + (y1 + bend) + " " + x2 + " " + (y2 - bend) + " " + x2 + " " + y2);
    linkStart.setAttribute("cx", x1);
    linkStart.setAttribute("cy", y1);
    linkEnd.setAttribute("cx", x2);
    linkEnd.setAttribute("cy", y2);
  }

  // The translator grows (hint, result) and the stage rescales, so keep
  // the line attached.
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(positionLink);
    observer.observe(translator);
    observer.observe(bubble);
    observer.observe(scene);
  }
  window.addEventListener("resize", positionLink);

  // ---------- Rounds ----------
  function stage() {
    return STAGES[stageIndex];
  }

  function pickWord() {
    const pool = WORDS.filter((item) => stage().sounds.includes(item.s) && !recentWords.includes(item.w));
    const item = pool[rand(0, pool.length - 1)];
    recentWords.push(item.w);
    if (recentWords.length > 12) recentWords.shift();
    return item;
  }

  // Shuffle-bag: every traveler shows up once before anyone repeats.
  let paxBag = [];
  function pickPax() {
    if (!paxBag.length) {
      paxBag = Array.from({ length: PAX_COUNT }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
      if (paxBag[0] === lastPax) paxBag.push(paxBag.shift());
    }
    lastPax = paxBag.shift();
    return lastPax;
  }

  function updateHud() {
    stageNode.textContent = stage().name;
    progressNode.textContent = Number.isFinite(stage().goal) ? stageCorrect + "/" + stage().goal : "";
    scoreNode.textContent = score;
    streakNode.textContent = streak;
  }

  function renderChoices() {
    const rows = [];
    const sounds = stage().sounds;
    const groups = [
      { label: "Short", keys: SHORT.filter((k) => sounds.includes(k)) },
      { label: "Long", keys: LONG.filter((k) => sounds.includes(k)) }
    ].filter((group) => group.keys.length);
    groups.forEach(function (group) {
      rows.push('<div class="vowel-row"><span class="vowel-row-label">' + group.label + "</span>" +
        group.keys.map(function (key) {
          const sound = SOUNDS[key];
          return '<button type="button" class="vowel-choice ' + (key === key.toUpperCase() ? "long" : "short") +
            '" data-sound="' + key + '"><span class="vowel-mark">' + sound.mark +
            '</span><span class="vowel-key">' + sound.key + "</span></button>";
        }).join("") + "</div>");
    });
    choicesNode.innerHTML = rows.join("");
  }

  async function nextPassenger() {
    busy = true;
    answered = false;
    current = pickWord();
    const word = plain(current.w);

    bubble.hidden = true;
    translator.hidden = true;
    hideLink();
    stamp.hidden = true;
    resultNode.textContent = "";
    resultNode.className = "translator-result";
    nextButton.hidden = true;
    hintUsed = false;
    hintNode.textContent = "";
    hintNode.hidden = true;
    hintButton.disabled = false;

    // Walk up from the far end of the hall to the window.
    pax.src = "../assets/images/pax_" + pickPax() + ".png";
    pax.hidden = false;
    pax.className = "customs-pax pax-far";
    void pax.offsetWidth;
    pax.className = "customs-pax pax-arriving";
    feedback.textContent = "A passenger is coming to the booth.";
    await wait(1900);
    pax.className = "customs-pax pax-at-window";

    // They speak: an English sentence with one alien word.
    const parts = current.say.split("{w}");
    sentenceNode.innerHTML = escapeHtml(parts[0]) +
      '<span class="alien-word" id="vc-alien">' + alienize(word) + "</span>" + escapeHtml(parts[1] || "");
    bubble.hidden = false;
    playSound("beep");
    feedback.textContent = "The passenger used an alien word. Translating...";
    await wait(1100);

    // The translator selects the alien word and decodes it.
    const alien = document.getElementById("vc-alien");
    if (alien) alien.classList.add("selected");
    playSound("good");
    await wait(600);
    wordNode.textContent = word;
    renderChoices();
    translator.hidden = false;
    showLink();
    feedback.textContent = "Say the word. Which vowel sound is in it?";
    speak(word, 0.8);
    busy = false;
  }

  async function choose(key) {
    if (answered || busy || !current) return;
    answered = true;
    const right = current.s;
    const sound = SOUNDS[right];
    const correct = key === right;
    choicesNode.querySelectorAll("[data-sound]").forEach(function (button) {
      button.disabled = true;
      if (button.dataset.sound === right) button.classList.add("choice-correct");
      else if (button.dataset.sound === key) button.classList.add("choice-wrong");
    });
    wordNode.innerHTML = markedWord(current.w);

    const hasSilent = /\(/.test(current.w);
    const why = soundTag(right) + ", like " + sound.key +
      (hasSilent ? ". The magic e is silent." : ".");
    hintButton.disabled = true;
    if (correct) {
      score += hintUsed ? 5 : 10;
      streak += 1;
      stageCorrect += 1;
      resultNode.innerHTML = "✓ Correct! " + plain(current.w) + " has " + why;
      resultNode.className = "translator-result result-correct";
      stamp.textContent = "Approved";
      stamp.className = "customs-stamp stamp-approved";
      playSound("small_victory");
    } else {
      streak = 0;
      resultNode.innerHTML = "Not quite. " + plain(current.w) + " has " + why;
      resultNode.className = "translator-result result-wrong";
      stamp.textContent = "Corrected";
      stamp.className = "customs-stamp stamp-retry";
      playSound("error");
      window.setTimeout(() => speak(plain(current.w), 0.7), 500);
    }
    stamp.hidden = false;

    let levelUp = false;
    if (stageCorrect >= stage().goal && stageIndex < STAGES.length - 1) {
      stageIndex += 1;
      stageCorrect = 0;
      levelUp = true;
    }
    updateHud();
    feedback.textContent = levelUp ? "Stage up! " + stage().intro : "Press Next passenger when you're ready.";
    nextButton.hidden = false;
    nextButton.focus({ preventScroll: true });
  }

  async function leaveAndNext() {
    if (busy) return;
    busy = true;
    nextButton.hidden = true;
    translator.hidden = true;
    bubble.hidden = true;
    hideLink();
    stamp.hidden = true;
    pax.className = "customs-pax pax-leaving";
    playSound("beep");
    await wait(900);
    pax.hidden = true;
    busy = false;
    nextPassenger();
  }

  // ---------- Wiring ----------
  choicesNode.addEventListener("click", function (event) {
    const button = event.target.closest("[data-sound]");
    if (button) choose(button.dataset.sound);
  });
  nextButton.addEventListener("click", leaveAndNext);

  // Hint: the classroom name for the sound ("long e", "short o").
  // A correct answer after a hint scores 5 instead of 10.
  hintButton.addEventListener("click", function () {
    if (!current || answered) return;
    const sound = SOUNDS[current.s];
    hintUsed = true;
    hintNode.innerHTML = "Hint: " + soundTag(current.s, true) +
      (current.s === current.s.toUpperCase() ? " &mdash; the vowel says its own name" : "");
    hintNode.hidden = false;
    hintButton.disabled = true;
    playSound("beep");
  });
  $("vc-hear-word").addEventListener("click", function () {
    if (current) speak(plain(current.w), 0.75);
  });
  $("vc-hear-sentence").addEventListener("click", function () {
    if (current) speak(current.say.replace("{w}", plain(current.w)), 0.9);
  });
  ready.addEventListener("click", function () {
    ready.hidden = true;
    if (window.EducationStationSound && window.EducationStationSound.unlockAudio) {
      window.EducationStationSound.unlockAudio();
    }
    feedback.textContent = stage().intro;
    updateHud();
    nextPassenger();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !nextButton.hidden) {
      event.preventDefault();
      leaveAndNext();
    }
  });

  // Test hook: ?debug
  if (new URLSearchParams(location.search).has("debug")) {
    window.VowelCustomsDebug = {
      get current() { return current; },
      get busy() { return busy; },
      words: WORDS,
      setStage(index) { stageIndex = index; stageCorrect = 0; updateHud(); }
    };
  }

  updateHud();
})();
