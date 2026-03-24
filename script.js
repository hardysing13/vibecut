/* ─── CUSTOM CURSOR ────────────────────────────────────────────
   left/top only. No CSS transform. No will-change. No opacity.
   Parked at -200px until first real mousemove.
────────────────────────────────────────────────────────────────*/
(function() {
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

/* ─── LOGO SCISSOR ANIMATION ───────────────────────────────────
   JS-driven so it never creates a CSS stacking context.
   Runs once on load. Uses opacity only — no transform on fixed elements.
────────────────────────────────────────────────────────────────*/
(function() {
  function fadeIn(selector, delay) {
    var el = document.querySelector(selector);
    if (!el) return;
    el.style.opacity = '0';
    setTimeout(function() {
      el.style.transition = 'opacity 0.4s ease';
      el.style.opacity = '1';
    }, delay);
  }
  // Stagger the logo parts in
  fadeIn('.vc-blade-l',   200);
  fadeIn('.vc-blade-r',   200);
  fadeIn('.vc-frame-tl',  700);
  fadeIn('.vc-frame-tr',  750);
  fadeIn('.vc-frame-bl',  800);
  fadeIn('.vc-frame-br',  850);
  fadeIn('.vc-glow',      900);
})();

/* ─── CATS TICKER — JS scroll, no CSS animation ────────────────
   CSS transform animation on .cats-list creates a stacking context
   in Safari that kills position:fixed cursor elements.
   This JS version moves the list via scrollLeft instead.
────────────────────────────────────────────────────────────────*/
(function() {
  var wrap = document.querySelector('.cats-track-wrap');
  var list = document.querySelector('.cats-list');
  if (!wrap || !list) return;

  var speed = 0.5; // px per frame
  var pos = 0;
  var paused = false;
  var halfWidth = 0;

  function getHalfWidth() {
    // List is doubled — half is one full set of items
    halfWidth = list.scrollWidth / 2;
  }

  wrap.addEventListener('mouseenter', function() { paused = true; });
  wrap.addEventListener('mouseleave', function() { paused = false; });

  function tickTicker() {
    if (!paused) {
      pos += speed;
      if (halfWidth > 0 && pos >= halfWidth) {
        pos = 0; // seamless reset
      }
      list.style.transform = 'translateX(-' + pos + 'px)';
    }
    requestAnimationFrame(tickTicker);
  }

  // Get width after fonts load
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function() {
      getHalfWidth();
      tickTicker();
    });
  } else {
    setTimeout(function() { getHalfWidth(); tickTicker(); }, 500);
  }
})();

/* ─── YOUTUBE MODAL ────────────────────────────────────────────*/
window.openYT = function(id) {
  if (!id || id.indexOf('REPLACE') === 0) return;
  var modal = document.getElementById('yt-modal');
  var frame = document.getElementById('yt-frame');
  if (!modal || !frame) return;
  frame.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0';
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
  if (modal)    modal.addEventListener('click', function(e) { if (e.target === modal) window.closeYT(); });
  document.querySelectorAll('.car-slide[data-yt]').forEach(function(el) {
    el.addEventListener('click', function() { window.openYT(el.dataset.yt); });
  });
});

document.addEventListener('keydown', function(e) { if (e.key === 'Escape') window.closeYT(); });

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
      (function(idx) { d.addEventListener('click', function() { goTo(idx); }); })(i);
      dotsEl.appendChild(d);
    }
  }

  function goTo(page) {
    cur = (page + pages()) % pages();
    track.style.transform = 'translateX(-' + (cur * (slides[0].offsetWidth + 18) * vis()) + 'px)';
    dotsEl.querySelectorAll('.car-dot').forEach(function(d, i) { d.classList.toggle('on', i === cur); });
  }

  var nb = document.getElementById('car-next'), pb = document.getElementById('car-prev');
  if (nb) nb.addEventListener('click', function() { goTo(cur + 1); });
  if (pb) pb.addEventListener('click', function() { goTo(cur - 1); });
  buildDots();
  window.addEventListener('resize', function() { buildDots(); goTo(0); });

  var timer = setInterval(function() { goTo(cur + 1); }, 5200);
  track.parentElement.addEventListener('mouseenter', function() { clearInterval(timer); });
  track.parentElement.addEventListener('mouseleave', function() {
    timer = setInterval(function() { goTo(cur + 1); }, 5200);
  });
})();

/* ─── SCROLL FADE-IN ────────────────────────────────────────────*/
(function() {
  var els = document.querySelectorAll('.fade');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function(el) { el.classList.add('animate'); });
    return;
  }
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('animate'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  els.forEach(function(el) { obs.observe(el); });
})();

/* ─── CONTACT FORM — EmailJS ────────────────────────────────────
   Service:  service_57k6qhf
   Template → you:     template_70u9yvd
   Template → sender:  template_iarwp0d
   Public Key:         2WkxcVwk1FHP0Sgyh
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
    var userEmail = (form.querySelector('#f-email') || {}).value;
    if (!userEmail || !userEmail.trim()) return;
    userEmail = userEmail.trim();
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
