'use strict';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const topBar = $('.top');
const menu = $('.menu');
const links = $('.links');

const updateHeader = () => {
  if (!topBar) return;
  topBar.classList.toggle('scrolled', window.scrollY > 24 || document.body.classList.contains('subpage'));
};
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menu?.addEventListener('click', () => {
  const open = links?.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(Boolean(open)));
});

$$('.links a').forEach((link) => link.addEventListener('click', () => {
  links?.classList.remove('open');
  menu?.setAttribute('aria-expanded', 'false');
}));

const year = $('#year');
if (year) year.textContent = new Date().getFullYear();

const heroVideo = $('.hero-video');
const videoToggle = $('#heroVideoToggle');
videoToggle?.addEventListener('click', () => {
  if (!heroVideo) return;
  if (heroVideo.paused) {
    heroVideo.play().catch(() => {});
    videoToggle.innerHTML = '<span>Ⅱ</span> Pause video';
    videoToggle.setAttribute('aria-label', 'Pause background video');
  } else {
    heroVideo.pause();
    videoToggle.innerHTML = '<span>▶</span> Play video';
    videoToggle.setAttribute('aria-label', 'Play background video');
  }
});

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  heroVideo?.pause();
  if (videoToggle) videoToggle.hidden = true;
}

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px' });
  $$('.reveal').forEach((element) => revealObserver.observe(element));
} else {
  $$('.reveal').forEach((element) => element.classList.add('visible'));
}

const animateCounter = (element) => {
  const target = Number(element.dataset.target || 0);
  const duration = 950;
  const started = performance.now();
  const update = (now) => {
    const progress = Math.min((now - started) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.floor(target * eased).toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
};

if ('IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.45 });
  $$('.counter').forEach((counter) => counterObserver.observe(counter));
} else {
  $$('.counter').forEach(animateCounter);
}

const scrollRail = (id, direction) => {
  const rail = document.getElementById(id);
  if (!rail) return;
  const firstCard = rail.firstElementChild;
  const distance = firstCard ? firstCard.getBoundingClientRect().width + 16 : rail.clientWidth * .8;
  rail.scrollBy({ left: distance * direction, behavior: 'smooth' });
};

document.addEventListener('click', (event) => {
  const previous = event.target.closest('[data-rail-prev]');
  const next = event.target.closest('[data-rail-next]');
  if (previous) scrollRail(previous.dataset.railPrev, -1);
  if (next) scrollRail(next.dataset.railNext, 1);

  if (event.target.closest('[data-open-chat]')) {
    event.preventDefault();
    $('#ksLauncher')?.click();
  }
});

const contactForm = $('#contactForm');
contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  const status = $('#contactStatus');
  if (status) status.textContent = 'The form is ready to connect once the final contact email and backend are confirmed.';
});
