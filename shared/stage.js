(function () {
  const root = document.documentElement;
  const designWidth = 1024;
  const designHeight = 768;
  const margin = 8;

  function isTextInputFocused() {
    const active = document.activeElement;
    if (!active) return false;
    return active.matches("input, textarea, select, [contenteditable='true']");
  }

  function viewportSize() {
    const viewport = window.visualViewport;
    if (isTextInputFocused()) {
      return {
        width: window.innerWidth,
        height: window.innerHeight
      };
    }

    return {
      width: viewport ? viewport.width : window.innerWidth,
      height: viewport ? viewport.height : window.innerHeight
    };
  }

  function fitStage() {
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

  window.addEventListener("resize", fitStage);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", fitStage);
  fitStage();

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
