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
    packing: ["Cargo Fractions", "MANIFEST PACKER"],
    land: ["Land Mission", "TERRAIN SURVEY"]
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
    if (window.EducationStationReward) window.EducationStationReward.init("lunar-keys");
    document.addEventListener("lunarkeys:finish", function () { finishTypingRun(); });
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
      feedback.textContent = "Lunar Keys complete. Take a rest point.";
      if (window.EducationStationReward) {
        window.EducationStationReward.celebrate({
          title: "Lunar Keys Complete!",
          lines: ["All " + totalRounds + " resources harvested", "Score " + score]
        });
      } else {
        play("small_victory");
      }
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

  if (mode === "typing" && new URLSearchParams(window.location.search).has("debug")) {
    window.LunarKeysDebug = { finish: function () { document.dispatchEvent(new CustomEvent("lunarkeys:finish")); } };
  }

  function initLand() {
    setHeader("land");
    const world = {
      biome: "grass",
      seed: rand(1000, 999999),
      width: 800,
      height: 500,
      x: 0,
      y: 0,
      speed: 0,
      throttle: 0,
      heading: -Math.PI / 2,
      turn: 0
    };
    const palettes = {
      grass: {
        label: "Grass",
        low: [25, 77, 43],
        mid: [58, 134, 61],
        high: [132, 184, 82],
        accent: [42, 154, 94],
        track: [71, 86, 43],
        particle: [154, 225, 100]
      },
      desert: {
        label: "Desert",
        low: [151, 102, 48],
        mid: [208, 168, 83],
        high: [238, 214, 136],
        accent: [184, 127, 59],
        track: [133, 84, 42],
        particle: [231, 199, 122]
      }
    };
    const keys = {};
    const particles = [];
    const treads = [];
    let lastFrame = performance.now();
    let animationFrame = 0;
    let running = true;
    let touchBase = null;

    workspace.innerHTML = [
      '<div class="test-layout land-layout">',
      '<div class="line-card land-map-card"><canvas id="land-map" width="' + world.width + '" height="' + world.height + '" aria-label="Procedural top view terrain driving field"></canvas></div>',
      '<div class="line-card land-control-card">',
      '<div class="prototype-big">LAND MISSION</div>',
      '<p class="land-readout">Biome <strong id="land-biome">Grass</strong></p>',
      '<p class="land-readout">Distance <strong id="land-distance">0</strong></p>',
      '<p class="land-readout">Speed <strong id="land-speed">0</strong></p>',
      '<p class="land-readout">Throttle <strong id="land-throttle">0%</strong></p>',
      '<div class="test-controls land-controls">',
      button("Grass", 'data-biome="grass"'),
      button("Desert", 'data-biome="desert"'),
      button("New Map", 'data-action="regenerate"'),
      "</div>",
      '<div class="land-legend"><span><i class="land-swatch land-low"></i>low ground</span><span><i class="land-swatch land-high"></i>high ground</span><span><i class="land-swatch land-path"></i>tire track</span><span><i class="land-swatch land-water"></i>water / oasis</span></div>',
      '<p class="land-note">Hold forward to add throttle. Spacebar brakes. Steer with left/right, A/D, or drag inside the terrain window.</p>',
      "</div></div>"
    ].join("");

    const canvas = document.getElementById("land-map");
    const context = canvas.getContext("2d");
    const biomeNode = document.getElementById("land-biome");
    const distanceNode = document.getElementById("land-distance");
    const speedNode = document.getElementById("land-speed");
    const throttleNode = document.getElementById("land-throttle");
    const buggy = new Image();
    buggy.src = "../assets/images/buggy_top.png";
    const terrainAtlas = new Image();
    terrainAtlas.src = "../assets/images/terrain_texture_samples.png";
    const terrainPixel = 6;
    const atlasTile = 108;
    const atlasStepX = 119;
    const atlasBrush = 16;
    const buggyWidth = 96;
    const buggyHeight = buggyWidth * 1.5;
    const rearAxleOffset = buggyHeight * 0.34;
    const wheelSideOffset = buggyWidth * 0.25;
    const wheelBase = 18;
    const atlasRows = {
      desert: 75,
      grass: 244
    };
    const textureFamilies = {
      grass: {
        low: [tile("grass", 0), tile("grass", 5), tile("grass", 7)],
        mid: [tile("grass", 0), tile("grass", 1), tile("grass", 5)],
        high: [tile("grass", 2), tile("grass", 5), tile("grass", 7)],
        route: [tile("grass", 3), tile("grass", 4), tile("grass", 8)],
        water: [tile("desert", 7), tile("grass", 7), tile("grass", 8)]
      },
      desert: {
        low: [tile("desert", 0), tile("desert", 1), tile("desert", 4)],
        mid: [tile("desert", 0), tile("desert", 2), tile("desert", 5)],
        high: [tile("desert", 3), tile("desert", 6), tile("desert", 9)],
        route: [tile("desert", 2), tile("desert", 5), tile("desert", 8)],
        water: [tile("desert", 7), tile("grass", 7), tile("grass", 2)]
      }
    };

    function seededNoise(x, y, scale, salt) {
      const value = Math.sin((x * 127.1 + y * 311.7 + world.seed * 0.013 + salt * 19.19) / scale) * 43758.5453;
      return value - Math.floor(value);
    }

    function smoothNoise(x, y, scale, salt) {
      const x0 = Math.floor(x / scale);
      const y0 = Math.floor(y / scale);
      const tx = x / scale - x0;
      const ty = y / scale - y0;
      const a = seededNoise(x0, y0, 1, salt);
      const b = seededNoise(x0 + 1, y0, 1, salt);
      const c = seededNoise(x0, y0 + 1, 1, salt);
      const d = seededNoise(x0 + 1, y0 + 1, 1, salt);
      const ux = tx * tx * (3 - 2 * tx);
      const uy = ty * ty * (3 - 2 * ty);
      return lerp(lerp(a, b, ux), lerp(c, d, ux), uy);
    }

    function terrainValue(x, y) {
      const broad = smoothNoise(x, y, 28, 1);
      const middle = smoothNoise(x, y, 12, 2);
      const detail = smoothNoise(x, y, 5, 3);
      const ridge = Math.abs(smoothNoise(x, y, 18, 4) - 0.5) * 2;
      return broad * 0.46 + middle * 0.28 + detail * 0.16 + ridge * 0.1;
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function mixColor(a, b, t) {
      return [
        Math.round(lerp(a[0], b[0], t)),
        Math.round(lerp(a[1], b[1], t)),
        Math.round(lerp(a[2], b[2], t))
      ];
    }

    function rgb(color) {
      return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
    }

    function tile(row, col) {
      return {
        x: 16 + col * atlasStepX,
        y: atlasRows[row],
        width: atlasTile,
        height: atlasTile
      };
    }

    function drawFrame(now) {
      if (!running) return;
      const dt = Math.min(2, Math.max(0.4, (now - lastFrame) / 16.67));
      lastFrame = now;
      updateVehicle(dt);
      drawTerrain();
      drawTreads(dt);
      updateParticles(dt);
      drawParticles();
      drawBuggy();
      updateLandReadouts();
      animationFrame = window.requestAnimationFrame(drawFrame);
    }

    function updateVehicle(dt) {
      const keyTurn = (keys.ArrowLeft || keys.a ? -1 : 0) + (keys.ArrowRight || keys.d ? 1 : 0);
      const accelerating = keys.ArrowUp || keys.w;
      const braking = keys[" "] || keys.Spacebar || keys.Space;
      const maxSpeed = world.biome === "desert" ? 1.85 : 2.15;
      const rollingDrag = world.biome === "desert" ? 0.001 : 0.0008;
      world.turn = touchBase ? world.turn : keyTurn;
      const speedRatio = Math.min(1, world.speed / maxSpeed);
      const steerAuthority = 0.18 + speedRatio * 0.24;
      const steerAngle = world.turn * steerAuthority;
      if (accelerating) {
        world.throttle = Math.min(1, world.throttle + 0.015 * dt);
      } else {
        world.throttle = Math.max(0, world.throttle - 0.008 * dt);
      }
      if (braking) {
        world.throttle = Math.max(0, world.throttle - 0.05 * dt);
        world.speed = Math.max(0, world.speed - 0.12 * dt);
      }
      world.speed += (world.throttle * maxSpeed - world.speed) * 0.018 * dt;
      world.speed = Math.max(0, world.speed - rollingDrag * dt);
      const drift = Math.max(0, speedRatio - 0.58) * Math.abs(world.turn);
      const grip = 1 - drift * 0.65;
      world.heading += (world.speed / wheelBase) * Math.tan(steerAngle) * grip * dt;
      world.x += Math.cos(world.heading) * world.speed * dt;
      world.y += Math.sin(world.heading) * world.speed * dt;
      if (drift > 0) {
        const slipDirection = -Math.sign(world.turn || 1);
        const sideSlip = drift * world.speed * 0.72 * dt * slipDirection;
        world.x += Math.cos(world.heading + Math.PI / 2) * sideSlip;
        world.y += Math.sin(world.heading + Math.PI / 2) * sideSlip;
      }
      if (world.speed > 0.12) {
        addTreadMarks();
      }
      if (world.speed > 0.18 && (Math.abs(world.turn) > 0.05 || Math.random() < world.speed / maxSpeed)) emitParticles();
    }

    function drawTerrain() {
      const palette = palettes[world.biome];
      context.imageSmoothingEnabled = false;
      context.clearRect(0, 0, canvas.width, canvas.height);
      const pixel = terrainPixel;
      for (let y = 0; y < canvas.height; y += pixel) {
        for (let x = 0; x < canvas.width; x += pixel) {
          const wx = (x - canvas.width / 2) / pixel + world.x;
          const wy = (y - canvas.height / 2) / pixel + world.y;
          const elevation = terrainValue(wx, wy);
          const moisture = smoothNoise(wx, wy, 16, 8);
          const route = Math.abs(wy - (Math.sin((wx + world.seed * 0.001) * 0.12) * 12)) < 1.4;
          const water = world.biome === "grass"
            ? moisture > 0.76 && elevation < 0.6
            : moisture > 0.86 && elevation < 0.52;
          let color;
          let textureGroup;
          if (water) {
            color = world.biome === "grass" ? [37, 128, 143] : [41, 143, 117];
            textureGroup = "water";
          } else if (route) {
            color = palette.track;
            textureGroup = "route";
          } else if (elevation < 0.42) {
            color = mixColor(palette.low, palette.mid, elevation / 0.42);
            textureGroup = "low";
          } else {
            color = mixColor(palette.mid, palette.high, (elevation - 0.42) / 0.58);
            textureGroup = elevation > 0.68 ? "high" : "mid";
          }
          if (!water && moisture > 0.7) {
            color = mixColor(color, palette.accent, 0.24);
          }
          drawTerrainBrush(x, y, wx, wy, textureGroup, color);
        }
      }
    }

    function drawTerrainBrush(x, y, wx, wy, group, fallbackColor) {
      if (!terrainAtlas.complete || !terrainAtlas.naturalWidth) {
        context.fillStyle = rgb(fallbackColor);
        context.fillRect(x, y, terrainPixel, terrainPixel);
        return;
      }
      const family = textureFamilies[world.biome][group] || textureFamilies[world.biome].mid;
      const cellX = Math.floor(wx);
      const cellY = Math.floor(wy);
      const tileNoise = seededNoise(Math.floor(cellX / 3), Math.floor(cellY / 3), 1, 21);
      const sampleNoiseX = seededNoise(cellX, cellY, 1, 22);
      const sampleNoiseY = seededNoise(cellX, cellY, 1, 23);
      const sample = family[Math.min(family.length - 1, Math.floor(tileNoise * family.length))];
      const sx = sample.x + Math.floor(sampleNoiseX * (sample.width - atlasBrush));
      const sy = sample.y + Math.floor(sampleNoiseY * (sample.height - atlasBrush));
      context.drawImage(terrainAtlas, sx, sy, atlasBrush, atlasBrush, x, y, terrainPixel, terrainPixel);
    }

    function wheelPoints() {
      const pixel = terrainPixel;
      const side = wheelSideOffset;
      const forwardX = Math.cos(world.heading);
      const forwardY = Math.sin(world.heading);
      const sideX = Math.cos(world.heading + Math.PI / 2);
      const sideY = Math.sin(world.heading + Math.PI / 2);
      return [-1, 1].map((direction) => {
        const screenX = canvas.width / 2 + sideX * side * direction;
        const screenY = canvas.height / 2 + sideY * side * direction;
        return {
          x: screenX,
          y: screenY,
          worldX: world.x + (screenX - canvas.width / 2) / pixel,
          worldY: world.y + (screenY - canvas.height / 2) / pixel,
          side: direction
        };
      });
    }

    function addTreadMarks() {
      if (Math.random() > Math.min(0.92, 0.24 + world.speed * 0.18)) return;
      wheelPoints().forEach((wheel) => {
        treads.push({
          x: wheel.worldX + (Math.random() - 0.5) * 0.6,
          y: wheel.worldY + (Math.random() - 0.5) * 0.6,
          heading: world.heading,
          size: 27.2 + Math.random() * 22.4,
          alpha: (world.biome === "grass" ? 0.1 : 0.15) + Math.random() * 0.075,
          life: 850
        });
      });
      if (treads.length > 420) treads.splice(0, treads.length - 420);
    }

    function drawTreads(dt) {
      const pixel = terrainPixel;
      context.save();
      treads.forEach((mark) => {
        mark.life -= dt;
        const sx = (mark.x - world.x) * pixel + canvas.width / 2;
        const sy = (mark.y - world.y) * pixel + canvas.height / 2;
        if (sx < -20 || sx > canvas.width + 20 || sy < -20 || sy > canvas.height + 20) return;
        context.translate(sx, sy);
        context.rotate(mark.heading);
        context.globalAlpha = Math.max(0, Math.min(mark.alpha, mark.life / 850 * mark.alpha));
        context.fillStyle = "rgba(0, 0, 0, 1)";
        context.fillRect(-mark.size * 0.45, -mark.size * 0.18, mark.size * 0.9, mark.size * 0.36);
        context.setTransform(1, 0, 0, 1, 0, 0);
      });
      context.restore();
      for (let i = treads.length - 1; i >= 0; i -= 1) {
        if (treads[i].life <= 0) treads.splice(i, 1);
      }
    }

    function emitParticles() {
      const palette = palettes[world.biome];
      const spread = world.biome === "grass" ? 18 : 28;
      const count = world.biome === "grass" ? 2 : 3;
      wheelPoints().forEach((wheel) => {
        for (let i = 0; i < count; i += 1) {
          const side = (Math.random() - 0.5) * spread * 0.25;
          const back = 4 + Math.random() * 18;
          const px = wheel.x + Math.cos(world.heading + Math.PI / 2) * side - Math.cos(world.heading) * back;
          const py = wheel.y + Math.sin(world.heading + Math.PI / 2) * side - Math.sin(world.heading) * back;
          particles.push({
            x: px,
            y: py,
            vx: -Math.cos(world.heading) * (0.5 + Math.random() * 1.4) + Math.cos(world.heading + Math.PI / 2) * wheel.side * (0.25 + Math.random() * 0.45),
            vy: -Math.sin(world.heading) * (0.5 + Math.random() * 1.4) + Math.sin(world.heading + Math.PI / 2) * wheel.side * (0.25 + Math.random() * 0.45),
            life: world.biome === "grass" ? 32 : 48,
            maxLife: world.biome === "grass" ? 32 : 48,
            size: world.biome === "grass" ? 2 + Math.random() * 3 : 4 + Math.random() * 8,
            color: palette.particle
          });
        }
      });
      if (particles.length > 160) particles.splice(0, particles.length - 160);
    }

    function updateParticles(dt) {
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const particle = particles[i];
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.life -= dt;
        if (particle.life <= 0) particles.splice(i, 1);
      }
    }

    function drawParticles() {
      particles.forEach((particle) => {
        const alpha = Math.max(0, particle.life / particle.maxLife);
        context.globalAlpha = world.biome === "grass" ? alpha * 0.75 : alpha * 0.42;
        context.fillStyle = rgb(particle.color);
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size * (1.1 - alpha * 0.35), 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;
    }

    function drawBuggy() {
      context.save();
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(world.heading + Math.PI / 2);
      context.shadowColor = "rgba(0, 0, 0, 0.65)";
      context.shadowBlur = 12;
      context.shadowOffsetY = 8;
      if (buggy.complete) {
        context.drawImage(buggy, -buggyWidth / 2, -buggyHeight / 2 - rearAxleOffset, buggyWidth, buggyHeight);
      } else {
        context.fillStyle = "#6cff7b";
        context.fillRect(-20, -64 - rearAxleOffset, 40, 96);
      }
      context.restore();
    }

    function updateLandReadouts() {
      const distance = Math.round(Math.sqrt(world.x * world.x + world.y * world.y) * 3);
      biomeNode.textContent = palettes[world.biome].label;
      distanceNode.textContent = distance;
      speedNode.textContent = (world.speed * 10).toFixed(0);
      throttleNode.textContent = Math.round(world.throttle * 100) + "%";
    }

    workspace.querySelectorAll("[data-biome]").forEach((item) => {
      item.addEventListener("click", function () {
        world.biome = item.dataset.biome;
        particles.length = 0;
        treads.length = 0;
        play("beep");
        feedback.textContent = palettes[world.biome].label + " drive mode. Watch the trail change.";
      });
    });
    workspace.querySelector('[data-action="regenerate"]').addEventListener("click", function () {
      world.seed = rand(1000, 999999);
      world.x = 0;
      world.y = 0;
      world.speed = 0;
      world.throttle = 0;
      particles.length = 0;
      treads.length = 0;
      play("beep_good");
      feedback.textContent = "New terrain stream seeded.";
    });
    document.addEventListener("keydown", function (event) {
      keys[event.key] = true;
      if (event.key === " ") event.preventDefault();
    });
    document.addEventListener("keyup", function (event) {
      keys[event.key] = false;
      if (event.key === " ") event.preventDefault();
    });
    canvas.addEventListener("pointerdown", function (event) {
      canvas.setPointerCapture(event.pointerId);
      touchBase = { x: event.clientX, y: event.clientY };
    });
    canvas.addEventListener("pointermove", function (event) {
      if (!touchBase) return;
      const dx = event.clientX - touchBase.x;
      const fit = (window.EducationStationStage && window.EducationStationStage.fit) || 1;
      world.turn = Math.max(-1, Math.min(1, dx / (90 * fit)));
    });
    canvas.addEventListener("pointerup", function () {
      touchBase = null;
      world.turn = 0;
    });
    canvas.addEventListener("pointercancel", function () {
      touchBase = null;
      world.turn = 0;
    });
    feedback.textContent = "Hold forward to add throttle. Spacebar brakes.";
    animationFrame = window.requestAnimationFrame(drawFrame);
    window.addEventListener("beforeunload", function () {
      running = false;
      window.cancelAnimationFrame(animationFrame);
    });
  }

  function initRhythm() {
    setHeader("rhythm");
    const totalLevels = 10;
    let finished = false;
    if (window.EducationStationReward) window.EducationStationReward.init("key-echo");

    function showLevel() {
      levelNode.textContent = Math.min(level, totalLevels) + "/" + totalLevels;
    }

    // Shown before the cue on the last two levels.
    function milestoneMessage() {
      if (level === totalLevels - 1) return { text: "ALMOST THERE!", className: "echo-almost" };
      if (level === totalLevels) return { text: "FINISH LINE!", className: "echo-finish" };
      return null;
    }

    if (new URLSearchParams(window.location.search).has("debug")) {
      window.KeyEchoDebug = {
        setLevel: function (n) { setLevel(n); showLevel(); },
        get sequence() { return sequence; }
      };
    }

    function finishKeyEcho() {
      finished = true;
      listening = false;
      cueing = true;
      feedback.textContent = "Good workout! All " + totalLevels + " levels cleared.";
      const sound = window.EducationStationSound;
      if (sound && sound.stop) sound.stop("workout_music_2");
      if (window.EducationStationReward) {
        window.EducationStationReward.celebrate({
          title: "Good Workout!",
          lines: ["All " + totalLevels + " echoes matched", "Score " + score]
        });
      } else {
        play("small_victory");
      }
    }
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
        play("workout_music_2");
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
      const milestone = milestoneMessage();
      if (milestone) {
        cueing = true;
        const coach = document.getElementById("echo-coach");
        coach.textContent = milestone.text;
        coach.className = "key-echo-coach " + milestone.className;
        feedback.textContent = level === totalLevels ? "Last one! Finish line ahead." : "Almost there! Two more to go.";
        play(level === totalLevels ? "powerup_3" : "powerup_2");
        window.setTimeout(function () {
          coach.className = "key-echo-coach";
          cueing = false;
          countdown(playCue);
        }, 1900);
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
        if (level > totalLevels) {
          showLevel();
          levelNode.textContent = totalLevels + "/" + totalLevels;
          finishKeyEcho();
          return;
        }
        showLevel();
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

    document.getElementById("play-cue").addEventListener("click", function () {
      if (!finished) startCueFlow();
    });
    captureInput.addEventListener("input", function () {
      const typed = captureInput.value;
      if (!typed) return;
      handleEchoKey(typed.slice(-1));
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !listening) {
        event.preventDefault();
        if (!finished) startCueFlow();
        return;
      }
      if (event.target === captureInput) return;
      handleEchoKey(event.key);
    });
    show();
    showLevel();
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
      // The flyer lives outside the scaled stage, so match the stage scale.
      const fit = (window.EducationStationStage && window.EducationStationStage.fit) || 1;
      flyer.style.transform = "translate(-50%, -50%) scale(" + fit + ")";
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

    // Layout size of the scope, ignoring the stage's scale transform.
    // (getBoundingClientRect is in scaled screen pixels, but the circle and
    // ray are sized in layout pixels, so mixing them put the circle at the
    // wrong distance whenever the stage was scaled.)
    function scopeSize() {
      return { width: scopeGrid.clientWidth, height: scopeGrid.clientHeight };
    }

    function scopeRadiusPx() {
      const rect = scopeSize();
      return Math.min(rect.width * 0.46, rect.height * 0.92);
    }

    function scopePoint(pointAngle, pointTune) {
      const rect = scopeSize();
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
    // Story: an email arrives at the loadmaster's desk asking for a cargo mix,
    // the kid loads the crates, sends a report, and gets a reply email.
    const TYPES = [
      { key: "water", label: "Water", icon: "💧" },
      { key: "equipment", label: "Equipment", icon: "🔧" },
      { key: "food", label: "Food", icon: "🍎" }
    ];
    const MIXES = [
      { total: 10, water: 30, equipment: 50, food: 20 },
      { total: 12, water: 25, equipment: 50, food: 25 },
      { total: 15, water: 40, equipment: 20, food: 40 },
      { total: 20, water: 20, equipment: 40, food: 40 },
      { total: 8, water: 25, equipment: 50, food: 25 },
      { total: 10, water: 10, equipment: 60, food: 30 },
      { total: 20, water: 25, equipment: 25, food: 50 },
      { total: 16, water: 25, equipment: 50, food: 25 },
      { total: 5, water: 20, equipment: 40, food: 40 },
      { total: 12, water: 50, equipment: 25, food: 25 }
    ];
    const FRACTIONS = { 10: "1/10", 20: "1/5", 25: "1/4", 30: "3/10", 40: "2/5", 50: "1/2", 60: "3/5", 75: "3/4" };
    const SENDERS = [
      { name: "Rin Okafor", role: "Cargo Office", address: "rin.okafor@station7.space", sign: "Rin" },
      { name: "Captain Vega", role: "Bridge", address: "captain.vega@station7.space", sign: "Captain Vega" },
      { name: "Dr. Mae Osei", role: "Science Lab", address: "mae.osei@station7.space", sign: "Dr. Osei" },
      { name: "Chef Tomas", role: "Galley", address: "tomas.galley@station7.space", sign: "Chef Tomas" }
    ];
    const REASONS = [
      "We're heading out to the Ice Moon tomorrow.",
      "The supply run to Outpost Juniper leaves tonight.",
      "Our mining crew on the asteroid belt is running low.",
      "The research team on Mars Base is waiting for supplies."
    ];

    const totalLevels = 5;
    let email = null;
    let loaded = [];
    if (window.EducationStationReward) window.EducationStationReward.init("cargo-fractions");

    function showLevel() {
      levelNode.textContent = Math.min(level, totalLevels) + "/" + totalLevels;
    }
    let inbox = 0;
    const history = []; // earlier emails, shown read (greyed) under the new one
    let flight = rand(20, 80);

    workspace.classList.add("desk-workspace");
    workspace.innerHTML = [
      '<div class="desk-screen" id="desk-screen"></div>',
      '<div class="desk-controls" id="desk-controls"></div>'
    ].join("");
    const screen = document.getElementById("desk-screen");
    const controls = document.getElementById("desk-controls");

    function clockTime() {
      const now = new Date();
      const h = now.getHours() % 12 || 12;
      return h + ":" + String(now.getMinutes()).padStart(2, "0") + (now.getHours() < 12 ? " AM" : " PM");
    }

    function amountText(percent) {
      if (email.style === "fraction" && FRACTIONS[percent]) return FRACTIONS[percent];
      return percent + "%";
    }

    function makeEmail() {
      const mix = choice(MIXES);
      const sender = choice(SENDERS);
      flight += rand(1, 7);
      const style = level <= 2 ? "percent" : (Math.random() < 0.5 ? "fraction" : "percent");
      const crates = {};
      TYPES.forEach((type) => { crates[type.key] = mix.total * mix[type.key] / 100; });
      return { mix, sender, crates, style, flight, reason: choice(REASONS), time: clockTime() };
    }

    function mixList() {
      return TYPES.map((type) => "<li><strong>" + amountText(email.mix[type.key]) + "</strong> " + type.label.toLowerCase() + "</li>").join("");
    }

    // ---------- Screens ----------
    function showInbox() {
      inbox += 1;
      email = makeEmail();
      loaded = [];
      screen.innerHTML = [
        '<div class="mail-app">',
        '<div class="mail-bar"><span class="mail-logo">✉ StationMail</span><span class="mail-user">loadmaster@station7.space</span></div>',
        '<div class="mail-body">',
        '<div class="mail-side"><span class="mail-folder active">Inbox <b>1</b></span><span class="mail-folder">Sent</span><span class="mail-folder">Archive</span></div>',
        '<div class="mail-list">',
        '<button type="button" class="mail-item unread" id="mail-open">',
        '<span class="mail-dot"></span>',
        '<span class="mail-from">' + email.sender.name + '</span>',
        '<span class="mail-subject">Cargo for Flight ' + email.flight + '</span>',
        '<span class="mail-preview">Hi Loadmaster, ' + email.reason + "…</span>",
        '<span class="mail-time">' + email.time + "</span>",
        "</button>",
        history.length ? history.map(function (old) {
          return '<div class="mail-item read" aria-disabled="true">' +
            '<span class="mail-from">' + old.sender.name + "</span>" +
            '<span class="mail-subject">Cargo for Flight ' + old.flight + "</span>" +
            '<span class="mail-preview">' + (old.ok ? "✓ Loaded and launched" : "✗ Some crates were off") + "</span>" +
            '<span class="mail-time">' + old.time + "</span></div>";
        }).join("") : '<p class="mail-older">No other messages.</p>',
        "</div></div></div>"
      ].join("");
      // Same place as every other step: one action button on the desk.
      controls.innerHTML = button("Open mail", 'data-action="open"');
      controls.querySelector('[data-action="open"]').addEventListener("click", showEmail);
      play("good");
      feedback.textContent = "You have new mail! Press Open mail to read it.";
      document.getElementById("mail-open").addEventListener("click", showEmail);
    }

    function showEmail() {
      play("beep");
      screen.innerHTML = [
        '<div class="mail-app">',
        '<div class="mail-bar"><span class="mail-logo">✉ StationMail</span><span class="mail-user">loadmaster@station7.space</span></div>',
        '<div class="mail-read">',
        '<p class="mail-subject-big">Cargo for Flight ' + email.flight + "</p>",
        '<p class="mail-head"><b>From:</b> ' + email.sender.name + " (" + email.sender.role + ") &lt;" + email.sender.address + "&gt;</p>",
        '<p class="mail-head"><b>To:</b> Loadmaster (you)</p>',
        '<p class="mail-head"><b>Sent:</b> Today, ' + email.time + "</p>",
        '<div class="mail-text">',
        "<p>Hi Loadmaster,</p>",
        "<p>" + email.reason + " The captain wants the <strong>" + email.mix.total + " crates</strong> on Flight " + email.flight + " to be:</p>",
        '<ul class="mail-mix">' + mixList() + "</ul>",
        "<p>Could you make sure that's what gets loaded? Thanks!</p>",
        "<p>— " + email.sender.sign + "</p>",
        "</div></div></div>"
      ].join("");
      controls.innerHTML = button("Next: Load the cargo", 'data-action="load"');
      controls.querySelector('[data-action="load"]').addEventListener("click", showLoading);
      feedback.textContent = "Read the email. How many crates of each kind is that?";
    }

    function showLoading() {
      play("beep");
      screen.innerHTML = [
        '<div class="bay-app">',
        '<div class="mail-bar"><span class="mail-logo">▣ Cargo Bay // Flight ' + email.flight + '</span><span class="mail-user" id="bay-count"></span></div>',
        '<div class="bay-body">',
        '<div class="bay-note"><b>From ' + email.sender.sign + ':</b><ul class="mail-mix">' + mixList() + '</ul><span>of ' + email.mix.total + " crates</span></div>",
        '<div class="bay-rack" id="bay-rack"></div>',
        "</div>",
        '<div class="bay-tally" id="bay-tally"></div>',
        "</div>"
      ].join("");
      controls.innerHTML = TYPES.map((type) =>
        '<button type="button" class="command-button desk-crate crate-' + type.key + '" data-cargo="' + type.key + '"><span>' + type.icon + "</span>" + type.label + "</button>"
      ).join("") +
        button("↩ Undo", 'data-action="undo"') +
        button("Send report", 'data-action="send"');
      controls.querySelectorAll("[data-cargo]").forEach(function (item) {
        item.addEventListener("click", function () {
          if (loaded.length >= email.mix.total) {
            feedback.textContent = "The bay is full. Undo a crate or send your report.";
            play("error");
            return;
          }
          loaded.push(item.dataset.cargo);
          play("beep");
          drawBay();
        });
      });
      controls.querySelector('[data-action="undo"]').addEventListener("click", function () {
        if (!loaded.length) return;
        loaded.pop();
        play("beep");
        drawBay();
      });
      controls.querySelector('[data-action="send"]').addEventListener("click", sendReport);
      feedback.textContent = "Load " + email.mix.total + " crates, then send your report.";
      drawBay();
    }

    function tally() {
      const counts = { water: 0, equipment: 0, food: 0 };
      loaded.forEach((key) => { counts[key] += 1; });
      return counts;
    }

    function drawBay() {
      const rack = document.getElementById("bay-rack");
      rack.innerHTML = Array.from({ length: email.mix.total }, function (_, i) {
        const key = loaded[i];
        const type = TYPES.find((t) => t.key === key);
        return '<span class="bay-slot' + (key ? " filled crate-" + key : "") + '">' + (type ? type.icon : "") + "</span>";
      }).join("");
      rack.style.setProperty("--cols", email.mix.total > 12 ? 10 : email.mix.total > 6 ? 6 : 5);
      const counts = tally();
      document.getElementById("bay-tally").innerHTML = TYPES.map((type) =>
        '<span class="crate-' + type.key + '">' + type.icon + " " + type.label + " <b>" + counts[type.key] + "</b></span>"
      ).join("");
      document.getElementById("bay-count").textContent = loaded.length + " / " + email.mix.total + " loaded";
      const send = controls.querySelector('[data-action="send"]');
      if (send) send.disabled = loaded.length !== email.mix.total;
    }

    function sendReport() {
      if (loaded.length !== email.mix.total) return;
      const counts = tally();
      const rows = TYPES.map(function (type) {
        const want = email.crates[type.key];
        const ok = counts[type.key] === want;
        // The two numbers to compare sit in matching boxes, side by side.
        return '<tr class="' + (ok ? "row-ok" : "row-bad") + '"><td>' + type.icon + " " + type.label + "</td>" +
          '<td class="check-math">' + amountText(email.mix[type.key]) + " of " + email.mix.total + " =</td>" +
          '<td><span class="num-box">' + want + '</span></td>' +
          '<td><span class="num-box">' + counts[type.key] + "</span></td>" +
          '<td class="check-mark">' + (ok ? "✓" : "✗") + "</td></tr>";
      }).join("");
      const allOk = TYPES.every((type) => counts[type.key] === email.crates[type.key]);
      history.unshift({ sender: email.sender, flight: email.flight, time: email.time, ok: allOk });
      const finished = allOk && level >= totalLevels;
      if (allOk) {
        setScore(20);
        setLevel(level + 1);
        showLevel();
        if (finished) levelNode.textContent = totalLevels + "/" + totalLevels;
        play("small_victory");
      } else {
        play("error");
      }
      screen.innerHTML = [
        '<div class="mail-app">',
        '<div class="mail-bar"><span class="mail-logo">✉ StationMail</span><span class="mail-user">loadmaster@station7.space</span></div>',
        '<div class="mail-read">',
        '<p class="mail-subject-big">Re: Cargo for Flight ' + email.flight + "</p>",
        '<p class="mail-head"><b>From:</b> ' + email.sender.name + " &lt;" + email.sender.address + "&gt;</p>",
        '<div class="mail-text">',
        "<p>" + (allOk
          ? "Thanks, Loadmaster! I checked the bay and it's exactly right. Flight " + email.flight + " is cleared for launch. 🚀"
          : "Hmm, I checked the bay and a few crates are off. Here's what I found:") + "</p>",
        '<table class="mail-check"><tr><th>Cargo</th><th></th><th>Asked for</th><th>You loaded</th><th></th></tr>' + rows + "</table>",
        allOk ? "" : "<p>No problem, the next flight is waiting. Let's try again!</p>",
        "<p>— " + email.sender.sign + "</p>",
        "</div></div></div>"
      ].join("");
      if (finished) {
        controls.innerHTML = button("Finish shift", 'data-action="finish"');
        controls.querySelector('[data-action="finish"]').addEventListener("click", function () {
          if (window.EducationStationReward) {
            window.EducationStationReward.celebrate({
              title: "Shift Complete!",
              lines: ["All " + totalLevels + " flights loaded", "Score " + score]
            });
          }
        });
        feedback.textContent = "That was the last flight! Press Finish shift.";
        return;
      }
      controls.innerHTML = button("Next email", 'data-action="next"');
      controls.querySelector('[data-action="next"]').addEventListener("click", showInbox);
      feedback.textContent = allOk ? "Report accepted! Check your inbox for the next job." : "Compare what was asked with what you loaded, then try the next email.";
    }

    showLevel();
    showInbox();
  }

  const inits = { mastermind: initMastermind, typing: initTyping, rhythm: initRhythm, bonds: initBonds, radio: initRadio, packing: initPacking, land: initLand };
  (inits[mode] || initMastermind)();
})();
