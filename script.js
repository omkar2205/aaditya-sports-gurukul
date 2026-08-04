'use strict';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const topBar = $('.top');
const menu = $('.menu');
const links = $('.links');
const form = $('#coachForm');
const panes = $$('.pane');
const progressItems = $$('.progress li');
let currentStep = 1;

const updateHeader = () => topBar?.classList.toggle('scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menu?.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});
$$('.links a').forEach((link) => link.addEventListener('click', () => {
  links.classList.remove('open');
  menu?.setAttribute('aria-expanded', 'false');
}));

$('.start')?.addEventListener('click', () => $('#match')?.scrollIntoView({ behavior: 'smooth' }));
if ($('#year')) $('#year').textContent = new Date().getFullYear();

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

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.14, rootMargin: '0px 0px -40px' });
$$('.reveal').forEach((element) => revealObserver.observe(element));

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

const counterObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    animateCounter(entry.target);
    observer.unobserve(entry.target);
  });
}, { threshold: 0.45 });
$$('.counter').forEach((counter) => counterObserver.observe(counter));

const journeyContent = {
  1: ['Profile created', '25%', 'Improve performance', 'Add availability', 'Profile ready'],
  2: ['Recording added', '50%', 'Movement captured', 'Review performance', 'Clip uploaded'],
  3: ['Coaches matched', '75%', 'Three relevant profiles', 'Compare coaches', '96% top match'],
  4: ['Training started', '100%', 'Development plan active', 'Track progress', 'Journey active']
};

const setJourney = (step) => {
  const content = journeyContent[step];
  if (!content) return;
  $$('.journey-step').forEach((item) => item.classList.toggle('active', Number(item.dataset.journey) === step));
  if ($('#journeyTitle')) $('#journeyTitle').textContent = content[0];
  if ($('#journeyProgress')) $('#journeyProgress').textContent = content[1];
  if ($('#journeyBar')) $('#journeyBar').style.width = content[1];
  if ($('#journeyMetric')) $('#journeyMetric').textContent = content[2];
  if ($('#journeyAction')) $('#journeyAction').textContent = content[3];
  if ($('#journeyBadge')) $('#journeyBadge').textContent = content[4];
};

const journeyObserver = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (visible) setJourney(Number(visible.target.dataset.journey));
}, { threshold: [0.45, 0.7] });
$$('.journey-step').forEach((step) => journeyObserver.observe(step));

$$('.sport-visual').forEach((button) => button.addEventListener('click', () => {
  const sport = button.dataset.sport;
  const control = form?.querySelector(`input[name="sport"][value="${sport}"]`);
  if (control) {
    control.checked = true;
    control.dispatchEvent(new Event('change', { bubbles: true }));
  }
  $('#match')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}));

$('#askKhelSaathi')?.addEventListener('click', () => $('#ksLauncher')?.click());
$('#footerChat')?.addEventListener('click', () => $('#ksLauncher')?.click());

const contactForm = $('#contactForm');
contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const status = $('#contactStatus');
  if (status) status.textContent = 'The contact form is ready to connect once the final contact details are confirmed.';
});

const planNames = {
  Free: 'Explorer, Free',
  Pro: 'Progress, ₹499/month',
  Elite: 'Performance, ₹1,999/month'
};

const coachPools = {
  Cricket: [
    ['Rahul Kapoor', 'RK', 'Mumbai', '11 years', '4.8', 'Batting technique|Match awareness', 'Tomorrow, 6:30 PM'],
    ['Vikram Desai', 'VD', 'Pune', '9 years', '4.9', 'Fast bowling|Strength', 'Saturday, 8:00 AM'],
    ['Neha Kulkarni', 'NK', 'Online', '7 years', '4.8', 'Mental preparation|Video review', 'Friday, 7:00 PM']
  ],
  Football: [
    ['Arjun Nair', 'AN', 'Bengaluru', '9 years', '4.9', 'Technique|Fitness', 'Tomorrow, 5:30 PM'],
    ['Sameer Khan', 'SK', 'Mumbai', '12 years', '4.8', 'Positioning|Match intelligence', 'Sunday, 9:00 AM'],
    ['Riya Thomas', 'RT', 'Online', '6 years', '4.7', 'Ball control|Youth development', 'Friday, 6:00 PM']
  ],
  Badminton: [
    ['Meera Sharma', 'MS', 'Pune', '8 years', '4.9', 'Footwork|Match strategy', 'Tomorrow, 6:00 PM'],
    ['Karan Malhotra', 'KM', 'Mumbai', '10 years', '4.8', 'Smash technique|Competition preparation', 'Saturday, 7:30 AM'],
    ['Anjali Rao', 'AR', 'Online', '7 years', '4.8', 'Movement|Video analysis', 'Friday, 7:30 PM']
  ],
  Basketball: [
    ['Dev Mehta', 'DM', 'Pune', '8 years', '4.8', 'Shooting|Court awareness', 'Tomorrow, 7:00 PM'],
    ['Ishita Menon', 'IM', 'Bengaluru', '7 years', '4.9', 'Ball handling|Conditioning', 'Saturday, 9:00 AM'],
    ['Nikhil Shah', 'NS', 'Online', '9 years', '4.7', 'Game review|Decision making', 'Sunday, 5:00 PM']
  ],
  Athletics: [
    ['Priya Iyer', 'PI', 'Pune', '10 years', '4.9', 'Sprint mechanics|Mobility', 'Tomorrow, 6:00 AM'],
    ['Rohan Singh', 'RS', 'Delhi', '12 years', '4.8', 'Endurance|Race planning', 'Saturday, 6:30 AM'],
    ['Tanya Bose', 'TB', 'Online', '7 years', '4.8', 'Technique review|Strength', 'Friday, 6:30 PM']
  ],
  Tennis: [
    ['Sanjay Patel', 'SP', 'Pune', '11 years', '4.9', 'Serve|Match tactics', 'Tomorrow, 5:00 PM'],
    ['Kavya Reddy', 'KR', 'Hyderabad', '8 years', '4.8', 'Footwork|Consistency', 'Saturday, 8:30 AM'],
    ['Aman Verma', 'AV', 'Online', '9 years', '4.7', 'Video review|Mental game', 'Sunday, 6:00 PM']
  ]
};

