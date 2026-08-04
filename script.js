const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

const closeMenu = () => {
  navigation?.classList.remove('open');
  menuButton?.classList.remove('active');
  menuButton?.setAttribute('aria-expanded', 'false');
};

menuButton?.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuButton.classList.toggle('active', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.site-nav a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 18);
}, { passive: true });

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const animateCounter = (element) => {
  const target = Number(element.dataset.target || 0);
  const duration = target > 100 ? 1300 : 900;
  const startTime = performance.now();

  const tick = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.floor(target * eased).toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    animateCounter(entry.target);
    observer.unobserve(entry.target);
  });
}, { threshold: 0.6 });

document.querySelectorAll('.counter').forEach((counter) => counterObserver.observe(counter));

const testimonials = [...document.querySelectorAll('.testimonial')];
const dotsContainer = document.querySelector('.slider-dots');
let testimonialIndex = 0;
let autoplayTimer;

const showTestimonial = (index) => {
  testimonialIndex = (index + testimonials.length) % testimonials.length;
  testimonials.forEach((testimonial, position) => {
    testimonial.classList.toggle('active', position === testimonialIndex);
  });
  document.querySelectorAll('.slider-dots button').forEach((dot, position) => {
    dot.classList.toggle('active', position === testimonialIndex);
    dot.setAttribute('aria-current', position === testimonialIndex ? 'true' : 'false');
  });
};

const restartAutoplay = () => {
  window.clearInterval(autoplayTimer);
  autoplayTimer = window.setInterval(() => showTestimonial(testimonialIndex + 1), 6500);
};

testimonials.forEach((_, index) => {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.setAttribute('aria-label', `Show testimonial ${index + 1}`);
  dot.addEventListener('click', () => {
    showTestimonial(index);
    restartAutoplay();
  });
  dotsContainer?.appendChild(dot);
});

showTestimonial(0);
restartAutoplay();

document.querySelector('.slider-button--prev')?.addEventListener('click', () => {
  showTestimonial(testimonialIndex - 1);
  restartAutoplay();
});

document.querySelector('.slider-button--next')?.addEventListener('click', () => {
  showTestimonial(testimonialIndex + 1);
  restartAutoplay();
});

document.querySelectorAll('.accordion__item button').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.accordion__item');
    const wasActive = item.classList.contains('active');
    document.querySelectorAll('.accordion__item').forEach((accordionItem) => {
      accordionItem.classList.remove('active');
    });
    if (!wasActive) item.classList.add('active');
  });
});

const form = document.querySelector('#enquiryForm');
const toast = document.querySelector('.toast');
let toastTimer;

const hideToast = () => toast?.classList.remove('show');

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const originalContent = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.textContent = 'Submitting…';

  window.setTimeout(() => {
    form.reset();
    submitButton.disabled = false;
    submitButton.innerHTML = originalContent;
    toast?.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(hideToast, 5200);
  }, 650);
});

toast?.querySelector('button')?.addEventListener('click', hideToast);

document.querySelector('#year').textContent = new Date().getFullYear();

window.addEventListener('resize', () => {
  if (window.innerWidth > 820) closeMenu();
});
