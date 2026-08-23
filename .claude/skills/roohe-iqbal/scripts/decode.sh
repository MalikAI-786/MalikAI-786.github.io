#!/usr/bin/env bash
set -euo pipefail
VIDEO="${1:?usage: decode.sh <video> [outdir]}"
[ -f "$VIDEO" ] || { echo "No such file: $VIDEO" >&2; exit 1; }
BASE=$(basename "${VIDEO%.*}")
OUT="${2:-./decode-$BASE}"
FF=$(python3 - <<'PY' 2>/dev/null || true
try:
    import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())
except Exception: pass
PY
)
if [ -z "${FF:-}" ]; then
  pip install --quiet imageio-ffmpeg >/dev/null 2>&1
  FF=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
fi

# A decode directory is a snapshot of ONE source. Reusing an output path must
# never mix frames or audio from the prior source with the current one.
mkdir -p "$OUT"
rm -rf -- "$OUT/scene" "$OUT/grid"
rm -f -- "$OUT/audio.m4a" "$OUT/probe.txt" "$OUT/MANIFEST"
mkdir -p "$OUT/scene" "$OUT/grid"

"$FF" -hide_banner -i "$VIDEO" 2>&1 | grep -E "Duration|Stream #" > "$OUT/probe.txt" || true
"$FF" -y -loglevel error -i "$VIDEO" -vf "select='eq(n\,0)+gt(scene\,0.25)',scale=440:-1" -fps_mode vfr "$OUT/scene/cut%02d.png" 2>/dev/null || true
"$FF" -y -loglevel error -i "$VIDEO" -vf "fps=1,scale=440:-1" "$OUT/grid/sec%02d.png" 2>/dev/null || true
"$FF" -y -loglevel error -i "$VIDEO" -vn -c:a copy "$OUT/audio.m4a" 2>/dev/null || "$FF" -y -loglevel error -i "$VIDEO" -vn "$OUT/audio.m4a" 2>/dev/null || true
NS=$(ls "$OUT/scene" 2>/dev/null | wc -l | tr -d ' ')
NG=$(ls "$OUT/grid" 2>/dev/null | wc -l | tr -d ' ')
cat > "$OUT/MANIFEST" <<EOF
source     : $VIDEO
cuts       : $NS  (scene/)
seconds    : $NG  (grid/)
audio      : $([ -f "$OUT/audio.m4a" ] && echo "extracted, NOT transcribed" || echo "none")

$(cat "$OUT/probe.txt")

NEXT: Read scene/ first, then grid/. Transcribe every on-screen word before interpreting. Use references/decode-protocol.md. Do not infer unheard audio.
EOF
echo "✓ $OUT — $NS cuts, $NG second-frames"
cat "$OUT/MANIFEST"
