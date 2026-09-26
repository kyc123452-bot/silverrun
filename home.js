(() => {
  // Preserve bookmarked links from the former one-page layout.
  const legacyPages = {
    greeting: 'about.html', admission: 'admission.html',
    'namyangju-care': 'center-guide.html', facility: 'facility.html',
    location: 'location.html', contact: 'contact.html',
  };
  if (document.body.classList.contains('reference-home')) {
    const followLegacyLink = () => {
      const page = legacyPages[location.hash.slice(1)];
      if (page) location.replace(new URL(page, location.href).href);
    };
    followLegacyLink();
    window.addEventListener('hashchange', followLegacyLink);
  }

  const portrait = document.querySelector('[data-service-portrait]');
  document.querySelectorAll('[data-service-image]').forEach((row) => {
    row.addEventListener('toggle', () => {
      if (!row.open || !portrait) return;
      portrait.src = row.dataset.serviceImage;
      portrait.alt = row.dataset.serviceAlt;
    });
  });
})();

// Facility photography: automatic fade, direct selection and an explicit pause control.
(() => {
  const container = document.querySelector('[data-hero-slides]');
  if (!container) return;
  const slides = [...container.querySelectorAll('.hero-slide')];
  const buttons = [...document.querySelectorAll('[data-hero-slide]')];
  const toggle = document.querySelector('[data-hero-slide-toggle]');
  const count = document.querySelector('[data-hero-slide-count]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  let paused = motion.matches;
  let timer;
  const schedule = () => {
    clearTimeout(timer);
    if (!paused && !document.hidden) timer = setTimeout(() => show((active + 1) % slides.length), 5000);
  };
  const show = (next) => {
    active = next;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === active);
      slide.setAttribute('aria-hidden', String(i !== active));
      buttons[i].setAttribute('aria-pressed', String(i === active));
    });
    if (count) count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    schedule();
  };
  const syncPause = () => {
    if (toggle) {
      toggle.setAttribute('aria-label', paused ? '사진 자동 전환 재생' : '사진 자동 전환 일시정지');
      toggle.firstElementChild.textContent = paused ? '▶' : 'Ⅱ';
    }
    schedule();
  };
  buttons.forEach((button, i) => button.addEventListener('click', () => show(i)));
  toggle?.addEventListener('click', () => { paused = !paused; syncPause(); });
  motion.addEventListener('change', () => { paused = motion.matches; syncPause(); });
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('pagehide', () => clearTimeout(timer));
  window.addEventListener('pageshow', schedule);
  syncPause();
})();

(() => {
  const strip = document.querySelector('[data-logo-marquee]');
  const button = document.querySelector('[data-logo-motion-toggle]');
  if (!strip || !button) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = motion.matches;
  const sync = () => {
    strip.classList.toggle('is-paused', paused);
    strip.classList.toggle('is-playing', !paused);
    button.setAttribute('aria-label', paused ? '로고 이동 재생' : '로고 이동 일시정지');
    button.firstElementChild.textContent = paused ? '▶' : 'Ⅱ';
  };
  button.addEventListener('click', () => { paused = !paused; sync(); });
  motion.addEventListener('change', () => { paused = motion.matches; sync(); });
  sync();
})();

// Subtle, one-time entrances; content remains visible without animation support.
(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;

  const candidates = [...document.querySelectorAll([
    '.services-copy', '.service-portrait', '.service-moments > h2',
    '.service-moments-grid > a', '.arch-photo', '.feature-copy',
    '.information-heading', '.info-card', '.image-link', '.closing-message',
    '.guide-section', '.program-stories > article', '.greeting-detail',
    '.philosophy', '.local-search-layout', '.location-grid', '.related-guides',
  ].join(', '))];
  const targets = candidates.filter((element) => !candidates.some((parent) => parent !== element && parent.contains(element)));
  const animations = new Set();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      observer.unobserve(target);
      if (motion.matches) return;
      const siblings = [...target.parentElement.children];
      const stagger = target.matches('.info-card, .service-moments-grid > a, .image-link')
        ? Math.min(siblings.indexOf(target) * 55, 165) : 0;
      const animation = target.animate([
        { opacity: 0.65, transform: 'translateY(14px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: 560, delay: stagger, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' });
      animations.add(animation);
      animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

  targets.forEach((target) => {
    const rect = target.getBoundingClientRect();
    // Keep the opening screen and restored scroll positions immediately readable.
    if (rect.top < window.innerHeight && rect.bottom > 0) return;
    observer.observe(target);
  });
  motion.addEventListener('change', () => {
    if (!motion.matches) return;
    observer.disconnect();
    animations.forEach((animation) => animation.cancel());
    animations.clear();
  });
})();
