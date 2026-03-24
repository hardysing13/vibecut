/* ─── CUSTOM CURSOR ────────────────────────────────────────────
   Desktop only — hidden on touch devices (no cursor on mobile).
────────────────────────────────────────────────────────────────*/
(function() {
  // Don't run cursor on touch-primary devices
  if (window.matchMedia('(hover: none)').matches) return;

  var dot  = document.getElementById('cur-dot');
  var ring = document.getElementById('cur-ring');
  if (!dot || !ring) return;

  var mx = -200, my = -200;
  var rx = -200, ry = -200;

  document.addEventListener('mousemove', function(e) {
    mx = e.clientX;
    my = e.clientY;
  });

  document.querySelectorAll('a, button, [role="button"], .car-slide, .pf-card, .ls-card, .mf-card').forEach(function(el) {
    el.addEventListener('mouseenter', function() { ring.classList.add('big'); });
    el.addEventListener('mouseleave', function() { ring.classList.remove('big'); });
  });

  function tick() {
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.left = Math.round(rx) + 'px';
    ring.style.top  = Math.round(ry) + 'px';
    requestAnimationFrame(tick);
  }
  tick();
})();

/* ─── NAV SCROLL STATE ─────────────────────────────────────────*/
(function() {
  var nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', function() {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
})();