const value = (name) => form?.elements[name]?.value || '';

const showStep = (step) => {
  currentStep = step;
  panes.forEach((pane) => pane.classList.toggle('on', Number(pane.dataset.step) === step));
  progressItems.forEach((item, index) => {
    item.classList.toggle('on', index + 1 === step);
    item.classList.toggle('done', index + 1 < step);
  });
  $('.shell')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const validateStep = () => {
  let valid = true;
  const pane = panes[currentStep - 1];
  if (!pane) return false;
  $$('.field', pane).forEach((field) => {
    const control = $('input, select', field);
    const isValid = control?.checkValidity() ?? true;
    field.classList.toggle('bad', !isValid);
    if (!isValid) valid = false;
  });
  const requiredGroups = [...new Set($$('input[type="radio"][required]', pane).map((input) => input.name))];
  requiredGroups.forEach((name) => {
    const firstInput = $(`input[name="${name}"]`, pane);
    const group = firstInput?.closest('.choice-group');
    const isValid = Boolean($(`input[name="${name}"]:checked`, pane));
    group?.classList.toggle('bad', !isValid);
    if (!isValid) valid = false;
  });
  return valid;
};

$$('.next').forEach((button) => button.addEventListener('click', () => {
  if (validateStep()) showStep(currentStep + 1);
}));
$$('.prev').forEach((button) => button.addEventListener('click', () => showStep(currentStep - 1)));

form?.addEventListener('input', (event) => {
  event.target.closest('.field')?.classList.remove('bad');
  event.target.closest('.choice-group')?.classList.remove('bad');
  $('.plan-error')?.classList.remove('show');
});

const buildCoachResults = () => {
  const sport = value('sport');
  const city = value('city');
  const mode = value('mode');
  const coaches = coachPools[sport] || coachPools.Cricket;
  const firstName = value('athlete').trim().split(' ')[0] || 'Athlete';

  $('#firstName').textContent = firstName;
  $('#resultText').textContent = `${sport} coaches selected for a ${value('level').toLowerCase()} athlete focused on ${value('goal').toLowerCase()}.`;
  $('#summaryPlan').textContent = planNames[value('plan')];
  $('#summaryMode').textContent = mode;
  $('#summarySchedule').textContent = value('schedule');

  $('.coach-list').innerHTML = coaches.map((coach, index) => {
    const sameCity = coach[2].toLowerCase() === city.toLowerCase();
    const score = Math.max(86, 96 - index * 4 + (sameCity ? 2 : 0));
    const location = mode === 'Online' ? 'Online coaching' : mode === 'In person' ? `${coach[2]}, in person` : `${coach[2]}, online available`;
    return `<article class="coach-card"><div class="coach-avatar">${coach[1]}</div><div><div class="name-line"><h4>${coach[0]}</h4><span>✓ Verified</span></div><p>${sport} coach, ${location}</p><div class="meta"><span><b>${coach[3]}</b> experience</span><span><b>★ ${coach[4]}</b> rating</span><span><b>${coach[6]}</b></span></div><div class="tags">${coach[5].split('|').map((tag) => `<span>${tag}</span>`).join('')}</div></div><div class="score"><strong>${score}%</strong><small>match score</small><button type="button" class="choose" data-name="${coach[0]}" data-time="${coach[6]}">Choose coach</button></div></article>`;
  }).join('');
};

$('.find')?.addEventListener('click', () => {
  const selectedPlan = $('input[name="plan"]:checked');
  $('.plan-error')?.classList.toggle('show', !selectedPlan);
  if (!selectedPlan) return;
  showStep(4);
  $('.results').hidden = true;
  $('.loading').hidden = false;
  setTimeout(() => {
    buildCoachResults();
    $('.loading').hidden = true;
    $('.results').hidden = false;
  }, 1500);
});

$('.edit')?.addEventListener('click', () => showStep(1));

const modal = $('.modal');
const closeModal = () => {
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lock');
};

document.addEventListener('click', (event) => {
  const chooseButton = event.target.closest('.choose');
  if (chooseButton) {
    $('#modalText').textContent = `${chooseButton.dataset.name} has been selected for ${value('athlete')}. Your details are ready for the coach introduction.`;
    $('.confirm').innerHTML = `<div><span>Coach</span><b>${chooseButton.dataset.name}</b></div><div><span>Sport</span><b>${value('sport')}</b></div><div><span>Membership</span><b>${planNames[value('plan')]}</b></div><div><span>Next availability</span><b>${chooseButton.dataset.time}</b></div>`;
    modal?.classList.add('open');
    modal?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lock');
  }
  if (event.target.closest('.close-modal')) closeModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
});
