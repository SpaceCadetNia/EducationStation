#!/bin/zsh

set -e

APP_DIR="${0:A:h}"
cd "$APP_DIR"

PORT=8080
while lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

LOCAL_URL="http://localhost:${PORT}/"
LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"

clear
echo "EducationStation"
echo "================"
echo
echo "Starting local web server from:"
echo "$APP_DIR"
echo
echo "This computer:"
echo "$LOCAL_URL"
echo
if [ -n "$LAN_IP" ]; then
  echo "Other computers in the house:"
  echo "http://${LAN_IP}:${PORT}/"
  echo
fi
echo "Keep this window open while playing."
echo "Press Control-C here to stop the server."
echo

open "$LOCAL_URL"
python3 -m http.server "$PORT" --bind 0.0.0.0
