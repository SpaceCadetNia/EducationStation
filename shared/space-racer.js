(function () {
  if (document.body.dataset.game !== "space-racer") return;

  const track = document.getElementById("racer-track");
  const ready = document.getElementById("racer-ready");
  const pauseButton = document.getElementById("racer-pause");
  const slider = document.getElementById("racer-position");
  const steerPad = document.getElementById("racer-steer-pad");
  const steerPuck = document.getElementById("racer-steer-puck");
  const shipWrap = document.getElementById("racer-ship-wrap");
  const ship = document.getElementById("racer-ship");
  const station = document.getElementById("racer-station");
  const pitstop = document.getElementById("pitstop-panel");
  const pitReward = document.getElementById("pitstop-reward");
  const question = document.getElementById("pitstop-question");
  const choices = document.getElementById("pitstop-choices");
  const launchButton = document.getElementById("pitstop-launch");
  const feedback = document.getElementById("racer-feedback");
  const distanceNode = document.getElementById("racer-distance");
  const distanceBigNode = document.getElementById("racer-distance-big");
  const fuelNode = document.getElementById("racer-fuel");
  const shieldNode = document.getElementById("racer-shield");
  const statusSpeedNode = document.getElementById("racer-status-speed");
  const speedNode = document.getElementById("racer-speed");
  const nextPitNode = document.getElementById("racer-next-pit");
  const fuelFill = document.getElementById("racer-fuel-fill");
  const pitSummary = document.getElementById("pitstop-summary");

  const obstacles = [];
  const pitInterval = 500;
  let running = false;
  let paused = false;
  let lastTime = 0;
  let spawnTimer = 0;
  let distance = 0;
  let nextPit = pitInterval;
  let fuel = 100;
  let speedBoost = 1;
  let shield = 4;
  let shipX = 50;
  let invulnerableUntil = 0;
  let problem = null;
  let inPitstop = false;
  let stationActive = false;
  let stationY = -42;
  let stationX = 50;
  let pointerActive = false;
  let pointerBaseX = 0;
  let pointerTurn = 0;
  let pointerControl = null;
  let sliderTurn = 0;
  let keyboardTurn = 0;
  const keys = { left: false, right: false };

  function playSound(name) {
    if (window.EducationStationSound && window.EducationStationSound.play) {
      window.EducationStationSound.play(name);
      return;
    }
    document.dispatchEvent(new CustomEvent("educationstation:sound", { detail: { name } }));
  }

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function clamp(min, max, value) {
    return Math.max(min, Math.min(max, value));
  }

  function reset() {
    clearObstacles();
    distance = 0;
    nextPit = pitInterval;
    fuel = 100;
    speedBoost = 1;
    shield = 4;
    shipX = 50;
    pointerActive = false;
    pointerTurn = 0;
    pointerControl = null;
    sliderTurn = 0;
    slider.value = 0;
    keyboardTurn = 0;
    keys.left = false;
    keys.right = false;
    spawnTimer = 0;
    paused = false;
    running = true;
    inPitstop = false;
    stationActive = false;
    station.hidden = true;
    pitstop.hidden = true;
    track.classList.remove("racer-paused");
    pauseButton.textContent = "II";
    ship.src = "../assets/images/ship_on.png";
    feedback.textContent = "Dodge racers. Touch stations for math fuel.";
    updateHud();
    updateShip();
    updateSteerPuck(0);
  }

  function clearObstacles() {
    obstacles.splice(0).forEach((obstacle) => obstacle.node.remove());
  }

  function updateHud() {
    const distanceValue = Math.floor(distance);
    distanceNode.textContent = distanceValue;
    distanceBigNode.textContent = distanceValue;
    fuelNode.textContent = Math.max(0, Math.floor(fuel));
    if (fuelFill) fuelFill.style.width = Math.max(0, Math.min(100, fuel)) + "%";
    shieldNode.textContent = shield;
    statusSpeedNode.textContent = currentSpeed().toFixed(1);
    speedNode.textContent = currentSpeed().toFixed(1);
    nextPitNode.textContent = stationActive ? "DOCK" : Math.max(0, Math.floor(nextPit - distance));
    shipWrap.classList.remove("shield-green", "shield-yellow", "shield-red", "shield-critical");
    shipWrap.classList.add(shield >= 4 ? "shield-green" : shield === 3 ? "shield-yellow" : shield === 2 ? "shield-red" : "shield-critical");
  }

  function currentSpeed() {
    return fuel > 0 ? speedBoost : 0.18;
  }

  function updateShip() {
    const steering = getSteering();
    shipWrap.style.left = shipX + "%";
    shipWrap.style.transform = "translateX(-50%) rotate(" + (steering * 22).toFixed(1) + "deg)";
  }

  function getSteering() {
    if (pointerActive) return pointerTurn;
    if (Math.abs(keyboardTurn) > 0.01 || keys.left || keys.right) return keyboardTurn;
    return sliderTurn;
  }

  function getRestingSteering() {
    if (Math.abs(keyboardTurn) > 0.01 || keys.left || keys.right) return keyboardTurn;
    return sliderTurn;
  }

  function setSliderTurn(value) {
    sliderTurn = clamp(-1, 1, value);
    if (!pointerActive && !(keys.left || keys.right || Math.abs(keyboardTurn) > 0.01)) {
      updateSteerPuck(sliderTurn);
      updateShip();
    }
  }

  function updateSteerPuck(value) {
    if (!steerPuck) return;
    steerPuck.style.transform = "translate(-50%, -50%) translateX(" + (value * 72).toFixed(1) + "px)";
  }

  function updateKeyboardTurn(delta) {
    const target = keys.left && !keys.right ? -1 : keys.right && !keys.left ? 1 : 0;
    const step = delta / 420;
    keyboardTurn += clamp(-step, step, target - keyboardTurn);
    if (!pointerActive) updateSteerPuck(Math.abs(keyboardTurn) > 0.01 || keys.left || keys.right ? keyboardTurn : sliderTurn);
  }

  function spawnObstacle() {
    const node = document.createElement("div");
    node.className = "racer-obstacle";
    node.style.left = rand(8, 92) + "%";
    node.style.top = "-12%";
    node.innerHTML = '<img src="../assets/images/ship_off.png" alt="">';
    track.appendChild(node);
    obstacles.push({ node, y: -12, x: Number.parseFloat(node.style.left), hit: false });
  }

  function step(now) {
    if (!running) return;
    const delta = Math.min(50, now - lastTime || 16);
    lastTime = now;

    if (!paused) {
      const speed = currentSpeed();
      updateKeyboardTurn(delta);
      const steering = getSteering();
      shipX = Math.max(6, Math.min(94, shipX + steering * delta * 0.026));
      updateShip();
      distance += delta * 0.035 * speed;
      fuel = Math.max(0, fuel - delta * 0.006 * speedBoost);
      spawnTimer -= delta;
      if (spawnTimer <= 0) {
        spawnObstacle();
        spawnTimer = Math.max(520, 1300 - distance * 0.7);
      }
      moveObstacles(delta, speed, now);
      if (distance >= nextPit && !stationActive && !inPitstop) deployStation();
      moveStation(delta, speed);
      updateHud();
    }

    window.requestAnimationFrame(step);
  }

  function moveObstacles(delta, speed, now) {
    for (let index = obstacles.length - 1; index >= 0; index -= 1) {
      const obstacle = obstacles[index];
      obstacle.y += delta * 0.025 * (1.2 + speed * 0.5);
      obstacle.node.style.top = obstacle.y + "%";

      if (!obstacle.hit && obstacle.y > 69 && obstacle.y < 87 && Math.abs(obstacle.x - shipX) < 9) {
        obstacle.hit = true;
        hitShield(now);
      }

      if (obstacle.y > 112) {
        obstacle.node.remove();
        obstacles.splice(index, 1);
      }
    }
  }

  function deployStation() {
    stationActive = true;
    stationY = -46;
    stationX = 50;
    nextPit += pitInterval;
    station.hidden = false;
    station.style.left = stationX + "%";
    station.style.top = stationY + "%";
    feedback.textContent = "Station ahead. Steer into it to dock.";
    playSound("train_indicator");
  }

  function moveStation(delta, speed) {
    if (!stationActive) return;
    stationY += delta * 0.012 * (0.75 + speed * 0.32);
    station.style.top = stationY + "%";

    const stationCenterY = stationY + 18;
    if (stationCenterY > 58 && stationCenterY < 88 && Math.abs(stationX - shipX) < 24) {
      dockPitstop();
      return;
    }

    if (stationY > 120) {
      stationActive = false;
      station.hidden = true;
      feedback.textContent = "Station missed. Keep racing to the next dock.";
    }
  }

  function hitShield(now) {
    if (now < invulnerableUntil) return;
    invulnerableUntil = now + 1100;
    shield -= 1;
    playSound("error");
    shipWrap.classList.add("ship-hit");
    window.setTimeout(() => shipWrap.classList.remove("ship-hit"), 400);
    feedback.textContent = "Shield hit. " + shield + " layers remain.";
    if (shield <= 0) endRace();
  }

  function endRace() {
    running = false;
    paused = true;
    inPitstop = false;
    stationActive = false;
    pointerActive = false;
    pointerTurn = 0;
    pointerControl = null;
    sliderTurn = 0;
    slider.value = 0;
    ship.src = "../assets/images/ship_off.png";
    station.hidden = true;
    track.classList.remove("racer-paused");
    pauseButton.textContent = "II";
    feedback.textContent = "Race over. Distance " + Math.floor(distance) + ". Press READY to restart.";
    ready.hidden = false;
    ready.textContent = ">> RESTART <<";
  }

  function dockPitstop() {
    paused = true;
    inPitstop = true;
    stationActive = false;
    station.hidden = false;
    pitstop.hidden = false;
    ship.src = "../assets/images/ship_off.png";
    pointerActive = false;
    pointerTurn = 0;
    pointerControl = null;
    sliderTurn = 0;
    slider.value = 0;
    keyboardTurn = 0;
    keys.left = false;
    keys.right = false;
    track.classList.remove("racer-paused");
    pauseButton.textContent = "II";
    updateSteerPuck(0);
    updateShip();
    playSound("powerup_2");
    updatePitSummary();
    buildProblem();
    feedback.textContent = "Pitstop docked. Solve as many as you like, then launch.";
  }

  function buildProblem() {
    const a = rand(2, 12);
    const b = rand(2, 12);
    const useMultiply = distance > 1200 && Math.random() > 0.45;
    const answer = useMultiply ? a * b : a + b;
    const prompt = useMultiply ? a + " x " + b : a + " + " + b;
    const options = [answer, answer + rand(1, 4), Math.max(0, answer - rand(1, 4)), answer + rand(5, 9)]
      .sort(() => Math.random() - 0.5);
    const rewardType = choice(["fuel", "speed", "shield"]);
    problem = { answer, rewardType };
    pitReward.textContent = rewardType === "fuel" ? "⛽ Earn Fuel" : rewardType === "speed" ? "⚡ Earn Speed" : "🛡 Earn Shield";
    question.textContent = prompt + " = ?";
    choices.innerHTML = options.map((value) => '<button type="button" class="command-button" data-answer="' + value + '">' + value + "</button>").join("");
  }

  function choice(values) {
    return values[rand(0, values.length - 1)];
  }

  function updatePitSummary() {
    pitSummary.innerHTML = [
      '<span>⛽ Fuel <strong>' + Math.floor(fuel) + "</strong></span>",
      '<span>⚡ Speed <strong>' + speedBoost.toFixed(1) + "x</strong></span>",
      '<span>🛡 Shield <strong>' + shield + "</strong></span>"
    ].join("");
  }

  choices.addEventListener("click", function (event) {
    const button = event.target.closest("[data-answer]");
    if (!button || !problem) return;
    const value = Number(button.dataset.answer);
    if (value === problem.answer) {
      if (problem.rewardType === "fuel") {
        fuel += 35;
      } else if (problem.rewardType === "speed") {
        speedBoost += 0.22;
      } else {
        shield += 1;
      }
      playSound("small_victory");
      feedback.textContent = problem.rewardType === "fuel" ? "Fuel loaded. Solve again or launch." : problem.rewardType === "speed" ? "Speed tuned. Solve again or launch." : "Shield layer added. Solve again or launch.";
      updateHud();
      updatePitSummary();
      buildProblem();
      return;
    }
    playSound("error");
    feedback.textContent = "Not quite. Try this station problem.";
    buildProblem();
  });

  function resumeRace() {
    problem = null;
    pitstop.hidden = true;
    station.hidden = true;
    inPitstop = false;
    clearObstacles();
    spawnTimer = 0;
    invulnerableUntil = performance.now() + 1200;
    pointerActive = false;
    pointerTurn = 0;
    pointerControl = null;
    sliderTurn = 0;
    slider.value = 0;
    ship.src = "../assets/images/ship_on.png";
    updateSteerPuck(0);
    updateShip();
    updateHud();
    window.setTimeout(function () {
      paused = false;
      feedback.textContent = "Back on course.";
    }, 900);
  }

  launchButton.addEventListener("click", resumeRace);

  function togglePause() {
    if (!running || inPitstop) return;
    paused = !paused;
    track.classList.toggle("racer-paused", paused);
    pauseButton.textContent = paused ? "▶" : "II";
    feedback.textContent = paused ? "Paused." : "Race resumed.";
    if (!paused) lastTime = performance.now();
  }

  pauseButton.addEventListener("click", togglePause);

  function startPointerTurn(event) {
    if (!running || paused || inPitstop || event.target.closest("button")) return;
    pointerActive = true;
    pointerControl = event.currentTarget;
    pointerBaseX = event.clientX;
    pointerTurn = 0;
    pointerControl.setPointerCapture(event.pointerId);
    updateSteerPuck(0);
    updateShip();
  }

  function movePointerTurn(event) {
    if (!pointerActive) return;
    pointerTurn = clamp(-1, 1, (event.clientX - pointerBaseX) / 110);
    updateSteerPuck(pointerTurn);
    updateShip();
  }

  function endPointerTurn(event) {
    if (!pointerActive) return;
    pointerActive = false;
    pointerTurn = 0;
    if (event && pointerControl && pointerControl.hasPointerCapture(event.pointerId)) {
      pointerControl.releasePointerCapture(event.pointerId);
    }
    pointerControl = null;
    updateSteerPuck(getRestingSteering());
    updateShip();
  }

  track.addEventListener("pointerdown", startPointerTurn);
  track.addEventListener("pointermove", movePointerTurn);
  track.addEventListener("pointerup", endPointerTurn);
  track.addEventListener("pointercancel", endPointerTurn);

  slider.addEventListener("input", function () {
    setSliderTurn(Number(slider.value) / 30);
  });

  document.addEventListener("keydown", function (event) {
    if ((event.key === "Enter" || event.code === "Enter") && !ready.hidden) {
      event.preventDefault();
      ready.click();
      return;
    }
    if (event.code === "Space") {
      if (!running || inPitstop) return;
      event.preventDefault();
      togglePause();
      return;
    }
    if (!running || inPitstop) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      keys.left = true;
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      keys.right = true;
    }
  });

  document.addEventListener("keyup", function (event) {
    if (!running || inPitstop) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      keys.left = false;
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      keys.right = false;
    }
  });

  ready.addEventListener("click", function () {
    ready.hidden = true;
    reset();
    lastTime = performance.now();
    playSound("powerup_3");
    window.requestAnimationFrame(step);
  });

  updateShip();
  updateHud();
})();
