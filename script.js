(function () {
  'use strict';

  var state = { navVisible: false, aboutDismissed: true, suppressFade: false };

  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return document.querySelectorAll(sel); }

  /* ---------- Dust-particle statement text ---------- */
  function buildDustText() {
    var lines = $all('[data-statement-line]');
    lines.forEach(function (line) {
      var text = line.textContent;
      line.textContent = '';
      var dustLayer = document.createElement('div');
      dustLayer.className = 'dust-layer';
      line.appendChild(dustLayer);

      var letterIndex = 0;
      var words = text.split(' ');
      words.forEach(function (word, wi) {
        var wordSpan = document.createElement('span');
        wordSpan.style.display = 'inline-block';
        wordSpan.style.whiteSpace = 'nowrap';
        word.split('').forEach(function (ch) {
          var span = document.createElement('span');
          span.textContent = ch;
          span.style.display = 'inline-block';
          span.style.opacity = '0';
          span.style.filter = 'blur(4px)';
          var angle = Math.random() * Math.PI * 2;
          var dist = 30 + Math.random() * 50;
          span.style.transform = 'translate(' + (Math.cos(angle) * dist) + 'px, ' + (Math.sin(angle) * dist) + 'px) scale(0.4)';
          span.style.transition = 'opacity 1.8s cubic-bezier(0.19,1,0.22,1), filter 1.8s cubic-bezier(0.19,1,0.22,1), transform 1.8s cubic-bezier(0.19,1,0.22,1)';
          span.style.transitionDelay = (letterIndex * 38) + 'ms';
          span.dataset.settle = 'translate(0px,0px) scale(1)';
          letterIndex++;
          wordSpan.appendChild(span);

          for (var d = 0; d < 3; d++) {
            var dot = document.createElement('span');
            dot.style.position = 'absolute';
            var size = (1 + Math.random() * 2) + 'px';
            dot.style.width = size;
            dot.style.height = size;
            dot.style.borderRadius = '50%';
            dot.style.background = 'oklch(12% 0.002 90)';
            dot.style.left = (Math.random() * 100) + '%';
            dot.style.top = (Math.random() * 100) + '%';
            dot.style.opacity = '0.55';
            dot.style.transition = 'opacity 1.5s ease-out, transform 1.5s ease-out';
            dot.style.transitionDelay = (letterIndex * 38) + 'ms';
            var dAngle = Math.random() * Math.PI * 2;
            var dDist = 20 + Math.random() * 40;
            dot.dataset.settle = 'translate(' + (Math.cos(dAngle) * dDist) + 'px, ' + (Math.sin(dAngle) * dDist) + 'px)';
            dustLayer.appendChild(dot);
          }
        });
        line.appendChild(wordSpan);
        if (wi < words.length - 1) line.appendChild(document.createTextNode(' '));
      });
    });

    var statementSection = $('#statementSection');
    if (statementSection) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            statementSection.querySelectorAll('[data-statement-line] span span').forEach(function (span) {
              span.style.opacity = '1';
              span.style.filter = 'blur(0px)';
              span.style.transform = 'translate(0px,0px) scale(1)';
            });
            statementSection.querySelectorAll('[data-statement-line] div > span').forEach(function (dot) {
              dot.style.opacity = '0';
              dot.style.transform = dot.dataset.settle;
            });
            io.disconnect();
          }
        });
      }, { threshold: 0.3 });
      io.observe(statementSection);
    }
  }

  /* ---------- Scroll behaviour ---------- */
  function handleScroll() {
    var vh = window.innerHeight;
    var t = Math.min(window.scrollY / vh, 1);
    var scale = 1 + t * 8;
    var opacity = 1 - t;
    var taglineOpacity = Math.max(0, 1 - t * 5);
    var logo = $('#logo'), tagline = $('#tagline');
    if (logo) { logo.style.transform = 'scale(' + scale + ')'; logo.style.opacity = opacity; }
    if (tagline) tagline.style.opacity = taglineOpacity;

    var navVisible = window.scrollY >= vh * 1.9;
    if (navVisible !== state.navVisible) {
      state.navVisible = navVisible;
      $('#nav').classList.toggle('is-visible', navVisible);
    }

    var about = $('#aboutSection');
    var culture = $('#cultureGrid');
    if (about && culture && !state.suppressFade) {
      var fadeEnd = culture.getBoundingClientRect().top + window.scrollY;
      var fadeStart = Math.max(fadeEnd - vh * 0.6, vh);
      var at = fadeEnd > fadeStart ? Math.min(Math.max((window.scrollY - fadeStart) / (fadeEnd - fadeStart), 0), 1) : 0;
      if (at >= 1) state.aboutDismissed = true;
      var finalOpacity = state.aboutDismissed ? 0 : 1 - at;
      var finalTranslate = state.aboutDismissed ? -40 : -at * 40;
      about.style.opacity = finalOpacity;
      about.style.transform = 'translateY(' + finalTranslate + 'px)';
      if (state.aboutDismissed) {
        about.style.height = '0px';
        about.style.paddingTop = '0px';
        about.style.paddingBottom = '0px';
        about.style.marginTop = '0px';
        about.style.marginBottom = '0px';
      }
    }
  }

  /* ---------- Culture grid shuffle (desktop only) ---------- */
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function applyGridLayout() {
    var grid = $('#cultureGrid');
    if (!grid) return;
    var isMobile = window.matchMedia('(max-width:768px)').matches;
    if (isMobile) return; // CSS handles mobile single-column full-width layout
    var cards = Array.prototype.slice.call(grid.children);
    shuffle(cards);
    var pairTemplates = [
      [{ gridColumn: 'span 3', aspectRatio: '4/5', alignSelf: '' }, { gridColumn: 'span 3', aspectRatio: '4/5', alignSelf: '' }],
      [{ gridColumn: 'span 2', aspectRatio: '4/5', alignSelf: 'end' }, { gridColumn: 'span 4', aspectRatio: '16/10', alignSelf: '' }],
      [{ gridColumn: 'span 2', aspectRatio: '4/5', alignSelf: 'end' }, { gridColumn: 'span 4', aspectRatio: '16/10', alignSelf: '' }],
      [{ gridColumn: 'span 3', aspectRatio: '4/5', alignSelf: '' }, { gridColumn: 'span 3', aspectRatio: '4/5', alignSelf: '' }]
    ];
    shuffle(pairTemplates);
    pairTemplates.forEach(function (pair) { shuffle(pair); });
    var layouts = pairTemplates.reduce(function (a, b) { return a.concat(b); }, []);
    cards.forEach(function (card, i) {
      grid.appendChild(card);
      card.style.gridColumn = layouts[i].gridColumn;
      card.style.aspectRatio = layouts[i].aspectRatio;
      card.style.alignSelf = layouts[i].alignSelf;
    });
  }

  /* ---------- Menu ---------- */
  function closeMenu() {
    var toggle = $('#menuToggle'), panel = $('#menuPanel');
    panel.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function onMenuToggle() {
    var toggle = $('#menuToggle'), panel = $('#menuPanel');
    var open = panel.classList.contains('is-open');
    panel.classList.toggle('is-open', !open);
    toggle.classList.toggle('is-open', !open);
    toggle.setAttribute('aria-expanded', String(!open));
  }

  /* ---------- Profile overlays ---------- */
  function openProfile(target) {
    var el = document.querySelector('[data-profile-overlay="' + target + '"]');
    if (el) el.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeProfile(overlay) {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  /* ---------- About expand ---------- */
  function openAbout() {
    state.aboutDismissed = false;
    state.suppressFade = true;
    var el = $('#aboutSection');
    if (el) {
      el.style.height = 'auto';
      el.style.paddingTop = '120px';
      el.style.paddingBottom = '120px';
      el.style.marginTop = '';
      el.style.marginBottom = '';
      el.style.opacity = 1;
      el.style.transform = 'translateY(0px)';
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
    }
    clearTimeout(state.suppressFadeTimeout);
    state.suppressFadeTimeout = setTimeout(function () { state.suppressFade = false; }, 1000);
  }

  /* ---------- Modals ---------- */
  function openModal(overlay) { overlay.classList.add('is-open'); }
  function closeModal(overlay) { overlay.classList.remove('is-open'); }

  function mailto(address, subject, body) {
    window.location.href = 'mailto:' + address + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    buildDustText();
    applyGridLayout();

    window.addEventListener('resize', debounce(applyGridLayout, 250));
    window.addEventListener('scroll', handleScroll, { passive: true });

    $('#navLogo').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    $('#menuToggle').addEventListener('click', onMenuToggle);
    $('#menuPanel').addEventListener('click', onMenuToggle);

    $all('.menu-item')[0].addEventListener('click', function (e) { e.stopPropagation(); closeMenu(); openAbout(); });
    $('#connectMenuItem').addEventListener('click', function (e) { e.stopPropagation(); closeMenu(); openModal($('#contactOverlay')); });
    $('#demoMenuItem').addEventListener('click', function (e) { e.stopPropagation(); closeMenu(); openModal($('#demoOverlay')); });
    $all('.menu-item')[1].addEventListener('click', function (e) {
      e.stopPropagation();
      closeMenu();
      var el = $('#cultureGrid');
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
    });

    var video = $('#mainVideo');
    video.addEventListener('ended', function () { video.currentTime = 0; video.play(); });

    $all('[data-human-trigger]').forEach(function (card) {
      card.addEventListener('click', function () { openProfile(card.dataset.target); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProfile(card.dataset.target); }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var openProfileEl = document.querySelector('.profile-overlay.is-open');
      if (openProfileEl) { closeProfile(openProfileEl); return; }
      var openModalEl = document.querySelector('.modal-overlay.is-open');
      if (openModalEl) closeModal(openModalEl);
    });
    $all('[data-close-profile]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        closeProfile(btn.closest('[data-profile-overlay]'));
      });
    });

    var contactOverlay = $('#contactOverlay');
    contactOverlay.addEventListener('click', function (e) { if (e.target === contactOverlay) closeModal(contactOverlay); });
    $('#contactClose').addEventListener('click', function () { closeModal(contactOverlay); });
    $('#contactForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#contactName').value, email = $('#contactEmail').value, message = $('#contactMessage').value;
      mailto('hello@kukai.agency', 'Connect: ' + (name || 'New enquiry'), message + '\n\n— ' + name + '\n' + email);
      closeModal(contactOverlay);
      e.target.reset();
    });

    var demoOverlay = $('#demoOverlay');
    demoOverlay.addEventListener('click', function (e) { if (e.target === demoOverlay) closeModal(demoOverlay); });
    $('#demoClose').addEventListener('click', function () { closeModal(demoOverlay); });
    $('#demoForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#demoName').value, company = $('#demoCompany').value, jobTitle = $('#demoJobTitle').value,
          email = $('#demoEmail').value, phone = $('#demoPhone').value, website = $('#demoWebsite').value;
      mailto('hello@kukai.agency', 'Culture Codified Demo Request: ' + (company || name),
        'Name: ' + name + '\nCompany: ' + company + '\nJob Title: ' + jobTitle + '\nEmail: ' + email + '\nPhone: ' + phone + '\nWebsite: ' + website);
      closeModal(demoOverlay);
      e.target.reset();
    });

    $('#footerEmail').addEventListener('click', function (e) { e.preventDefault(); openModal(contactOverlay); });
  });

  function debounce(fn, wait) {
    var t;
    return function () {
      clearTimeout(t);
      var args = arguments, ctx = this;
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }
})();
