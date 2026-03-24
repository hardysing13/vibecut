/* ─── CUSTOM CURSOR ────────────────────────────────────────────
   Two separate fixed divs parked at left:-200px until first mousemove.
   left/top assignment only — no transform, no will-change, no opacity.
────────────────────────────────────────────────────────────────*/
(function() {
  var dot  = document.getElementById('cur-dot');
  var ring = document.getElementById('cur-ring');
  var mx = -200, my = -200;
  var rx = -200, ry = -200;

  document.addEventListener('mousemove', function(e) {
    mx = e.clientX;
    my = e.clientY;
  });

  var hoverable = document.querySelectorAll('a, button, [role="button"], .car-slide, .pf-card, .ls-card, .mf-card');
  hoverable.forEach(function(el) {
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
  window.addEventListener('scroll', function() {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
})();

/* ─── YOUTUBE MODAL ────────────────────────────────────────────
   On window scope so onclick="window.openYT(...)" in HTML works.
────────────────────────────────────────────────────────────────*/
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
  var track  = document.getElementById('car-track');
  var dotsEl = document.getElementById('car-dots');
  if (!track || !dotsEl) return;

  var slides = track.querySelectorAll('.car-slide');
  var n   = slides.length;
  var cur = 0;

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
    var sw = slides[0].offsetWidth + 18;
    track.style.transform = 'translateX(-' + (cur * sw * vis()) + 'px)';
    dotsEl.querySelectorAll('.car-dot').forEach(function(d, i) {
      d.classList.toggle('on', i === cur);
    });
  }

  var nextBtn = document.getElementById('car-next');
  var prevBtn = document.getElementById('car-prev');
  if (nextBtn) nextBtn.addEventListener('click', function() { goTo(cur + 1); });
  if (prevBtn) prevBtn.addEventListener('click', function() { goTo(cur - 1); });

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
      if (e.isIntersecting) {
        e.target.classList.add('animate');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  els.forEach(function(el) { obs.observe(el); });
})();

/* ─── CONTACT FORM ──────────────────────────────────────────────
   Wire to Formspree: add action="https://formspree.io/f/YOUR_ID"
   and method="POST" to the <form>, then remove e.preventDefault().
────────────────────────────────────────────────────────────────*/
document.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    form.style.display = 'none';
    var success = document.getElementById('form-success');
    if (success) success.classList.add('on');
  });
});
