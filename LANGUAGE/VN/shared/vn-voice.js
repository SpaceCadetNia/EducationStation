// Shared speech for the VN games: plays the recorded clips listed in
// ../audio/manifest.js (window.VN_AUDIO) and falls back to the browser's
// Vietnamese text-to-speech when a clip is missing.
// Safe on older iPad Safari (no speechSynthesis.addEventListener, tap rules).
(function () {
  const synth = window.speechSynthesis || null;
  const player = new Audio();
  player.preload = "auto";
  if ("preservesPitch" in player) player.preservesPitch = true;
  const voices = ((window.VN_AUDIO && window.VN_AUDIO.voices) || []);
  const voiceData = voices[0] || null; // the recorded voice in use (only Sample3 today)
  let ttsVoice = null;
  let rate = 1;
  let unlocked = false;

  function loadTtsVoice() {
    if (!synth) return;
    const vi = synth.getVoices().filter((v) => /^vi([-_]|$)/i.test(v.lang));
    ttsVoice = vi.find((v) => /premium|enhanced|natural/i.test(v.name)) || vi[0] || null;
  }
  if (synth) {
    loadTtsVoice();
    if (typeof synth.addEventListener === "function") synth.addEventListener("voiceschanged", loadTtsVoice);
    else synth.onvoiceschanged = loadTtsVoice;
    window.setTimeout(loadTtsVoice, 800);
  }

  function key(text) {
    return String(text).replace(/[^\p{L}\p{N}]/gu, "").toLowerCase().normalize("NFC");
  }

  // kind: "sentence" (index into that set's list) or "word" (the word itself)
  const base = document.currentScript ? document.currentScript.src : location.href;
  function clipFor(setId, kind, which) {
    if (!voiceData || !voiceData.lessons || !voiceData.lessons[setId]) return null;
    const data = voiceData.lessons[setId];
    const path = kind === "sentence" ? data.sentences[which] : data.words[key(which)];
    return path ? new URL("../audio/" + encodeURI(path), base).href : null;
  }

  function stop() {
    player.pause();
    if (synth && (synth.speaking || synth.pending)) synth.cancel();
  }

  function speakTts(text, onend) {
    if (!synth) { if (onend) onend(); return; }
    try {
      if (synth.speaking || synth.pending) synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "vi-VN";
      if (ttsVoice) u.voice = ttsVoice;
      u.rate = 0.85 * rate;
      u.onend = function () { if (onend) onend(); };
      u.onerror = function () { if (onend) onend(); };
      synth.speak(u);
    } catch (error) {
      if (onend) onend();
    }
  }

  // Play a clip, or speak `text` with the computer voice if there is no clip.
  function say(url, text, onend) {
    stop();
    if (!url) { speakTts(text, onend); return; }
    player.muted = false;
    player.onended = function () { if (onend) onend(); };
    player.onerror = function () { speakTts(text, onend); };
    player.src = url;
    player.playbackRate = rate;
    const p = player.play();
    if (p && p.catch) p.catch(function () { speakTts(text, onend); });
  }

  // Call inside the first tap: unlocks the audio element and speech on iPad.
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    // The first tap usually also starts a clip right away, so the unlock must
    // never pause or mute that clip: only touch the player while it still holds
    // the silent sound.
    const silent = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
    try {
      player.src = silent;
      const p = player.play();
      const done = function () { if (player.src === silent) player.pause(); };
      if (p && p.then) p.then(done, done); else done();
    } catch (error) {
      // ignore
    }
  }

  window.VNVoice = {
    sentence: function (setId, index, text, onend) { say(clipFor(setId, "sentence", index), text, onend); },
    word: function (setId, word, onend) { say(clipFor(setId, "word", word), word, onend); },
    hasClips: function (setId) { return Boolean(voiceData && voiceData.lessons && voiceData.lessons[setId]); },
    voiceName: function () { return voiceData ? voiceData.label : (ttsVoice ? ttsVoice.name : "Computer voice"); },
    setRate: function (r) { rate = r; },
    stop: stop,
    unlock: unlock,
    key: key
  };
})();
