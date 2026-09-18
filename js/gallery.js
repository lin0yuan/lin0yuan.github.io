/* beyond.html gallery: one masonry grid per section, with a lightbox.
   Reads window.BEYOND_PHOTOS from js/photos.js. */
(function () {
  'use strict';

  var photos = Array.isArray(window.BEYOND_PHOTOS) ? window.BEYOND_PHOTOS : [];

  var host = document.getElementById('sections');
  var nav = document.getElementById('section-nav');
  var box = document.getElementById('lightbox');
  var boxImg = document.getElementById('lb-img');
  var boxCap = document.getElementById('lb-caption');
  var boxNum = document.getElementById('lb-counter');

  var PREVIEW = 24;          // photos shown before "Show all"
  var active = [];           // the set the lightbox is currently walking
  var current = 0;
  var lastFocus = null;

  /* ---------- group ---------- */

  function group() {
    var order = [], byKey = {};
    photos.forEach(function (p) {
      var key = p.section || 'other';
      if (!byKey[key]) {
        byKey[key] = { key: key, title: p.sectionTitle || key, items: [] };
        order.push(byKey[key]);
      }
      byKey[key].items.push(p);
    });
    return order;
  }

  /* ---------- tiles ---------- */

  function tile(list, i) {
    var p = list[i];
    var fig = document.createElement('figure');
    fig.className = 'photo-tile';
    fig.tabIndex = 0;
    fig.setAttribute('role', 'button');
    fig.setAttribute('aria-label', 'Open ' + (p.title || 'photo'));

    var img = document.createElement('img');
    img.src = p.thumb || p.src;
    img.alt = p.title || '';
    img.loading = 'lazy';
    img.decoding = 'async';
    fig.appendChild(img);

    if (p.title || p.note) {
      var cap = document.createElement('figcaption');
      if (p.title) {
        var t = document.createElement('span');
        t.className = 'cap-title';
        t.textContent = p.title;
        cap.appendChild(t);
      }
      if (p.note) {
        var nt = document.createElement('span');
        nt.className = 'cap-note';
        nt.textContent = p.note;
        cap.appendChild(nt);
      }
      fig.appendChild(cap);
    }

    function open() { active = list; openBox(i); }
    fig.addEventListener('click', open);
    fig.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
    return fig;
  }

  /* ---------- render ---------- */

  function render() {
    var groups = group();

    if (!groups.length) {
      var empty = document.createElement('p');
      empty.className = 'gallery-empty';
      // Visitor-facing text. To fill this page: add photos under
      // images/beyond/<section>/ and run python3 tools/build_gallery.py
      empty.textContent = 'Photos coming soon.';
      host.appendChild(empty);
      return;
    }

    groups.forEach(function (g) {
      var link = document.createElement('a');
      link.href = '#' + g.key;
      link.className = 'chip';
      link.textContent = g.title;
      nav.appendChild(link);

      var sec = document.createElement('section');
      sec.className = 'gallery-section';
      sec.id = g.key;

      var h = document.createElement('h2');
      h.textContent = g.title;
      var n = document.createElement('span');
      n.className = 'section-count';
      n.textContent = g.items.length + (g.items.length === 1 ? ' photo' : ' photos');
      h.appendChild(n);
      sec.appendChild(h);

      var grid = document.createElement('div');
      grid.className = 'photo-grid';
      var shown = Math.min(PREVIEW, g.items.length);
      for (var i = 0; i < shown; i++) grid.appendChild(tile(g.items, i));
      sec.appendChild(grid);

      if (g.items.length > PREVIEW) {
        var more = document.createElement('button');
        more.type = 'button';
        more.className = 'show-all';
        more.textContent = 'Show all ' + g.items.length + ' photos';
        more.addEventListener('click', function () {
          for (var j = PREVIEW; j < g.items.length; j++) grid.appendChild(tile(g.items, j));
          more.remove();
        });
        sec.appendChild(more);
      }

      host.appendChild(sec);
    });
  }

  /* ---------- lightbox ---------- */

  function show(i) {
    current = (i + active.length) % active.length;
    var p = active[current];

    boxImg.src = p.src;
    boxImg.alt = p.title || '';

    boxCap.textContent = '';
    if (p.title) boxCap.appendChild(document.createTextNode(p.title));
    if (p.note) {
      var s = document.createElement('span');
      s.className = 'lb-note';
      s.textContent = p.note;
      boxCap.appendChild(s);
    }

    boxNum.textContent = (current + 1) + ' / ' + active.length;
    preload(current + 1);
    preload(current - 1);
  }

  function preload(i) {
    if (active.length < 2) return;
    var p = active[(i + active.length) % active.length];
    if (p) { new Image().src = p.src; }
  }

  function openBox(i) {
    lastFocus = document.activeElement;
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    show(i);
    box.querySelector('.lb-close').focus();
  }

  function closeBox() {
    box.hidden = true;
    boxImg.src = '';
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  box.addEventListener('click', function (e) {
    var act = e.target.closest('[data-lb]');
    if (act) {
      var a = act.getAttribute('data-lb');
      if (a === 'close') closeBox();
      else if (a === 'prev') show(current - 1);
      else if (a === 'next') show(current + 1);
      return;
    }
    if (e.target === box) closeBox();
  });

  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') closeBox();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
  });

  render();
})();
