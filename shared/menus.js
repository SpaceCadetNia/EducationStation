(function () {
  const host = document.querySelector("[data-menu-host]");
  if (!host) return;

  const header = host.querySelector("[data-menu-header]");
  const grid = host.querySelector("[data-menu-grid]");
  const backNav = host.querySelector(".menu-back-nav");
  const homeLink = host.querySelector("[data-menu-home]");
  const startField = host.querySelector("[data-start-field]");
  const hasStartGate = Boolean(startField);
  let started = !hasStartGate;

  const screens = {
    home: {
      title: "EducationStation",
      tagline: "Choose a learning program.",
      gridClass: "program-grid rolling-program-grid",
      ariaLabel: "Learning activities",
      back: false,
      cards: [
        {
          code: "01",
          title: "Number Seeker",
          meta: "Arithmetic missions: plus, minus, multiply, divide",
          href: "#number-seeker",
          menuTarget: "number-seeker"
        },
        {
          code: "02",
          title: "Passenger Counter",
          meta: "Track boarding waves at the space train station",
          href: "passenger-counter/index.html",
          launch: true
        },
        {
          code: "03",
          title: "Space Racer",
          meta: "Dodge ships and earn pitstop boosts with math",
          href: "space-racer/index.html",
          launch: true
        },
        {
          code: "04",
          title: "Radio Scope",
          meta: "Tune degrees and focal distance to find a signal",
          href: "test/index.html?game=radio",
          launch: true
        },
        {
          code: "05",
          title: "Number Bonds",
          meta: "Build nested number bonds from components",
          href: "test/index.html?game=bonds",
          launch: true
        },
        {
          code: "06",
          title: "Cargo Fractions",
          meta: "Pack crates to match fractional manifests",
          href: "test/index.html?game=packing",
          launch: true
        },
        {
          code: "07",
          title: "Signal Code",
          meta: "Deduce the hidden symbol sequence",
          href: "test/index.html?game=mastermind",
          launch: true
        },
        {
          code: "08",
          title: "Key Echo",
          meta: "Recall keyboard sequences with letter case",
          href: "test/index.html?game=rhythm",
          launch: true
        },
        {
          code: "09",
          title: "Test Pilots",
          meta: "Prototype lab for experimental games",
          href: "#test",
          menuTarget: "test"
        },
        {
          code: "10",
          title: "Time to Launch",
          meta: "Minutes before or after the hour: catch the ship",
          href: "time-to-launch/index.html",
          launch: true
        },
        {
          code: "11",
          title: "Vowel Customs",
          meta: "Translate alien travelers: long and short vowel sounds",
          href: "vowel-customs/index.html",
          launch: true
        }
      ]
    },
    "number-seeker": {
      system: "PROGRAM 01 // MATH SCANNER ONLINE",
      title: "Number Seeker",
      tagline: "Pick an operator and locate the missing number.",
      gridClass: "program-grid operator-grid",
      ariaLabel: "Number Seeker operators",
      back: true,
      cards: [
        { code: "+", title: "Plus", meta: "Find addends and sums", href: "number-seeker/plus.html", launch: true },
        { code: "-", title: "Minus", meta: "Track the difference", href: "number-seeker/minus.html", launch: true },
        { code: "x", title: "Multiply", meta: "Scan skip-count patterns", href: "number-seeker/multiply.html", launch: true },
        { code: "÷", title: "Divide", meta: "Find quotients", href: "number-seeker/divide.html", launch: true }
      ]
    },
    test: {
      system: "PROTOTYPE BAY // ACTIVE",
      title: "Test Pilots",
      tagline: "Pick an experimental learning mechanic.",
      gridClass: "program-grid operator-grid",
      ariaLabel: "Prototype games",
      back: true,
      cards: [
        { code: "TY", title: "Lunar Keys", meta: "Low-pressure typing harvest", href: "test/index.html?game=typing", launch: true },
        { code: "LM", title: "Land Mission", meta: "Procedural top-view terrain scouting", href: "test/index.html?game=land", launch: true }
      ]
    }
  };

  function render(screenName) {
    const screen = screens[screenName] || screens.home;
    document.title = screen.title === "EducationStation" ? "EducationStation" : screen.title + " - EducationStation";
    backNav.hidden = !screen.back;
    header.innerHTML = [
      screen.system ? '<p class="system-line">' + screen.system + "</p>" : "",
      "<h1>" + screen.title + "</h1>",
      '<p class="tagline">' + screen.tagline + "</p>"
    ].join("");
    grid.className = screen.gridClass;
    grid.setAttribute("aria-label", screen.ariaLabel);
    grid.innerHTML = screen.cards.map(renderCard).join("");
    grid.hidden = !started;
    if (startField) startField.hidden = started || screenName !== "home";
    history.replaceState(null, "", screenName === "home" ? location.pathname : "#" + screenName);
  }

  function renderCard(card) {
    const menuTarget = card.menuTarget ? ' data-menu-target="' + card.menuTarget + '"' : "";
    const launch = card.launch ? " data-launch-target" : "";
    return [
      '<a class="program-card" href="' + card.href + '" title=""' + menuTarget + launch + ">",
      '<span class="program-code">' + card.code + "</span>",
      '<span class="program-title">' + card.title + "</span>",
      '<span class="program-meta">' + card.meta + "</span>",
      "</a>"
    ].join("");
  }

  host.addEventListener("click", function (event) {
    const menuLink = event.target.closest("[data-menu-target]");
    if (!menuLink) return;

    event.preventDefault();
    render(menuLink.dataset.menuTarget);
  });

  homeLink.addEventListener("click", function (event) {
    event.preventDefault();
    render("home");
  });

  if (startField) {
    startField.addEventListener("click", function () {
      if (started) return;
      started = true;
      startField.disabled = true;
      startField.classList.add("starting");
      playMenuSound("powerup_3");

      window.setTimeout(function () {
        if (window.EducationStationSound && window.EducationStationSound.startMusic) {
          window.EducationStationSound.startMusic({ restart: true });
        }
        render(location.hash.slice(1) || "home");
      }, 2000);
    });
  }

  function playMenuSound(name) {
    document.dispatchEvent(new CustomEvent("educationstation:sound", { detail: { name } }));
  }

  host.addEventListener("mouseover", function (event) {
    const card = event.target.closest(".program-card");
    if (card) card.removeAttribute("title");
  });

  window.addEventListener("hashchange", function () {
    if (!started) {
      render("home");
      return;
    }
    render(location.hash.slice(1) || "home");
  });

  render(started ? location.hash.slice(1) || "home" : "home");
})();
