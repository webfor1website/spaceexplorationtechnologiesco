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

document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

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
function updateCountdowns() {
  document.querySelectorAll('.countdown[data-target]').forEach(el => {
    const target = new Date(el.dataset.target).getTime();
    const now = Date.now();
    const diff = target - now;
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
    if (dEl) dEl.textContent = fmt(days);
    if (hEl) hEl.textContent = fmt(hours);
    if (mEl) mEl.textContent = fmt(mins);
    if (sEl) sEl.textContent = fmt(secs);
  });
}
setInterval(updateCountdowns, 1000);
updateCountdowns();

// ===== Vehicle clip segment loops =====
(function () {
  function ytCmd(iframe, func, args) {
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: func, args: args || [] }), '*'
    );
  }

  var clips = [
    { id: 'vid-falcon9',      start: 3615,  end: 3658  },
    { id: 'vid-falcon-heavy', start: 30,    end: 66    },
    { id: 'vid-dragon',       start: 14791, end: 14813 },
  ];

  clips.forEach(function (clip) {
    var iframe = document.getElementById(clip.id);
    if (!iframe) return;
    var clipMs = (clip.end - clip.start - 1) * 1000; // fire 1s before end
    var plays = 0;

    function seekBack() {
      plays++;
      if (plays > 10) return;
      ytCmd(iframe, 'seekTo', [clip.start, true]);
      ytCmd(iframe, 'playVideo');
      setTimeout(seekBack, clipMs);
    }

    setTimeout(seekBack, clipMs + 2000); // +2s initial buffer for page load
  });
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
