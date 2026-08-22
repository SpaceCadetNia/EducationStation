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
  const suppliesToFinish = 10;
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
      ? "Find cargo by clearing every multiple of " + currentFactor() + "."
      : "Find " + arithmeticTargetsPerLevel + " cargo tiles for " + currentResource().name + ".";
    choices.className = "number-grid";
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
      button.textContent = "";
      feedback.textContent = remainingTargets
        ? currentResource().name + " cargo found. " + remainingTargets + " target" + (remainingTargets === 1 ? "" : "s") + " remain."
        : currentResource().name + " supply complete.";
    } else {
      playSound("error");
      streak = 0;
      button.classList.add("wrong");
      feedback.textContent = "Close scan. The target was " + answer + ".";
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
      button.textContent = "";
      levelScore += pointsPerCorrect;
      feedback.textContent = remainingTargets
        ? currentResource().name + " cargo found. " + remainingTargets + " target" + (remainingTargets === 1 ? "" : "s") + " remain."
        : levelScore >= pointsNeededForSupply()
          ? currentResource().name + " supply complete. Leveling up."
          : currentResource().name + " cargo stored. Leveling up.";
    } else {
      playSound("error");
      score = Math.max(0, score - 5);
      streak = 0;
      button.classList.add("wrong");
      feedback.textContent = value + " is not in the " + currentFactor() + " table.";
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
        if (currentFactor() >= multiplicationMaxFactor) {
          updateSupplies();
          showSummary();
          return;
        }
        level += 1;
        updateSupplies();
        nextProblem();
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
      nextProblem();
    }, 1300);
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
    return Math.min(level + 1, multiplicationMaxFactor);
  }

  function currentResource() {
    return resources[Math.min(supplies, resources.length - 1)];
  }

  function currentSupplyIcons() {
    return resources.slice(0, supplies).map((resource) => resource.icon).join(" ");
  }

  function pointsNeededForSupply() {
    return pointsPerCorrect * (mode === "multiply" ? discoveriesPerSupply : arithmeticTargetsPerLevel);
  }

  function updateSystemLine() {
    if (!systemLine) return;
    if (mode === "multiply") {
      systemLine.textContent = "Level: " + level + " // Multiples of " + currentFactor();
      return;
    }
    systemLine.textContent = "Level: " + Math.min(supplies + 1, suppliesToFinish) + " // " + symbols[mode];
  }

  function updateSupplies() {
    if (suppliesNode) {
      suppliesNode.textContent = currentSupplyIcons() || "—";
    }
  }

  function showSummary() {
    locked = true;
    updateSystemLine();
    equation.textContent = "Mission Complete";
    choices.className = "summary-panel";
    choices.innerHTML = [
      '<p class="summary-line">Final Score <strong>' + score + "</strong></p>",
      '<p class="summary-line">Supplies Loaded <strong>' + (currentSupplyIcons() || "None") + "</strong></p>",
      '<p class="summary-line">Best Streak <strong>' + bestStreak + "</strong></p>"
    ].join("");
    feedback.textContent = "Return to Number Seeker for another mission.";
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
  updateSupplies();
  nextProblem();
})();
