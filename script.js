// ===== Starfield =====
(function generateStars() {
  const container = document.getElementById('stars');
  if (!container) return;
  const count = 200;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    const size = Math.random() * 2 + 0.4;
    star.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      top: ${Math.random() * 100}%;
      left: ${Math.random() * 100}%;
      --dur: ${(Math.random() * 4 + 2).toFixed(1)}s;
      animation-delay: ${(Math.random() * 4).toFixed(1)}s;
    `;
    container.appendChild(star);
  }
})();

// ===== Stats Counters =====
document.addEventListener('DOMContentLoaded', function() {
  function animateCounter(el) {
    const target   = parseFloat(el.dataset.target);
    const suffix   = el.dataset.suffix || '';
    const decimal  = el.dataset.target.includes('.');
    const duration = 2500;
    const start    = performance.now();

    function easeOutQuad(t) { return t * (2 - t); }

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutQuad(progress);
      const value    = decimal
        ? (eased * target).toFixed(1)
        : Math.floor(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.stat-num[data-target]').forEach(el => counterObserver.observe(el));
});

// ===== Fade-in on scroll =====
const fadeStyle = document.createElement('style');
fadeStyle.textContent = '.fade-in { opacity: 0; transform: translateY(20px); transition: opacity 0.55s ease, transform 0.55s ease; } .fade-in.visible { opacity: 1; transform: translateY(0); }';
document.head.appendChild(fadeStyle);

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.card, .mission-card, .tech-item, .team-card, .press-item, .rocket-card, .ai-card, .launch-card').forEach((el, i) => {
  el.classList.add('fade-in');
  el.style.transitionDelay = `${(i % 4) * 0.07}s`;
  fadeObserver.observe(el);
});

// ===== Hamburger menu =====
(function () {
  const btn   = document.getElementById('navHamburger');
  const links = document.querySelector('.nav-links');
  if (!btn || !links) return;

  function close() {
    links.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    const isOpen = links.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    btn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', close);
  });

  document.addEventListener('click', function (e) {
    if (!btn.contains(e.target) && !links.contains(e.target)) close();
  });
})();

// ===== Navbar scroll state =====
(function () {
  const nb = document.querySelector('.navbar');
  if (!nb) return;
  const toggle = () => nb.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
})();

// ===== Hero nebula parallax =====
(function () {
  const nebula = document.querySelector('.hero-nebula');
  const stars  = document.getElementById('stars');
  if (!nebula) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nebula.style.transform = `translateY(${y * 0.28}px)`;
    if (stars) stars.style.transform = `translateY(${y * 0.12}px)`;
  }, { passive: true });
})();

// ===== Launch Countdown Timers =====
document.addEventListener('DOMContentLoaded', function() {
  function updateCountdowns() {
    const countdowns = document.querySelectorAll('.countdown[data-target]');
    console.log('Found countdowns:', countdowns.length);
    countdowns.forEach(el => {
      const targetStr = el.dataset.target;
      console.log('Target string:', targetStr);
      const target = new Date(targetStr).getTime();
      const now = Date.now();
      const diff = target - now;
      console.log('Target time:', target, 'Now:', now, 'Diff:', diff);
      if (diff <= 0) {
        el.innerHTML = '<span class="cd-launched">&#x2713; LAUNCHED</span>';
        return;
      }
      const days  = Math.floor(diff / 864e5);
      const hours = Math.floor((diff % 864e5) / 36e5);
      const mins  = Math.floor((diff % 36e5) / 6e4);
      const secs  = Math.floor((diff % 6e4) / 1e3);
      const fmt = n => String(n).padStart(2, '0');
      const dEl = el.querySelector('.cd-days');
      const hEl = el.querySelector('.cd-hours');
      const mEl = el.querySelector('.cd-min');
      const sEl = el.querySelector('.cd-sec');
      console.log('Elements:', dEl, hEl, mEl, sEl);
      if (dEl) dEl.textContent = fmt(days);
      if (hEl) hEl.textContent = fmt(hours);
      if (mEl) mEl.textContent = fmt(mins);
      if (sEl) sEl.textContent = fmt(secs);
    });
  }
  updateCountdowns();
  setInterval(updateCountdowns, 1000);
});

// ===== Vehicle clip segment loops (IFrame API) =====
(function () {
  var segMap = {
    'vid-falcon9':      { start: 3615,  end: 3658  },
    'vid-falcon-heavy': { start: 30,    end: 66    },
    'vid-dragon':       { start: 14791, end: 14813 },
    'vid-starlink':     { start: 195,   end: 210   },
  };
  var players = {};

  function initPlayers() {
    Object.keys(segMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      players[id] = new YT.Player(id, {});
    });

    setInterval(function () {
      Object.keys(players).forEach(function (id) {
        var p = players[id];
        var seg = segMap[id];
        if (!p || typeof p.getCurrentTime !== 'function') return;
        try {
          var t = p.getCurrentTime();
          if (t > 0 && t >= seg.end - 1) {
            p.seekTo(seg.start, true);
            p.playVideo();
          }
        } catch (ignore) {}
      });
    }, 500);
  }

  var prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = function () {
    if (typeof prev === 'function') prev();
    initPlayers();
  };
  var s = document.createElement('script');
  s.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(s);
})();

// ===== Vehicle video play/pause =====
(function () {
  function ytCmd(iframe, func) {
    iframe.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func, args: [] }), '*'
    );
  }

  document.querySelectorAll('.video-toggle').forEach(btn => {
    let paused = false;
    const iframe = btn.closest('.vehicle-video').querySelector('.vehicle-iframe');
    btn.addEventListener('click', () => {
      paused = !paused;
      ytCmd(iframe, paused ? 'pauseVideo' : 'playVideo');
      btn.querySelector('.vt-icon').innerHTML = paused ? '&#9654;' : '&#9646;&#9646;';
      btn.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
      btn.classList.toggle('is-paused', paused);
    });
  });
})();

// ===== Contact form =====
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const msg = document.getElementById('formMsg');
  msg.textContent = 'Your inquiry has been received. A member of our team will respond within 2 business days.';
  this.reset();
  setTimeout(() => { msg.textContent = ''; }, 7000);
});
