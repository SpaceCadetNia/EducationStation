(function () {
  if (document.body.dataset.game !== "time-to-launch") return;

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const sceneBox = $("tm-scene");
  const canvas = $("tm-scene-canvas");
  const ctx = canvas.getContext("2d");
  const hud = $("tm-hud");
  const hudClock = $("tm-hud-clock");
  const hudTime = $("tm-hud-time");
  const hudPhase = $("tm-hud-phase");
  const speedButton = $("tm-speed");
  const phaseFlash = $("tm-phase-flash");
  const resultNode = $("tm-result");
  const consoleNode = $("tm-console");
  const shipClock = $("tm-ship-clock");
  const shipAmpm = $("tm-ship-ampm");
  const brief = $("tm-brief");
  const minutesGroup = $("tm-minutes-group");
  const dirGroup = $("tm-dir-group");
  const hourGroup = $("tm-hour-group");
  const minutesOut = $("tm-minutes");
  const hourOut = $("tm-hour");
  const launchButton = $("tm-launch");
  const nextButton = $("tm-next");
  const feedback = $("tm-feedback");
  const roundNode = $("tm-round");
  const scoreNode = $("tm-score");
  const streakNode = $("tm-streak");

  // ---------- Constants ----------
  const DAY = 1440;
  const SUNRISE = 390;
  const SUNSET = 1155;
  const MIN_STEP = 5;
  const MAX_MINUTES = 60;

  // Sprite source rects (transparent padding trimmed) and anchors.
  const COMPLEX = { sx: 8, sy: 17, sw: 1758, sh: 840 };
  const PAD = { x: 0.5, y: 0.805 };
  const DOOR = { x: 0.252, y: 0.875 };
  const PAD_STAND = { x: 0.43, y: 0.835 };
  const SHIP_FRAME = { size: 1254, cx: 626, top: 83, bottom: 1158 };
  const ASTRO_FRAME = { w: 1536, h: 1024, cx: 768, top: 304, bottom: 759 };

  const PHASES = [
    { at: 0, name: "Midnight" },
    { at: 150, name: "Early Morning" },
    { at: 375, name: "Sunrise" },
    { at: 450, name: "Morning" },
    { at: 690, name: "Noon" },
    { at: 780, name: "Afternoon" },
    { at: 1020, name: "Evening" },
    { at: 1125, name: "Sunset" },
    { at: 1200, name: "Night" },
    { at: 1380, name: "Midnight" }
  ];

  const SKY = [
    [0, [5, 8, 30], [14, 20, 62]],
    [300, [8, 10, 40], [22, 24, 72]],
    [360, [32, 26, 88], [120, 64, 124]],
    [400, [62, 84, 165], [255, 152, 92]],
    [480, [60, 140, 225], [170, 220, 255]],
    [720, [42, 122, 235], [160, 215, 255]],
    [1000, [60, 120, 205], [255, 212, 145]],
    [1140, [62, 40, 118], [255, 110, 80]],
    [1200, [16, 20, 66], [46, 36, 98]],
    [1260, [5, 8, 30], [14, 20, 62]],
    [1440, [5, 8, 30], [14, 20, 62]]
  ];

  // ---------- State ----------
  let round = 1;
  let score = 0;
  let streak = 0;
  let mode = "setup"; // setup | sim | done
  let mission = null;
  let plan = { minutes: 15, dir: "before", hour: 12 };
  let simTime = 0;
  let speed = 1;
  let lastFrame = 0;
  let fired = new Set();
  let currentPhase = "";
  let outcome = null;
  let resultShown = false;

  const sprites = {};
  const stars = Array.from({ length: 90 }, () => ({
    x: Math.random(),
    y: Math.random() * 0.62,
    r: Math.random() < 0.15 ? 1.6 : 1,
    tw: Math.random() * Math.PI * 2
  }));
  const hills = Array.from({ length: 24 }, (_, i) => 0.5 + 0.5 * Math.sin(i * 1.7) * Math.cos(i * 0.6));

  loadSprite("complex", "launch_complex.png");
  loadSprite("shipOn", "ship_on.png");
  loadSprite("shipOff", "ship_off.png");
  loadSprite("astro", "passenger.png");

  function loadSprite(name, file) {
    const image = new Image();
    image.addEventListener("load", function () {
      sprites[name] = image;
      if (mode !== "sim") render();
    });
    image.src = "../assets/images/" + file;
  }

  // ---------- Helpers ----------
  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(list) {
    return list[rand(0, list.length - 1)];
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeIn(t) {
    return t * t * t;
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function formatTime(total) {
    const m = ((Math.floor(total) % DAY) + DAY) % DAY;
    const h24 = Math.floor(m / 60);
    const h12 = h24 % 12 || 12;
    return h12 + ":" + pad2(m % 60) + " " + (h24 < 12 ? "AM" : "PM");
  }

  function phaseAt(t) {
    let name = PHASES[0].name;
    for (const phase of PHASES) if (t >= phase.at) name = phase.name;
    return name;
  }

  function planHourMinutes() {
    return plan.hour * 60;
  }

  function astronautTime() {
    const offset = plan.dir === "after" ? plan.minutes : -plan.minutes;
    return planHourMinutes() + offset;
  }

  function playSound(name) {
    if (window.EducationStationSound && window.EducationStationSound.play) {
      return window.EducationStationSound.play(name);
    }
    document.dispatchEvent(new CustomEvent("educationstation:sound", { detail: { name } }));
    return null;
  }

  function unlockAudio() {
    if (window.EducationStationSound && window.EducationStationSound.unlockAudio) {
      window.EducationStationSound.unlockAudio();
    }
  }

  // ---------- Mission generation ----------
  // The ship always docks off the hour, so the kid describes it as
  // "N minutes before/after <hour>".
  function minutePool() {
    if (round <= 2) return [15, 30, 45];
    if (round <= 4) return [10, 15, 20, 30, 40, 45, 50];
    return [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  }

  function makeMission() {
    const hour = rand(1, 22);
    const minute = pick(minutePool());
    return { ship: hour * 60 + minute };
  }

  function startMission() {
    mission = makeMission();
    mode = "setup";
    simTime = 0;
    fired = new Set();
    outcome = null;
    resultShown = false;
    currentPhase = "";

    plan = { minutes: 5, dir: "before", hour: 12 };
    brief.textContent = "When should the astronaut get to the launch pad?";
    roundNode.textContent = round;
    scoreNode.textContent = score;
    streakNode.textContent = streak;

    drawClock(shipClock, mission.ship, { accent: "#62d8ff" });
    shipAmpm.textContent = (mission.ship < 720 ? "AM" : "PM") + " // " + phaseAt(mission.ship);

    consoleNode.classList.remove("running");
    resultNode.hidden = true;
    hud.hidden = true;
    speedButton.hidden = true;
    phaseFlash.hidden = true;
    launchButton.hidden = false;
    launchButton.disabled = false;
    nextButton.hidden = true;
    feedback.textContent = "Read the ship clock. Set the minutes, before or after, and the hour.";
    updatePlanUI();
    render();
  }

  // ---------- Plan UI ----------
  function hourLabel(hour) {
    return formatTime(hour * 60);
  }

  function updatePlanUI() {
    const editable = mode === "setup";
    minutesOut.textContent = plan.minutes;
    hourOut.textContent = hourLabel(plan.hour);
    dirGroup.querySelectorAll("[data-dir]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.dir === plan.dir));
      button.disabled = !editable;
    });
    minutesGroup.querySelectorAll("button").forEach((b) => { b.disabled = !editable; });
    hourGroup.querySelectorAll("button").forEach((b) => { b.disabled = !editable; });
  }

  consoleNode.addEventListener("click", function (event) {
    if (mode !== "setup") return;
    const step = event.target.closest("[data-step]");
    const dir = event.target.closest("[data-dir]");

    if (step) {
      const delta = Number(step.dataset.delta);
      if (step.dataset.step === "minutes") {
        plan.minutes = clamp(plan.minutes + delta, MIN_STEP, MAX_MINUTES);
      }
      if (step.dataset.step === "hour") {
        plan.hour = (plan.hour + delta + 24) % 24;
      }
      playSound("beep");
    }
    if (dir) {
      plan.dir = dir.dataset.dir;
      playSound("beep");
    }
    if (step || dir) updatePlanUI();
  });

  // ---------- Simulation ----------
  function keyTimes() {
    const list = [mission.ship];
    if (mission.simAstro >= 0 && mission.simAstro < DAY) list.push(mission.simAstro);
    return list;
  }

  function simRate(t) {
    let distance = Infinity;
    for (const k of keyTimes()) {
      const d = Math.max(0, k - 14 - t, t - (k + 10));
      distance = Math.min(distance, d);
    }
    const slow = 5;
    const fast = 85;
    return lerp(slow, fast, clamp(distance / 45, 0, 1));
  }

  function startSim() {
    if (mode !== "setup") return;
    unlockAudio();
    mission.simHour = planHourMinutes();
    mission.simAstro = astronautTime();
    const a = mission.simAstro;
    if (a < 0 || a >= DAY) outcome = { kind: "offday", diff: 0 };
    else if (a === mission.ship) outcome = { kind: "ontime", diff: 0 };
    else if (a < mission.ship) outcome = { kind: "early", diff: mission.ship - a };
    else outcome = { kind: "late", diff: a - mission.ship };

    mode = "sim";
    simTime = 0;
    fired = new Set();
    currentPhase = "";
    consoleNode.classList.add("running");
    launchButton.disabled = true;
    hud.hidden = false;
    speedButton.hidden = false;
    speed = 1;
    speedButton.textContent = "Speed 1X";
    updatePlanUI();
    feedback.textContent = "Astronaut plan: " + plan.minutes + " minutes " + plan.dir + " " +
      hourLabel(plan.hour) + ". Running the day...";
    playSound("powerup_2");
    lastFrame = performance.now();
    requestAnimationFrame(tick);
  }

  function tick(now) {
    if (mode !== "sim") return;
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    simTime = Math.min(DAY, simTime + simRate(simTime) * speed * dt);
    runTriggers(simTime);
    render();
    if (simTime >= DAY) {
      finishDay();
      return;
    }
    requestAnimationFrame(tick);
  }

  function once(key, at, t, fn) {
    if (t >= at && !fired.has(key)) {
      fired.add(key);
      fn();
    }
  }

  function runTriggers(t) {
    const phase = phaseAt(Math.min(t, DAY - 1));
    if (phase !== currentPhase) {
      currentPhase = phase;
      flashPhase(phase);
    }
    if (t >= DAY - 0.5 && !fired.has("midnight-end")) {
      fired.add("midnight-end");
      flashPhase("Midnight");
    }

    const S = mission.ship;
    const A = mission.simAstro;
    once("ship-land", S - 6, t, () => playSound("land_down"));
    once("ship-launch", S + 3, t, () => playSound("launch_up"));
    if (outcome.kind !== "offday") {
      once("astro-arrive", A, t, function () {
        if (outcome.kind !== "ontime") playSound("error");
      });
    }
    const decisive = outcome.kind === "offday" ? S + 4 : Math.max(S + 4, A + 2);
    once("result", decisive, t, showResult);
  }

  function flashPhase(name) {
    phaseFlash.hidden = true;
    phaseFlash.offsetWidth;
    phaseFlash.textContent = name;
    phaseFlash.hidden = false;
  }

  function showResult() {
    if (resultShown) return;
    resultShown = true;
    const S = mission.ship;
    const A = mission.simAstro;
    const sign = plan.dir === "after" ? " + " : " - ";
    const math = formatTime(mission.simHour) + sign + plan.minutes + " min = " +
      (outcome.kind === "offday" ? "not today" : formatTime(A));
    let title = "";
    let detail = "";

    if (outcome.kind === "ontime") {
      score += 10;
      streak += 1;
      title = "On board!";
      detail = "Met the ship at " + formatTime(S);
      playSound("small_victory");
    } else {
      streak = 0;
      if (outcome.kind === "early") title = "Too early by " + outcome.diff + " min";
      if (outcome.kind === "late") title = "Too late by " + outcome.diff + " min";
      if (outcome.kind === "offday") title = "Not on this day";
      detail = "Ship docked at " + formatTime(S);
    }

    resultNode.innerHTML = title + "<small>" + math + " // " + detail + "</small>";
    resultNode.classList.toggle("correct", outcome.kind === "ontime");
    resultNode.classList.toggle("wrong", outcome.kind !== "ontime");
    resultNode.hidden = false;
    scoreNode.textContent = score;
    streakNode.textContent = streak;
    feedback.textContent = "Astronaut: " + math + ". Ship: " + formatTime(S) + ".";
  }

  function finishDay() {
    mode = "done";
    showResult();
    speedButton.hidden = true;
    launchButton.hidden = true;
    nextButton.hidden = false;
    nextButton.focus({ preventScroll: true });
    render();
  }

  // ---------- Rendering ----------
  function sizeCanvas() {
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const cssW = Math.max(1, sceneBox.clientWidth);
    const cssH = Math.max(1, sceneBox.clientHeight);
    const w = Math.round(cssW * ratio);
    const h = Math.round(cssH * ratio);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.imageSmoothingEnabled = false;
    sceneWidth = cssW;
    return { W: cssW, H: cssH };
  }

  function skyAt(t) {
    for (let i = 0; i < SKY.length - 1; i += 1) {
      const a = SKY[i];
      const b = SKY[i + 1];
      if (t >= a[0] && t <= b[0]) {
        const k = (t - a[0]) / (b[0] - a[0] || 1);
        return {
          top: a[1].map((v, j) => Math.round(lerp(v, b[1][j], k))),
          bottom: a[2].map((v, j) => Math.round(lerp(v, b[2][j], k)))
        };
      }
    }
    return { top: SKY[0][1], bottom: SKY[0][2] };
  }

  function nightAmount(t) {
    if (t <= 330 || t >= 1230) return 1;
    if (t >= 440 && t <= 1100) return 0;
    if (t < 440) return 1 - (t - 330) / 110;
    return (t - 1100) / 130;
  }

  function rgb(c, alpha) {
    return alpha === undefined ? "rgb(" + c.join(",") + ")" : "rgba(" + c.join(",") + "," + alpha + ")";
  }

  function render() {
    const { W, H } = sizeCanvas();
    const t = mode === "setup" ? 0 : simTime;
    const sky = skyAt(t);
    const night = nightAmount(t);

    // Layout
    const complexW = Math.min(W * 0.92, (H * 0.8) * (COMPLEX.sw / COMPLEX.sh));
    const complexH = complexW * (COMPLEX.sh / COMPLEX.sw);
    const cx = (W - complexW) / 2;
    const cy = H - complexH + complexH * 0.03;
    const L = { W, H, cx, cy, cw: complexW, ch: complexH };
    const horizon = cy + complexH * 0.7;

    // Sky
    const gradient = ctx.createLinearGradient(0, 0, 0, horizon);
    gradient.addColorStop(0, rgb(sky.top));
    gradient.addColorStop(1, rgb(sky.bottom));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // Stars
    if (night > 0.02) {
      const now = performance.now() / 600;
      for (const star of stars) {
        const a = night * (0.55 + 0.45 * Math.sin(now + star.tw));
        ctx.fillStyle = "rgba(255,255,255," + a.toFixed(3) + ")";
        ctx.fillRect(star.x * W, 24 + star.y * (horizon - 24), star.r * 1.5, star.r * 1.5);
      }
    }

    drawSun(t, L, horizon);
    drawMoon(t, L, horizon);

    // Distant hills
    const hillColor = sky.bottom.map((v) => Math.round(v * 0.35));
    ctx.fillStyle = rgb(hillColor);
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let i = 0; i < hills.length; i += 1) {
      const x = (i / (hills.length - 1)) * W;
      ctx.lineTo(x, horizon - 8 - hills[i] * complexH * 0.16);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();

    // Ground strip
    const groundTop = cy + complexH * 0.9;
    ctx.fillStyle = rgb([28, 34, 48].map((v) => Math.round(v * (1 - night * 0.55))));
    ctx.fillRect(0, groundTop, W, H - groundTop);
    ctx.fillStyle = "rgba(98,216,255," + (0.25 + night * 0.35).toFixed(2) + ")";
    ctx.fillRect(0, groundTop, W, 2);

    // Ship behind the tower arms? Draw complex first, ship on top (it sits on the pad).
    drawComplex(L, night, t);
    if (mission && mode !== "setup") drawShip(t, L);
    drawAstronaut(t, L);
    if (mission && mode !== "setup") drawBubbles(t, L);
    drawTimeline(t, L);

    if (mode !== "setup") {
      drawClock(hudClock, t, { accent: "#6cff7b" });
      hudTime.textContent = formatTime(Math.min(t, DAY - 0.01));
      hudPhase.textContent = phaseAt(Math.min(t, DAY - 1));
    }
  }

  function drawSun(t, L, horizon) {
    if (t < SUNRISE - 20 || t > SUNSET + 20) return;
    const p = (t - SUNRISE) / (SUNSET - SUNRISE);
    const x = L.W * (0.06 + 0.88 * p);
    const y = horizon - Math.sin(Math.PI * clamp(p, -0.05, 1.05)) * (horizon - 60) + 6;
    const glow = ctx.createRadialGradient(x, y, 4, x, y, 60);
    glow.addColorStop(0, "rgba(255,230,140,0.75)");
    glow.addColorStop(1, "rgba(255,200,90,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - 60, y - 60, 120, 120);
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawMoon(t, L, horizon) {
    const start = SUNSET + 15;
    const span = DAY - start + SUNRISE - 15;
    const p = (((t - start) % DAY) + DAY) % DAY / span;
    if (p < 0 || p > 1) return;
    const x = L.W * (0.06 + 0.88 * p);
    const y = horizon - Math.sin(Math.PI * p) * (horizon - 70) + 8;
    ctx.fillStyle = "rgba(230,236,255,0.18)";
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e6ecff";
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#b9c3e6";
    ctx.fillRect(x - 6, y - 4, 4, 4);
    ctx.fillRect(x + 3, y + 3, 3, 3);
  }

  let tintCanvas = null;
  let sceneWidth = 800;
  function drawComplex(L, night, t) {
    const img = sprites.complex;
    if (!img) return;
    const w = Math.max(1, Math.round(L.cw));
    const h = Math.max(1, Math.round(L.ch));
    if (!tintCanvas) tintCanvas = document.createElement("canvas");
    if (tintCanvas.width !== w || tintCanvas.height !== h) {
      tintCanvas.width = w;
      tintCanvas.height = h;
    }
    const tc = tintCanvas.getContext("2d");
    tc.imageSmoothingEnabled = false;
    tc.globalCompositeOperation = "source-over";
    tc.clearRect(0, 0, w, h);
    tc.drawImage(img, COMPLEX.sx, COMPLEX.sy, COMPLEX.sw, COMPLEX.sh, 0, 0, w, h);
    const dusk = Math.max(0, 1 - Math.abs(t - 400) / 60, 1 - Math.abs(t - 1140) / 70);
    tc.globalCompositeOperation = "source-atop";
    if (night > 0) {
      tc.fillStyle = "rgba(6,10,45," + (night * 0.55).toFixed(3) + ")";
      tc.fillRect(0, 0, w, h);
    }
    if (dusk > 0) {
      tc.fillStyle = "rgba(255,120,60," + (dusk * 0.18).toFixed(3) + ")";
      tc.fillRect(0, 0, w, h);
    }
    ctx.drawImage(tintCanvas, L.cx, L.cy, L.cw, L.ch);
  }

  function shipGeometry(L) {
    const bodyH = L.ch * 0.54;
    const scale = bodyH / (SHIP_FRAME.bottom - SHIP_FRAME.top);
    const size = SHIP_FRAME.size * scale;
    const padX = L.cx + L.cw * PAD.x;
    const padY = L.cy + L.ch * PAD.y;
    return {
      scale,
      size,
      x: padX - SHIP_FRAME.cx * scale,
      y: padY - SHIP_FRAME.bottom * scale,
      padX,
      padY,
      bodyH
    };
  }

  function drawShip(t, L) {
    const S = mission.ship;
    const g = shipGeometry(L);
    const offscreen = g.padY + 20;
    let offset = null;
    let engines = false;

    if (t >= S - 6 && t < S) {
      offset = -offscreen * (1 - easeOut((t - (S - 6)) / 6));
      engines = true;
    } else if (t >= S && t < S + 3) {
      offset = 0;
    } else if (t >= S + 3 && t < S + 14) {
      offset = -offscreen * easeIn((t - (S + 3)) / 11);
      engines = true;
    }
    if (offset === null) return;

    const img = engines ? sprites.shipOn : sprites.shipOff;
    if (!img) return;
    if (!engines) {
      ctx.fillStyle = "rgba(98,216,255,0.35)";
      ctx.beginPath();
      ctx.ellipse(g.padX, g.padY + 2, L.cw * 0.07, L.ch * 0.02, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const jitter = engines ? (Math.random() - 0.5) * 1.5 : 0;
    ctx.drawImage(img, g.x + jitter, g.y + offset, g.size, g.size);
  }

  // Returns where the astronaut is (fractions of the complex) and how visible.
  function astronautState(t) {
    const idle = { x: DOOR.x, y: DOOR.y, alpha: 1, scale: 1, walking: false };
    if (!mission || mode === "setup" || outcome.kind === "offday") return idle;
    const A = mission.simAstro;
    const walkStart = A - 10;
    if (t < walkStart) return idle;
    if (t < A) {
      const k = (t - walkStart) / 10;
      return { x: lerp(DOOR.x, PAD_STAND.x, k), y: lerp(DOOR.y, PAD_STAND.y, k), alpha: 1, scale: 1, walking: true };
    }
    if (outcome.kind === "ontime") {
      if (t < A + 2) {
        const k = (t - A) / 2;
        return { x: lerp(PAD_STAND.x, PAD.x, k), y: lerp(PAD_STAND.y, PAD.y - 0.06, k), alpha: 1 - k, scale: 1 - 0.4 * k, walking: true };
      }
      return null;
    }
    const waitEnd = A + 3;
    if (t < waitEnd) return { x: PAD_STAND.x, y: PAD_STAND.y, alpha: 1, scale: 1, walking: false };
    if (t < waitEnd + 10) {
      const k = (t - waitEnd) / 10;
      return { x: lerp(PAD_STAND.x, DOOR.x, k), y: lerp(PAD_STAND.y, DOOR.y, k), alpha: 1, scale: 1, walking: true, back: true };
    }
    return idle;
  }

  function drawAstronaut(t, L) {
    const img = sprites.astro;
    const s = astronautState(t);
    if (!img || !s) return;
    const bodyH = L.ch * 0.1 * s.scale;
    const scale = bodyH / (ASTRO_FRAME.bottom - ASTRO_FRAME.top);
    const footX = L.cx + L.cw * s.x;
    let footY = L.cy + L.ch * s.y;
    if (s.walking) footY -= Math.abs(Math.sin(t * 2.4)) * bodyH * 0.08;
    ctx.save();
    ctx.globalAlpha = clamp(s.alpha, 0, 1);
    ctx.drawImage(
      img,
      footX - ASTRO_FRAME.cx * scale,
      footY - ASTRO_FRAME.bottom * scale,
      ASTRO_FRAME.w * scale,
      ASTRO_FRAME.h * scale
    );
    ctx.restore();
  }

  function bubble(x, y, lines, color) {
    ctx.save();
    ctx.font = "bold 14px 'Courier New', monospace";
    const width = Math.max(...lines.map((line) => ctx.measureText(line).width)) + 18;
    const height = lines.length * 17 + 10;
    const left = clamp(x - width / 2, 4, sceneWidth - width - 4);
    const top = y - height - 10;
    ctx.fillStyle = "rgba(0,0,0,0.82)";
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.fillRect(left, top, width, height);
    ctx.strokeRect(left, top, width, height);
    ctx.beginPath();
    ctx.moveTo(x - 6, top + height);
    ctx.lineTo(x, top + height + 9);
    ctx.lineTo(x + 6, top + height);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    lines.forEach((line, i) => ctx.fillText(line, left + width / 2, top + 6 + i * 17));
    ctx.restore();
  }

  function drawBubbles(t, L) {
    const S = mission.ship;
    const A = mission.simAstro;

    if (t >= S && t < S + 5) {
      const g = shipGeometry(L);
      bubble(g.padX + L.cw * 0.13, g.padY - g.bodyH * 0.45, ["SHIP DOCKED", formatTime(S)], "#62d8ff");
    }
    if (outcome.kind !== "offday" && t >= A && t < A + 6) {
      const x = L.cx + L.cw * PAD_STAND.x;
      const y = L.cy + L.ch * (PAD_STAND.y - 0.11);
      if (outcome.kind === "ontime") bubble(x - 30, y, ["ABOARD!", formatTime(A)], "#6cff7b");
      if (outcome.kind === "early") bubble(x - 30, y, ["TOO EARLY!", formatTime(A)], "#ff6bb5");
      if (outcome.kind === "late") bubble(x - 30, y, ["MISSED IT!", formatTime(A)], "#ff6bb5");
    }
  }

  function drawTimeline(t, L) {
    const left = 14;
    const right = L.W - 14;
    const y = 13;
    const xAt = (m) => left + (right - left) * (m / DAY);
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, L.W, 26);
    ctx.strokeStyle = "rgba(216,255,224,0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
    ctx.font = "10px 'Courier New', monospace";
    ctx.fillStyle = "rgba(216,255,224,0.8)";
    ctx.textBaseline = "top";
    const labels = ["12A", "3A", "6A", "9A", "12P", "3P", "6P", "9P", "12A"];
    labels.forEach(function (label, i) {
      const x = xAt(i * 180);
      ctx.fillRect(x - 1, y - 5, 2, 10);
      ctx.textAlign = i === 0 ? "left" : i === labels.length - 1 ? "right" : "center";
      ctx.fillText(label, x, y + 5);
    });

    if (mission && mode !== "setup") {
      const marker = function (m, color, shape) {
        if (t < m || m < 0 || m >= DAY) return;
        const x = xAt(m);
        ctx.fillStyle = color;
        ctx.beginPath();
        if (shape === "diamond") {
          ctx.moveTo(x, y - 7); ctx.lineTo(x + 6, y); ctx.lineTo(x, y + 7); ctx.lineTo(x - 6, y);
        } else if (shape === "tri") {
          ctx.moveTo(x, y + 7); ctx.lineTo(x + 6, y - 6); ctx.lineTo(x - 6, y - 6);
        } else {
          ctx.arc(x, y, 5, 0, Math.PI * 2);
        }
        ctx.closePath();
        ctx.fill();
      };
      marker(mission.ship, "#62d8ff", "tri");
      marker(mission.simAstro, "#ff6bb5", "dot");
      ctx.fillStyle = "#6cff7b";
      ctx.fillRect(xAt(Math.min(t, DAY)) - 1.5, 2, 3, 22);
    }
    ctx.restore();
  }

  // ---------- Analog clock ----------
  function drawClock(target, minutesOfDay, options) {
    const c = target.getContext("2d");
    const size = target.width;
    const r = size / 2;
    const accent = (options && options.accent) || "#6cff7b";
    c.save();
    c.clearRect(0, 0, size, size);
    c.translate(r, r);

    c.fillStyle = "#020b06";
    c.beginPath();
    c.arc(0, 0, r - 2, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = accent;
    c.lineWidth = Math.max(2, size * 0.035);
    c.stroke();

    for (let i = 0; i < 60; i += 1) {
      const angle = (i / 60) * Math.PI * 2;
      const major = i % 5 === 0;
      const inner = r - (major ? size * 0.11 : size * 0.06);
      c.strokeStyle = major ? "#d8ffe0" : "rgba(216,255,224,0.45)";
      c.lineWidth = major ? Math.max(1.5, size * 0.022) : 1;
      c.beginPath();
      c.moveTo(Math.sin(angle) * inner, -Math.cos(angle) * inner);
      c.lineTo(Math.sin(angle) * (r - size * 0.035), -Math.cos(angle) * (r - size * 0.035));
      c.stroke();
    }

    c.fillStyle = "#ffd166";
    c.font = "bold " + Math.round(size * 0.115) + "px 'Courier New', monospace";
    c.textAlign = "center";
    c.textBaseline = "middle";
    for (let n = 1; n <= 12; n += 1) {
      const angle = (n / 12) * Math.PI * 2;
      const d = r - size * 0.19;
      c.fillText(String(n), Math.sin(angle) * d, -Math.cos(angle) * d + 1);
    }

    const m = ((minutesOfDay % DAY) + DAY) % DAY;
    const minuteAngle = ((m % 60) / 60) * Math.PI * 2;
    const hourAngle = (((m / 60) % 12) / 12) * Math.PI * 2;

    c.lineCap = "round";
    c.strokeStyle = "#ffd166";
    c.lineWidth = Math.max(3, size * 0.06);
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(Math.sin(hourAngle) * r * 0.45, -Math.cos(hourAngle) * r * 0.45);
    c.stroke();

    c.strokeStyle = accent;
    c.lineWidth = Math.max(2, size * 0.035);
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(Math.sin(minuteAngle) * r * 0.72, -Math.cos(minuteAngle) * r * 0.72);
    c.stroke();

    c.fillStyle = "#ff6bb5";
    c.beginPath();
    c.arc(0, 0, Math.max(3, size * 0.045), 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  // ---------- Wiring ----------
  launchButton.addEventListener("click", startSim);
  nextButton.addEventListener("click", function () {
    unlockAudio();
    playSound("beep");
    round += 1;
    startMission();
  });
  speedButton.addEventListener("click", function () {
    speed = speed === 1 ? 3 : 1;
    speedButton.textContent = "Speed " + speed + "X";
    playSound("beep");
  });

  window.addEventListener("resize", function () {
    if (mode !== "sim") render();
  });

  // Test hook: ?debug lets the console force a plan or jump the clock.
  if (new URLSearchParams(location.search).has("debug")) {
    window.TimeToLaunchDebug = {
      get mission() { return mission; },
      get plan() { return plan; },
      setPlan(next) { Object.assign(plan, next); updatePlanUI(); },
      solve(offset) {
        const target = mission.ship + (offset || 0);
        plan.hour = Math.floor(target / 60);
        plan.dir = "after";
        plan.minutes = target % 60;
        updatePlanUI();
      },
      jump(time) { simTime = time; },
      setSpeed(value) { speed = value; }
    };
  }

  startMission();
})();
