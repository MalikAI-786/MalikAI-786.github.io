#!/usr/bin/env bash
# Decode a reel into readable frames + a probe report.
#
#   bash .claude/skills/roohe-iqbal/scripts/decode.sh <video> [outdir]
#
# Produces, in <outdir> (default: ./decode-<basename>):
#   scene/     one frame per detected cut — the edit structure
#   grid/      one frame per second — catches text that appears without a cut
#   probe.txt  duration, resolution, fps, aspect, audio presence
#   MANIFEST   what was produced and what to do next
#
# Then READ the frames. That is the decode: every on-screen word, the
# typography, the pacing, where the eye is asked to go.
set -euo pipefail

VIDEO="${1:?usage: decode.sh <video> [outdir]}"
[ -f "$VIDEO" ] || { echo "No such file: $VIDEO" >&2; exit 1; }
BASE=$(basename "${VIDEO%.*}")
OUT="${2:-./decode-$BASE}"

# A full ffmpeg. The Playwright-bundled one is stripped to VP8/webm and cannot
# read an h264 mp4, which is what every reel actually is — so we use the
# imageio-ffmpeg binary and install it on first run if absent.
FF=$(python3 - <<'PY' 2>/dev/null || true
try:
    import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())
except Exception: pass
PY
)
if [ -z "${FF:-}" ]; then
  echo "→ fetching a full ffmpeg (first run only)…"
  pip install --quiet imageio-ffmpeg >/dev/null 2>&1
  FF=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
fi

mkdir -p "$OUT/scene" "$OUT/grid"

"$FF" -hide_banner -i "$VIDEO" 2>&1 | grep -E "Duration|Stream #" > "$OUT/probe.txt" || true

# Cut detection. 0.25 is deliberately sensitive: this genre cuts on every text
# swap, and a missed swap is a missed line of the argument.
"$FF" -y -loglevel error -i "$VIDEO" \
  -vf "select='eq(n\,0)+gt(scene\,0.25)',scale=440:-1" -fps_mode vfr \
  "$OUT/scene/cut%02d.png" 2>/dev/null || true

# One per second, as a safety net for text that fades in without a hard cut.
"$FF" -y -loglevel error -i "$VIDEO" -vf "fps=1,scale=440:-1" \
  "$OUT/grid/sec%02d.png" 2>/dev/null || true

# Audio, extracted but NOT transcribed — no speech model is reachable from this
# environment (HF downloads are 403 at the proxy). Keep it so a transcript can
# be attached later, and read the caption for what the voiceover said.
"$FF" -y -loglevel error -i "$VIDEO" -vn -c:a copy "$OUT/audio.m4a" 2>/dev/null \
  || "$FF" -y -loglevel error -i "$VIDEO" -vn "$OUT/audio.m4a" 2>/dev/null || true

NS=$(ls "$OUT/scene" 2>/dev/null | wc -l | tr -d ' ')
NG=$(ls "$OUT/grid"  2>/dev/null | wc -l | tr -d ' ')

cat > "$OUT/MANIFEST" <<EOF
source     : $VIDEO
cuts       : $NS  (scene/)
seconds    : $NG  (grid/)
audio      : $([ -f "$OUT/audio.m4a" ] && echo "extracted, NOT transcribed" || echo "none")

$(cat "$OUT/probe.txt")

NEXT: Read every frame in scene/ first — that is the edit, and the edit is the
argument. Then scan grid/ for text the cut detector missed. Fill the decode
record from references/decode-protocol.md. Do not summarise the reel; transcribe
every on-screen word before interpreting anything.
EOF

echo "✓ $OUT — $NS cuts, $NG second-frames"
cat "$OUT/MANIFEST"
