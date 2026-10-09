"""Generate Vietnamese lesson audio with VieNeu-TTS (runs on the Mac, offline after first download).

For every voice below, writes one clip per sentence and per unique word of each
lesson in lessons/lessons.js (and every filled-in sentence of each workbook page
in lessons/workbook.js) to audio/<voice-id>/<lesson-id>/, then rewrites
audio/manifest.js so the reader can play them.

Voices:
  * every recording in voice-samples/ (cloned voice), e.g. Sample3.m4a -> "sample3"
  * any built-in presets listed in PRESETS (none by default)

Usage (normally via "Make Voices.command"):
  python tools/make_voices.py                 # all voices, skip clips that exist
  python tools/make_voices.py --only sample3  # one voice
  python tools/make_voices.py --redo          # regenerate everything
"""
import argparse
import json
import re
import shutil
import subprocess
import sys
import time
import unicodedata
from pathlib import Path

VN = Path(__file__).resolve().parent.parent
SAMPLES = VN / "voice-samples"
AUDIO = VN / "audio"
LESSONS_JS = VN / "lessons" / "lessons.js"
WORKBOOK_JS = VN / "lessons" / "workbook.js"
POEMS_JS = VN / "lessons" / "poems.js"
SAMPLE_EXT = {".m4a", ".wav", ".mp3", ".aiff", ".aif", ".caf"}
# Built-in Southern (miền Nam) voices: (id, preset name, label)
PRESETS = []
# To compare against a built-in Southern voice, add e.g.
#   ("kim-thanh", "Kim Thanh", "Kim Thanh (built-in, Southern)")


def nfc(s):
    return unicodedata.normalize("NFC", s)


def load_lessons():
    text = LESSONS_JS.read_text(encoding="utf-8")
    text = "\n".join(l for l in text.splitlines() if not l.strip().startswith("//"))
    body = text[text.index("[") : text.rindex("]") + 1]
    body = re.sub(r"(\{|,)\s*([A-Za-z_]\w*)\s*:", r'\1 "\2":', body)  # quote keys
    body = re.sub(r",\s*([\]}])", r"\1", body)  # trailing commas
    return json.loads(body) + workbook_as_lessons() + poems_as_lessons()


def fill_blank(sentence, option):
    """Workbook sentence with the blank filled; same rule as the Chọn Từ game."""
    if sentence.startswith("___"):
        option = option[:1].upper() + option[1:]
    return sentence.replace("___", option, 1)


def poems_as_lessons():
    """Each poem becomes a pseudo-lesson: one clip per line (s01 = line 1)."""
    if not POEMS_JS.exists():
        return []
    text = POEMS_JS.read_text(encoding="utf-8")
    text = "\n".join(l for l in text.splitlines() if not l.strip().startswith("//"))
    poems = json.loads(text[text.index("[") : text.rindex("]") + 1])
    return [{"id": p["id"], "title": p.get("title", p["id"]),
             "sentences": [[nfc(line["vi"]), line.get("en", "")] for line in p["lines"]]}
            for p in poems]


def workbook_as_lessons():
    """Each workbook page becomes a pseudo-lesson whose 'sentences' are every
    filled-in variant, in order (item 1 option 1, item 1 option 2, item 2 ...).
    The game finds a clip by that flat index."""
    if not WORKBOOK_JS.exists():
        return []
    text = WORKBOOK_JS.read_text(encoding="utf-8")
    text = "\n".join(l for l in text.splitlines() if not l.strip().startswith("//"))
    sets = json.loads(text[text.index("[") : text.rindex("]") + 1])
    out = []
    for ws in sets:
        sentences = []
        for item in ws["items"]:
            for opt in item["options"]:
                sentences.append([nfc(fill_blank(item["sentence"], opt["vi"])), opt.get("result", "")])
        out.append({"id": ws["id"], "title": ws.get("title", ws["id"]), "sentences": sentences})
    return out


def words_of(sentence):
    out = []
    for w in sentence.split():
        w = re.sub(r"[^\w]", "", w)
        if w:
            out.append(nfc(w.lower()))
    return out


def to_wav(src, dst):
    """Convert a recording to 16-bit mono WAV (afconvert ships with macOS)."""
    if shutil.which("afconvert"):
        subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16", "-c", "1", str(src), str(dst)], check=True)
    elif shutil.which("ffmpeg"):
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-ac", "1", str(dst)], check=True)
    else:
        sys.exit("Need afconvert (macOS) or ffmpeg to read " + src.name)


