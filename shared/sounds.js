(function () {
  const script = document.currentScript || document.querySelector('script[src*="sounds.js"]');
  const isMenu = !document.body.dataset.game;
  const isStartGated = document.body.dataset.titleStartGate === "true";
  const musicKey = "educationstation:titleMusicTime";
  const musicVolume = 0.35;
  const music = new Audio(new URL("../assets/sounds/title_music.mp3", script.src).href);
  let musicStarted = false;
  let fadeFrame = 0;
  const sounds = {
    air_brakes: "air_brakes.wav",
    beep: "beep.wav",
    good: "beep_good.wav",
    error: "error.wav",
    electric_charge: "electric_charge.wav",
    power_charge: "power_charge.wav",
    power_down: "power_down.wav",
    powerup_2: "powerup_2.wav",
    powerup_3: "powerup_3.wav",
    radio_music_1: "radio_music_1.mp3",
    radio_music_2: "radio_music_2.mp3",
    radio_music_3: "radio_music_3.mp3",
    radio_music_4: "radio_music_4.mp3",
    radio_music_5: "radio_music_5.mp3",
    radio_music_6: "radio_music_6.mp3",
    radio_music_7: "radio_music_7.mp3",
    radio_music_8: "radio_music_8.mp3",
    radio_static: "radio_static.wav",
    small_victory: "small_victory.wav",
    train_indicator: "train_indicator.wav",
    workout_music_1: "workout_music_1.mp3"
  };
  const players = {};
  const radioDataNames = new Set(["radio_music_1", "radio_music_2", "radio_music_3", "radio_music_4", "radio_music_5", "radio_music_6", "radio_music_7", "radio_music_8", "radio_static"]);
  const singleChannelSounds = new Set(["air_brakes", "electric_charge", "power_charge", "power_down", "radio_music_1", "radio_music_2", "radio_music_3", "radio_music_4", "radio_music_5", "radio_music_6", "radio_music_7", "radio_music_8", "radio_static", "train_indicator", "workout_music_1"]);
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioBuffers = {};
  let audioContext = null;
  let radioAnalyser = null;
  let radioAnalyserData = null;
  let radioAnalyserConnected = false;
  let activeRadioElement = null;
  const radioSources = new WeakMap();

  music.loop = true;
  music.preload = "auto";
  music.volume = musicVolume;
  if (isMenu) music.load();

  for (const [name, file] of Object.entries(sounds)) {
    const audio = new Audio(new URL("../assets/sounds/" + file, script.src).href);
    audio.preload = "auto";
    audio.volume = name === "workout_music_1" ? 0.3 : name === "error" ? 0.55 : 0.42;
    if (name === "workout_music_1") audio.loop = true;
    players[name] = audio;
    loadAudioBuffer(name, audio.src);
  }

  function play(name) {
    const source = players[name] || players.beep;
    if (!source) return;

    if (radioDataNames.has(name)) {
      stopRadioData();
      connectRadioAnalyser(source);
      activeRadioElement = source;
      try {
        source.currentTime = 0;
      } catch (error) {
        // Some browsers reject currentTime changes before metadata is ready.
      }
      source.play().catch(function () {
        // The scan or Play Data button is the user gesture that should unlock this.
      });
      return source;
    }

    const buffered = playBufferedSound(name);
    if (buffered) return buffered;

    if (singleChannelSounds.has(name)) {
      try {
        source.pause();
        source.currentTime = 0;
      } catch (error) {
        // Some browsers reject currentTime changes before metadata is ready.
      }
      source.play().catch(function () {
        // Browsers may block sound until a user gesture. Long cue sounds use
        // their original element so one gesture can unlock later replays.
      });
      return source;
    }

    const audio = source.cloneNode();
    audio.volume = source.volume;
    audio.play().catch(function () {
      // Browsers may block sound until a user gesture. The click that called us
      // usually unlocks it, and failures here should never block play.
    });
    return audio;
  }

  function stopRadioData() {
    activeRadioElement = null;
    radioDataNames.forEach(function (radioName) {
      const audio = players[radioName];
      if (!audio) return;
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (error) {
        // Resetting inactive media can fail before metadata loads.
      }
    });
  }

  function connectRadioAnalyser(audio) {
    const context = getAudioContext();
    if (!context || !audio) return;

    if (!radioAnalyser) {
      radioAnalyser = context.createAnalyser();
      radioAnalyser.fftSize = 256;
      radioAnalyser.smoothingTimeConstant = 0.76;
      radioAnalyserData = new Uint8Array(radioAnalyser.fftSize);
    }

    if (!radioAnalyserConnected) {
      radioAnalyser.connect(context.destination);
      radioAnalyserConnected = true;
    }

    if (!radioSources.has(audio)) {
      const source = context.createMediaElementSource(audio);
      source.connect(radioAnalyser);
      radioSources.set(audio, source);
    }

    context.resume().catch(function () {
      // The HTMLAudio element still plays if Web Audio analysis is blocked.
    });
  }

  function getRadioAmplitude() {
    if (!radioAnalyser || !radioAnalyserData || !activeRadioElement || activeRadioElement.paused || activeRadioElement.ended) return 0;

    radioAnalyser.getByteTimeDomainData(radioAnalyserData);
    let sum = 0;
    for (let index = 0; index < radioAnalyserData.length; index += 1) {
      const centered = (radioAnalyserData[index] - 128) / 128;
      sum += centered * centered;
    }

    return Math.min(1, Math.sqrt(sum / radioAnalyserData.length) * 2.25);
  }

  function loadAudioBuffer(name, url) {
    if (!AudioContext || !window.fetch) return;

    window.fetch(url)
      .then((response) => response.arrayBuffer())
      .then((data) => getAudioContext().decodeAudioData(data))
      .then((buffer) => {
        audioBuffers[name] = buffer;
      })
      .catch(function () {
        // HTMLAudio fallback remains available when decoding is unsupported.
      });
  }

  function getAudioContext() {
    if (!AudioContext) return null;
    if (!audioContext) audioContext = new AudioContext();
    return audioContext;
  }

  function unlockAudio() {
    const context = getAudioContext();
    if (!context) return;

    context.resume().then(function () {
      const buffer = context.createBuffer(1, 1, 22050);
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start(0);
    }).catch(function () {
      // HTMLAudio fallback still handles browsers without Web Audio unlock.
    });
  }

  function playBufferedSound(name) {
    const context = getAudioContext();
    const buffer = audioBuffers[name];
    if (!context || !buffer || context.state !== "running") return null;

    const source = context.createBufferSource();
    const gain = context.createGain();
    const endedHandlers = [];
    source.buffer = buffer;
    gain.gain.value = name === "error" ? 0.55 : 0.42;
    source.connect(gain);
    gain.connect(context.destination);
    source.addEventListener("ended", function () {
      endedHandlers.forEach((handler) => handler());
    });
    source.start(0);

    return {
      addEventListener(type, handler) {
        if (type === "ended") endedHandlers.push(handler);
      }
    };
  }

  function startMusic(options) {
    if (!isMenu || musicStarted) return;
    const shouldRestart = Boolean(options && options.restart);
    musicStarted = true;
    cancelMusicFade();
    music.volume = musicVolume;

    if (shouldRestart) sessionStorage.removeItem(musicKey);

    const savedTime = shouldRestart ? 0 : Number(sessionStorage.getItem(musicKey));
    if (Number.isFinite(savedTime) && savedTime > 0) {
      try {
        music.currentTime = savedTime;
      } catch (error) {
        // Some browsers reject seeks before metadata is ready; starting at 0 is fine.
      }
    }

    music.play().catch(function () {
      musicStarted = false;
      if (isStartGated) return;
      bindMusicUnlock();
    });
  }

  function stopMusic() {
    cancelMusicFade();
    music.pause();
    music.currentTime = 0;
    music.volume = musicVolume;
  }

  function fadeMusicOut(duration) {
    if (!isMenu) return;
    cancelMusicFade();

    const startVolume = music.volume;
    const startTime = performance.now();
    const fadeDuration = duration || 1600;

    function step(now) {
      const progress = Math.min((now - startTime) / fadeDuration, 1);
      music.volume = startVolume * (1 - progress);

      if (progress < 1) {
        fadeFrame = requestAnimationFrame(step);
        return;
      }

      music.pause();
      music.volume = musicVolume;
      fadeFrame = 0;
    }

    fadeFrame = requestAnimationFrame(step);
  }

  function cancelMusicFade() {
    if (!fadeFrame) return;
    cancelAnimationFrame(fadeFrame);
    fadeFrame = 0;
  }

  function bindMusicUnlock() {
    if (isStartGated) return;
    window.addEventListener("pointerdown", startMusic, { capture: true, once: true });
    window.addEventListener("keydown", startMusic, { capture: true, once: true });
  }

  function saveMusicTime() {
    if (!isMenu) return;
    if (isStartGated && !musicStarted) return;
    sessionStorage.setItem(musicKey, String(music.currentTime || 0));
  }

  document.addEventListener("educationstation:sound", function (event) {
    play(event.detail && event.detail.name);
  });

  window.addEventListener("pagehide", saveMusicTime);
  window.addEventListener("beforeunload", saveMusicTime);

  if (isMenu && !isStartGated) {
    startMusic();
  } else {
    stopMusic();
  }

  try {
    window.EducationStationSound = { play, startMusic, stopMusic, fadeMusicOut, unlockAudio, getRadioAmplitude };
  } catch (error) {
    // Some embedded browser surfaces lock global objects. The event listener
    // above is the supported path for game scripts.
  }
})();
