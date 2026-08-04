'use strict';

(() => {
  const API_URL = 'https://script.google.com/macros/s/AKfycbypuCFhBf6B15McAP4WtTe65ryExAvIoHQhpPO6TlWd5N083P8Ll-ekXlrmLJTV2uJ-jA/exec';
  const form = document.querySelector('#coachForm');
  if (!form) return;

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const panes = $$('.pane');
  const progressItems = $$('.progress li');
  let currentStep = 1;
  let callbackCount = 0;

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

  const value = (name) => form.elements[name]?.value || '';

  const showStep = (step) => {
    currentStep = Math.max(1, Math.min(4, step));
    panes.forEach((pane) => pane.classList.toggle('on', Number(pane.dataset.step) === currentStep));
    progressItems.forEach((item, index) => {
      item.classList.toggle('on', index + 1 === currentStep);
      item.classList.toggle('done', index + 1 < currentStep);
    });
    document.querySelector('.shell')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const applyValue = (name, selectedValue) => {
    if (!selectedValue) return;
    form.querySelectorAll(`[name="${name}"]`).forEach((control) => {
      if (control.type === 'radio') control.checked = control.value === selectedValue;
      else control.value = selectedValue;
      control.dispatchEvent(new Event('input', { bubbles: true }));
      control.dispatchEvent(new Event('change', { bubbles: true }));
    });
  };

  const applyInitialValues = () => {
    const params = new URLSearchParams(window.location.search);
    const allowedSports = Object.keys(coachPools);
    const planValues = ['Free', 'Pro', 'Elite'];
    const sport = params.get('sport');
    const plan = params.get('plan');
    if (allowedSports.includes(sport)) applyValue('sport', sport);
    if (planValues.includes(plan)) applyValue('plan', plan);

    try {
      const saved = JSON.parse(sessionStorage.getItem('khelSaathiPrefill') || '{}');
      ['sport', 'level', 'goal', 'mode', 'plan'].forEach((name) => applyValue(name, saved[name]));
      sessionStorage.removeItem('khelSaathiPrefill');
    } catch (error) {
      sessionStorage.removeItem('khelSaathiPrefill');
    }
  };

  const profile = () => ({
    athlete: value('athlete'), age: value('age'), city: value('city'), phone: value('phone'), email: value('email'),
    sport: value('sport'), level: value('level'), goal: value('goal'), mode: value('mode'), schedule: value('schedule'), budget: value('budget'), plan: value('plan')
  });

  const requestJsonp = (payload, timeoutMs = 16000) => new Promise((resolve, reject) => {
    callbackCount += 1;
    const callbackName = `__sportsGurukulLead_${Date.now()}_${callbackCount}`;
    const script = document.createElement('script');
    let complete = false;
    let timer;
    const cleanup = () => { window.clearTimeout(timer); script.remove(); try { delete window[callbackName]; } catch (error) { window[callbackName] = undefined; } };
    const finish = (action) => { if (complete) return; complete = true; cleanup(); action(); };
    timer = window.setTimeout(() => finish(() => reject(new Error('REQUEST_TIMEOUT'))), timeoutMs);
    window[callbackName] = (response) => finish(() => resolve(response));
    script.onerror = () => finish(() => reject(new Error('SCRIPT_LOAD_FAILED')));
    const params = new URLSearchParams({ callback: callbackName, payload: JSON.stringify(payload), _: String(Date.now()) });
    script.src = `${API_URL}?${params.toString()}`;
    document.head.appendChild(script);
  });

  const saveLead = (selectedCoach) => {
    const sessionId = sessionStorage.getItem('khelSaathiSession') || `KS-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem('khelSaathiSession', sessionId);
    requestJsonp({ action: 'saveLead', sessionId, selectedCoach, profile: profile(), source: 'Website coach match' }).catch(() => {});
  };

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
      return `<article class="coach-card"><div class="coach-avatar">${coach[1]}</div><div><div class="name-line"><h3>${coach[0]}</h3><span>✓ Verified</span></div><p>${sport} coach, ${location}</p><div class="meta"><span><b>${coach[3]}</b> experience</span><span><b>★ ${coach[4]}</b> rating</span><span><b>${coach[6]}</b></span></div><div class="tags">${coach[5].split('|').map((tag) => `<span>${tag}</span>`).join('')}</div></div><div class="score"><strong>${score}%</strong><small>match score</small><button type="button" class="choose" data-name="${coach[0]}" data-time="${coach[6]}">Choose coach</button></div></article>`;
    }).join('');
  };

  $$('.next').forEach((button) => button.addEventListener('click', () => { if (validateStep()) showStep(currentStep + 1); }));
  $$('.prev').forEach((button) => button.addEventListener('click', () => showStep(currentStep - 1)));
  form.addEventListener('input', (event) => { event.target.closest('.field')?.classList.remove('bad'); event.target.closest('.choice-group')?.classList.remove('bad'); $('.plan-error')?.classList.remove('show'); });

  $('.find')?.addEventListener('click', () => {
    const selectedPlan = $('input[name="plan"]:checked');
    $('.plan-error')?.classList.toggle('show', !selectedPlan);
    if (!selectedPlan) return;
    showStep(4);
    $('.results').hidden = true;
    $('.loading').hidden = false;
    window.setTimeout(() => { buildCoachResults(); $('.loading').hidden = true; $('.results').hidden = false; }, 1200);
  });

  $('.edit')?.addEventListener('click', () => showStep(1));
  const modal = $('.modal');
  const closeModal = () => { modal?.classList.remove('open'); modal?.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lock'); };

  document.addEventListener('click', (event) => {
    const chooseButton = event.target.closest('.choose');
    if (chooseButton) {
      $('#modalText').textContent = `${chooseButton.dataset.name} has been selected for ${value('athlete')}. Your details are ready for the coach introduction.`;
      $('.confirm').innerHTML = `<div><span>Coach</span><b>${chooseButton.dataset.name}</b></div><div><span>Sport</span><b>${value('sport')}</b></div><div><span>Membership</span><b>${planNames[value('plan')]}</b></div><div><span>Next availability</span><b>${chooseButton.dataset.time}</b></div>`;
      modal?.classList.add('open'); modal?.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock'); saveLead(chooseButton.dataset.name);
    }
    if (event.target.closest('.close-modal')) closeModal();
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });
  applyInitialValues();
})();