def compress(wav):
    """WAV -> AAC .m4a (small, plays in Safari/Chrome). Falls back to keeping the WAV."""
    m4a = wav.with_suffix(".m4a")
    if shutil.which("afconvert"):
        try:
            subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "96000", str(wav), str(m4a)], check=True)
            wav.unlink()
            return m4a
        except subprocess.CalledProcessError:
            pass
    return wav


def materialize_hf_links():
    """Replace symlinks in the VieNeu/MOSS Hugging Face snapshots with the real files.

    The HF cache stores files as blobs/<hash> with symlinks in snapshots/; recent
    onnxruntime refuses external weight files that resolve outside the model folder.
    Moving each blob into place keeps disk use the same.
    """
    import os

    hub = Path(os.environ.get("HF_HUB_CACHE") or Path(os.environ.get("HF_HOME", Path.home() / ".cache" / "huggingface")) / "hub")
    fixed = 0
    moved = {}  # blob -> where it went (two links can share one blob)
    # Any symlink under the hub cache whose path mentions VieNeu or MOSS (works for
    # both the classic models--*/snapshots layout and newer shared-blob layouts).
    links = [p for p in hub.rglob("*") if p.is_symlink() and re.search(r"vieneu|moss", str(p.relative_to(hub)), re.I)]
    for link in links:
        target = link.resolve()
        link.unlink()
        if target in moved:
            shutil.copy2(moved[target], link)
        elif target.exists():
            shutil.move(str(target), str(link))
            moved[target] = link
        fixed += 1
    print(f"  moved {fixed} model file(s) into place", flush=True)


def find_clip(folder, stem):
    for ext in (".m4a", ".wav"):
        p = folder / (stem + ext)
        if p.exists():
            return p
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", help="voice id to generate (e.g. sample3)")
    ap.add_argument("--redo", action="store_true", help="regenerate clips that already exist")
    ap.add_argument("--sentence", help="work on one sentence only, e.g. bai-1:6 (always regenerates it)")
    ap.add_argument("--takes", type=int, default=1,
                    help="with --sentence: make N alternative takes in <lesson>/takes/ instead of replacing the clip")
    ap.add_argument("--fixes", action="store_true",
                    help="enable our corrections: looser short-sentence cap, retry cut-off clips, end padding "
                         "(off by default = VieNeu as shipped)")
    ap.add_argument("--check", action="store_true", help="list clips that end mid-word, then stop")
    ap.add_argument("--fix-cutoffs", action="store_true", help="delete clips that end mid-word and regenerate them")
    ap.add_argument("--temperature", type=float, default=None,
                    help="sampling temperature (model default 0.8); lower, e.g. 0.3-0.5, is steadier")
    ap.add_argument("--say", help="with --sentence: text to speak instead of the lesson text (try respellings/punctuation)")
    args = ap.parse_args()

    lessons = load_lessons()
    AUDIO.mkdir(exist_ok=True)
    work = AUDIO / ".work"
    work.mkdir(exist_ok=True)

    if args.check or args.fix_cutoffs:
        bad = check_existing(lessons)
        if args.check:
            return
        for clip in bad:
            clip.unlink()

    voices = []  # (id, label, kwargs for infer)
    for f in sorted(SAMPLES.iterdir()):
        if f.suffix.lower() in SAMPLE_EXT:
            vid = re.sub(r"[^a-z0-9]+", "-", f.stem.lower()).strip("-")
            wav = work / (vid + ".wav")
            to_wav(f, wav)
            voices.append((vid, f.stem, {"ref_audio": str(wav)}))
    for vid, name, label in PRESETS:
        voices.append((vid, label, {"voice": name}))
    if args.only:
        voices = [v for v in voices if v[0] == args.only]
        if not voices:
            sys.exit("No voice with id " + args.only)

    print("Loading VieNeu-TTS (first run downloads the model, a few hundred MB)...", flush=True)
    from vieneu import Vieneu

    global FIXES
    FIXES = args.fixes
    if FIXES:
        loosen_frame_cap()
        print("Corrections ON (--fixes)", flush=True)
    else:
        print("Stock VieNeu settings (add --fixes for our corrections)", flush=True)

    try:
        tts = Vieneu()
    except Exception as exc:  # newer onnxruntime rejects Hugging Face's symlinked .data files
        if "escapes model directory" not in str(exc):
            raise
        print("Fixing model cache links for onnxruntime, then retrying...", flush=True)
        materialize_hf_links()
        tts = Vieneu()

    if args.temperature is not None:
        voices = [(vid, label, dict(kw, temperature=args.temperature)) for vid, label, kw in voices]

    if args.sentence:
        one_sentence(tts, lessons, voices, args)
        write_manifest(lessons)
        return

    for vid, label, kw in voices:
        print(f"\n== {label} ==", flush=True)
        for lesson in lessons:
            out = AUDIO / vid / lesson["id"]
            (out / "words").mkdir(parents=True, exist_ok=True)
            jobs = []
            for i, sent in enumerate(lesson["sentences"], 1):
                jobs.append((out, f"s{i:02d}", spoken_text(sent)))
            seen = []
            for sent in lesson["sentences"]:
                for w in words_of(sent[0]):
                    if w not in seen:
                        seen.append(w)
            for w in seen:
                jobs.append((out / "words", w, w + "."))
            for folder, stem, text in jobs:
                if find_clip(folder, stem) and not args.redo:
                    continue
                t0 = time.time()
                wav, note = synth(tts, text, kw)
                path = folder / (stem + ".wav")
                tts.save(wav, str(path))
                compress(path)
                print(f"  {text:<24} {time.time() - t0:4.1f}s{note}", flush=True)

    write_manifest(lessons)
    print("\nDone. Open the reader and pick a voice in the 🔈 panel.")


