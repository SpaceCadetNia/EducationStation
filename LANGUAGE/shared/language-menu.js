// Language Garden launch menu.
// Same navigation cues as the EducationStation menu (START gate, numbered
// program cards, top-nav back link, hash routing, beep + "launching" flash)
// without the space theme. Add new languages to `screens.home.cards` and give
// each one its own screen keyed by its menuTarget.
(function () {
  const host = document.querySelector("[data-lang-host]");
  if (!host) return;

  const header = host.querySelector("[data-lang-header]");
  const grid = host.querySelector("[data-lang-grid]");
  const backLink = host.querySelector("[data-lang-back]");
  const backNav = backLink.closest(".top-nav");
  const startField = host.querySelector("[data-lang-start]");
  const startedKey = "languagegarden:started";
  let started = readStarted();
  let pendingNavigation = null;

  const screens = {
    home: {
      title: "Language Garden",
      tagline: "Choose a language.",
      gridClass: "program-grid operator-grid",
      ariaLabel: "Languages",
      back: null, // Language Garden is its own top level: no link out to EducationStation
      cards: [
        {
          code: "VI2",
          title: "Tiếng Việt 2",
          meta: "Năm thứ hai · Vietnamese, year 2",
          href: "#vn",
          menuTarget: "vn"
        },
        {
          code: "+",
          title: "More Soon",
          meta: "New languages will grow here",
          locked: true
        }
      ]
    },
    vn: {
      system: "TIẾNG VIỆT 2 // VIETNAMESE YEAR 2",
      title: "Tiếng Việt 2",
      tagline: "Chọn một trò chơi. Pick a game.",
      gridClass: "program-grid operator-grid",
      ariaLabel: "Vietnamese games",
      back: { label: "Languages", href: "#home", menuTarget: "home" },
      cards: [
        {
          code: "01",
          title: "Đọc Bài",
          meta: "Read along: hear each sentence, tap words",
          href: "VN/reader/index.html",
          launch: true
        },
        {
          code: "02",
          title: "Chọn Từ",
          meta: "Workbook pages: pick the word that fits",
          href: "VN/choose/index.html",
          launch: true
        },
        {
          code: "03",
          title: "Đọc Thơ",
          meta: "Poems line by line, with meanings",
          href: "VN/poem/index.html",
          launch: true
        }
      ]
    }
  };

  function readStarted() {
    try { return sessionStorage.getItem(startedKey) === "true"; } catch (error) { return false; }
  }

  function saveStarted() {
    try { sessionStorage.setItem(startedKey, "true"); } catch (error) { /* ignore */ }
  }

  function render(screenName) {
    const name = screens[screenName] ? screenName : "home";
    const screen = screens[name];
    document.title = name === "home" ? screen.title : screen.title + " - Language Garden";

    backNav.hidden = !screen.back;
    if (screen.back) {
      backLink.textContent = screen.back.label;
      backLink.href = screen.back.href;
    }
    if (screen.back && screen.back.menuTarget) backLink.dataset.menuTarget = screen.back.menuTarget;
    else delete backLink.dataset.menuTarget;

    header.innerHTML = [
      screen.system ? '<p class="system-line">' + screen.system + "</p>" : "",
      "<h1>" + screen.title + "</h1>",
      '<p class="tagline">' + screen.tagline + "</p>"
    ].join("");
    grid.className = screen.gridClass;
    grid.setAttribute("aria-label", screen.ariaLabel);
    grid.innerHTML = screen.cards.map(renderCard).join("");
    grid.hidden = !started;
    startField.hidden = started;
    host.dataset.screen = name;
    history.replaceState(null, "", name === "home" ? location.pathname : "#" + name);
  }

  function renderCard(card) {
    const tag = card.locked ? "div" : "a";
    const href = card.locked ? "" : ' href="' + card.href + '"';
    const menuTarget = card.menuTarget ? ' data-menu-target="' + card.menuTarget + '"' : "";
    const launch = card.launch ? " data-launch-target" : "";
    const locked = card.locked ? " locked" : "";
    return [
      "<" + tag + ' class="program-card' + locked + '"' + href + menuTarget + launch + (card.locked ? ' aria-disabled="true"' : "") + ">",
      '<span class="program-code">' + card.code + "</span>",
      '<span class="program-title">' + card.title + "</span>",
      '<span class="program-meta">' + card.meta + "</span>",
      "</" + tag + ">"
    ].join("");
  }

  function playSound(name) {
    document.dispatchEvent(new CustomEvent("educationstation:sound", { detail: { name } }));
  }

  host.addEventListener("click", function (event) {
    const link = event.target.closest("a.program-card, .top-nav a");
    if (!link) return;
    if (pendingNavigation) { event.preventDefault(); return; }

    playSound("beep");

    if (link.dataset.menuTarget) {
      event.preventDefault();
      render(link.dataset.menuTarget);
      return;
    }

    if (link.matches("[data-launch-target]")) {
      event.preventDefault();
      pendingNavigation = link.href;
      link.classList.add("launching");
      window.setTimeout(function () { window.location.href = pendingNavigation; }, 650);
    }
  });

  startField.addEventListener("click", function () {
    if (started) return;
    started = true;
    saveStarted();
    startField.disabled = true;
    startField.classList.add("starting");
    playSound("powerup_3");
    window.setTimeout(function () {
      startField.disabled = false;
      startField.classList.remove("starting");
      render(location.hash.slice(1) || "home");
    }, 900);
  });

  window.addEventListener("hashchange", function () {
    render(started ? location.hash.slice(1) || "home" : "home");
  });

  // Coming back from a game (bfcache) should not leave a card stuck mid-launch.
  window.addEventListener("pageshow", function () {
    pendingNavigation = null;
    host.querySelectorAll(".launching").forEach(function (el) { el.classList.remove("launching"); });
  });

  render(started ? location.hash.slice(1) || "home" : "home");
})();
