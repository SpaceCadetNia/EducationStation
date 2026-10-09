(function () {
  const root = document.documentElement;
  const designWidth = 1024;
  const designHeight = 768;
  const margin = 8;
  const script = document.currentScript || document.querySelector('script[src*="stage.js"]');

  // Language Garden pages share this file but keep their own layout.
  const legacy = /\/LANGUAGE\//.test(window.location.pathname);

  const ua = navigator.userAgent || "";
  const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  const shortSide = Math.min(window.screen.width || 0, window.screen.height || 0);
  // Phones: iPhone/iPod, Android phones, or any touch screen under 500px wide.
  const isPhone = /iPhone|iPod/.test(ua) || (/Android/.test(ua) && /Mobile/.test(ua)) || (coarse && shortSide > 0 && shortSide < 500);
  // Tablets: touch screens that aren't phones (iPads report as Mac + touch).
  const isTablet = !isPhone && (coarse || /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1));

  function isTextInputFocused() {
    const active = document.activeElement;
    if (!active) return false;
    return active.matches("input, textarea, select, [contenteditable='true']");
  }

  function viewportSize() {
    const viewport = window.visualViewport;
    if (isTextInputFocused()) {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    return {
      width: viewport ? viewport.width : window.innerWidth,
      height: viewport ? viewport.height : window.innerHeight
    };
  }

  // Legacy layout: shrink the stage box (contents are not scaled).
  function fitLegacy() {
    const viewport = viewportSize();
    const scale = Math.min(
      1,
      Math.max(0.1, (viewport.width - margin) / designWidth),
      Math.max(0.1, (viewport.height - margin) / designHeight)
    );
    const width = Math.floor(designWidth * scale);
    const height = Math.floor(designHeight * scale);
    const top = Math.max(4, Math.floor((viewport.height - height) / 2));
    root.style.setProperty("--stage-width", width + "px");
    root.style.setProperty("--stage-height", height + "px");
    root.style.setProperty("--stage-margin-y", top + "px");
    root.style.setProperty("--stage-scale", String(scale));
  }

  // Fixed stage: lay out at 1024x768 and scale the whole picture to fit,
  // up or down, so everything keeps its proportions on any screen.
  function fitFixed() {
    const viewport = viewportSize();
    const fit = Math.max(0.2, Math.min(
      (viewport.width - margin) / designWidth,
      (viewport.height - margin) / designHeight,
      2.5
    ));
    root.style.setProperty("--stage-fit", fit.toFixed(4));
    window.EducationStationStage.fit = fit;
    updateRotateNotice(viewport);
  }

  window.EducationStationStage = { fit: 1, legacy, isPhone, isTablet };

  // ---------- iPad held upright: ask to rotate ----------
  let rotateNotice = null;
  function updateRotateNotice(viewport) {
    const portrait = isTablet && viewport.height > viewport.width;
    if (portrait && !rotateNotice && document.body) {
      rotateNotice = document.createElement("div");
      rotateNotice.className = "stage-notice rotate-notice";
      rotateNotice.innerHTML = '<div class="rotate-device" aria-hidden="true"></div>' +
        "<h2>Turn your iPad sideways</h2><p>EducationStation plays in landscape.</p>";
      document.body.appendChild(rotateNotice);
    }
    if (rotateNotice) rotateNotice.hidden = !portrait;
    root.classList.toggle("stage-rotate", portrait);
  }

  // ---------- Phones: radio only ----------
  const radioTracks = [
    ["radio_music_1", "Return to Cordelia"],
    ["radio_music_2", "Kitty World"],
    ["radio_music_3", "Desert World"],
    ["radio_music_4", "Apollo 11"],
    ["radio_music_5", "Space Keys"],
    ["radio_music_6", "Dancing Starports"],
    ["radio_music_7", "Astro Jelly"],
    ["radio_music_8", "Easy Signal"]
  ];

  function showPhoneRadio() {
    root.classList.add("stage-phone");
    const base = new URL("../assets/sounds/", script.src).href;
    const audio = new Audio();
    audio.preload = "none";
    let index = 0;
    let playing = false;

    const panel = document.createElement("div");
    panel.className = "stage-notice phone-radio";
    panel.innerHTML = [
      "<h2>EducationStation</h2>",
      "<p>These games are made for iPads (sideways) and computers.<br>On a phone, enjoy the station radio.</p>",
      '<div class="phone-radio-deck">',
      '<div class="phone-radio-bars" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>',
      '<p class="phone-radio-title" id="phone-radio-title"></p>',
      '<div class="phone-radio-buttons">',
      '<button type="button" data-radio="prev" aria-label="Previous track">&#9664;&#9664;</button>',
      '<button type="button" data-radio="play" class="phone-radio-play" aria-label="Play">&#9654;</button>',
      '<button type="button" data-radio="next" aria-label="Next track">&#9654;&#9654;</button>',
      "</div></div>",
      '<ol class="phone-radio-list" id="phone-radio-list"></ol>'
    ].join("");
    document.body.appendChild(panel);
    const title = panel.querySelector("#phone-radio-title");
    const list = panel.querySelector("#phone-radio-list");
    const playButton = panel.querySelector(".phone-radio-play");
    list.innerHTML = radioTracks.map((track, i) => '<li><button type="button" data-track="' + i + '">' + track[1] + "</button></li>").join("");

    function render() {
      title.textContent = (playing ? "Now playing: " : "Ready: ") + radioTracks[index][1];
      playButton.innerHTML = playing ? "&#10074;&#10074;" : "&#9654;";
      playButton.setAttribute("aria-label", playing ? "Pause" : "Play");
      panel.classList.toggle("is-playing", playing);
      list.querySelectorAll("button").forEach((button) => {
        button.classList.toggle("current", Number(button.dataset.track) === index);
      });
    }

    function load(i) {
      index = (i + radioTracks.length) % radioTracks.length;
      audio.src = base + radioTracks[index][0] + ".mp3";
    }

    function play() {
      if (!audio.src) load(index);
      const attempt = audio.play();
      playing = true;
      if (attempt && attempt.catch) attempt.catch(() => { playing = false; render(); });
      render();
    }

    panel.addEventListener("click", function (event) {
      const control = event.target.closest("[data-radio]");
      const track = event.target.closest("[data-track]");
      if (track) {
        load(Number(track.dataset.track));
        play();
      } else if (control && control.dataset.radio === "play") {
        if (playing) {
          audio.pause();
          playing = false;
          render();
        } else {
          play();
        }
      } else if (control) {
        load(index + (control.dataset.radio === "next" ? 1 : -1));
        play();
      }
    });
    audio.addEventListener("ended", function () {
      load(index + 1);
      play();
    });
    load(0);
    render();

    // Keep game sounds and title music from starting underneath.
    document.addEventListener("educationstation:sound", function (event) {
      event.stopImmediatePropagation();
    }, true);
  }

  function fitStage() {
    if (legacy) fitLegacy();
    else fitFixed();
  }

  if (!legacy) root.classList.add("fixed-stage");
  window.addEventListener("resize", fitStage);
  window.addEventListener("orientationchange", fitStage);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", fitStage);
  fitStage();

  function onReady() {
    if (!legacy && isPhone) showPhoneRadio();
    fitStage();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onReady);
  else onReady();

  let lastTouchEnd = 0;
  document.addEventListener("touchend", function (event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 320) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });

  document.addEventListener("gesturestart", function (event) {
    event.preventDefault();
  });
})();
