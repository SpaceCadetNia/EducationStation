// Stars, records and the end-of-game celebration.
// Stars and records are remembered on this device (localStorage).
(function () {
  const STAR_KEY = "educationstation:stars";
  const RECORD_KEY = "educationstation:records";
  const SONG = "radio_music_6"; // "Dancing Starports"

  function readStore(name) {
    try {
      return JSON.parse(window.localStorage.getItem(name) || "{}") || {};
    } catch (error) {
      return {};
    }
  }

  function writeStore(name, value) {
    try {
      window.localStorage.setItem(name, JSON.stringify(value));
    } catch (error) {
      // Private browsing or storage turned off: the reward still shows.
    }
  }

  function stars(key) {
    return Number(readStore(STAR_KEY)[key]) || 0;
  }

  function starsFor(keys) {
    const store = readStore(STAR_KEY);
    return keys.reduce((sum, key) => sum + (Number(store[key]) || 0), 0);
  }

  function addStar(key) {
    const store = readStore(STAR_KEY);
    store[key] = (Number(store[key]) || 0) + 1;
    writeStore(STAR_KEY, store);
    return store[key];
  }

  function record(key) {
    return Number(readStore(RECORD_KEY)[key]) || 0;
  }

  // Saves the value if it beats the old record. Returns true when it does.
  function saveRecord(key, value) {
    const store = readStore(RECORD_KEY);
    if (!(value > (Number(store[key]) || 0))) return false;
    store[key] = Math.floor(value);
    writeStore(RECORD_KEY, store);
    return true;
  }

  // ---------- Star badge next to the game's name ----------
  let pageKey = "";

  function badgeHtml(count) {
    return "★ " + count;
  }

  function updateBadge() {
    const title = document.getElementById("game-title") ||
      document.getElementById("test-title") ||
      document.querySelector(".mission-header h1");
    if (!title || !pageKey) return;
    let badge = title.querySelector(".star-badge");
    const count = stars(pageKey);
    if (!count) {
      if (badge) badge.remove();
      return;
    }
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "star-badge";
      title.appendChild(badge);
    }
    badge.textContent = badgeHtml(count);
    badge.setAttribute("aria-label", count + (count === 1 ? " star" : " stars") + " earned");
  }

  function init(key) {
    pageKey = key;
    updateBadge();
  }

  // ---------- Celebration ----------
  const STAR_PATH = "M50 4 L62 37 L97 38 L69 59 L79 93 L50 73 L21 93 L31 59 L3 38 L38 37 Z";

  function playSong() {
    const sound = window.EducationStationSound;
    if (sound && sound.playSong) sound.playSong(SONG);
  }

  function stopSong() {
    const sound = window.EducationStationSound;
    if (sound && sound.stopSong) sound.stopSong();
  }

  // options: { key, title, lines: [text], onRestart }
  function celebrate(options) {
    const opts = options || {};
    const key = opts.key || pageKey;
    const total = key ? addStar(key) : 0;
    updateBadge();
    const host = document.querySelector(".screen") || document.body;
    const old = host.querySelector(".reward-overlay");
    if (old) old.remove();

    const overlay = document.createElement("div");
    overlay.className = "reward-overlay";
    overlay.innerHTML = [
      '<div class="reward-rays" aria-hidden="true"></div>',
      '<svg class="reward-star" viewBox="0 0 100 100" aria-hidden="true">',
      '<defs><linearGradient id="reward-gold" x1="0" y1="0" x2="0" y2="1">',
      '<stop offset="0" stop-color="#fff6b0"/><stop offset="0.45" stop-color="#ffd166"/><stop offset="1" stop-color="#f08a24"/>',
      "</linearGradient></defs>",
      '<path d="' + STAR_PATH + '" fill="url(#reward-gold)" stroke="#fff3c4" stroke-width="2.5" stroke-linejoin="round"/>',
      "</svg>",
      '<div class="reward-sparkles" aria-hidden="true">' + Array.from({ length: 12 }, (_, i) => '<span style="--i:' + i + '"></span>').join("") + "</div>",
      '<div class="reward-text">',
      "<h2>" + (opts.title || "Mission Complete!") + "</h2>",
      total ? '<p class="reward-count">Star earned! <strong>' + badgeHtml(total) + "</strong></p>" : "",
      (opts.lines || []).map((line) => '<p class="reward-line">' + line + "</p>").join(""),
      "</div>",
      '<div class="reward-actions">',
      '<button type="button" class="command-button reward-restart">Play again</button>',
      '<a class="command-button reward-menu" href="' + menuHref() + '">Menu</a>',
      "</div>"
    ].join("");
    host.appendChild(overlay);

    const sound = window.EducationStationSound;
    if (sound && sound.play) sound.play("small_victory");
    window.setTimeout(playSong, 700);

    overlay.querySelector(".reward-restart").addEventListener("click", function () {
      stopSong();
      overlay.classList.add("reward-leaving");
      window.setTimeout(function () {
        overlay.remove();
        if (typeof opts.onRestart === "function") opts.onRestart();
        else window.location.reload();
      }, 350);
    });
    overlay.querySelector(".reward-menu").addEventListener("click", stopSong);
    return total;
  }

  function menuHref() {
    const nav = document.querySelector(".top-nav a");
    return nav ? nav.getAttribute("href") : "../index.html";
  }

  window.EducationStationReward = { init, celebrate, stars, starsFor, addStar, record, saveRecord, updateBadge };
})();
