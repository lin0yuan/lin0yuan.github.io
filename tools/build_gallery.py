#!/usr/bin/env python3
"""Rebuild js/photos.js from the images under images/beyond/.

Drop photos into a folder per theme:

    images/beyond/cooking/*.jpg
    images/beyond/travel/*.jpg
    images/beyond/music/*.jpg
    images/beyond/sports/*.jpg

Each folder becomes a section on beyond.html. Add a new folder to add a
new section. Then run:

    python3 tools/build_gallery.py

- Makes a max-900px thumbnail for each photo in <folder>/thumbs/
  (uses `sips`, which ships with macOS; skipped if unavailable).
- Preserves the title / note you have already written for a photo.
- Within a section, photos are listed newest-file-first.
"""

import json
import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BEYOND_DIR = os.path.join(ROOT, "images", "beyond")
MANIFEST = os.path.join(ROOT, "js", "photos.js")

EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
THUMB_MAX = 900

# Sections render in this order; any folder not listed is appended, sorted.
SECTION_ORDER = ["cooking", "travel", "music", "sports"]

# Folder name -> heading shown on the page. Unlisted folders get Title Case.
SECTION_TITLES = {
    "cooking": "In the Kitchen",
    "travel": "Through the Lens",
    "music": "Zheng & Music",
    "sports": "On the Move",
}

HEADER = """/* Gallery manifest for beyond.html.
   Regenerate with:  python3 tools/build_gallery.py
   Titles and notes you add here are preserved when you regenerate. */
window.BEYOND_PHOTOS = """


def load_existing():
    """Return {src: entry} from the current manifest, so captions survive."""
    if not os.path.exists(MANIFEST):
        return {}
    text = open(MANIFEST, encoding="utf-8").read()
    text = re.sub(r"^\s*//.*$", "", text, flags=re.MULTILINE)
    try:
        body = text[text.index("["): text.rindex("]") + 1]
        return {e["src"]: e for e in json.loads(body) if "src" in e}
    except (ValueError, json.JSONDecodeError):
        print("  ! could not parse existing photos.js - captions not preserved")
        return {}


def make_thumb(folder, name):
    """Return the thumbnail path relative to the site root, or None."""
    src = os.path.join(BEYOND_DIR, folder, name)
    thumb_dir = os.path.join(BEYOND_DIR, folder, "thumbs")
    dst = os.path.join(thumb_dir, name)
    rel = "images/beyond/%s/thumbs/%s" % (folder, name)

    if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
        return rel, False
    if not shutil.which("sips"):
        return None, False

    os.makedirs(thumb_dir, exist_ok=True)
    result = subprocess.run(
        ["sips", "-Z", str(THUMB_MAX), src, "--out", dst],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    if result.returncode != 0:
        print("  ! thumbnail failed for %s/%s" % (folder, name))
        return None, False
    return rel, True


def section_title(folder):
    return SECTION_TITLES.get(folder, folder.replace("-", " ").replace("_", " ").title())


def main():
    if not os.path.isdir(BEYOND_DIR):
        sys.exit("No such directory: %s" % BEYOND_DIR)

    folders = [
        d for d in os.listdir(BEYOND_DIR)
        if os.path.isdir(os.path.join(BEYOND_DIR, d)) and not d.startswith(".")
    ]
    folders.sort(key=lambda d: (SECTION_ORDER.index(d) if d in SECTION_ORDER
                                else len(SECTION_ORDER), d))

    existing = load_existing()
    entries, made = [], 0

    for folder in folders:
        path = os.path.join(BEYOND_DIR, folder)
        names = [
            n for n in os.listdir(path)
            if os.path.splitext(n)[1].lower() in EXTS
            and not n.startswith(".")
            and os.path.isfile(os.path.join(path, n))
        ]
        names.sort(key=lambda n: os.path.getmtime(os.path.join(path, n)), reverse=True)

        for name in names:
            src = "images/beyond/%s/%s" % (folder, name)
            prev = existing.get(src, {})
            thumb, fresh = make_thumb(folder, name)
            made += 1 if fresh else 0

            entry = {"src": src, "section": folder, "sectionTitle": section_title(folder)}
            if thumb:
                entry["thumb"] = thumb
            entry["title"] = prev.get("title", "")
            entry["note"] = prev.get("note", "")
            entries.append(entry)

        print("  %-10s %3d photo(s)" % (folder, len(names)))

    os.makedirs(os.path.dirname(MANIFEST), exist_ok=True)
    with open(MANIFEST, "w", encoding="utf-8") as fh:
        fh.write(HEADER)
        fh.write(json.dumps(entries, indent=2, ensure_ascii=False))
        fh.write(";\n")

    kept = sum(1 for e in entries if e["title"] or e["note"])
    print("Wrote %d photo(s) across %d section(s) to js/photos.js "
          "(%d caption(s) kept, %d new thumbnail(s))."
          % (len(entries), len(folders), kept, made))


if __name__ == "__main__":
    main()