/* ─── SMOOTH SCROLL FOR NAV LINKS ─────────────────────────────
   iOS Safari sometimes ignores CSS scroll-behavior: smooth on
   anchor links. This JS version works on all browsers.
────────────────────────────────────────────────────────────────*/
(function() {
  document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var id = this.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - 70;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();

/* ─── LOGO FADE-IN + SCANNER ───────────────────────────────────
   Opacity fade on load. Scanner uses translateY via rAF so it
   never triggers a CSS stacking context (Safari cursor safe).
────────────────────────────────────────────────────────────────*/
(function() {
  function fadeIn(sel, delay) {
    var el = document.querySelector(sel);
    if (!el) return;
    el.style.opacity = '0';
    setTimeout(function() {
      el.style.transition = 'opacity 0.4s ease';
      el.style.opacity = '1';
    }, delay);
  }
  fadeIn('.vc-blade-l',  200);
  fadeIn('.vc-blade-r',  200);
  fadeIn('.vc-frame-tl', 700);
  fadeIn('.vc-frame-tr', 760);
  fadeIn('.vc-frame-bl', 820);
  fadeIn('.vc-frame-br', 880);
  fadeIn('.vc-glow',     940);

  /* Scanner line — moves top to bottom via translateY, loops every 3s */
  var scanner = document.getElementById('vc-scanner');
  if (!scanner) return;
  var scanPos = 0;       // 0–28 range (SVG height minus top offset)
  var scanDir = 1;
  var scanActive = false;

  function runScan() {
    if (!scanActive) {
      scanActive = true;
      scanner.style.opacity = '0.7';
    }
    scanPos += 0.35 * scanDir;
    scanner.style.transform = 'translateY(' + scanPos + 'px)';
    if (scanPos >= 28) {
      // Fade out at bottom, pause, restart from top
      scanner.style.opacity = '0';
      scanPos = 0;
      scanActive = false;
      setTimeout(runScan, 800); // pause between scans
      return;
    }
    requestAnimationFrame(runScan);
  }

  // Start first scan after blades fade in
  setTimeout(runScan, 600);
})();

/* ─── CATS TICKER — JS scroll, no CSS animation ────────────────
   CSS transform animations create stacking contexts that break
   position:fixed cursor elements in Safari. JS-driven instead.
────────────────────────────────────────────────────────────────*/
(function() {
  var wrap = document.querySelector('.cats-track-wrap');
  var list = document.querySelector('.cats-list');
  if (!wrap || !list) return;

  var speed = 0.5;
  var pos = 0;
  var paused = false;
  var halfWidth = 0;

  function measure() { halfWidth = list.scrollWidth / 2; }

  wrap.addEventListener('mouseenter', function() { paused = true; });
  wrap.addEventListener('mouseleave', function() { paused = false; });
  // Touch: pause briefly on touch
  wrap.addEventListener('touchstart', function() { paused = true; }, { passive: true });
  wrap.addEventListener('touchend', function() { setTimeout(function() { paused = false; }, 1500); }, { passive: true });

  function tick() {
    if (!paused) {
      pos += speed;
      if (halfWidth > 0 && pos >= halfWidth) pos = 0;
      list.style.transform = 'translateX(-' + pos + 'px)';
    }
    requestAnimationFrame(tick);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function() { measure(); tick(); });
  } else {
    setTimeout(function() { measure(); tick(); }, 500);
  }
})();

/* ─── YOUTUBE MODAL ────────────────────────────────────────────
   openYT on window scope so inline onclick attributes work.
   Touch events added so tapping works on iPhone.
────────────────────────────────────────────────────────────────*/
window.openYT = function(id) {
  if (!id || id.indexOf('REPLACE') === 0) return;
  var modal = document.getElementById('yt-modal');
  var frame = document.getElementById('yt-frame');
  if (!modal || !frame) return;
  frame.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1';
  modal.classList.add('on');
  document.body.style.overflow = 'hidden';
};

window.closeYT = function() {
  var modal = document.getElementById('yt-modal');
  var frame = document.getElementById('yt-frame');
  if (!modal || !frame) return;
  modal.classList.remove('on');
  frame.src = '';
  document.body.style.overflow = '';
};

document.addEventListener('DOMContentLoaded', function() {
  var closeBtn = document.getElementById('yt-close');
  var modal    = document.getElementById('yt-modal');

  if (closeBtn) closeBtn.addEventListener('click', window.closeYT);
  if (modal) modal.addEventListener('click', function(e) {
    if (e.target === modal) window.closeYT();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') window.closeYT();
  });

  // Tap detection helper — only fires openYT if finger didn't move (not a scroll)
  function addTapToPlay(el, ytId) {
    var touchStartY = 0;
    var touchStartX = 0;
    el.addEventListener('click', function() { window.openYT(ytId); });
    el.addEventListener('touchstart', function(e) {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    el.addEventListener('touchend', function(e) {
      var dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
      var dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
      // Only fire if finger moved less than 10px — genuine tap, not scroll
      if (dy < 10 && dx < 10) {
        e.preventDefault();
        window.openYT(ytId);
      }
    }, { passive: false });
  }

  // Wire carousel slides
  document.querySelectorAll('.car-slide[data-yt]').forEach(function(el) {
    addTapToPlay(el, el.dataset.yt);
  });

  // Wire portfolio + latent space cards
  document.querySelectorAll('[onclick*="openYT"]').forEach(function(el) {
    var match = el.getAttribute('onclick').match(/openYT\('([^']+)'\)/);
    if (match) addTapToPlay(el, match[1]);
  });
});

/* ─── CAROUSEL ─────────────────────────────────────────────────*/
(function() {
  var track = document.getElementById('car-track');
  var dotsEl = document.getElementById('car-dots');
  if (!track || !dotsEl) return;

  var slides = track.querySelectorAll('.car-slide');
  var n = slides.length, cur = 0;

  function vis()   { return window.innerWidth <= 860 ? 1 : 2; }
  function pages() { return Math.ceil(n / vis()); }

  function buildDots() {
    dotsEl.innerHTML = '';
    for (var i = 0; i < pages(); i++) {
      var d = document.createElement('div');
      d.className = 'car-dot' + (i === 0 ? ' on' : '');
      (function(idx) {
        d.addEventListener('click', function() { goTo(idx); });
        d.addEventListener('touchend', function(e) { e.preventDefault(); goTo(idx); }, { passive: false });
      })(i);
      dotsEl.appendChild(d);
    }
  }

  function goTo(page) {
    cur = (page + pages()) % pages();
    var sw = slides[0].offsetWidth + 18;
    track.style.transform = 'translateX(-' + (cur * sw * vis()) + 'px)';
    dotsEl.querySelectorAll('.car-dot').forEach(function(d, i) {
      d.classList.toggle('on', i === cur);
    });
  }

  var nb = document.getElementById('car-next');
  var pb = document.getElementById('car-prev');
  if (nb) {
    nb.addEventListener('click', function() { goTo(cur + 1); });
    nb.addEventListener('touchend', function(e) { e.preventDefault(); goTo(cur + 1); }, { passive: false });
  }
  if (pb) {
    pb.addEventListener('click', function() { goTo(cur - 1); });
    pb.addEventListener('touchend', function(e) { e.preventDefault(); goTo(cur - 1); }, { passive: false });
  }

  // Swipe support for iPhone
  var touchStartX = 0;
  track.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', function(e) {
    var diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goTo(cur + 1);
      else goTo(cur - 1);
    }
  }, { passive: true });

  buildDots();
  window.addEventListener('resize', function() { buildDots(); goTo(0); });

  var timer = setInterval(function() { goTo(cur + 1); }, 5200);
  track.parentElement.addEventListener('mouseenter', function() { clearInterval(timer); });
  track.parentElement.addEventListener('mouseleave', function() {
    timer = setInterval(function() { goTo(cur + 1); }, 5200);
  });
})();

