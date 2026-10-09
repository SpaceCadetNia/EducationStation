(function () {
  if (document.body.dataset.game !== "space-racer") return;

  const track = document.getElementById("racer-track");
  const lanes = track.querySelector(".racer-lanes");
  const ready = document.getElementById("racer-ready");
  const pauseButton = document.getElementById("racer-pause");
  const slider = document.getElementById("racer-position");
  const steerPad = document.getElementById("racer-steer-pad");
  const steerPuck = document.getElementById("racer-steer-puck");
  const shipWrap = document.getElementById("racer-ship-wrap");
  const ship = document.getElementById("racer-ship");
  const station = document.getElementById("racer-station");
  const stationWarning = document.getElementById("racer-station-warning");
  const pitstop = document.getElementById("pitstop-panel");
  const picker = document.getElementById("pitstop-picker");
  const pitResult = document.getElementById("pitstop-result");
  const cargoSlots = document.getElementById("cargo-slots");
  const cargoCount = document.getElementById("cargo-count");
  const question = document.getElementById("pitstop-question");
  const choices = document.getElementById("pitstop-choices");
  const launchButton = document.getElementById("pitstop-launch");
  const feedback = document.getElementById("racer-feedback");
  const distanceNode = document.getElementById("racer-distance");
  const distanceBigNode = document.getElementById("racer-distance-big");
  const recordNode = document.getElementById("racer-record");
  const Reward = window.EducationStationReward;
  let bestDistance = Reward ? Reward.record("space-racer") : 0;
  const fuelNode = document.getElementById("racer-fuel");
  const shieldNode = document.getElementById("racer-shield");
  const statusSpeedNode = document.getElementById("racer-status-speed");
  const speedNode = document.getElementById("racer-speed");
  const nextPitNode = document.getElementById("racer-next-pit");
  const fuelFill = document.getElementById("racer-fuel-fill");
  const pitSummary = document.getElementById("pitstop-summary");
  const pitLevel = document.getElementById("pitstop-level");

  const obstacles = [];
  const MAX_FUEL = 100;
  const FUEL_DRAIN = 0.006; // fuel per ms, the same at every speed
  const WARNING_MS = 2000; // flash the station position this long before it appears
  const HEADINGS = [-60, -40, -20, 0, 20, 40, 60];
  const PERSONALITIES = {
    cruiser: { speed: [0.8, 1.0], turnEvery: [2600, 5000], maxStep: 1, turnRate: 70, range: 1 },
    weaver: { speed: [0.85, 1.1], turnEvery: [700, 1500], maxStep: 1, turnRate: 140, range: 2 },
    drifter: { speed: [0.5, 0.7], turnEvery: [1400, 2800], maxStep: 2, turnRate: 60, range: 3 },
    hotshot: { speed: [1.2, 1.45], turnEvery: [1800, 3600], maxStep: 2, turnRate: 220, range: 2 }
  };
  // Turn signals: ships blink toward their new heading before they turn.
  const SIGNAL_MS = 900;
  const EDGE_SIGNAL_MS = 550;
  // What comes down the track. Ships steer (with signals); rocks and
  // satellites just float and spin.
  const OBSTACLE_MIX = [
    { type: "ship", weight: 55 },
    { type: "rockLarge", weight: 8, group: "rocksLarge", size: [70, 88], drift: [0.45, 0.6], spin: 18 },
    { type: "rockMedium", weight: 13, group: "rocksMedium", size: [48, 60], drift: [0.5, 0.75], spin: 30 },
    { type: "rockSmall", weight: 12, group: "rocksSmall", size: [24, 34], drift: [0.6, 0.9], spin: 50 },
    { type: "satellite", weight: 12, group: "satellites", size: [62, 78], drift: [0.45, 0.65], spin: 10 }
  ];
  const PIT_TANK_SHARE = 0.9; // next station arrives when a full tank is 90% used
  const CARGO_LIMIT = 5;
  const MAX_SHIELD = 4;
  const SHIP_DENSITY = 0.7;
  const SCROLL_RATE = 0.0005; // background travel per ms, as a share of track height, at 1x
  const STAR_TILE = 46; // px, matches .racer-lanes background-size
  const GRID_TILE = 34; // px, matches the track's horizontal grid lines
  const VISITS_PER_LEVEL = 3;
  const MAX_LEVEL = 10;
  const FUEL_ITEM = 35;
  const SPEED_ITEM = 0.22;
  const STATION_DOCK_Y = 40; // stationY where the docking window opens
  const STATION_START_Y = -46;
  const REWARDS = {
    fuel: { icon: "⛽", label: "Fuel" },
    speed: { icon: "⚡", label: "Speed" },
    shield: { icon: "🛡", label: "Shield" }
  };
  let running = false;
  let paused = false;
  let lastTime = 0;
  let spawnTimer = 0;
  let distance = 0;
  let legElapsed = 0;
  let legDuration = 0;
  let fuel = MAX_FUEL;
  let speedBoost = 1;
  let shield = 4;
  let shipX = 50;
  let invulnerableUntil = 0;
  let problem = null;
  let inPitstop = false;
  let stationActive = false;
  let spriteGroups = null;
  let scrollOffset = 0;
  let warningActive = false;
  let warningElapsed = 0;
  let outOfFuelNoted = false;
  let stationY = STATION_START_Y;
  let selectedReward = "fuel";
  let cargo = [];
  let stationVisits = 0;
  let answerLocked = false;
  let answerTimer = 0;
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

  // Space dust and grid lines stream past at the ship's real speed
  // (slower when coasting with no fuel, faster with speed boosts).
  function scrollBackground(delta, speed) {
    const height = track.clientHeight || 400;
    scrollOffset = (scrollOffset + delta * SCROLL_RATE * speed * height) % (STAR_TILE * GRID_TILE);
    lanes.style.backgroundPosition = "0 " + (scrollOffset % STAR_TILE).toFixed(1) + "px";
    track.style.backgroundPosition = "0 " + (scrollOffset % GRID_TILE).toFixed(1) + "px, 0 0, 0 0";
  }

  function reset() {
    clearObstacles();
    distance = 0;
    fuel = MAX_FUEL;
    speedBoost = 1;
    shield = MAX_SHIELD;
    stationVisits = 0;
    shipX = 50;
    startLeg();
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
    hideWarning();
    outOfFuelNoted = false;
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
    updateRecord(distanceValue);
    fuelNode.textContent = Math.max(0, Math.floor(fuel));
    if (fuelFill) fuelFill.style.width = Math.max(0, Math.min(100, fuel)) + "%";
    shieldNode.innerHTML = shieldBoxesHtml();
    shieldNode.setAttribute("aria-label", "Shield " + shield + " of " + MAX_SHIELD);
    statusSpeedNode.textContent = speedBoost.toFixed(1) + "x";
    speedNode.textContent = speedBoost.toFixed(1) + "x";
    track.classList.toggle("racer-no-fuel", fuel <= 0);
    fuelNode.parentElement.classList.toggle("hud-empty", fuel <= 0);
    nextPitNode.textContent = stationActive || inPitstop ? "DOCK" : Math.max(0, Math.ceil(Math.round(legDuration - legElapsed) / 1000)) + "s";
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

  // Stations arrive on a timer, not by distance: a full tank lasts just
  // past the next station, so anything less than full means a slowdown.
  function fullTankMs() {
    return MAX_FUEL / FUEL_DRAIN;
  }

  function startLeg() {
    legElapsed = 0;
    legDuration = PIT_TANK_SHARE * fullTankMs();
  }

  function stationApproachMs(speed) {
    return (STATION_DOCK_Y - STATION_START_Y) / (0.012 * (0.75 + speed * 0.32));
  }

  function trackAspect() {
    const width = track.clientWidth || 1;
    return (track.clientHeight || 1) / width;
  }

  function between(range) {
    return range[0] + Math.random() * (range[1] - range[0]);
  }

  function pickPersonality() {
    const roll = Math.random();
    if (roll < 0.3) return "cruiser";
    if (roll < 0.6) return "weaver";
    if (roll < 0.85) return "drifter";
    return "hotshot";
  }

  // Like skiers on a slope: each ship holds a heading for a while, then
  // picks a new one nearby. Mostly downhill, sometimes a wide sideways cut.
  // Pick the next heading, but don't turn yet: blink a signal first.
  function planTurn(obstacle, forceDir) {
    const p = PERSONALITIES[obstacle.kind];
    const center = 3;
    let index = HEADINGS.indexOf(obstacle.targetHeading);
    if (index < 0) index = center;
    let step = rand(1, p.maxStep) * (Math.random() < 0.5 ? -1 : 1);
    // Pull back toward straight down so ships keep coming at you.
    if (Math.abs(index + step - center) > p.range) step = index > center ? -1 : 1;
    if (forceDir) step = forceDir * Math.max(1, Math.abs(step));
    const next = HEADINGS[clamp(center - p.range, center + p.range, index + step)];
    obstacle.nextTurn = between(p.turnEvery);
    if (next === obstacle.targetHeading) return;
    obstacle.pendingHeading = next;
    obstacle.signal = forceDir ? EDGE_SIGNAL_MS : SIGNAL_MS;
    obstacle.node.classList.toggle("signal-right", next > obstacle.heading);
    obstacle.node.classList.toggle("signal-left", next < obstacle.heading);
  }

  function updateSignal(obstacle, delta) {
    if (obstacle.pendingHeading === null) return;
    obstacle.signal -= delta;
    if (obstacle.signal > 0) return;
    obstacle.targetHeading = obstacle.pendingHeading;
    obstacle.pendingHeading = null;
    obstacle.node.classList.remove("signal-left", "signal-right");
  }

  function pickObstacleType() {
    const total = OBSTACLE_MIX.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * total;
    for (const item of OBSTACLE_MIX) {
      roll -= item.weight;
      if (roll <= 0) return item;
    }
    return OBSTACLE_MIX[0];
  }

  function spriteFrom(group) {
    const list = spriteGroups && spriteGroups[group];
    if (!list || !list.length) return null;
    const sprite = list[rand(0, list.length - 1)];
    return sprite.url ? sprite : null;
  }

  function spawnObstacle() {
    const node = document.createElement("div");
    node.className = "racer-obstacle";
    const spec = pickObstacleType();
    const isShip = spec.type === "ship";
    let sprite = null;
    if (isShip) sprite = spriteFrom(Math.random() < 0.5 ? "shipsA" : "shipsB");
    else sprite = spriteFrom(spec.group);
    // Until the sprite sheet loads, everything is a classic ship.
    const ship = isShip || !sprite;
    const src = sprite ? sprite.url : "../assets/images/ship_off.png";
    node.innerHTML = '<img src="' + src + '" alt="">' +
      (ship ? '<span class="racer-blinker left"></span><span class="racer-blinker right"></span>' : "");
    node.classList.add(ship ? "obstacle-ship" : "obstacle-float");

    let obstacle;
    if (ship) {
      const kind = pickPersonality();
      const p = PERSONALITIES[kind];
      const range = HEADINGS.slice(3 - p.range, 4 + p.range);
      const heading = range[rand(0, range.length - 1)];
      node.style.width = (sprite ? rand(50, 60) : 58) + "px";
      obstacle = {
        node, ship: true, kind,
        y: -12, x: rand(8, 92),
        heading, targetHeading: heading, pendingHeading: null, signal: 0,
        speedFactor: between(p.speed),
        nextTurn: between(p.turnEvery) * 0.6,
        hit: false
      };
    } else {
      node.style.width = rand(spec.size[0], spec.size[1]) + "px";
      obstacle = {
        node, ship: false, kind: spec.type,
        y: -14, x: rand(6, 94),
        heading: rand(-15, 15), spinAngle: rand(0, 359),
        spin: (Math.random() < 0.5 ? -1 : 1) * between([spec.spin * 0.4, spec.spin]),
        speedFactor: between(spec.drift),
        hit: false
      };
    }
    track.appendChild(node);
    obstacles.push(obstacle);
    placeObstacle(obstacle);
  }

  function placeObstacle(obstacle) {
    const angle = obstacle.ship ? obstacle.heading : obstacle.spinAngle;
    obstacle.node.style.left = obstacle.x + "%";
    obstacle.node.style.top = obstacle.y + "%";
    obstacle.node.style.transform = "translateX(-50%) rotate(" + angle.toFixed(1) + "deg)";
  }

  // Collide on the sprite artwork, trimmed a little so grazes don't count.
  function obstacleHitsShip(obstacle) {
    if (obstacle.y < 45 || obstacle.y > 100) return false;
    const art = obstacle.node.querySelector("img") || obstacle.node;
    const trim = obstacle.ship ? 0.2 : 0.22;
    const o = insetRect(art.getBoundingClientRect(), trim, trim, trim, trim);
    const p = insetRect(ship.getBoundingClientRect(), 0.2, 0.12, 0.2, 0.12);
    return p.left < o.right && p.right > o.left && p.top < o.bottom && p.bottom > o.top;
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
      fuel = Math.max(0, fuel - delta * FUEL_DRAIN);
      if (fuel <= 0 && !outOfFuelNoted) {
        outOfFuelNoted = true;
        feedback.textContent = "Out of fuel! Coasting slowly to the next station.";
      }
      spawnTimer -= delta;
      if (spawnTimer <= 0) {
        spawnObstacle();
        // Dividing by SHIP_DENSITY spawns 30% fewer ships than before.
        spawnTimer = Math.max(520, 1300 - distance * 0.7) / SHIP_DENSITY;
      }
      scrollBackground(delta, speed);
      moveObstacles(delta, speed, now);
      legElapsed += delta;
      if (!stationActive && !inPitstop && !warningActive &&
        legElapsed >= legDuration - stationApproachMs(speed) - WARNING_MS) showWarning();
      if (warningActive) {
        warningElapsed += delta;
        if (warningElapsed >= WARNING_MS) deployStation();
      }
      moveStation(delta, speed);
      updateHud();
    }

    window.requestAnimationFrame(step);
  }

  function moveObstacles(delta, speed, now) {
    const aspect = trackAspect();
    for (let index = obstacles.length - 1; index >= 0; index -= 1) {
      const obstacle = obstacles[index];
      if (obstacle.ship) {
        const p = PERSONALITIES[obstacle.kind];
        obstacle.nextTurn -= delta;
        updateSignal(obstacle, delta);
        if (obstacle.pendingHeading === null) {
          if (obstacle.x < 10 && obstacle.targetHeading <= 0) planTurn(obstacle, 1);
          else if (obstacle.x > 90 && obstacle.targetHeading >= 0) planTurn(obstacle, -1);
          else if (obstacle.nextTurn <= 0) planTurn(obstacle);
        }
        const turn = (delta / 1000) * p.turnRate;
        obstacle.heading += clamp(-turn, turn, obstacle.targetHeading - obstacle.heading);
      } else {
        obstacle.spinAngle += (delta / 1000) * obstacle.spin;
      }
      const radians = (obstacle.heading * Math.PI) / 180;
      const base = delta * 0.025 * (1.2 + speed * 0.5) * obstacle.speedFactor;
      obstacle.y += base * (0.55 + 0.45 * Math.cos(radians));
      obstacle.x = clamp(3, 97, obstacle.x + base * Math.sin(radians) * aspect * 1.1);
      if (!obstacle.ship && (obstacle.x <= 3 || obstacle.x >= 97)) obstacle.heading = -obstacle.heading;
      placeObstacle(obstacle);

      if (!obstacle.hit && obstacleHitsShip(obstacle)) {
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
    stationY = STATION_START_Y;
    hideWarning();
    station.hidden = false;
    station.style.left = stationX + "%";
    station.style.top = stationY + "%";
    feedback.textContent = "Station ahead. Steer into it to dock.";
  }

  function showWarning() {
    warningActive = true;
    warningElapsed = 0;
    stationX = rand(22, 78);
    stationWarning.style.left = stationX + "%";
    stationWarning.hidden = false;
    feedback.textContent = "Station coming! Get under the warning sign.";
    playSound("train_indicator");
  }

  function hideWarning() {
    warningActive = false;
    warningElapsed = 0;
    stationWarning.hidden = true;
  }

  function moveStation(delta, speed) {
    if (!stationActive) return;
    stationY += delta * 0.012 * (0.75 + speed * 0.32);
    station.style.top = stationY + "%";

    if (shipTouchesStation()) {
      dockPitstop();
      return;
    }

    if (stationY > 120) {
      stationActive = false;
      station.hidden = true;
      startLeg();
      feedback.textContent = "Station missed. Keep racing to the next dock.";
    }
  }

  // Dock only when the ship actually overlaps the station artwork.
  // station.png has transparent margins: the ring spans ~14%-86% of its width.
  function insetRect(rect, left, top, right, bottom) {
    return {
      left: rect.left + rect.width * left,
      right: rect.right - rect.width * right,
      top: rect.top + rect.height * top,
      bottom: rect.bottom - rect.height * bottom
    };
  }

  function shipTouchesStation() {
    const art = station.querySelector("img") || station;
    const s = insetRect(art.getBoundingClientRect(), 0.15, 0.08, 0.15, 0.1);
    const p = insetRect(ship.getBoundingClientRect(), 0.18, 0.12, 0.18, 0.12);
    return p.left < s.right && p.right > s.left && p.top < s.bottom && p.bottom > s.top;
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

  // Record distance: shown under the big distance number, saved on this device.
  function updateRecord(current) {
    if (!recordNode) return;
    const beating = bestDistance > 0 && current > bestDistance;
    const shown = Math.max(bestDistance, current);
    recordNode.hidden = !bestDistance && !beating;
    recordNode.textContent = beating ? "New record!" : "Record " + shown;
    recordNode.classList.toggle("new-record", beating);
  }

  function saveRecord() {
    if (!Reward) return false;
    const isNew = Reward.saveRecord("space-racer", Math.floor(distance));
    if (isNew) bestDistance = Math.floor(distance);
    return isNew;
  }

  window.addEventListener("pagehide", saveRecord);

  function endRace() {
    const newRecord = saveRecord();
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
    hideWarning();
    track.classList.remove("racer-paused");
    pauseButton.textContent = "II";
    feedback.textContent = (newRecord ? "New record! " : "Race over. ") + "Distance " + Math.floor(distance) + ". Press READY to restart.";
    updateRecord(Math.floor(distance));
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
    cargo = [];
    stationVisits += 1;
    pitLevel.textContent = mathLevel();
    answerLocked = false;
    pitResult.textContent = "";
    pitResult.className = "pitstop-result";
    if (fuel >= MAX_FUEL && selectedReward === "fuel") selectedReward = "speed";
    updatePitSummary();
    updatePicker();
    renderCargo();
    buildProblem();
    feedback.textContent = "Pitstop docked. Pick what to earn. Cargo holds " + CARGO_LIMIT + " items.";
  }

  // ---------- Math levels ----------
  // Every 3 station visits unlocks a new problem type. Each problem is drawn
  // from the newest level and the two before it.
  function mathLevel() {
    return Math.min(MAX_LEVEL, Math.floor(Math.max(0, stationVisits - 1) / VISITS_PER_LEVEL));
  }

  // "Up to N" = the N-times tables: one factor 2..N, the other 2..10
  // (2..12 for the 12s). No x1 or x0 problems.
  function timesTable(maxFactor) {
    const table = rand(2, maxFactor);
    const other = rand(2, maxFactor === 12 ? 12 : 10);
    const pair = Math.random() < 0.5 ? [table, other] : [other, table];
    return { text: pair[0] + " × " + pair[1], answer: pair[0] * pair[1] };
  }

  function sumOf(count) {
    const terms = Array.from({ length: count }, () => rand(1, 9));
    return { text: terms.join(" + "), answer: terms.reduce((total, n) => total + n, 0) };
  }

  function mixedChain(allowNegative) {
    const count = rand(3, 4);
    let total = rand(2, 9);
    let text = String(total);
    for (let index = 1; index < count; index += 1) {
      const n = rand(1, 9);
      const subtract = Math.random() < 0.5;
      if (subtract && (allowNegative || total - n >= 0)) {
        total -= n;
        text += " - " + n;
      } else {
        total += n;
        text += " + " + n;
      }
    }
    if (allowNegative && total >= 0 && Math.random() < 0.5) {
      const n = total + rand(1, 6);
      total -= n;
      text += " - " + n;
    }
    return { text, answer: total };
  }

  const PROBLEM_LEVELS = [
    () => { const a = rand(1, 9); const b = rand(1, 9); return { text: a + " + " + b, answer: a + b }; },
    () => timesTable(3),
    () => { const a = rand(10, 89); const b = rand(10, 99 - a); return { text: a + " + " + b, answer: a + b }; },
    () => timesTable(6),
    () => timesTable(9),
    () => { const a = rand(1, 9); const b = rand(0, a); return { text: a + " - " + b, answer: a - b }; },
    () => sumOf(3),
    () => timesTable(12),
    () => sumOf(4),
    () => mixedChain(false),
    () => mixedChain(true)
  ];

  function makeProblem() {
    const level = mathLevel();
    const pick = rand(Math.max(0, level - 2), level);
    return PROBLEM_LEVELS[pick]();
  }

  function buildProblem() {
    const made = makeProblem();
    const answer = made.answer;
    const options = [answer];
    let guard = 0;
    while (options.length < 4 && guard < 100) {
      guard += 1;
      let wrong = answer + (Math.random() < 0.5 ? -1 : 1) * rand(1, Math.max(4, Math.min(12, Math.round(Math.abs(answer) / 4) + 3)));
      if (answer >= 0) wrong = Math.max(0, wrong);
      if (!options.includes(wrong)) options.push(wrong);
    }
    options.sort(() => Math.random() - 0.5);
    problem = { answer };
    question.textContent = made.text + " = ?";
    choices.innerHTML = options.map((value) => '<button type="button" class="command-button" data-answer="' + value + '">' + value + "</button>").join("");
  }

  function shieldBoxesHtml() {
    const boxes = [];
    for (let level = 1; level <= MAX_SHIELD; level += 1) {
      const filled = level <= shield;
      boxes.push('<span class="shield-box shield-level-' + level + (filled ? " filled" : "") + '"></span>');
    }
    return boxes.join("");
  }

  function choice(values) {
    return values[rand(0, values.length - 1)];
  }

  // Same labels, icons and numbers as the race HUD.
  function updatePitSummary() {
    pitSummary.innerHTML = [
      '<span class="hud-fuel' + (fuel <= 0 ? " hud-empty" : "") + '">⛽ Fuel <strong>' + Math.max(0, Math.floor(fuel)) + "</strong></span>",
      "<span>⚡ Speed <strong>" + speedBoost.toFixed(1) + "x</strong></span>",
      '<span class="hud-shield"><span class="shield-boxes" role="img" aria-label="Shield ' + shield + " of " + MAX_SHIELD + '">' + shieldBoxesHtml() + "</span></span>"
    ].join("");
  }

  function cargoFull() {
    return cargo.length >= CARGO_LIMIT;
  }

  function rewardAvailable(type) {
    if (type === "fuel") return fuel < MAX_FUEL;
    if (type === "shield") return shield < MAX_SHIELD;
    return true;
  }

  function updatePicker() {
    if (!rewardAvailable(selectedReward)) {
      selectedReward = ["fuel", "speed", "shield"].find(rewardAvailable) || "speed";
    }
    picker.querySelectorAll("[data-reward]").forEach(function (button) {
      const type = button.dataset.reward;
      button.setAttribute("aria-pressed", String(type === selectedReward));
      button.disabled = !rewardAvailable(type) || cargoFull();
      const full = (type === "fuel" && fuel >= MAX_FUEL) || (type === "shield" && shield >= MAX_SHIELD);
      button.textContent = REWARDS[type].icon + " " + (full ? (type === "fuel" ? "Tank Full" : "Shields Full") : REWARDS[type].label);
    });
  }

  function renderCargo() {
    const slots = [];
    for (let index = 0; index < CARGO_LIMIT; index += 1) {
      const item = cargo[index];
      slots.push(item
        ? '<span class="cargo-slot filled cargo-' + item + '" title="' + REWARDS[item].label + '">' + REWARDS[item].icon + "</span>"
        : '<span class="cargo-slot"></span>');
    }
    cargoSlots.innerHTML = slots.join("");
    cargoCount.textContent = cargo.length + "/" + CARGO_LIMIT;
  }

  function applyReward(type) {
    if (type === "fuel") fuel = Math.min(MAX_FUEL, fuel + FUEL_ITEM);
    else if (type === "speed") speedBoost += SPEED_ITEM;
    else shield = Math.min(MAX_SHIELD, shield + 1);
  }

  function showCargoFull() {
    question.textContent = "Cargo full!";
    choices.innerHTML = "";
    feedback.textContent = "Cargo bay full. Launch when ready.";
    launchButton.focus({ preventScroll: true });
  }

  picker.addEventListener("click", function (event) {
    const button = event.target.closest("[data-reward]");
    if (!button || button.disabled) return;
    selectedReward = button.dataset.reward;
    playSound("beep");
    updatePicker();
  });

  choices.addEventListener("click", function (event) {
    const button = event.target.closest("[data-answer]");
    if (!button || !problem || answerLocked || cargoFull()) return;
    answerLocked = true;
    const value = Number(button.dataset.answer);
    const correct = value === problem.answer;
    choices.querySelectorAll("[data-answer]").forEach(function (option) {
      option.disabled = true;
      if (Number(option.dataset.answer) === problem.answer) option.classList.add("answer-correct");
    });
    if (!correct) button.classList.add("answer-wrong");

    if (correct) {
      const type = selectedReward;
      applyReward(type);
      cargo.push(type);
      playSound("small_victory");
      pitResult.textContent = "✓ Correct! +" + REWARDS[type].icon + " " + REWARDS[type].label;
      pitResult.className = "pitstop-result result-correct";
      feedback.textContent = REWARDS[type].label + " loaded into cargo.";
      renderCargo();
      updateHud();
      updatePitSummary();
    } else {
      playSound("error");
      pitResult.textContent = "✗ Not quite. " + question.textContent.replace("?", problem.answer);
      pitResult.className = "pitstop-result result-wrong";
      feedback.textContent = "No cargo this time. Try the next one.";
    }

    answerTimer = window.setTimeout(function () {
      answerLocked = false;
      pitResult.textContent = "";
      pitResult.className = "pitstop-result";
      updatePicker();
      if (cargoFull()) showCargoFull();
      else buildProblem();
    }, correct ? 1300 : 2000);
  });

  function resumeRace() {
    window.clearTimeout(answerTimer);
    answerLocked = false;
    problem = null;
    startLeg();
    outOfFuelNoted = false;
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
    // clientX is in screen pixels; divide by the stage scale so steering feels the same on any screen.
    const fit = (window.EducationStationStage && window.EducationStationStage.fit) || 1;
    pointerTurn = clamp(-1, 1, (event.clientX - pointerBaseX) / (110 * fit));
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

  if (window.EducationStationSprites) {
    window.EducationStationSprites.loadObjects().then(function (groups) {
      spriteGroups = groups;
    }).catch(function () {
      // Keep the classic ship sprite if the sheet can't load.
    });
  }

  startLeg();
  updateShip();
  updateHud();
})();
