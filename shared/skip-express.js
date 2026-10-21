// Skip Express (PROGRAM 11): get the astronaut from one address to another.
// Walk +1, Car +5, Train +10, Ship +100. You can only change lanes at a
// station: car stops on 5s, train stations on 10s, spaceports on 100s.
(function () {
  const UNIT = 40;          // px per address on the map
  let LANE_H = 84;          // px per lane band (fitted to the map in buildMap)
  const TOTAL_TRIPS = 10;
  const LANES = [
    { key: "walk", name: "Walk", verb: "Walk", step: 1, stop: "", sound: "beep", time: 0.22 },
    { key: "car", name: "Car", verb: "Drive", step: 5, stop: "car stop", sound: "powerup_2", time: 0.34 },
    { key: "train", name: "Train", verb: "Ride", step: 10, stop: "train station", sound: "train_indicator", time: 0.42 },
    { key: "ship", name: "Ship", verb: "Fly", step: 100, stop: "spaceport", sound: "launch_up", time: 1.1 }
  ];

  const $ = (id) => document.getElementById(id);
  const sound = (name) => {
    const s = window.EducationStationSound;
    if (s && s.play) s.play(name);
  };
  const reward = window.EducationStationReward;
  if (reward) reward.init("skip-express");

  const view = $("se-view");
  const world = $("se-world");
  const overlay = $("se-overlay");
  const feedback = $("se-feedback");
  const log = $("se-log");
  const upButton = $("se-up");
  const downButton = $("se-down");
  const goButton = $("se-go");
  const backButton = $("se-back");

  let figures = [];
  if (window.EducationStationSprites) {
    window.EducationStationSprites.loadFigures().then((list) => { figures = list; setFigure(); }).catch(() => {});
  }

  const state = {
    trip: 0, score: 0, start: 0, target: 0, pos: 0, lane: 0,
    moves: 0, best: 0, busy: true, playing: false, x0: 0, segments: []
  };
  let rider = null;
  let nodes = {};      // "lane:pos" -> element
  let links = {};      // "lane:pos" -> connector between lane-1 and lane at pos

  // ---------- Trips ----------
  function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  function makeTrip(n) {
    // Two trips per stage; each stage reaches bigger numbers.
    // [start min, start max, target min, target max]
    const plans = [
      [1, 9, 13, 29],        // 1-2: ones
      [3, 39, 55, 99],       // 3-4: ones and tens
      [21, 89, 160, 399],    // 5-6: hundreds
      [380, 790, 0, 0],      // 7-8: start high, go higher
      [40, 290, 1310, 1490]  // 9-10: nearly to 1500
    ];
    const p = plans[Math.min(Math.floor(n / 2), plans.length - 1)];
    let start;
    let target;
    do {
      start = randInt(p[0], p[1]);
      target = p[2] ? randInt(p[2], p[3]) : start + randInt(260, 480);
    } while (start % 5 === 0 || target % 10 === 0 || target - start < 10);
    return { start, target };
  }

  function canBoard(pos, lane) { return pos % LANES[lane].step === 0; }

  // The map runs a little past both ends so overshooting can be undone.
  function mapRange(start, target) {
    return { lo: Math.max(0, start - 12), hi: target + 14 };
  }

  // Fewest taps from start to target (every button press counts).
  // Express target: the best forward-only route (Back can still beat it).
  function bestMoves(start, target, allowBack) {
    const range = mapRange(start, target);
    const seen = new Set();
    let frontier = [[start, 0]];
    seen.add(start + ":0");
    for (let d = 0; d < 2000 && frontier.length; d++) {
      const next = [];
      for (const [p, l] of frontier) {
        if (p === target) return d;
        const options = [];
        const fwd = p + LANES[l].step;
        const back = p - LANES[l].step;
        if (fwd <= range.hi) options.push([fwd, l]);
        if (back >= range.lo && allowBack) options.push([back, l]);
        if (l > 0) options.push([p, l - 1]);
        if (l < LANES.length - 1 && canBoard(p, l + 1)) options.push([p, l + 1]);
        for (const o of options) {
          const k = o[0] + ":" + o[1];
          if (!seen.has(k)) { seen.add(k); next.push(o); }
        }
      }
      frontier = next;
    }
    return target - start;
  }

  // ---------- Map ----------
  const xOf = (p) => (p - state.x0) * UNIT;
  const yOf = (lane) => lane * LANE_H + LANE_H / 2;

  function el(tag, cls, parent, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }

  function buildMap() {
    world.innerHTML = "";
    nodes = {};
    links = {};
    LANE_H = Math.max(60, Math.floor(view.clientHeight / LANES.length));
    const range = mapRange(state.start, state.target);
    const x0 = range.lo;
    const x1 = range.hi;
    state.x0 = x0;
    world.style.width = (x1 - x0) * UNIT + "px";

    LANES.forEach((lane, i) => {
      const band = el("div", "se-band band-" + lane.key, world);
      band.style.top = i * LANE_H + "px";
      band.style.height = LANE_H + "px";
    });

    for (let p = Math.max(0, x0); p <= x1; p++) {
      // Transfer links between lanes (drawn behind the stops).
      for (let l = 1; l < LANES.length; l++) {
        if (!canBoard(p, l)) continue;
        const link = el("div", "se-link link-" + LANES[l].key, world);
        link.style.left = xOf(p) + "px";
        link.style.top = yOf(l - 1) + "px";
        link.style.height = LANE_H + "px";
        links[l + ":" + p] = link;
      }
      // Stops in every lane that stops here.
      for (let l = 0; l < LANES.length; l++) {
        if (!canBoard(p, l)) continue;
        const node = el("div", "se-node node-" + LANES[l].key + (p % 10 === 0 ? " node-ten" : "") + (p % 100 === 0 ? " node-hundred" : ""), world);
        node.style.left = xOf(p) + "px";
        node.style.top = yOf(l) + "px";
        el("span", "se-node-label", node, String(p));
        nodes[l + ":" + p] = node;
      }
    }

    // Start and destination markers.
    // Start and destination: circle the address on the walking line
    // (and on any other lane that stops at the destination).
    const startRing = el("div", "se-ring se-ring-start", world);
    startRing.style.left = xOf(state.start) + "px";
    startRing.style.top = yOf(0) + "px";
    state.goalRings = [];
    for (let l = 0; l < LANES.length; l++) {
      if (!canBoard(state.target, l)) continue;
      const ring = el("div", "se-ring se-ring-goal ring-" + LANES[l].key, world);
      ring.style.left = xOf(state.target) + "px";
      ring.style.top = yOf(l) + "px";
      state.goalRings.push(ring);
    }

    rider = el("div", "se-rider", world);
    el("div", "se-badge", rider);
    const walker = el("div", "se-vehicle se-walker", rider);
    el("img", "se-figure", walker).alt = "";
    const car = el("div", "se-vehicle se-car", rider);
    el("img", "", car).src = "../assets/images/buggy_top.png";
    const train = el("div", "se-vehicle se-train", rider);
    el("img", "", train).src = "../assets/images/space_train_top.png";
    const ship = el("div", "se-vehicle se-ship", rider);
    el("img", "", ship).src = "../assets/images/ship_on.png";
    setFigure();
  }

  function setFigure() {
    if (!rider) return;
    const img = rider.querySelector(".se-figure");
    if (!img) return;
    if (figures.length) {
      const f = figures[state.trip % figures.length];
      img.src = f.url || "";
      img.classList.remove("se-figure-missing");
    } else {
      img.classList.add("se-figure-missing");
    }
  }

  // ---------- Drawing the current state ----------
  function placeRider(duration) {
    const d = (duration || 0) + "s";
    rider.style.transitionDuration = d;
    rider.style.left = xOf(state.pos) + "px";
    rider.style.top = yOf(state.lane) + "px";
    rider.querySelector(".se-badge").textContent = "#" + state.pos;
    rider.className = "se-rider riding-" + LANES[state.lane].key + (state.facing < 0 ? " facing-left" : "");
    // Camera: keep the rider about 40% across the window.
    const viewW = view.clientWidth;
    const worldW = world.offsetWidth;
    let cam = xOf(state.pos) - viewW * 0.4;
    cam = Math.max(0, Math.min(cam, worldW - viewW));
    world.style.transitionDuration = d;
    world.style.transform = "translateX(" + (-cam) + "px)";
  }

  function lightNode(lane, pos) {
    Object.keys(nodes).forEach((k) => nodes[k].classList.remove("here"));
    Object.keys(links).forEach((k) => links[k].classList.remove("open"));
    const node = nodes[lane + ":" + pos];
    if (node) {
      node.classList.add("lit", "here");
      // Re-trigger the ping so each stop flashes as the vehicle reaches it.
      node.classList.remove("ping");
      void node.offsetWidth;
      node.classList.add("ping");
    }
    // Show where Up / Down can go from here.
    if (lane > 0 && links[lane + ":" + pos]) links[lane + ":" + pos].classList.add("open");
    if (lane < LANES.length - 1 && links[(lane + 1) + ":" + pos]) links[(lane + 1) + ":" + pos].classList.add("open");
  }

  function updateHud() {
    $("se-trip").textContent = (state.trip + 1) + "/" + TOTAL_TRIPS;
    $("se-moves").textContent = state.moves;
    $("se-score").textContent = state.score;
    $("se-from").textContent = "#" + state.start;
    $("se-to").textContent = "#" + state.target;
    const span = state.target - state.start;
    const pct = span ? Math.max(0, Math.min(1, (state.pos - state.start) / span)) * 100 : 0;
    $("se-progress-fill").style.width = pct + "%";
    $("se-progress-dot").style.left = pct + "%";
    const lane = LANES[state.lane];
    $("se-go-label").textContent = lane.verb + " +" + lane.step;
    $("se-back-label").textContent = "Back \u2212" + lane.step;
    goButton.className = "se-btn se-go go-" + lane.key;
    backButton.className = "se-btn se-back go-" + lane.key;
    upButton.classList.toggle("se-dim", state.lane === 0);
    downButton.classList.toggle("se-dim", !(state.lane < LANES.length - 1 && canBoard(state.pos, state.lane + 1)));
  }

  function renderLog() {
    log.innerHTML = "";
    state.segments.forEach((seg, i) => {
      if (i) el("span", "se-log-arrow", log, "→");
      const group = el("span", "se-log-seg seg-" + LANES[seg.lane].key, log);
      el("span", "se-log-mode", group, LANES[seg.lane].name);
      seg.nums.forEach((n) => el("span", "se-log-num", group, String(n)));
    });
    log.scrollLeft = log.scrollWidth;
  }

  function hint() {
    const p = state.pos;
    const lane = state.lane;
    const left = state.target - p;
    if (left < 0) {
      return "Passed #" + state.target + " by " + (-left) + ". Tap Back.";
    }
    if (lane < LANES.length - 1 && canBoard(p, lane + 1) && LANES[lane + 1].step <= left) {
      return "#" + p + " is a " + LANES[lane + 1].stop + ". Tap Down to take the " + LANES[lane + 1].name.toLowerCase() + ".";
    }
    if (lane > 0 && LANES[lane].step > left) {
      return "Only " + left + " to go. Tap Up to change to a slower ride.";
    }
    return "Heading to #" + state.target + ". " + left + " to go.";
  }

  // ---------- Moves ----------
  function lock(seconds) {
    state.busy = true;
    window.setTimeout(() => { state.busy = false; }, seconds * 1000 + 40);
  }

  function shake() {
    rider.classList.remove("se-shake");
    void rider.offsetWidth;
    rider.classList.add("se-shake");
  }

  function say(text, tone) {
    feedback.textContent = text;
    feedback.classList.toggle("se-warn", tone === "warn");
    feedback.classList.toggle("se-good", tone === "good");
  }

  // Car: plain engine loop while driving, cut at the stop.
  function moveSound(lane) {
    const s = window.EducationStationSound;
    if (!s) return;
    if (lane.key === "train") {
      // Quiet ride; a metro beep when it pulls into the station.
      window.setTimeout(() => s.play("metro_beep"), lane.time * 1000);
      return;
    }
    if (lane.key !== "car" || !s.start) {
      s.play(lane.key === "car" ? "beep" : lane.sound);
      return;
    }
    const engine = s.start("engine_loop", { loop: true, volume: 0.42 });
    window.setTimeout(() => engine.stop(0.08), lane.time * 1000);
  }

  function go(dir) {
    if (state.busy || !state.playing) return;
    const lane = LANES[state.lane];
    const next = state.pos + dir * lane.step;
    const range = mapRange(state.start, state.target);
    if (next > range.hi || next < range.lo) {
      sound("error");
      shake();
      say("That's off the map! " + state.pos + (dir > 0 ? " + " : " - ") + lane.step + " = " + next + ". Try a slower ride.", "warn");
      return;
    }
    state.pos = next;
    state.moves++;
    state.facing = dir;
    state.segments[state.segments.length - 1].nums.push(next);
    moveSound(lane);
    placeRider(lane.time);
    lightNode(state.lane, next);
    updateHud();
    renderLog();
    lock(lane.time);
    if (next === state.target) {
      window.setTimeout(arrive, lane.time * 1000 + 120);
      state.busy = true;
    } else if (next > state.target) {
      say("Passed #" + state.target + " by " + (next - state.target) + ". Go back, or tap Up for a slower ride.", "warn");
    } else {
      say(hint());
    }
  }

  function changeLane(delta) {
    if (state.busy || !state.playing) return;
    const to = state.lane + delta;
    if (to < 0) {
      sound("error");
      say("Walking is the top lane.", "warn");
      return;
    }
    if (to >= LANES.length) {
      sound("error");
      say("The ship is the fastest ride. Tap Go.", "warn");
      return;
    }
    if (delta > 0 && !canBoard(state.pos, to)) {
      const lane = LANES[to];
      const nextStop = Math.ceil(state.pos / lane.step) * lane.step;
      sound("error");
      shake();
      say("No " + lane.stop + " at #" + state.pos + ". The " + lane.name.toLowerCase() + " stops on " + lane.step + "s, like #" + nextStop + ".", "warn");
      return;
    }
    state.lane = to;
    state.moves++;
    const last = state.segments[state.segments.length - 1];
    // Passing straight through a lane at one station leaves no ride to show.
    if (last.nums.length === 1 && state.segments.length > 1) state.segments.pop();
    state.segments.push({ lane: to, nums: [state.pos] });
    // Changing lanes is silent; each ride has its own travel sound.
    placeRider(0.3);
    lightNode(state.lane, state.pos);
    updateHud();
    renderLog();
    say(delta > 0 ? "All aboard the " + LANES[to].name.toLowerCase() + ": " + LANES[to].verb.toLowerCase() + " +" + LANES[to].step + "." : hint());
    lock(0.3);
  }

  // ---------- Trip flow ----------
  function showCard(kicker, title, bodyHtml, buttonText, onClick) {
    $("se-card-kicker").textContent = kicker;
    $("se-card-title").textContent = title;
    $("se-card-body").innerHTML = bodyHtml;
    const button = $("se-card-button");
    button.textContent = buttonText;
    button.onclick = function () {
      overlay.hidden = true;
      onClick();
    };
    overlay.hidden = false;
  }

  function setupTrip() {
    const trip = makeTrip(state.trip);
    state.start = trip.start;
    state.target = trip.target;
    state.pos = trip.start;
    state.lane = 0;
    state.facing = 1;
    state.moves = 0;
    state.best = bestMoves(trip.start, trip.target);
    state.segments = [{ lane: 0, nums: [trip.start] }];
    state.playing = false;
    state.busy = true;
    buildMap();
    placeRider(0);
    lightNode(0, state.pos);
    updateHud();
    renderLog();
    const tips = [
      "Walk by 1s. Car stops are on the 5s: tap <b>Down</b> there to drive by 5s.",
      "Trains stop on the 10s. Take the car to a train station, then ride by 10s.",
      "Spaceports are on the 100s. The ship flies by 100s!",
      "Big numbers! Walk to a 5, drive to a 10, ride to a 100, then fly.",
      "Long trip, nearly to 1500! Use every ride: 1s, 5s, 10s and 100s."
    ];
    showCard(
      "Level " + (state.trip + 1) + "/" + TOTAL_TRIPS,
      "Travel ticket",
      '<div class="se-card-route"><span class="se-chip">#' + trip.start + '</span><span class="se-card-arrow">→</span><span class="se-chip se-chip-goal">#' + trip.target + "</span></div>" +
        '<p class="se-card-tip">' + tips[Math.min(Math.floor(state.trip / 2), tips.length - 1)] + "</p>",
      "Start trip",
      () => {
        state.playing = true;
        state.busy = false;
        sound("good");
        say(hint());
      }
    );
  }

  function arrive() {
    state.playing = false;
    state.busy = true;
    // Step off whatever we're riding and walk up to the door.
    if (state.lane !== 0) {
      state.lane = 0;
      placeRider(0.3);
      lightNode(0, state.pos);
      updateHud();
    }
    state.goalRings.forEach((ring) => ring.classList.add("se-goal-reached"));
    sound("good");
    const express = state.moves <= state.best;
    const points = 100 + (express ? 50 : 0);
    state.score += points;
    updateHud();
    say("Arrived at #" + state.target + "!", "good");
    const last = state.trip >= TOTAL_TRIPS - 1;
    const body = '<p class="se-card-result">' + state.moves + " moves" + (express ? "" : " · best is " + state.best) + "</p>" +
      '<p class="se-card-tip">' + (express ? "Express route! +150" : "+100. Try a faster ride next time.") + "</p>";
    window.setTimeout(() => {
      showCard(
        "Level " + (state.trip + 1) + "/" + TOTAL_TRIPS,
        express ? "Express route!" : "Arrived!",
        body,
        last ? "Finish" : "Next level",
        () => {
          if (last) finish();
          else {
            state.trip++;
            setupTrip();
          }
        }
      );
    }, 500);
  }

  function finish() {
    if (reward && reward.celebrate) {
      reward.celebrate({
        title: "Express Complete!",
        lines: ["All " + TOTAL_TRIPS + " addresses reached", "Score " + state.score],
        onRestart: restart
      });
    }
  }

  function restart() {
    state.trip = 0;
    state.score = 0;
    setupTrip();
  }

  // ---------- Input ----------
  goButton.addEventListener("click", () => go(1));
  backButton.addEventListener("click", () => go(-1));
  upButton.addEventListener("click", () => changeLane(-1));
  downButton.addEventListener("click", () => changeLane(1));
  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); go(1); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); go(-1); }
    else if (event.key === "ArrowUp") { event.preventDefault(); changeLane(-1); }
    else if (event.key === "ArrowDown") { event.preventDefault(); changeLane(1); }
    else if ((event.key === "Enter" || event.key === " ") && !overlay.hidden) {
      event.preventDefault();
      $("se-card-button").click();
    }
  });
  window.addEventListener("resize", () => { if (rider) placeRider(0); });

  window.SkipExpressDebug = {
    state,
    bestMoves,
    setTrip(n) { state.trip = Math.max(0, Math.min(TOTAL_TRIPS - 1, n - 1)); setupTrip(); },
    setRoute(start, target) {
      state.start = start; state.target = target; state.pos = start; state.lane = 0; state.facing = 1; state.moves = 0;
      state.best = bestMoves(start, target); state.segments = [{ lane: 0, nums: [start] }];
      overlay.hidden = true; buildMap(); placeRider(0); lightNode(0, start); updateHud(); renderLog();
      state.playing = true; state.busy = false; say(hint());
    }
  };

  restart();
})();
