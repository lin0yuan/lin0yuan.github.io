# Photos for beyond.html

Drop photos into the folder for their section:

    cooking/   ->  "In the Kitchen"
    travel/    ->  "Through the Lens"
    music/     ->  "Zheng & Music"
    sports/    ->  "On the Move"

Add a new folder to add a new section (edit SECTION_ORDER and
SECTION_TITLES in tools/build_gallery.py to name and order it).

Then run, from the repo root:

    python3 tools/build_gallery.py

That writes js/photos.js and generates thumbnails in each
section's thumbs/ folder. Add titles and notes by editing
js/photos.js - they are preserved next time you regenerate.

thumbs/ folders are generated; do not edit them by hand.
