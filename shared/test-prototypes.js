(function () {
  if (document.body.dataset.game !== "test") return;

  const params = new URLSearchParams(window.location.search);
  const mode = params.get("game") || "mastermind";
  const workspace = document.getElementById("test-workspace");
  const feedback = document.getElementById("test-feedback");
  const title = document.getElementById("test-title");
  const system = document.getElementById("test-system");
  const scoreNode = document.getElementById("test-score");
  const levelNode = document.getElementById("test-level");
  let score = 0;
  let level = 1;

  const names = {
    mastermind: ["Signal Code", "DEDUCTION ARRAY"],
    typing: ["Lunar Keys", "RESOURCE HARVEST"],
    rhythm: ["Key Echo", "CASE RECALL"],
    bonds: ["Number Bonds", "SYNTHESIS CHAMBER"],
    radio: ["Radio Scope", "SIGNAL TRIANGULATION"],
    packing: ["Cargo Fractions", "MANIFEST PACKER"]
  };

  function play(name) {
    document.dispatchEvent(new CustomEvent("educationstation:sound", { detail: { name } }));
  }

  function setHeader(name) {
    title.textContent = names[name][0];
    system.textContent = "TEST // " + names[name][1];
    document.title = names[name][0] + " - EducationStation";
  }

  function setScore(delta) {
    score += delta;
    scoreNode.textContent = score;
  }

  function setLevel(value) {
    level = value;
    levelNode.textContent = level;
  }

  function button(label, attrs) {
    const extra = attrs || "";
    return '<button type="button" class="command-button" ' + extra + ">" + label + "</button>";
  }

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function choice(values) {
    return values[rand(0, values.length - 1)];
  }

  function initMastermind() {
    setHeader("mastermind");
    const symbols = ["▲", "■", "●", "◆"];
    let secret = [];
    let guess = [];
    let tries = 0;
    let hintMode = false;
    let solved = false;

    function newCode() {
      secret = Array.from({ length: 4 }, () => choice(symbols));
      guess = [];
      tries = 0;
      solved = false;
      draw();
      animateMysteryCode();
      feedback.textContent = "Find the code.";
    }

    function scoreGuess() {
      if (solved || guess.length !== 4) return;
      tries += 1;
      let exact = 0;
      let near = 0;
      const usedSecret = [];
      const usedGuess = [];
      for (let i = 0; i < 4; i += 1) {
        if (guess[i] === secret[i]) {
          exact += 1;
          usedSecret[i] = true;
          usedGuess[i] = true;
        }
      }
      for (let i = 0; i < 4; i += 1) {
        if (usedGuess[i]) continue;
        for (let j = 0; j < 4; j += 1) {
          if (!usedSecret[j] && guess[i] === secret[j]) {
            near += 1;
            usedSecret[j] = true;
            break;
          }
        }
      }
      const wrong = 4 - exact - near;
      const displayGuess = guess.map((symbol, index) => {
        if (hintMode && symbol === secret[index]) {
          return '<span class="signal-hint-check">✓</span>';
        }
        return symbol;
      }).join(" ");
      const row = document.createElement("div");
      row.className = "test-history-row";
      row.innerHTML = [
        '<span class="signal-history-guess">' + displayGuess + '</span>',
        '<span>' + exact + '</span>',
        '<span>' + near + '</span>',
        '<span>' + wrong + '</span>'
      ].join("");
      workspace.querySelector(".test-history").prepend(row);
      if (exact === 4) {
        solved = true;
        setScore(Math.max(5, 40 - tries * 5));
        setLevel(level + 1);
        play("small_victory");
        feedback.textContent = "Signal code solved.";
        revealSolvedCode();
      } else {
        play("beep");
        feedback.textContent = "Adjust the abstract pattern.";
        guess = [];
        updateGuess();
      }
    }

    function updateGuess() {
      workspace.querySelector(".signal-current").textContent = guess.join(" ") || "_ _ _ _";
    }

    function animateMysteryCode() {
      const slots = Array.from(workspace.querySelectorAll(".signal-code-slot"));
      slots.forEach((slot, index) => {
        slot.textContent = "_";
        window.setTimeout(function () {
          slot.textContent = "*";
        }, 160 + index * 190);
      });
    }

    function revealSolvedCode() {
      const card = workspace.querySelector(".signal-code-card");
      const slots = Array.from(workspace.querySelectorAll(".signal-code-slot"));
      if (card) card.classList.add("signal-code-solved");
      slots.forEach((slot, index) => {
        window.setTimeout(function () {
          slot.textContent = secret[index];
          slot.classList.add("signal-code-slot-revealed");
        }, 180 + index * 240);
      });
    }

    function draw() {
      workspace.innerHTML = [
        '<div class="test-layout two-col">',
        '<div class="line-card signal-code-card"><div class="signal-code-center"><div class="signal-code-mystery" aria-label="Hidden code"><span class="signal-code-slot">_</span><span class="signal-code-slot">_</span><span class="signal-code-slot">_</span><span class="signal-code-slot">_</span></div><p class="signal-code-instruction">Find the code</p><div class="prototype-big signal-current">_ _ _ _</div><div class="signal-entry-panel"><div class="test-controls signal-symbol-controls">',
        symbols.map((symbol) => button(symbol, 'data-symbol="' + symbol + '"')).join(""),
        '</div><div class="signal-action-stack">',
        button("Scan", 'data-action="scan"'),
        button("Clear", 'data-action="clear"'),
        button("Next", 'data-action="next"'),
        "</div></div></div></div>",
        '<div class="line-card signal-feedback-card"><div class="signal-feedback-top"><label class="hint-toggle"><input type="checkbox" id="hint-mode"> <span>Hint Mode</span></label><div class="signal-feedback-head"><span></span><span>Correct</span><span>Near</span><span>Wrong</span></div></div><div class="test-history"></div></div>',
        "</div>"
      ].join("");
      workspace.querySelector("#hint-mode").checked = hintMode;
      workspace.querySelector("#hint-mode").addEventListener("change", function (event) {
        hintMode = event.target.checked;
      });
      workspace.querySelectorAll("[data-symbol]").forEach((item) => {
        item.addEventListener("click", function () {
          if (guess.length >= 4) return;
          guess.push(item.dataset.symbol);
          updateGuess();
        });
      });
      workspace.querySelector('[data-action="clear"]').addEventListener("click", function () {
        guess = [];
        updateGuess();
      });
      workspace.querySelector('[data-action="scan"]').addEventListener("click", scoreGuess);
      workspace.querySelector('[data-action="next"]').addEventListener("click", newCode);
    }

    newCode();
  }

  function initTyping() {
    setHeader("typing");
    const wordSets = {
      a: ["alien", "atlas"],
      b: ["base", "beacon"],
      c: ["cargo", "comet"],
      d: ["dock", "drift"],
      e: ["earth", "engine"],
      f: ["flare", "fuel"],
      g: ["galaxy", "glide"],
      h: ["hatch", "hover"],
      i: ["ice", "ion"],
      j: ["jet", "jump"],
      k: ["key", "kite"],
      l: ["laser", "lunar"],
      m: ["module", "moon"],
      n: ["nebula", "north"],
      o: ["orbit", "ore"],
      p: ["planet", "probe"],
      q: ["quest", "quiet"],
      r: ["radar", "rover"],
      s: ["solar", "star"],
      t: ["telescope", "trail"],
      u: ["under", "unit"],
      v: ["valve", "vector"],
      w: ["water", "wing"],
      x: ["box", "six"],
      y: ["yard", "yellow"],
      z: ["zero", "zone"]
    };
    const words = Object.values(wordSets).flat();
    const totalRounds = 6;
    let target = "";
    let repeats = 0;
    let completedRounds = 0;
    let timer = 100;
    let decay = null;

    function decayInterval() {
      return Math.max(90, 300 - (level - 1) * 22);
    }

    workspace.innerHTML = [
      '<div class="line-card typing-field lunar-keys-field">',
      '<div class="lunar-status-panel"><div class="lunar-input-dock"><input class="test-input" id="typing-input" inputmode="text" autocomplete="off" autocapitalize="none" spellcheck="false"></div>',
      '<div class="prototype-big" id="typing-target"></div>',
      '<div class="lunar-progress"><span id="typing-progress">0 / 3</span><span id="typing-countdown">100%</span></div>',
      '<div class="lunar-rounds" id="typing-rounds" aria-label="Word rounds"></div>',
      '<div class="decay-bar"><span id="decay-fill"></span></div>',
      '<pre class="ascii-map">[ rover ] ----> [ target zone ] ----> [ resource ]</pre></div></div>'
    ].join("");
    const field = document.querySelector(".lunar-keys-field");
    const input = document.getElementById("typing-input");
    const targetNode = document.getElementById("typing-target");
    const progressNode = document.getElementById("typing-progress");
    const countdownNode = document.getElementById("typing-countdown");
    const roundsNode = document.getElementById("typing-rounds");
    const fill = document.getElementById("decay-fill");

    function updateTypingStatus() {
      targetNode.textContent = target;
      progressNode.textContent = repeats + " / 3";
      countdownNode.textContent = Math.max(0, timer) + "%";
      fill.style.width = Math.max(0, timer) + "%";
      roundsNode.innerHTML = Array.from({ length: totalRounds }, function (_, index) {
        const checked = index < completedRounds;
        return '<span class="' + (checked ? "complete" : "") + '">' + (checked ? "✓" : "") + "</span>";
      }).join("");
    }

    function settleKeyboardLayout() {
      field.classList.add("keyboard-active");
    }

    function finishTypingRun() {
      window.clearInterval(decay);
      target = "COMPLETE";
      repeats = 3;
      timer = 100;
      input.value = "";
      input.disabled = true;
      updateTypingStatus();
      play("small_victory");
      feedback.textContent = "Lunar Keys complete. Take a rest point.";
    }

    function nextWord() {
      if (completedRounds >= totalRounds) {
        finishTypingRun();
        return;
      }

      target = choice(words);
      repeats = 0;
      timer = 100;
      updateTypingStatus();
      input.value = "";
      try {
        input.focus({ preventScroll: true });
      } catch (error) {
        input.focus();
      }
      settleKeyboardLayout();
      feedback.textContent = "Enter target name on keyboard three times before it decays.";
      window.clearInterval(decay);
      decay = window.setInterval(function () {
        timer -= 1;
        updateTypingStatus();
        if (timer <= 0) {
          play("error");
          nextWord();
        }
      }, decayInterval());
    }

    input.addEventListener("input", function () {
      if (input.value.trim().toLowerCase() !== target) return;
      repeats += 1;
      input.value = "";
      play("beep");
      updateTypingStatus();
      if (repeats >= 3) {
        completedRounds += 1;
        setScore(10);
        setLevel(level + 1);
        play("small_victory");
        nextWord();
      }
    });
    input.addEventListener("focus", function () {
      settleKeyboardLayout();
    });
    input.addEventListener("blur", function () {
      field.classList.remove("keyboard-active");
    });
    nextWord();
  }

  function initRhythm() {
    setHeader("rhythm");
    const keys = ["a", "s", "d", "f", "j", "k", "l"];
    const beatMs = 560;
    const coachLines = ["HELLO!", "I AM SIMON", "AND I SAY", "ARE YOU READY FOR A WORKOUT?", "FOLLOW ME!"];
    const praise = [
      "GREAT!", "GOOD!", "WHOAH!", "NICE!", "YES!", "POWER!", "SHARP!", "BRAVO!", "BOLD!", "SOLID!",
      "ON BEAT!", "FAST!", "FOCUS!", "ACE!", "BOOM!", "SUPER!", "CLEAN!", "LOCKED!", "ROCKET!", "PERFECT!"
    ];
    let sequence = makeSequence(3);
    let index = 0;
    let listening = false;
    let cueing = false;
    let introPlayed = false;
    let errors = 0;
    let listenStartedAt = 0;

    workspace.innerHTML = [
      '<div class="line-card center-card key-echo-card"><div class="key-echo-coach" id="echo-coach">KEY ECHO</div>',
      '<div class="prototype-big" id="echo-sequence"></div>',
      '<div class="key-echo-input" id="echo-input" aria-live="polite"></div>',
      '<div class="key-echo-stats"><span>Errors: <strong id="echo-errors"></strong></span><span>Speed: <strong id="echo-speed">-- WPM</strong></span></div>',
      button("Ready", 'id="play-cue"'),
      '<input class="key-echo-capture" id="echo-capture" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" inputmode="text" aria-label="Key Echo input"></div>'
    ].join("");
    const captureInput = document.getElementById("echo-capture");
    const echoCard = workspace.querySelector(".key-echo-card");

    function makeSequence(length) {
      const next = Array.from({ length }, () => {
        const key = choice(keys);
        return Math.random() < 0.35 ? key.toUpperCase() : key;
      });
      if (!next.some((key) => key === key.toUpperCase())) {
        const position = rand(0, next.length - 1);
        next[position] = next[position].toUpperCase();
      }
      return next;
    }

    function show() {
      document.getElementById("echo-sequence").textContent = sequence.join(" ");
      document.getElementById("echo-input").textContent = "";
      updateStats();
      feedback.textContent = "Press Enter or Ready to hear the cue, then match the keys and casing.";
    }

    function updateStats(speed) {
      document.getElementById("echo-errors").innerHTML = errors
        ? Array.from({ length: Math.min(errors, 12) }, () => '<span class="echo-error-dot"></span>').join("")
        : '<span class="echo-error-none">none</span>';
      document.getElementById("echo-speed").textContent = speed ? speed + " WPM" : "-- WPM";
    }

    function runCoachIntro(done) {
      const coach = document.getElementById("echo-coach");
      let delay = 0;
      coachLines.forEach((line) => {
        window.setTimeout(function () {
          coach.textContent = line;
          coach.classList.remove("echo-coach-pop");
          void coach.offsetWidth;
          coach.classList.add("echo-coach-pop");
          play("beep");
        }, delay);
        delay += line.length > 18 ? 1150 : 760;
      });
      window.setTimeout(function () {
        play("workout_music_1");
        countdown(done);
      }, delay + 240);
    }

    function countdown(done) {
      const coach = document.getElementById("echo-coach");
      [3, 2, 1].forEach((number, pos) => {
        window.setTimeout(function () {
          coach.textContent = String(number);
          coach.classList.remove("echo-countdown-pop");
          void coach.offsetWidth;
          coach.classList.add("echo-countdown-pop");
          play("beep");
        }, pos * 650);
      });
      window.setTimeout(function () {
        coach.textContent = "ECHO!";
        done();
      }, 2100);
    }

    function startCueFlow() {
      if (cueing) return;
      if (echoCard) echoCard.classList.add("key-echo-started");
      focusCapture();
      if (!introPlayed) {
        cueing = true;
        listening = false;
        introPlayed = true;
        runCoachIntro(function () {
          cueing = false;
          playCue();
        });
        return;
      }
      countdown(playCue);
    }

    function playCue(keepErrors) {
      if (cueing) return;
      cueing = true;
      listening = false;
      index = 0;
      if (!keepErrors) errors = 0;
      updateStats();
      let i = 0;
      const node = document.getElementById("echo-sequence");
      document.getElementById("echo-input").textContent = "";
      feedback.textContent = "Echo incoming.";
      const interval = window.setInterval(function () {
        node.textContent = sequence.map((key, pos) => pos === i ? "[" + key + "]" : key).join(" ");
        play("beep");
        i += 1;
        if (i >= sequence.length) {
          window.clearInterval(interval);
          window.setTimeout(function () {
            node.textContent = sequence.join(" ");
            listening = true;
            cueing = false;
            focusCapture();
            listenStartedAt = performance.now();
            feedback.textContent = "Repeat the keys. Uppercase means hold Shift.";
          }, 500);
        }
      }, beatMs);
    }

    function flashPraise() {
      const node = document.getElementById("echo-coach");
      node.textContent = choice(praise);
      node.classList.remove("key-echo-shout-flash");
      void node.offsetWidth;
      node.classList.add("key-echo-shout-flash");
    }

    function speedWpm() {
      const elapsedMinutes = Math.max((performance.now() - listenStartedAt) / 60000, 0.01);
      return Math.max(1, Math.round((sequence.length / 5) / elapsedMinutes));
    }

    function focusCapture() {
      if (!captureInput) return;
      try {
        captureInput.focus({ preventScroll: true });
      } catch (error) {
        captureInput.focus();
      }
    }

    function clearCapture() {
      if (captureInput) captureInput.value = "";
    }

    function handleEchoKey(key) {
      if (!listening || !keys.includes(key.toLowerCase()) || key.length !== 1) return;
      document.getElementById("echo-input").textContent += key + " ";
      clearCapture();
      if (key !== sequence[index]) {
        errors += 1;
        updateStats();
        play("error");
        listening = false;
        feedback.textContent = "Key or casing drift. Watch again.";
        document.getElementById("echo-input").textContent = "";
        window.setTimeout(function () {
          focusCapture();
          playCue(true);
        }, 650);
        return;
      }
      index += 1;
      play("beep");
      if (index >= sequence.length) {
        const speed = speedWpm();
        updateStats(speed);
        setScore(10);
        setLevel(level + 1);
        play("small_victory");
        flashPraise();
        sequence = makeSequence(Math.min(7, 3 + level));
        errors = 0;
        listening = false;
        window.setTimeout(function () {
          show();
          startCueFlow();
        }, 1700);
      }
    }

    document.getElementById("play-cue").addEventListener("click", startCueFlow);
    captureInput.addEventListener("input", function () {
      const typed = captureInput.value;
      if (!typed) return;
      handleEchoKey(typed.slice(-1));
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !listening) {
        event.preventDefault();
        startCueFlow();
        return;
      }
      if (event.target === captureInput) return;
      handleEchoKey(event.key);
    });
    show();
  }

  function initBonds() {
    setHeader("bonds");
    let round = null;
    let subSelected = [];
    let topSelected = [];
    let selectedCompound = null;
    let subOpen = false;
    let resolvedMissing = null;
    let animating = false;
    let solved = false;

    function newRound() {
      if (level % 2 === 0) {
        const a = rand(3, 12);
        const b = rand(3, 12);
        const target = a + b;
        const topKnown = choice([a, b]);
        const missing = target - topKnown;
        const values = [
          { value: target, kind: "compound" },
          { value: missing, kind: "number" },
          { value: rand(3, 12), kind: "number" },
          { value: rand(4, 13), kind: "number" },
          { value: target + rand(1, 4), kind: "compound" }
        ];
        round = { mode: "decompose", target, topKnown, missing, values };
      } else {
        const target = rand(18, 30);
        const topKnown = rand(7, Math.min(12, target - 8));
        const missing = target - topKnown;
        const subA = rand(2, missing - 2);
        const subB = missing - subA;
        const values = [
          { value: topKnown, kind: "number" },
          { value: subA, kind: "number" },
          { value: subB, kind: "number" },
          { value: rand(2, 9), kind: "number" },
          { value: rand(4, 12), kind: "number" }
        ];
        round = { mode: "synthesis", target, topKnown, missing, subA, subB, values };
      }
      resetRoundState();
      draw();
      feedback.textContent = round.mode === "decompose"
        ? "Pick the compound and the missing element."
        : "Pick a top-level number and ?. Then open ? to build it.";
    }

    function resetRoundState() {
      subSelected = [];
      topSelected = round.mode === "decompose" ? [{ kind: "number", value: round.topKnown }, null] : [];
      selectedCompound = null;
      subOpen = false;
      resolvedMissing = null;
      animating = false;
      solved = false;
    }

    function topLabel(item) {
      if (!item) return "?";
      if (item.kind === "mystery") return resolvedMissing === null ? "?" : String(resolvedMissing);
      return String(item.value);
    }

    function expression(items) {
      return topLabel(items[0]) + " + " + topLabel(items[1]);
    }

    function expressionMarkup(items) {
      return [0, 1].map((index) => {
        return '<span class="' + bondSlotClass(items[index]) + '" id="top-slot-' + index + '">' + topLabel(items[index]) + "</span>";
      }).join('<span class="bond-plus">+</span>');
    }

    function bondSlotClass(item) {
      if (!item) return "bond-slot bond-slot-unknown";
      if (item.kind === "mystery") {
        return "bond-slot " + (resolvedMissing === null && subOpen ? "bond-slot-subcompound" : "bond-slot-compound");
      }
      return "bond-slot bond-slot-element";
    }

    function compoundLabel() {
      if (round.mode === "synthesis") return String(round.target);
      return selectedCompound === null ? "?" : String(selectedCompound.value);
    }

    function compoundClass() {
      if (round.mode === "decompose" && selectedCompound === null) return "diagram-unknown";
      return "diagram-compound";
    }

    function diagramPartClass(index) {
      const item = topSelected[index];
      if (!item) return "diagram-node diagram-part diagram-unknown";
      if (item.kind === "mystery") {
        return "diagram-node diagram-part " + (resolvedMissing === null && subOpen ? "diagram-subcompound" : "diagram-compound");
      }
      return "diagram-node diagram-part diagram-element";
    }

    function selectedTopNumber() {
      const found = topSelected.find((item) => item.kind === "number");
      return found ? found.value : null;
    }

    function expectedMissing() {
      const topNumber = selectedTopNumber();
      return topNumber === null ? null : round.target - topNumber;
    }

    function diagramMarkup() {
      return [
        '<div class="bond-diagram-title">BOND GRAPH</div>',
        '<div class="bond-diagram" id="bond-diagram">',
        '<div class="diagram-node diagram-total ' + compoundClass() + '" id="diagram-total">' + compoundLabel() + "</div>",
        '<div class="diagram-line diagram-line-left"></div>',
        '<div class="diagram-line diagram-line-right"></div>',
        '<div class="' + diagramPartClass(0) + ' diagram-part-left" id="diagram-part-0">' + topLabel(topSelected[0]) + "</div>",
        '<div class="' + diagramPartClass(1) + ' diagram-part-right" id="diagram-part-1">' + topLabel(topSelected[1]) + "</div>",
        "</div>"
      ].join("");
    }

    function draw() {
      workspace.innerHTML = [
        '<div class="bond-lab-bg" aria-hidden="true"></div>',
        '<div class="line-card bond-game-layout"><div class="bond-synth-panel"><div class="prototype-big">' + (round.mode === "decompose" ? "DECOMPOSE: ? = " + round.topKnown + " + ?" : "SYNTHESIZE: " + round.target + " = ? + ?") + "</div>",
        '<div class="bond-zone top-bond-zone" id="bond-zone"><span class="bond-target-compound ' + (round.mode === "decompose" ? "bond-target-unknown" : "") + '" id="compound-slot">' + compoundLabel() + '</span><span>=</span><span id="top-expression">' + expressionMarkup(topSelected) + "</span></div>",
        '<div class="sub-bonder" id="sub-bonder" ' + (subOpen ? "" : "hidden") + '><strong>SUB-BONDER</strong><div id="sub-bond-zone"></div></div>',
        '<div class="number-cloud">',
        round.values.map((item, index) => '<button type="button" class="number-orb ' + (item.kind === "compound" ? "compound-orb" : "") + '" data-kind="' + item.kind + '" data-value="' + item.value + '" data-index="' + index + '">' + item.value + "</button>").join(""),
        round.mode === "synthesis" ? '<button type="button" class="number-orb mystery-orb" data-mystery="?">?</button>' : "",
        "</div>",
        '<div class="test-controls bond-actions">' + button("Restart", 'data-action="restart"') + "</div></div>",
        '<aside class="bond-diagram-panel">' + diagramMarkup() + "</aside></div>"
      ].join("");
      workspace.querySelectorAll(".number-orb").forEach((orb) => {
        orb.addEventListener("click", function () {
          if (animating) return;
          if (round.mode === "decompose") {
            handleDecomposePick(orb);
            return;
          }
          if (subOpen) {
            if (orb.dataset.mystery) return;
            if (orb.classList.contains("sub-selected")) return;
            const value = Number(orb.dataset.value);
            const slot = document.getElementById("sub-slot-" + subSelected.length);
            animating = true;
            flyValue(orb, slot, value, function () {
              subSelected.push(value);
              orb.classList.add("sub-selected");
              updateSubBond();
              animating = false;
              if (subSelected.length === 2) window.setTimeout(checkSubBond, 500);
            });
            return;
          }
          if (topSelected.length >= 2) return;
          const slotIndex = topSelected.length;
          const slot = document.getElementById("top-slot-" + slotIndex);
          if (orb.dataset.mystery) {
            if (selectedTopNumber() === null) {
              feedback.textContent = "Pick a top-level number first, then open ?.";
              play("beep");
              return;
            }
            animating = true;
            flyValue(orb, slot, "?", function () {
              topSelected.push({ kind: "mystery", value: null });
              subOpen = true;
              orb.classList.add("selected");
              updateTopBond();
              animating = false;
              feedback.textContent = "Build the ? using two numbers from the same pool.";
            });
          } else {
            const value = Number(orb.dataset.value);
            animating = true;
            flyValue(orb, slot, value, function () {
              topSelected.push({ kind: "number", value });
              orb.classList.add("selected");
              updateTopBond();
              animating = false;
              if (topSelected.length === 2 && !topSelected.some((item) => item.kind === "mystery")) window.setTimeout(checkTopBond, 500);
            });
          }
        });
      });
      workspace.querySelector('[data-action="restart"]').addEventListener("click", restartRound);
      updateSubBond();
    }

    function restartRound() {
      if (animating) return;
      resetRoundState();
      draw();
      feedback.textContent = round.mode === "decompose"
        ? "Round restarted. Pick the compound and the missing element."
        : "Round restarted. Pick a top-level number and ?.";
      play("beep");
    }

    function flyValue(source, target, value, done) {
      if (!source || !target) {
        done();
        return;
      }
      const sourceRect = source.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const flyer = document.createElement("span");
      flyer.className = "bond-flyer";
      flyer.textContent = value;
      flyer.style.left = sourceRect.left + sourceRect.width / 2 + "px";
      flyer.style.top = sourceRect.top + sourceRect.height / 2 + "px";
      document.body.appendChild(flyer);
      window.requestAnimationFrame(function () {
        flyer.style.left = targetRect.left + targetRect.width / 2 + "px";
        flyer.style.top = targetRect.top + targetRect.height / 2 + "px";
      });
      window.setTimeout(function () {
        flyer.remove();
        done();
      }, 620);
    }

    function updateTopBond() {
      const compoundSlot = document.getElementById("compound-slot");
      if (compoundSlot) {
        compoundSlot.textContent = compoundLabel();
        compoundSlot.classList.toggle("bond-target-unknown", round.mode === "decompose" && selectedCompound === null);
      }
      document.getElementById("top-expression").innerHTML = expressionMarkup(topSelected);
      updateDiagram();
      const bonder = document.getElementById("sub-bonder");
      if (bonder) bonder.hidden = !subOpen;
      updateSubBond();
    }

    function updateDiagram() {
      const left = document.getElementById("diagram-part-0");
      const right = document.getElementById("diagram-part-1");
      const total = document.getElementById("diagram-total");
      if (!left || !right) return;
      if (total) {
        total.textContent = compoundLabel();
        total.className = "diagram-node diagram-total " + compoundClass();
      }
      left.textContent = topLabel(topSelected[0]);
      right.textContent = topLabel(topSelected[1]);
      left.className = diagramPartClass(0) + " diagram-part-left";
      right.className = diagramPartClass(1) + " diagram-part-right";
    }

    function updateSubBond() {
      const node = document.getElementById("sub-bond-zone");
      if (!node) return;
      node.innerHTML = '<span class="bond-slot ' + (subSelected[0] ? "bond-slot-element" : "bond-slot-unknown") + '" id="sub-slot-0">' + (subSelected[0] || "?") + '</span><span class="bond-plus">+</span><span class="bond-slot ' + (subSelected[1] ? "bond-slot-element" : "bond-slot-unknown") + '" id="sub-slot-1">' + (subSelected[1] || "?") + "</span>";
    }

    function handleDecomposePick(orb) {
      if (orb.classList.contains("selected")) return;
      const value = Number(orb.dataset.value);
      if (orb.dataset.kind === "compound") {
        if (selectedCompound !== null) return;
        const slot = document.getElementById("compound-slot");
        animating = true;
        flyValue(orb, slot, value, function () {
          selectedCompound = { kind: "compound", value };
          orb.classList.add("selected");
          updateTopBond();
          animating = false;
          if (topSelected[1]) window.setTimeout(checkTopBond, 500);
        });
        return;
      }
      if (topSelected[1]) return;
      const slot = document.getElementById("top-slot-1");
      animating = true;
      flyValue(orb, slot, value, function () {
        topSelected[1] = { kind: "number", value };
        orb.classList.add("selected");
        updateTopBond();
        animating = false;
        if (selectedCompound !== null) window.setTimeout(checkTopBond, 500);
      });
    }

    function checkSubBond() {
      const sum = subSelected.reduce((total, value) => total + value, 0);
      const expected = expectedMissing();
      if (expected === null) {
        play("error");
        feedback.textContent = "Pick a top-level number before building the ?.";
        restartRound();
        return;
      }
      document.getElementById("sub-bond-zone").textContent = subSelected.join(" + ") + " -> " + sum;
      if (sum === expected) {
        animating = true;
        play("small_victory");
        feedback.textContent = subSelected.join(" + ") + " -> " + sum + ". Folding into the top-level bond.";
        window.setTimeout(function () {
          const source = document.getElementById("sub-bond-zone");
          const targetIndex = topSelected.findIndex((item) => item.kind === "mystery");
          const target = document.getElementById("top-slot-" + targetIndex);
          flyValue(source, target, sum, function () {
            resolvedMissing = sum;
            subOpen = false;
            updateTopBond();
            animating = false;
            feedback.textContent = sum + " appears at the top-level ?. Now synthesize.";
            if (topSelected.length === 2) window.setTimeout(checkTopBond, 900);
          });
        }, 900);
      } else {
        play("error");
        feedback.textContent = "Sub-bond unstable.";
        window.setTimeout(function () {
          workspace.querySelectorAll(".sub-selected").forEach((orb) => orb.classList.remove("sub-selected"));
          subSelected = [];
          updateSubBond();
        }, 700);
      }
    }

    function checkTopBond() {
      if (round.mode === "decompose") {
        if (selectedCompound === null || !topSelected[1]) return;
        if (selectedCompound.value === round.target && topSelected[1].value === round.missing) {
          solveBond(topLabel(topSelected[0]) + " + " + topLabel(topSelected[1]) + " -> " + selectedCompound.value);
        } else {
          resetFailedBond();
        }
        return;
      }
      if (topSelected.length !== 2 || topSelected.some((item) => item.kind === "mystery") && resolvedMissing === null) return;
      const sum = topSelected.reduce((total, item) => {
        return total + (item.kind === "mystery" ? resolvedMissing : item.value);
      }, 0);
      if (sum === round.target) {
        solveBond(expression(topSelected) + " -> " + round.target);
      } else {
        resetFailedBond();
      }
    }

    function solveBond(message) {
      solved = true;
      animating = true;
      setScore(10);
      setLevel(level + 1);
      play("small_victory");
      feedback.textContent = message + ". CORRECT!";
      const layout = workspace.querySelector(".bond-game-layout");
      const zone = document.getElementById("bond-zone");
      if (layout) layout.classList.add("bond-solved");
      if (zone) zone.classList.add("bond-correct");
      window.setTimeout(newRound, 2600);
    }

    function resetFailedBond() {
      play("error");
      feedback.textContent = "Top-level bond unstable.";
      window.setTimeout(function () {
        workspace.querySelectorAll(".selected").forEach((orb) => orb.classList.remove("selected"));
        workspace.querySelectorAll(".sub-selected").forEach((orb) => orb.classList.remove("sub-selected"));
        subSelected = [];
        resolvedMissing = null;
        selectedCompound = null;
        topSelected = round.mode === "decompose" ? [{ kind: "number", value: round.topKnown }, null] : [];
        subOpen = false;
        updateTopBond();
      }, 700);
    }

    newRound();
  }

  function initRadio() {
    setHeader("radio");
    let targetAngle = rand(10, 170);
    let targetTune = rand(2, 9);
    let lastDistance = null;
    let freePlay = false;
    let scannedFreeSource = null;
    const radioTracks = ["radio_music_1", "radio_music_2", "radio_music_3", "radio_music_4", "radio_music_5", "radio_music_6", "radio_music_7", "radio_music_8"];
    const freePlaySources = [
      { track: "radio_music_1", angle: 18, tune: 8 },
      { track: "radio_music_2", angle: 39, tune: 5 },
      { track: "radio_music_3", angle: 61, tune: 9 },
      { track: "radio_music_4", angle: 84, tune: 3 },
      { track: "radio_music_5", angle: 107, tune: 7 },
      { track: "radio_music_6", angle: 129, tune: 4 },
      { track: "radio_music_7", angle: 151, tune: 6 },
      { track: "radio_music_8", angle: 169, tune: 2 }
    ];
    const radioTrackTitles = {
      radio_music_1: "RTURN TO CORDELIA 8BT",
      radio_music_2: "KITTY WORLD 8BT",
      radio_music_3: "DESERT WORLD 8BT",
      radio_music_4: "APOLLO 11 HIST",
      radio_music_5: "SPACE KEYS 8BT",
      radio_music_6: "DANCING STARPORTS 8BT",
      radio_music_7: "ASTRO JELLY 8BT",
      radio_music_8: "EASY SIGNAL 8BT"
    };

    workspace.innerHTML = [
      '<div class="test-layout two-col">',
      '<div class="scope line-card"><div class="scope-grid"><div class="scope-camera-window"><img class="scope-camera" src="../assets/images/dish_cam.png" alt=""><div class="scope-dish-rig"><img class="scope-dish-base" src="../assets/images/dish_base.png" alt=""><img class="scope-dish" id="scope-dish" src="../assets/images/dish.png" alt=""></div></div><div class="radio-decode-field" id="radio-decode-field">DATA LINK IDLE</div><div id="scope-distance-circle"></div><div id="scope-free-sources"></div><div id="scope-markers"></div><div id="scope-ray"></div><div id="scope-dot">?</div><div class="radio-free-label" id="radio-free-label" hidden>FREE PLAY</div></div></div>',
      '<div class="line-card"><label>Elevation <span id="angle-readout">90 DEGREES</span><input type="range" id="angle" min="0" max="180" value="90"></label>',
      '<label>Focal Distance Tune <span id="range-readout">1.42 GHz</span><input type="range" id="range" min="1" max="10" value="5"></label>',
      '<div class="signal-panel"><span>Target Signal</span><pre id="target-signal"></pre><span>Receiver Signal</span><div class="receiver-signal-box"><pre id="receiver-signal"></pre><div id="receiver-amplitude-line"></div></div></div>',
      '<div class="test-controls">' + button("Scan", 'id="scan-scope"') + button("Free Play", 'id="free-play-scope"') + button("Play Again", 'id="play-radio-again" hidden') + "</div>",
      '<pre id="scope-log"></pre></div></div>',
      '<div class="radio-data-popup" id="radio-data-popup" hidden><div><p>Connection Success!</p><button type="button" class="command-button" id="play-radio-data">Play Data</button></div></div>'
    ].join("");
    const angle = document.getElementById("angle");
    const range = document.getElementById("range");
    const scopeGrid = document.querySelector(".scope-grid");
    const ray = document.getElementById("scope-ray");
    const dish = document.getElementById("scope-dish");
    const distanceCircle = document.getElementById("scope-distance-circle");
    const markers = document.getElementById("scope-markers");
    const freeSourceLayer = document.getElementById("scope-free-sources");
    const log = document.getElementById("scope-log");
    const angleReadout = document.getElementById("angle-readout");
    const rangeReadout = document.getElementById("range-readout");
    const targetSignal = document.getElementById("target-signal");
    const receiverSignal = document.getElementById("receiver-signal");
    const amplitudeLine = document.getElementById("receiver-amplitude-line");
    const decodeField = document.getElementById("radio-decode-field");
    const radioPopup = document.getElementById("radio-data-popup");
    const playDataButton = document.getElementById("play-radio-data");
    const playAgainButton = document.getElementById("play-radio-again");
    const freePlayButton = document.getElementById("free-play-scope");
    const freePlayLabel = document.getElementById("radio-free-label");
    let currentRadioTrack = choice(radioTracks);
    let lastRadioTrack = "";
    let foundRadioTrack = "";
    let decodeTimers = [];
    let targetDishAngle = Number(angle.value) - 90;
    let renderedDishAngle = targetDishAngle;

    function sourceScore(source) {
      const angleDelta = Math.abs(Number(angle.value) - source.angle) / 180;
      const rangeDelta = Math.abs(Number(range.value) - source.tune) / 9;
      return Math.max(0, 1 - Math.sqrt(angleDelta * angleDelta + rangeDelta * rangeDelta) * 2.25);
    }

    function activeSignalSource() {
      if (!freePlay) return { angle: targetAngle, tune: targetTune, track: currentRadioTrack };
      return freePlaySources.reduce(function (best, source) {
        return sourceScore(source) > sourceScore(best) ? source : best;
      }, freePlaySources[0]);
    }

    function matchScore() {
      return sourceScore(activeSignalSource());
    }

    function drawWave(amplitude, frequency, jitter) {
      const rows = 7;
      const cols = 42;
      const center = Math.floor(rows / 2);
      const lines = Array.from({ length: rows }, () => Array.from({ length: cols }, () => " "));
      for (let x = 0; x < cols; x += 1) {
        const wobble = jitter ? (Math.random() - 0.5) * jitter : 0;
        const y = Math.round(center + Math.sin((x / cols) * Math.PI * 2 * frequency + wobble) * amplitude);
        lines[Math.max(0, Math.min(rows - 1, y))][x] = "*";
      }
      return lines.map((line) => line.join("")).join("\n");
    }

    function tuneToRadius(pointTune) {
      return 11 - pointTune;
    }

    function signalFrequency(pointTune) {
      return 0.85 + pointTune * 0.42;
    }

    function radioFrequencyLabel(pointTune) {
      const radioBandsMHz = [300, 420, 610, 900, 1420, 2300, 5000, 8400, 15000, 22000];
      const mhz = radioBandsMHz[Math.max(0, Math.min(radioBandsMHz.length - 1, pointTune - 1))];
      if (mhz < 1000) return mhz + " MHz";
      return (mhz / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " GHz";
    }

    function renderDish() {
      dish.style.transform = "translate(-50%, -64%) rotate(" + renderedDishAngle + "deg)";
    }

    function animateDish() {
      if (!document.body.contains(dish)) return;
      renderedDishAngle += (targetDishAngle - renderedDishAngle) * 0.07;
      if (Math.abs(targetDishAngle - renderedDishAngle) < 0.08) {
        renderedDishAngle = targetDishAngle;
      }
      renderDish();
      window.requestAnimationFrame(animateDish);
    }

    function animateAmplitudeLine() {
      if (!document.body.contains(amplitudeLine)) return;
      const sound = window.EducationStationSound;
      const amplitude = sound && typeof sound.getRadioAmplitude === "function" ? sound.getRadioAmplitude() : 0;
      amplitudeLine.style.width = Math.round(amplitude * 100) + "%";
      amplitudeLine.style.opacity = amplitude > 0.01 ? "1" : "0.28";
      window.requestAnimationFrame(animateAmplitudeLine);
    }

    function updateRay() {
      const coherence = matchScore();
      const signalSource = activeSignalSource();
      const receiverAmplitude = 0.5 + coherence * 2.2;
      const radius = scopeRadiusPx() * tuneToRadius(Number(range.value)) / 10;
      const pointingAngle = Number(angle.value) - 90;
      ray.style.transform = "rotate(" + pointingAngle + "deg)";
      targetDishAngle = pointingAngle;
      ray.style.height = scopeRadiusPx() + "px";
      distanceCircle.style.width = radius * 2 + "px";
      distanceCircle.style.height = radius * 2 + "px";
      angleReadout.textContent = angle.value + " DEGREES";
      rangeReadout.textContent = radioFrequencyLabel(Number(range.value));
      targetSignal.textContent = freePlay
        ? scannedFreeSource ? drawWave(2.7, signalFrequency(scannedFreeSource.tune), 0.35) : ""
        : drawWave(2.7, signalFrequency(targetTune), 0.35);
      receiverSignal.textContent = drawWave(receiverAmplitude, signalFrequency(freePlay ? signalSource.tune : Number(range.value)), 0.65 - coherence * 0.35);
    }

    function scopeRadiusPx() {
      const rect = scopeGrid.getBoundingClientRect();
      return Math.min(rect.width * 0.46, rect.height * 0.92);
    }

    function scopePoint(pointAngle, pointTune) {
      const rect = scopeGrid.getBoundingClientRect();
      const radians = pointAngle * Math.PI / 180;
      const dx = -Math.cos(radians);
      const dy = -Math.sin(radians);
      const distance = tuneToRadius(pointTune) / 10 * scopeRadiusPx();
      return {
        x: 50 + dx * distance / rect.width * 100,
        y: 100 + dy * distance / rect.height * 100
      };
    }

    function addScanVisuals(coherence) {
      const scan = scopePoint(Number(angle.value), Number(range.value));
      const signalSource = activeSignalSource();
      const source = scopePoint(signalSource.angle, signalSource.tune);
      const pulse = document.createElement("span");
      const marker = document.createElement("span");
      const echo = document.createElement("span");
      pulse.className = "scope-scan-pulse";
      pulse.style.left = scan.x + "%";
      pulse.style.top = scan.y + "%";
      marker.className = "scope-marker";
      marker.style.left = scan.x + "%";
      marker.style.top = scan.y + "%";
      marker.style.borderColor = coherence > 0.82 ? "var(--green)" : coherence > 0.48 ? "var(--amber)" : "var(--pink)";
      marker.style.boxShadow = "0 0 12px " + (coherence > 0.82 ? "var(--green)" : coherence > 0.48 ? "var(--amber)" : "var(--pink)");
      echo.className = coherence > 0.82 ? "scope-echo scope-echo-hit" : "scope-echo scope-echo-miss";
      echo.style.left = source.x + "%";
      echo.style.top = source.y + "%";
      echo.textContent = coherence > 0.82 ? "SIGNAL" : "echo";
      markers.appendChild(pulse);
      markers.appendChild(marker);
      markers.appendChild(echo);
      window.setTimeout(function () {
        pulse.remove();
      }, 900);
    }

    function showRadioConnection(track) {
      if (track) {
        currentRadioTrack = track;
      } else {
        currentRadioTrack = choice(radioTracks);
        while (radioTracks.length > 1 && currentRadioTrack === lastRadioTrack) {
          currentRadioTrack = choice(radioTracks);
        }
      }
      lastRadioTrack = currentRadioTrack;
      foundRadioTrack = currentRadioTrack;
      showDecodedText("DATA PACKET READY", false);
      playAgainButton.hidden = false;
      radioPopup.hidden = false;
      radioPopup.style.left = rand(28, 72) + "%";
      radioPopup.style.top = rand(24, 62) + "%";
    }

    function renderFreePlaySources() {
      freeSourceLayer.innerHTML = "";
      if (!freePlay) return;
      freePlaySources.forEach(function (source) {
        const point = scopePoint(source.angle, source.tune);
        const marker = document.createElement("span");
        marker.className = "scope-free-source";
        marker.textContent = "?";
        marker.style.left = point.x + "%";
        marker.style.top = point.y + "%";
        marker.style.setProperty("--jitter-x", rand(-5, 5) + "px");
        marker.style.setProperty("--jitter-y", rand(-5, 5) + "px");
        freeSourceLayer.appendChild(marker);
      });
    }

    function setFreePlayMode(enabled) {
      freePlay = enabled;
      scannedFreeSource = null;
      lastDistance = null;
      targetSignal.textContent = "";
      markers.innerHTML = "";
      radioPopup.hidden = true;
      playAgainButton.hidden = true;
      freePlayButton.textContent = freePlay ? "Exit Free" : "Free Play";
      freePlayLabel.hidden = !freePlay;
      showDecodedText(freePlay ? "FREE PLAY SCAN READY" : "DATA LINK IDLE", false);
      renderFreePlaySources();
      updateRay();
      feedback.textContent = freePlay
        ? "Free play. Tune near a blue source, then scan."
        : "Tune angle and frequency. Match receiver to target.";
    }

    function playFoundRadioData() {
      if (!foundRadioTrack) return;
      play(foundRadioTrack);
      showDecodeSequence(foundRadioTrack);
      feedback.textContent = "Planetary radio data playing.";
    }

    function encodedRadioPacket(track) {
      const index = radioTracks.indexOf(track) + 1;
      return "DATA: RX-" + String(index).padStart(2, "0") + " / " + rand(1000, 9999).toString(16).toUpperCase() + "-QAM-" + rand(10, 99);
    }

    function clearDecodeTimers() {
      decodeTimers.forEach(function (timer) {
        if (timer.type === "interval") {
          window.clearInterval(timer.id);
        } else {
          window.clearTimeout(timer.id);
        }
      });
      decodeTimers = [];
    }

    function rememberDecodeTimer(id, type) {
      decodeTimers.push({ id, type: type || "timeout" });
    }

    function randomDecodeChar() {
      return choice(["0", "1", "3", "7", "A", "C", "D", "E", "F", "K", "L", "Q", "R", "X", "#", "/", "*"]);
    }

    function scrambledTitle(title, revealedCount) {
      return title.split("").map(function (char, index) {
        if (index < revealedCount || char === " ") return char;
        return randomDecodeChar();
      }).join("");
    }

    function showDecodedText(text, decoding) {
      decodeField.textContent = text;
      decodeField.classList.toggle("decoding", Boolean(decoding));
    }

    function showDecodeSequence(track) {
      clearDecodeTimers();
      const title = radioTrackTitles[track] || "UNKNOWN SIGNAL";
      showDecodedText(encodedRadioPacket(track), false);

      rememberDecodeTimer(window.setTimeout(function () {
        showDecodedText("AUTO DECODING", true);
      }, 3200));

      rememberDecodeTimer(window.setTimeout(function () {
        let revealed = 0;
        showDecodedText("TITLE: " + scrambledTitle(title, revealed), false);
        const revealTimer = window.setInterval(function () {
          revealed += 1;
          showDecodedText("TITLE: " + scrambledTitle(title, revealed), false);
          if (revealed >= title.length) {
            window.clearInterval(revealTimer);
          }
        }, 155);
        rememberDecodeTimer(revealTimer, "interval");
      }, 4600));
    }

    angle.addEventListener("input", updateRay);
    range.addEventListener("input", updateRay);
    playDataButton.addEventListener("click", function () {
      playFoundRadioData();
      radioPopup.hidden = true;
    });
    playAgainButton.addEventListener("click", playFoundRadioData);
    freePlayButton.addEventListener("click", function () {
      setFreePlayMode(!freePlay);
    });
    document.getElementById("scan-scope").addEventListener("click", function () {
      const coherence = matchScore();
      const signalSource = activeSignalSource();
      const distance = 1 - coherence;
      const trend = lastDistance === null ? "first scan" : distance < lastDistance ? "stronger" : "weaker";
      lastDistance = distance;
      addScanVisuals(coherence);
      play(coherence > 0.82 ? "small_victory" : "radio_static");
      if (coherence > 0.82) {
        setScore(20);
        setLevel(level + 1);
        log.textContent = "SOURCE FOUND\ncoherence: " + Math.round(coherence * 100) + "%";
        if (freePlay) {
          scannedFreeSource = signalSource;
          showRadioConnection(signalSource.track);
          updateRay();
        } else {
          showRadioConnection();
          targetAngle = rand(10, 170);
          targetTune = rand(2, 9);
          lastDistance = null;
          window.setTimeout(function () {
            markers.innerHTML = "";
            log.textContent = "New signal seeded.";
            updateRay();
          }, 900);
        }
      } else {
        log.textContent = "Signal " + trend + "\ncoherence: " + Math.round(coherence * 100) + "%\nmatch the target, then scan again";
      }
    });
    updateRay();
    renderDish();
    animateDish();
    animateAmplitudeLine();
    window.setInterval(updateRay, 420);
    window.addEventListener("resize", function () {
      if (freePlay) renderFreePlaySources();
    });
    feedback.textContent = "Tune angle and frequency. Match receiver to target.";
  }

  function initPacking() {
    setHeader("packing");
    let manifest = null;
    let counts = { water: 0, equipment: 0, food: 0 };

    function newManifest() {
      const options = [
        { total: 10, water: 30, equipment: 50, food: 20 },
        { total: 12, water: 25, equipment: 50, food: 25 },
        { total: 15, water: 40, equipment: 20, food: 40 },
        { total: 20, water: 20, equipment: 40, food: 40 }
      ];
      const option = choice(options);
      manifest = {
        total: option.total,
        percent: { water: option.water, equipment: option.equipment, food: option.food },
        crates: {
          water: option.total * option.water / 100,
          equipment: option.total * option.equipment / 100,
          food: option.total * option.food / 100
        }
      };
      counts = { water: 0, equipment: 0, food: 0 };
      draw();
    }

    function draw() {
      workspace.innerHTML = [
        '<div class="line-card"><div class="prototype-big">TOTAL CRATES: ' + manifest.total + "</div>",
        '<div class="manifest-grid"><div><strong>Goal (%)</strong><span>Water ' + manifest.percent.water + "%</span><span>Equipment " + manifest.percent.equipment + "%</span><span>Food " + manifest.percent.food + "%</span></div>",
        '<div id="cargo-counts"></div></div>',
        '<div class="test-controls">',
        button("Water", 'data-cargo="water"'),
        button("Equipment", 'data-cargo="equipment"'),
        button("Food", 'data-cargo="food"'),
        button("Undo", 'data-action="undo"'),
        button("Check", 'data-action="check"'),
        '</div><div class="cargo-results" id="cargo-results"></div></div>'
      ].join("");
      workspace.querySelectorAll("[data-cargo]").forEach((item) => {
        item.addEventListener("click", function () {
          const loaded = counts.water + counts.equipment + counts.food;
          if (loaded >= manifest.total) return;
          counts[item.dataset.cargo] += 1;
          play("beep");
          update();
        });
      });
      workspace.querySelector('[data-action="undo"]').addEventListener("click", function () {
        counts = { water: 0, equipment: 0, food: 0 };
        update();
      });
      workspace.querySelector('[data-action="check"]').addEventListener("click", check);
      update();
    }

    function cargoBoxes(values) {
      return ["water", "equipment", "food"].map((type) => {
        const boxes = Array.from({ length: values[type] }, () => '<span class="cargo-box cargo-' + type + '"></span>').join("");
        return '<div class="cargo-line"><span>' + type + " " + values[type] + '</span><div class="cargo-boxes">' + boxes + "</div></div>";
      }).join("");
    }

    function showResults(ok) {
      const results = document.getElementById("cargo-results");
      results.innerHTML = [
        '<div class="cargo-result-grid">',
        '<div><strong>Expected (Answer)</strong>' + cargoBoxes(manifest.crates) + "</div>",
        '<div><strong>Delivered (You Loaded)</strong>' + cargoBoxes(counts) + "</div>",
        "</div>",
        button("Next", 'data-action="next"')
      ].join("");
      results.querySelector('[data-action="next"]').addEventListener("click", newManifest);
      feedback.textContent = ok ? "Manifest matched. Review the cargo, then press Next." : "Manifest mismatch. Compare expected and delivered, then press Next.";
    }

    function update() {
      document.getElementById("cargo-counts").innerHTML = "<strong>Loaded (crates)</strong><span>Water " + counts.water + "</span><span>Equipment " + counts.equipment + "</span><span>Food " + counts.food + "</span>";
    }

    function check() {
      const ok = counts.water === manifest.crates.water && counts.equipment === manifest.crates.equipment && counts.food === manifest.crates.food;
      if (ok) {
        setScore(20);
        setLevel(level + 1);
        play("small_victory");
      } else {
        play("error");
      }
      showResults(ok);
    }

    newManifest();
    feedback.textContent = "Load crates to match the fractional manifest.";
  }

  const inits = { mastermind: initMastermind, typing: initTyping, rhythm: initRhythm, bonds: initBonds, radio: initRadio, packing: initPacking };
  (inits[mode] || initMastermind)();
})();
