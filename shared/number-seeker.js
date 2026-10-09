(function () {
  const mode = document.body.dataset.game;
  if (!mode) return;

  const equation = document.getElementById("equation");
  const choices = document.getElementById("choices");
  const feedback = document.getElementById("feedback");
  const scoreNode = document.getElementById("score");
  const streakNode = document.getElementById("streak");
  const suppliesNode = document.getElementById("supplies");
  const systemLine = document.querySelector(".system-line");

  const columns = 6;
  const gridSize = 30;
  const multiplicationMaxFactor = 10;
  const multiplicationTargetsPerLevel = 10;
  const arithmeticTargetsPerLevel = 5;
  const pointsPerCorrect = 10;
  const discoveriesPerSupply = 10;
  const suppliesToFinish = 5; // items on the hangar procurement request
  const numberSpaceMax = multiplicationMaxFactor * multiplicationMaxFactor;
  const resources = [
    { name: "Water", icon: "💧" },
    { name: "Computers", icon: "💻" },
    { name: "Food", icon: "🍎" },
    { name: "Power", icon: "🔋" },
    { name: "Tools", icon: "🔧" },
    { name: "Medicine", icon: "🧰" },
    { name: "Seeds", icon: "🌱" },
    { name: "Charts", icon: "🗺️" },
    { name: "Books", icon: "📚" },
    { name: "Crystals", icon: "💎" }
  ];
  let score = 0;
  let streak = 0;
  let bestStreak = 0;
  let level = 1;
  let levelScore = 0;
  let supplies = 0;
  let answer = 0;
  let remainingTargets = 0;
  let selectedIndex = 0;
  let locked = false;
  // The hangar crew's order: 5 of the 10 supplies, collected in this order.
  let request = [];
  // Multiply: one times table per requested item, easiest first.
  let tables = [];

  const symbols = {
    plus: "+",
    minus: "-",
    multiply: "x",
    divide: "÷"
  };

  function playSound(name) {
    document.dispatchEvent(new CustomEvent("educationstation:sound", { detail: { name } }));
  }

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffle(values) {
    return values
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((entry) => entry.value);
  }

  function makeProblem() {
    if (mode === "plus") {
      const a = rand(2, 18);
      const b = rand(2, 18);
      answer = a + b;
      return "Find " + a + " + " + b;
    }

    if (mode === "multiply") {
      answer = currentFactor();
      return "Multiples of " + currentFactor();
    }

    if (mode === "divide") {
      const divisor = rand(2, 12);
      const quotient = rand(1, 12);
      answer = quotient;
      return "Find " + divisor * quotient + " ÷ " + divisor;
    }

    const b = rand(1, 20);
    const result = rand(1, 20);
    const a = b + result;

    answer = result;
    return "Find " + a + " - " + b;
  }

  function makeGridValues() {
    if (mode === "multiply") {
      return makeMultipleGridValues();
    }

    const max = 42;
    const values = Array.from({ length: arithmeticTargetsPerLevel }, () => answer);
    let attempts = 0;
    while (values.length < gridSize) {
      const offset = rand(-18, 18);
      const nearby = Math.max(0, Math.min(max, answer + offset));
      const candidate = attempts > 80 ? rand(0, max) : nearby;
      if (candidate !== answer) values.push(candidate);
      attempts += 1;
    }
    return shuffle(values);
  }

  function makeMultipleGridValues() {
    const factor = currentFactor();
    const targetCount = multiplicationTargetsPerLevel;
    const targets = shuffle(Array.from({ length: multiplicationMaxFactor }, (_, index) => factor * (index + 1))).slice(0, targetCount);
    const values = targets.slice();

    while (values.length < gridSize) {
      const candidate = rand(1, numberSpaceMax);
      if (candidate % factor !== 0) values.push(candidate);
    }

    return shuffle(values);
  }

  function renderSelection() {
    for (const choice of choices.children) {
      const selected = Number(choice.dataset.index) === selectedIndex;
      choice.classList.toggle("selected", selected);
      choice.setAttribute("aria-selected", String(selected));
    }
  }

  function nextProblem() {
    locked = false;
    selectedIndex = rand(0, gridSize - 1);
    equation.textContent = makeProblem();
    updateSystemLine();
    feedback.textContent = mode === "multiply"
      ? "Open every compartment holding a multiple of " + currentFactor() + " to find " + currentResource().name + "."
      : "Open the " + arithmeticTargetsPerLevel + " compartments holding " + currentResource().name + ".";
    choices.className = "number-grid storage-grid";
    choices.innerHTML = "";
    remainingTargets = 0;

    for (const [index, value] of makeGridValues().entries()) {
      const button = document.createElement("button");
      button.className = "grid-cell";
      button.type = "button";
      button.dataset.index = String(index);
      button.dataset.target = String(isTarget(value));
      if (isTarget(value)) remainingTargets += 1;
      button.textContent = value;
      button.addEventListener("click", function () {
        selectedIndex = index;
        renderSelection();
        choose(button, value);
      });
      choices.appendChild(button);
    }

    renderSelection();
  }

  function choose(button, value) {
    if (locked) return;
    if (button.disabled) return;

    if (mode === "multiply") {
      chooseMultiple(button, value);
      return;
    }

    if (value === answer) {
      playSound("good");
      score += pointsPerCorrect;
      levelScore += pointsPerCorrect;
      streak += 1;
      bestStreak = Math.max(bestStreak, streak);
      remainingTargets -= 1;
      button.classList.add("correct", "munched");
      button.disabled = true;
      button.dataset.resource = currentResource().icon;
      button.classList.add("resource-found");
      openCompartment(button, value);
      feedback.textContent = remainingTargets
        ? "Compartment open: " + currentResource().name + " found. " + remainingTargets + " to go."
        : currentResource().name + " supply complete.";
    } else {
      playSound("error");
      streak = 0;
      button.classList.add("wrong");
      feedback.textContent = "That compartment is locked. The answer was " + answer + ".";
      for (const choice of choices.children) {
        if (Number(choice.textContent) === answer) choice.classList.add("correct");
      }
    }

    scoreNode.textContent = score;
    streakNode.textContent = streak;
    updateSupplies();
    if (remainingTargets === 0) {
      completeSupplyLevel();
      return;
    }
  }

  function chooseMultiple(button, value) {
    if (isTarget(value)) {
      playSound("good");
      score += pointsPerCorrect;
      streak += 1;
      bestStreak = Math.max(bestStreak, streak);
      remainingTargets -= 1;
      button.classList.add("correct", "munched");
      button.disabled = true;
      button.dataset.resource = currentResource().icon;
      button.classList.add("resource-found");
      openCompartment(button, value);
      levelScore += pointsPerCorrect;
      feedback.textContent = remainingTargets
        ? "Compartment open: " + currentResource().name + " found. " + remainingTargets + " to go."
        : levelScore >= pointsNeededForSupply()
          ? currentResource().name + " supply complete. Leveling up."
          : currentResource().name + " cargo stored. Leveling up.";
    } else {
      playSound("error");
      score = Math.max(0, score - 5);
      streak = 0;
      button.classList.add("wrong");
      feedback.textContent = "Locked! " + value + " is not in the " + currentFactor() + " table.";
      window.setTimeout(function () {
        button.classList.remove("wrong");
      }, 650);
    }

    scoreNode.textContent = score;
    streakNode.textContent = streak;
    updateSupplies();

    if (remainingTargets === 0) {
      locked = true;
      playSound("powerup_2");
      window.setTimeout(function () {
        if (levelScore >= pointsNeededForSupply()) {
          supplies += 1;
          levelScore = 0;
        }
        updateSupplies();
        if (supplies >= suppliesToFinish || level >= tables.length) {
          showSummary();
          return;
        }
        level += 1;
        showCheckOff(nextProblem);
      }, 1000);
    }
  }

  function completeSupplyLevel() {
    locked = true;
    supplies += 1;
    level += 1;
    levelScore = 0;
    updateSupplies();
    window.setTimeout(function () {
      playSound("powerup_2");
    }, 180);

    window.setTimeout(function () {
      if (supplies >= suppliesToFinish) {
        showSummary();
        return;
      }
      showCheckOff(nextProblem);
    }, 1300);
  }

  // A storage compartment door swings open to show the supply inside.
  function openCompartment(button, value) {
    button.textContent = "";
    const door = document.createElement("span");
    door.className = "locker-door";
    door.textContent = value;
    button.appendChild(door);
    window.setTimeout(function () { door.remove(); }, 700);
  }

  function isTarget(value) {
    if (mode === "multiply") return isLevelTarget(value);
    return value === answer;
  }

  function isLevelTarget(value) {
    const factor = currentFactor();
    return value % factor === 0 && value >= factor && value <= factor * multiplicationMaxFactor;
  }

  function currentFactor() {
    if (tables.length) return tables[Math.min(level - 1, tables.length - 1)];
    return Math.min(level + 1, multiplicationMaxFactor);
  }

  function currentResource() {
    return request[Math.min(supplies, request.length - 1)] || resources[0];
  }

  function currentSupplyIcons() {
    return request.slice(0, supplies).map((resource) => resource.icon).join(" ");
  }

  function pointsNeededForSupply() {
    return pointsPerCorrect * (mode === "multiply" ? discoveriesPerSupply : arithmeticTargetsPerLevel);
  }

  function updateSystemLine() {
    if (!systemLine) return;
    if (mode === "multiply") {
      systemLine.textContent = "Supplies Storage // Item " + Math.min(supplies + 1, suppliesToFinish) + "/" + suppliesToFinish + " // \u00d7" + currentFactor();
      return;
    }
    systemLine.textContent = "Supplies Storage // Item " + Math.min(supplies + 1, suppliesToFinish) + "/" + suppliesToFinish + " // " + symbols[mode];
  }

  function updateSupplies() {
    if (suppliesNode) {
      suppliesNode.textContent = currentSupplyIcons() || "—";
    }
  }

  function showSummary() {
    locked = true;
    updateSystemLine();
    equation.textContent = "Order Complete";
    choices.className = "summary-panel";
    choices.innerHTML = [
      '<p class="summary-line">Final Score <strong>' + score + "</strong></p>",
      '<p class="summary-line">Supplies Delivered <strong>' + (currentSupplyIcons() || "None") + "</strong></p>",
      '<p class="summary-line">Best Streak <strong>' + bestStreak + "</strong></p>"
    ].join("");
    feedback.textContent = "Every item on the request is collected. Delivering to the hangar.";
    showDelivery();
  }

  // ---------- Hangar procurement request ----------
  const screenNode = document.querySelector(".screen");
  const IMG = "../assets/images/";
  let hangarOverlay = null;

  function pickRequest() {
    request = shuffle(resources).slice(0, suppliesToFinish);
    if (mode === "multiply") {
      const pool = shuffle(Array.from({ length: multiplicationMaxFactor - 1 }, (_, i) => i + 2));
      tables = pool.slice(0, suppliesToFinish).sort((a, b) => a - b);
    }
  }

  function taskFor(index) {
    if (mode === "multiply") return "Clear the " + tables[index] + "× table";
    return "Solve " + arithmeticTargetsPerLevel + " " + mode + " problems";
  }

  function requestRows(checkedCount, popIndex) {
    return request.map(function (item, index) {
      const done = index < checkedCount;
      return '<li class="pr-row' + (done ? " done" : "") + (index === popIndex ? " pop" : "") + '">' +
        '<span class="pr-check">' + (done ? "✓" : "") + "</span>" +
        '<span class="pr-icon">' + item.icon + "</span>" +
        '<span class="pr-name">' + item.name + '<small>' + taskFor(index) + "</small></span></li>";
    }).join("");
  }

  function padHtml(checkedCount, popIndex, stamp) {
    return [
      '<div class="pr-pad">',
      '<img class="pr-pad-art" src="' + IMG + 'clip_pad.png" alt="">',
      '<div class="pr-sheet">',
      '<p class="pr-title">Procurement Request</p>',
      '<p class="pr-meta">Hangar 7 // Order ' + orderNumber + "</p>",
      '<ol class="pr-list">' + requestRows(checkedCount, popIndex) + "</ol>",
      '<p class="pr-progress">' + checkedCount + " / " + request.length + " collected</p>",
      "</div>",
      stamp ? '<div class="pr-stamp">' + stamp + "</div>" : "",
      "</div>"
    ].join("");
  }

  const orderNumber = "NS-" + String(rand(100, 999));

  function openHangar(className, inner) {
    closeHangar();
    hangarOverlay = document.createElement("div");
    hangarOverlay.className = "hangar-overlay " + className;
    hangarOverlay.innerHTML = inner;
    screenNode.appendChild(hangarOverlay);
    return hangarOverlay;
  }

  function closeHangar() {
    if (hangarOverlay) hangarOverlay.remove();
    hangarOverlay = null;
  }

  function showBriefing() {
    locked = true;
    const overlay = openHangar("hangar-briefing", [
      '<img class="hangar-bg" src="' + IMG + 'hangar.png" alt="">',
      '<img class="hangar-worker" src="' + IMG + 'worker.png" alt="">',
      '<div class="hangar-bubble">The cargo ship can\'t launch until we have these ' + suppliesToFinish +
        " supplies. Can you find them in Supplies Storage? Open the compartments whose numbers match your " +
        (mode === "multiply" ? "times table" : "answers") + ".</div>",
      padHtml(0, -1, ""),
      '<button type="button" class="command-button hangar-accept">Accept order</button>'
    ].join(""));
    overlay.querySelector(".hangar-accept").addEventListener("click", function () {
      if (window.EducationStationSound && window.EducationStationSound.unlockAudio) {
        window.EducationStationSound.unlockAudio();
      }
      playSound("powerup_3");
      overlay.classList.add("hangar-leaving");
      window.setTimeout(function () {
        closeHangar();
        nextProblem();
      }, 350);
    });
  }

  // After each supply: the clipboard slides in and ticks the item off.
  function showCheckOff(done) {
    locked = true;
    const overlay = openHangar("hangar-checkoff", padHtml(supplies, supplies - 1, ""));
    playSound("good");
    window.setTimeout(function () {
      overlay.classList.add("hangar-leaving");
    }, 1700);
    window.setTimeout(function () {
      closeHangar();
      done();
    }, 2050);
  }

  // Finale: back in the hangar, the crates are delivered, then the star.
  function showDelivery() {
    const crates = request.map(function (item, index) {
      return '<span class="hangar-crate" style="--i:' + index + '">' + item.icon + "</span>";
    }).join("");
    openHangar("hangar-delivery", [
      '<img class="hangar-bg" src="' + IMG + 'hangar.png" alt="">',
      '<div class="hangar-crates">' + crates + "</div>",
      '<img class="hangar-worker" src="' + IMG + 'worker.png" alt="">',
      '<div class="hangar-bubble">Order complete! Everything is loaded. Great work!</div>',
      padHtml(request.length, -1, "Delivered")
    ].join(""));
    playSound("launch_up");
    window.setTimeout(function () {
      if (window.EducationStationReward) {
        window.EducationStationReward.celebrate({
          title: "Order Delivered!",
          lines: [
            "Supplies " + currentSupplyIcons(),
            "Final score " + score,
            "Best streak " + bestStreak
          ]
        });
      }
    }, 3600);
  }

  function moveSelection(delta) {
    if (locked) return;
    const next = selectedIndex + delta;
    if (next < 0 || next >= gridSize) return;
    selectedIndex = next;
    renderSelection();
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") moveSelection(-1);
    if (event.key === "ArrowRight") moveSelection(1);
    if (event.key === "ArrowUp") moveSelection(-columns);
    if (event.key === "ArrowDown") moveSelection(columns);
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (choices.children[selectedIndex]) choices.children[selectedIndex].click();
    }
  });

  document.title = "Number Seeker: " + symbols[mode];
  if (window.EducationStationReward) window.EducationStationReward.init("number-seeker-" + mode);
  // Test hook: ?debug exposes a shortcut to the finale.
  if (new URLSearchParams(window.location.search).has("debug")) {
    window.NumberSeekerDebug = {
      finish: function () {
        supplies = suppliesToFinish;
        updateSupplies();
        showSummary();
      },
      collect: function () {
        supplies += 1;
        level += 1;
        updateSupplies();
        if (supplies >= suppliesToFinish) showSummary();
        else showCheckOff(nextProblem);
      },
      get request() { return request; }
    };
  }

  pickRequest();
  updateSupplies();
  updateSystemLine();
  showBriefing();
})();
