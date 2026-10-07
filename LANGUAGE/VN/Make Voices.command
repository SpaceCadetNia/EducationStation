#!/bin/zsh
# Double-click to (re)generate lesson audio with VieNeu-TTS.
# First run installs uv + VieNeu-TTS and downloads the model (needs internet, ~5-10 min).
# Later runs only make clips that are missing. Extra args pass through, e.g. --redo.
cd "${0:A:h}"
mkdir -p audio
LOG="audio/make_voices.log"
# Everything below is also saved to audio/make_voices.log for troubleshooting.
exec > >(tee "$LOG") 2>&1
echo "Started $(date)"
set -e
export PATH="$HOME/.local/bin:$PATH"
if ! command -v uv >/dev/null 2>&1; then
  echo "Installing uv (Python tool manager)..."
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$PATH"
fi
echo "VieNeu-TTS lesson voices"
echo "========================"
uv --version
# Use uv's own Apple-silicon Python (not Homebrew's Intel one in /usr/local) and
# avoid the newest numba/llvmlite, which only ship as source on this Mac.
unset VIRTUAL_ENV
uv python install 3.12
PY="$(uv python find --python-preference only-managed 3.12)"
echo "Python: $PY ($(file -bL "$PY" | head -c 60))"
uv run --no-project --python "$PY" \
  --with vieneu --with "librosa==0.11.0" --with "numba<0.68" \
  python tools/make_voices.py "$@" || { rc=$?; echo; echo "FAILED (exit $rc). Tell Claude: the log is in audio/make_voices.log"; exit 1; }
echo
echo "Finished. You can close this window."
