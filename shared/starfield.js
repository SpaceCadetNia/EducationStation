(function () {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const stars = [];
  const count = 160;
  const script = document.currentScript || document.querySelector('script[src*="starfield.js"]');
  const isTitleScreen = document.body.dataset.titleScreen === "launch";
  const assets = {};
  let launchStart = 0;
  let pendingNavigation = "";

  loadImage("station", "station.png");
  loadImage("complex", "launch_complex.png");
  loadImage("train", "space_train.png");
  loadImage("shipOff", "ship_off.png");
  loadImage("shipOn", "ship_on.png");

  function loadImage(name, filename) {
    const image = new Image();
    image.addEventListener("load", function () {
      assets[name] = makeSprite(image);
    });
    image.src = new URL("../assets/images/" + filename, script.src).href;
  }

  function makeSprite(image) {
    const buffer = document.createElement("canvas");
    buffer.width = image.naturalWidth;
    buffer.height = image.naturalHeight;
    const bufferCtx = buffer.getContext("2d");
    bufferCtx.drawImage(image, 0, 0);
    const pixels = bufferCtx.getImageData(0, 0, buffer.width, buffer.height);
    const data = pixels.data;
    let minX = buffer.width;
    let minY = buffer.height;
    let maxX = 0;
    let maxY = 0;

    for (let index = 0; index < data.length; index += 4) {
      if (data[index + 3] > 8) {
        const pixel = index / 4;
        const x = pixel % buffer.width;
        const y = Math.floor(pixel / buffer.width);
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }

    const empty = minX > maxX || minY > maxY;
    return {
      image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      bounds: {
        x: empty ? 0 : minX,
        y: empty ? 0 : minY,
        width: empty ? image.naturalWidth : maxX - minX + 1,
        height: empty ? image.naturalHeight : maxY - minY + 1
      }
    };
  }

  function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  function seedStars() {
    stars.length = 0;
    for (let i = 0; i < count; i += 1) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        speed: 0.18 + Math.random() * 0.85,
        size: Math.random() > 0.9 ? 2 : 1,
        tone: Math.random() > 0.75 ? "#62d8ff" : "#6cff7b"
      });
    }
  }

  function drawStation() {
    const station = assets.station;
    if (!station) return;

    const maxWidth = Math.min(window.innerWidth * 0.52, 720);
    const maxHeight = Math.min(window.innerHeight * 0.58, 430);
    const scale = Math.min(maxWidth / station.width, maxHeight / station.height);
    const width = station.width * scale;
    const height = station.height * scale;
    const x = window.innerWidth - width - Math.max(18, window.innerWidth * 0.04);
    const y = Math.max(18, window.innerHeight * 0.06);

    ctx.save();
    ctx.globalAlpha = 0.72;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(station.image, Math.round(x), Math.round(y), Math.round(width), Math.round(height));
    ctx.restore();
  }

  function drawTitleScene(now) {
    const complex = assets.complex;
    if (!complex) return;

    const layout = getLaunchLayout(complex);
    const train = getTrainPosition(now, layout);
    const ship = getShipPosition(now, layout);

    drawCroppedSprite(ship.launched ? assets.shipOn : assets.shipOff, ship.x, ship.y, ship.size, ship.size, ship.alpha);
    drawSprite(complex, layout.x, layout.y, layout.width, layout.height, 0.82);
    drawCroppedSprite(assets.train, train.x, train.y, train.width, train.height, train.alpha);
  }

  function getLaunchLayout(complex) {
    const screen = document.querySelector(".screen");
    const rect = screen ? screen.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    const width = Math.min(rect.width * 0.66, window.innerWidth * 0.66);
    const height = width * (complex.height / complex.width);
    const x = rect.left + (rect.width - width) / 2;
    const y = rect.top + rect.height - height - 12;
    return { x, y, width, height };
  }

  function getTrainPosition(now, layout) {
    const sprite = assets.train;
    const ratio = sprite ? sprite.bounds.height / sprite.bounds.width : 0.18;
    const width = layout.width * 0.72;
    const height = width * ratio;
    const duration = 7200;
    const travelIn = 2400;
    const dwell = 1100;
    const travelOut = 1900;
    const cycle = now % duration;
    const parkedX = layout.x + layout.width * 0.13;
    const startX = window.innerWidth + 24;
    const endX = -width - 24;
    const y = layout.y + layout.height - height - 8;
    let x = startX;
    let alpha = 1;

    if (cycle < travelIn) {
      x = lerp(startX, parkedX, easeOutCubic(cycle / travelIn));
    } else if (cycle < travelIn + dwell) {
      x = parkedX;
    } else if (cycle < travelIn + dwell + travelOut) {
      x = lerp(parkedX, endX, easeInCubic((cycle - travelIn - dwell) / travelOut));
    } else {
      alpha = 0;
    }

    return { x, y, width, height, alpha };
  }

  function getShipPosition(now, layout) {
    const size = Math.min(layout.width * 0.22, layout.height * 0.5);
    const dockX = layout.x + layout.width * 0.5 - size / 2;
    const dockY = layout.y + layout.height * 0.28 - size / 2;

    if (!launchStart) return { x: dockX, y: dockY, size, alpha: 0.92, launched: false };

    const elapsed = now - launchStart;
    const progress = Math.min(elapsed / 1800, 1);
    const y = lerp(dockY, -size * 1.2, easeInCubic(progress));
    const sway = Math.sin(progress * Math.PI * 3) * 10;
    return { x: dockX + sway, y, size, alpha: 1, launched: true };
  }

  function drawSprite(sprite, x, y, width, height, alpha) {
    if (!sprite) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprite.image, Math.round(x), Math.round(y), Math.round(width), Math.round(height));
    ctx.restore();
  }

  function drawCroppedSprite(sprite, x, y, width, height, alpha) {
    if (!sprite) return;
    const bounds = sprite.bounds;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      sprite.image,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      Math.round(x),
      Math.round(y),
      Math.round(width),
      Math.round(height)
    );
    ctx.restore();
  }

  function lerp(start, end, progress) {
    return start + (end - start) * progress;
  }

  function easeOutCubic(progress) {
    return 1 - Math.pow(1 - progress, 3);
  }

  function easeInCubic(progress) {
    return progress * progress * progress;
  }

  function tick(now) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = "#05070a";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    for (const star of stars) {
      star.y += star.speed;
      if (star.y > window.innerHeight) {
        star.y = 0;
        star.x = Math.random() * window.innerWidth;
      }
      ctx.fillStyle = star.tone;
      ctx.fillRect(Math.round(star.x), Math.round(star.y), star.size, star.size);
    }

    if (isTitleScreen) {
      drawTitleScene(now);
    } else {
      drawStation();
    }
    requestAnimationFrame(tick);
  }

  function bindLaunchLinks() {
    document.addEventListener("click", function (event) {
      const link = event.target.closest(".program-card, .top-nav a");
      if (!link) return;

      if (!isTitleScreen || !link.matches("[data-launch-target]")) {
        playUiSound("beep");
        return;
      }

      if (pendingNavigation) return;
      event.preventDefault();
      playUiSound("beep");
      fadeTitleMusic();
      pendingNavigation = link.href;
      launchStart = performance.now();
      link.classList.add("launching");
      window.setTimeout(function () {
        window.location.href = pendingNavigation;
      }, 1850);
    });
  }

  function playUiSound(name) {
    document.dispatchEvent(new CustomEvent("educationstation:sound", { detail: { name } }));
  }

  function fadeTitleMusic() {
    if (!window.EducationStationSound || !window.EducationStationSound.fadeMusicOut) return;
    window.EducationStationSound.fadeMusicOut(1750);
  }

  window.addEventListener("resize", function () {
    resize();
    seedStars();
  });

  resize();
  seedStars();
  bindLaunchLinks();
  tick();
})();
