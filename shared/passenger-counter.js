(function () {
  if (document.body.dataset.game !== "passenger-counter") return;

  const scene = document.getElementById("passenger-scene");
  const train = document.getElementById("train");
  const passengerLayer = document.getElementById("passenger-layer");
  const flashMessage = document.getElementById("flash-message");
  const stageResult = document.getElementById("stage-result");
  const readyField = document.getElementById("ready-field");
  const consolePanel = document.getElementById("counter-console");
  const answerDisplay = document.getElementById("answer-display");
  const resultLine = document.getElementById("result-line");
  const feedback = document.getElementById("feedback");
  const submitButton = document.getElementById("submit-answer");
  const nextButton = document.getElementById("next-round");
  const scoreNode = document.getElementById("score");
  const roundNode = document.getElementById("round");

  const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));
  const trainSprites = [
    "space_train_top.png",
    "space_train_top_2.png",
    "space_train_top_3.png"
  ];
  const passengerSlots = [
    { x: 35, y: 49 },
    { x: 43, y: 49 },
    { x: 51, y: 49 },
    { x: 59, y: 49 },
    { x: 39, y: 57 },
    { x: 47, y: 57 },
    { x: 55, y: 57 },
    { x: 63, y: 57 },
    { x: 31, y: 57 },
    { x: 67, y: 57 }
  ];

  let round = 1;
  let score = 0;
  let boardedTotal = 0;
  let exitedTotal = 0;
  let input = "";
  let waitingForAnswer = false;
  let currentPassengers = [];
  let nextSlot = 0;
  let currentTrainSprite = "";

  function playSound(name) {
    if (window.EducationStationSound && window.EducationStationSound.play) {
      return window.EducationStationSound.play(name);
    }
    document.dispatchEvent(new CustomEvent("educationstation:sound", { detail: { name } }));
    return null;
  }

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function chooseTrainSprite() {
    let nextTrainSprite = trainSprites[rand(0, trainSprites.length - 1)];
    if (trainSprites.length > 1) {
      while (nextTrainSprite === currentTrainSprite) {
        nextTrainSprite = trainSprites[rand(0, trainSprites.length - 1)];
      }
    }
    currentTrainSprite = nextTrainSprite;
    train.src = "../assets/images/" + currentTrainSprite;
  }

  function buildPlan() {
    const boardingWaves = rand(2, 3);
    const exitingWaves = rand(2, 3);
    const plan = [];

    for (let index = 0; index < Math.max(boardingWaves, exitingWaves); index += 1) {
      if (index < boardingWaves) plan.push({ type: "board", count: rand(1, 5) });
      if (index < exitingWaves) plan.push({ type: "exit", count: rand(1, 4) });
    }

    return plan;
  }

  async function runRound() {
    resetRound();
    feedback.textContent = "Awaiting platform signal.";
    playSound("train_indicator");
    await wait(1600);
    playSound("power_down");
    await wait(3400);
    await arriveTrain();
    flashMessage.hidden = false;
    feedback.textContent = "Scanner active.";

    for (const wave of buildPlan()) {
      if (wave.type === "board") {
        await boardPassengers(wave.count);
      } else {
        await exitPassengers(wave.count);
      }
      await wait(1100);
    }

    flashMessage.hidden = true;
    askQuestion();
  }

  function resetRound() {
    boardedTotal = 0;
    exitedTotal = 0;
    input = "";
    waitingForAnswer = false;
    nextSlot = 0;
    currentPassengers = [];
    passengerLayer.innerHTML = "";
    passengerLayer.classList.remove("reveal-passengers");
    chooseTrainSprite();
    flashMessage.hidden = true;
    stageResult.hidden = true;
    stageResult.textContent = "";
    stageResult.classList.remove("correct", "wrong");
    consolePanel.hidden = true;
    nextButton.hidden = true;
    submitButton.hidden = false;
    submitButton.disabled = false;
    resultLine.textContent = "";
    answerDisplay.textContent = "_";
    train.classList.add("train-hidden");
    train.classList.remove("train-arrived", "train-exit");
    roundNode.textContent = round;
    scoreNode.textContent = score;
  }

  async function arriveTrain() {
    feedback.textContent = "Train arriving.";
    train.classList.remove("train-exit");
    train.classList.remove("train-arrived");
    train.offsetHeight;
    train.classList.remove("train-hidden");
    window.requestAnimationFrame(function () {
      train.classList.add("train-arrived");
    });
    await wait(5400);
    playSound("air_brakes");
    await wait(550);
    feedback.textContent = "Train docked.";
  }

  async function boardPassengers(count) {
    boardedTotal += count;
    const group = makePassengerGroup(count, "boarding");
    feedback.textContent = count + " boarding.";
    await wait(500);
    group.forEach((passenger) => passenger.classList.add("visible"));
    await wait(1800);
    group.forEach((passenger) => passenger.classList.add("to-train"));
    await wait(2100);

    group.forEach((passenger) => {
      passenger.classList.remove("boarding", "visible", "to-train");
      passenger.classList.add("onboard");
      placeInTrain(passenger);
      currentPassengers.push(passenger);
    });
  }

  async function exitPassengers(count) {
    const group = [];
    const exitingCount = Math.min(count, currentPassengers.length);

    for (let index = 0; index < exitingCount; index += 1) {
      const passenger = currentPassengers.shift();
      passenger.classList.remove("onboard");
      passenger.classList.add("exiting");
      group.push(passenger);
    }

    if (!group.length) {
      await wait(900);
      return;
    }

    exitedTotal += exitingCount;
    feedback.textContent = exitingCount + " exiting.";
    passengerLayer.classList.add("exiting-passengers");
    await wait(1800);
    group.forEach((passenger, index) => {
      passenger.classList.add("leaving");
      passenger.style.left = 36 + index * 7 + "%";
      passenger.style.top = "-8%";
    });
    await wait(2600);
    group.forEach((passenger) => passenger.classList.add("gone"));
    await wait(500);
    group.forEach((passenger) => passenger.remove());
    passengerLayer.classList.remove("exiting-passengers");
  }

  function makePassengerGroup(count, className) {
    const group = [];
    const startX = 32 + rand(0, 18);

    for (let index = 0; index < count; index += 1) {
      const passenger = document.createElement("span");
      passenger.className = "passenger-icon " + className;
      passenger.style.setProperty("--from-x", startX + index * 6 + "%");
      passenger.style.setProperty("--from-y", 80 + (index % 2) * 7 + "%");
      passenger.style.setProperty("--dock-x", 40 + index * 5 + "%");
      passenger.style.setProperty("--dock-y", "52%");
      passengerLayer.appendChild(passenger);
      group.push(passenger);
    }

    return group;
  }

  function placeInTrain(passenger) {
    const slot = passengerSlots[nextSlot % passengerSlots.length];
    nextSlot += 1;
    passenger.style.left = slot.x + "%";
    passenger.style.top = slot.y + "%";
  }

  function askQuestion() {
    waitingForAnswer = true;
    consolePanel.hidden = false;
    feedback.textContent = "Enter boarded minus exited.";
  }

  function enterDigit(value) {
    if (!waitingForAnswer || input.replace("-", "").length >= 2) return;
    input += value;
    answerDisplay.textContent = input;
    playSound("beep");
  }

  function toggleMinus() {
    if (!waitingForAnswer) return;
    input = input.startsWith("-") ? input.slice(1) : "-" + input;
    answerDisplay.textContent = input && input !== "-" ? input : input || "_";
    playSound("beep");
  }

  function backspace() {
    if (!waitingForAnswer) return;
    input = input.slice(0, -1);
    answerDisplay.textContent = input || "_";
    playSound("beep");
  }

  function clearInput() {
    if (!waitingForAnswer) return;
    input = "";
    answerDisplay.textContent = "_";
    playSound("beep");
  }

  function submitAnswer() {
    if (!waitingForAnswer || !input || input === "-") return;
    waitingForAnswer = false;
    const answer = Number(input);
    const netChange = boardedTotal - exitedTotal;
    const correct = answer === netChange;

    if (correct) {
      score += 10;
      playSound("small_victory");
    } else {
      playSound("error");
    }

    scoreNode.textContent = score;
    stageResult.textContent = boardedTotal + " - " + exitedTotal + " = " + netChange;
    stageResult.classList.toggle("correct", correct);
    stageResult.classList.toggle("wrong", !correct);
    stageResult.hidden = false;
    resultLine.textContent = "Boarded " + boardedTotal + " - Exited " + exitedTotal + " = " + netChange + " // Answer " + answer;
    feedback.textContent = correct ? "Passenger count verified." : "Count mismatch.";
    submitButton.hidden = true;
    nextButton.hidden = false;
    passengerLayer.classList.add("reveal-passengers");
  }

  async function leaveStation() {
    if (window.EducationStationSound && window.EducationStationSound.unlockAudio) {
      window.EducationStationSound.unlockAudio();
    }
    nextButton.disabled = true;
    passengerLayer.classList.remove("reveal-passengers");
    await wait(250);
    currentPassengers.forEach((passenger) => passenger.remove());
    currentPassengers = [];
    consolePanel.hidden = true;
    feedback.textContent = "Train departing.";
    const departureSound = playSound("electric_charge");
    const departureSoundDone = waitForSound(departureSound, 4500);
    await wait(2500);
    train.classList.remove("train-arrived");
    train.classList.add("train-exit");
    await Promise.all([departureSoundDone, wait(1500)]);
    train.classList.add("train-hidden");
    nextButton.disabled = false;
    round += 1;
    await wait(5000);
    runRound();
  }

  function waitForSound(audio, fallback) {
    return new Promise((resolve) => {
      const timer = window.setTimeout(resolve, fallback);
      if (!audio) return;
      audio.addEventListener("ended", function () {
        window.clearTimeout(timer);
        resolve();
      }, { once: true });
    });
  }

  consolePanel.addEventListener("click", function (event) {
    const digitButton = event.target.closest("[data-digit]");
    const actionButton = event.target.closest("[data-action]");

    if (digitButton) enterDigit(digitButton.dataset.digit);
    if (!actionButton) return;
    if (actionButton.dataset.action === "clear") clearInput();
    if (actionButton.dataset.action === "backspace") backspace();
    if (actionButton.dataset.action === "minus") toggleMinus();
  });

  submitButton.addEventListener("click", submitAnswer);
  nextButton.addEventListener("click", leaveStation);

  document.addEventListener("keydown", function (event) {
    if (!waitingForAnswer) return;
    if (/^[0-9]$/.test(event.key)) enterDigit(event.key);
    if (event.key === "-") toggleMinus();
    if (event.key === "Backspace") backspace();
    if (event.key === "Escape") clearInput();
    if (event.key === "Enter") submitAnswer();
  });

  readyField.addEventListener("click", function () {
    readyField.hidden = true;
    if (window.EducationStationSound && window.EducationStationSound.unlockAudio) {
      window.EducationStationSound.unlockAudio();
    }
    playSound("beep");
    runRound();
  });
})();
