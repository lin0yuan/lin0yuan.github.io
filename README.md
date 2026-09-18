# lin0yuan.github.io

Personal academic homepage for Lin Yuan (Lynn) — <https://lin0yuan.github.io/>

Two static pages. No build step, no Ruby, no Jekyll: GitHub Pages serves the
HTML directly (`.nojekyll` tells it not to try to build the repo).

```
index.html         profile: about, education, publications, teaching
beyond.html        hobbies: photo galleries by theme
css/style.css      shared styles (layered on Bulma)
css/gallery.css    gallery + lightbox styles
js/photos.js       generated photo manifest — see below
js/gallery.js      renders the galleries and the lightbox
tools/build_gallery.py   regenerates js/photos.js and thumbnails
images/
  Lynn.jpg         profile photo (left rail)
  edu/             institution logos for Education
  papers/          thumbnails for Publications
  beyond/          hobby photos, one folder per section
files/             CV and teaching PDFs
robots.txt, sitemap.xml   search-engine basics
publications/, teaching/  redirect stubs for the old Jekyll URLs
```

Bulma 0.9.4 and Font Awesome 6 load from CDNs — see the `<head>` of each page.

## Preview locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Adding a publication

Copy an existing `<article class="columns">` block inside the `#publications`
section of `index.html` and edit it. Newest first.

```html
<article class="columns">
  <div class="column is-3">
    <figure class="image">
      <img src="images/papers/YOUR-THUMB.png" alt="...">
    </figure>
  </div>
  <div class="column">
    <div class="content">
      <p>
        <b>Paper title</b><br>
        Author One, <b>Lin Yuan</b>, Author Three<br>
        <b><span class="pub-badge">[Venue 2026]</span></b><i> Full Journal Name, 2026</i><br>
        <a href="..." target="_blank" rel="noopener">[Paper]</a>
      </p>
    </div>
  </div>
</article>
```

`pub-badge` is the red venue tag. Bold your own name in the author list.

## Adding photos to Beyond Research

1. Drop photos into `images/beyond/<section>/` (`cooking`, `travel`, `music`,
   `sports` — or a new folder for a new section).
2. Run `python3 tools/build_gallery.py`. It writes `js/photos.js` and makes
   900px thumbnails in each `thumbs/` folder, so the grid stays fast even with
   hundreds of photos.
3. Optionally add a `title` and `note` to entries in `js/photos.js`. These are
   preserved the next time you regenerate.

The grid shows 24 photos per section with a "Show all" button, images are
lazy-loaded, and clicking one opens a lightbox (arrow keys navigate, Esc closes).

To rename or reorder sections, edit `SECTION_TITLES` / `SECTION_ORDER` at the
top of `tools/build_gallery.py`.

## Adding a section to the profile page

Add an `<h2 id="yourid">` in the right panel of `index.html` and a matching
`<li><a href="#yourid">` in the `#sidebar` Quick Links list. The scroll-spy
script at the bottom of the file picks it up automatically.

## Notes

- The left rail is duplicated in `index.html` and `beyond.html`. If you change
  your photo, name, links or nav, change it in both.
- Avoid naming custom CSS classes after Bulma components (`tile`, `box`, `card`,
  `level`, `media`, `hero`, `tag`). Bulma's rules will win and break the layout —
  the gallery classes are prefixed `photo-` for this reason.
- `images/edu/*.svg` and `images/papers/*.svg` are grey placeholders. Replace
  them with real logos and figures, keeping the filenames.
- Search `index.html` for `TODO` to find the spots that still need checking.