/* ─── SCROLL FADE-IN ────────────────────────────────────────────
   Hero-body gets animate immediately — it's always above the fold.
   Everything else uses IntersectionObserver with a 500ms safety
   fallback that animates anything still in the viewport.
────────────────────────────────────────────────────────────────*/
(function() {
  var els = document.querySelectorAll('.fade');

  // Hero body is always visible — animate it right away
  var heroBody = document.querySelector('.hero-body');
  if (heroBody) heroBody.classList.add('animate');

  if (!('IntersectionObserver' in window)) {
    els.forEach(function(el) { el.classList.add('animate'); });
    return;
  }

  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('animate'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });

  els.forEach(function(el) { obs.observe(el); });

  // Safety net: after 600ms, animate anything still in the viewport
  setTimeout(function() {
    els.forEach(function(el) {
      if (!el.classList.contains('animate')) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('animate');
        }
      }
    });
  }, 600);
})();

/* ─── CONTACT FORM — EmailJS ────────────────────────────────────
   Template template_70u9yvd expects {{email}} (the original field
   name from the Gemini site). Field is name="email" in the HTML.
   Public Key:  2WkxcVwk1FHP0Sgyh
   Service:     service_57k6qhf
   To you:      template_70u9yvd
   To sender:   template_iarwp0d
────────────────────────────────────────────────────────────────*/
document.addEventListener('DOMContentLoaded', function() {
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  s.onload = function() { emailjs.init('2WkxcVwk1FHP0Sgyh'); };
  document.head.appendChild(s);

  var form    = document.getElementById('contact-form');
  var success = document.getElementById('form-success');
  if (!form) return;
  var btn = form.querySelector('.form-submit');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var emailInput = form.querySelector('[name="email"]') || form.querySelector('#f-email');
    var userEmail = emailInput ? emailInput.value.trim() : '';
    if (!userEmail) return;

    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }

    emailjs.sendForm('service_57k6qhf', 'template_70u9yvd', form)
      .then(function() {
        return emailjs.send('service_57k6qhf', 'template_iarwp0d', {
          to_email: userEmail,
          to_name:  userEmail.split('@')[0]
        });
      })
      .then(function() {
        form.style.display = 'none';
        if (success) success.classList.add('on');
      })
      .catch(function(err) {
        console.error('EmailJS error:', err);
        if (btn) { btn.disabled = false; btn.textContent = 'Send the Brief \u2192'; }
        alert('Something went wrong. Please email hello@vibecut.design directly.');
      });
  });
});