def loosen_frame_cap():
    """VieNeu caps short chunks (<=4 syllables) at 13 + 5/extra-syllable frames
    (12.5 frames/s), i.e. ~2.2 s for a 4-word sentence. A slow, calm voice runs
    past that, so the last word is chopped and the model may babble/repeat.
    Give short sentences more room. Single words keep the default cap (13 frames,
    ~1 s): it is what stops the model inventing extra words after one word.""" 
    try:
        from vieneu_utils import core_utils as cu
        cu.SYLLABLE_CAP_PER_EXTRA = max(cu.SYLLABLE_CAP_PER_EXTRA, 13)   # ~1 s per extra word
    except Exception as exc:
        print(f"  (could not adjust frame cap: {exc})", flush=True)


def tail_ratio(wav, sr):
    """Loudness of the last 60 ms relative to the loudest 60 ms. High = cut off mid-word."""
    import numpy as np

    x = np.asarray(wav, dtype=np.float32).reshape(-1)
    win = max(1, int(0.06 * sr))
    if len(x) < 2 * win:
        return 1.0
    frames = x[: len(x) // win * win].reshape(-1, win)
    rms = np.sqrt((frames ** 2).mean(axis=1))
    peak = float(rms.max()) or 1e-9
    return float(np.sqrt((x[-win:] ** 2).mean()) / peak)


FIXES = False


def synth(tts, text, kw, tries=4):
    """infer() with a cut-off check: retry if the clip ends mid-word, keep the best,
    and add a short silence so the last word never sounds chopped."""
    import numpy as np

    if not FIXES:
        wav = tts.infer(text, **kw)
        r = tail_ratio(wav, tts.sample_rate)
        return wav, ("" if r <= 0.12 else f"  (ends loudly: {r:.2f}, may be cut off)")

    best, best_r = None, 9.0
    for attempt in range(1, tries + 1):
        wav = tts.infer(text, **kw)
        r = tail_ratio(wav, tts.sample_rate)
        if r < best_r:
            best, best_r = wav, r
        if r <= 0.12:
            break
    pad = np.zeros(int(0.2 * tts.sample_rate), dtype=np.asarray(best).dtype)
    note = "" if best_r <= 0.12 else f"  (still ends loudly: {best_r:.2f}, check it)"
    if attempt > 1:
        note = f"  [{attempt} tries]" + note
    return np.concatenate([np.asarray(best).reshape(-1), pad]), note


def check_existing(lessons):
    """Report clips that end mid-word (decoded with afconvert/ffmpeg)."""
    import soundfile as sf

    bad = []
    tmp = AUDIO / ".work" / "check.wav"
    for clip in sorted(AUDIO.glob("*/*/*.m4a")) + sorted(AUDIO.glob("*/*/words/*.m4a")):
        if "takes" in clip.parts:
            continue
        to_wav(clip, tmp)
        x, sr = sf.read(str(tmp), dtype="float32", always_2d=False)
        if getattr(x, "ndim", 1) > 1:
            x = x.mean(axis=1)
        r = tail_ratio(x, sr)
        if r > 0.15:
            bad.append(clip)
            print(f"  cut off ({r:.2f}): {clip.relative_to(AUDIO)}")
    print(f"{len(bad)} clip(s) end mid-word.")
    return bad


def spoken_text(sent):
    """Text sent to the TTS: optional 3rd item in a lesson sentence overrides the shown text."""
    text = nfc((sent[2] if len(sent) > 2 and sent[2] else sent[0]).strip())
    text = text.rstrip(",;:")  # poem lines ending in a comma are spoken as a full stop
    return text if text[-1:] in ".!?" else text + "."


def show_phonemes(text):
    try:
        from vieneu_utils.phonemize_text import phonemize_text
        print(f"  phonemes: {phonemize_text(text)}", flush=True)
    except Exception as exc:  # debugging aid only
        print(f"  (could not show phonemes: {exc})", flush=True)


def one_sentence(tts, lessons, voices, args):
    """Regenerate (or make alternative takes of) a single sentence for each voice."""
    try:
        lesson_id, num = args.sentence.split(":")
        lesson = next(l for l in lessons if l["id"] == lesson_id)
        sent = lesson["sentences"][int(num) - 1]
    except (ValueError, StopIteration, IndexError):
        sys.exit("--sentence must look like bai-1:6 (lesson id : sentence number)")
    text = nfc(args.say.strip()) if args.say else spoken_text(sent)
    stem = f"s{int(num):02d}"
    print(f"Sentence {args.sentence}: {sent[0]}  ->  speaking: {text}")
    show_phonemes(text)
    for vid, label, kw in voices:
        print(f"\n== {label} ==", flush=True)
        out = AUDIO / vid / lesson_id
        if args.takes > 1:
            folder = out / "takes"
            folder.mkdir(parents=True, exist_ok=True)
            names = [f"{stem}.take{t}" for t in range(1, args.takes + 1)]
        else:
            folder = out
            folder.mkdir(parents=True, exist_ok=True)
            for old in (folder / (stem + ".m4a"), folder / (stem + ".wav")):
                if old.exists():
                    old.unlink()
            names = [stem]
        for name in names:
            wav, note = synth(tts, text, kw)
            path = folder / (name + ".wav")
            tts.save(wav, str(path))
            print(f"  {compress(path).relative_to(AUDIO)}{note}", flush=True)
    if args.takes > 1:
        print("\nListen in Finder (select a file, press Space). Copy the best take over "
              f"<voice>/{lesson_id}/{stem}.m4a, then rerun with no options to refresh the manifest.")


def write_manifest(lessons):
    """List every voice folder that has clips, so the reader can offer it."""
    labels = {vid: label for vid, _n, label in PRESETS}
    for f in SAMPLES.iterdir():
        if f.suffix.lower() in SAMPLE_EXT:
            labels[re.sub(r"[^a-z0-9]+", "-", f.stem.lower()).strip("-")] = f.stem
    voices = []
    preset_ids = {vid for vid, _n, _l in PRESETS}
    vdirs = [p for p in AUDIO.iterdir() if p.is_dir() and not p.name.startswith(".")]
    for vdir in sorted(vdirs, key=lambda p: (p.name in preset_ids, p.name)):  # cloned voices first
        entry = {"id": vdir.name, "label": labels.get(vdir.name, vdir.name), "lessons": {}}
        for lesson in lessons:
            ldir = vdir / lesson["id"]
            if not ldir.is_dir():
                continue
            rel = lambda p: p.relative_to(AUDIO).as_posix()
            sentences = []
            for i in range(1, len(lesson["sentences"]) + 1):
                c = find_clip(ldir, f"s{i:02d}")
                sentences.append(rel(c) if c else None)
            words = {}
            for c in sorted((ldir / "words").glob("*")):
                if c.suffix in (".m4a", ".wav"):
                    words[nfc(c.stem)] = rel(c)
            entry["lessons"][lesson["id"]] = {"sentences": sentences, "words": words}
        if entry["lessons"]:
            voices.append(entry)
    js = "// Generated by tools/make_voices.py. Paths are relative to VN/audio/.\nwindow.VN_AUDIO = " + json.dumps(
        {"voices": voices}, ensure_ascii=False, indent=2
    ) + ";\n"
    (AUDIO / "manifest.js").write_text(js, encoding="utf-8")
    print("Wrote audio/manifest.js with", len(voices), "voice(s)")


if __name__ == "__main__":
    main()
