const KHELSAATHI_API_URL = '';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const menu = $('.menu');
const links = $('.links');
menu?.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});
$$('.links a').forEach((link) => link.addEventListener('click', () => {
  links.classList.remove('open');
  menu?.setAttribute('aria-expanded', 'false');
}));
$('.start')?.addEventListener('click', () => $('#match')?.scrollIntoView({ behavior: 'smooth' }));
$('#year').textContent = new Date().getFullYear();

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

const form = $('#coachForm');
const panes = $$('.pane');
const progressItems = $$('.progress li');
let currentStep = 1;

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
  $$('.field', pane).forEach((field) => {
    const control = $('input, select', field);
    const isValid = control.checkValidity();
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
    const location = mode === 'Online'
      ? 'Online coaching'
      : mode === 'In person'
        ? `${coach[2]}, in person`
        : `${coach[2]}, online available`;

    return `
      <article class="coach-card">
        <div class="coach-avatar">${coach[1]}</div>
        <div>
          <div class="name-line"><h4>${coach[0]}</h4><span>✓ Verified</span></div>
          <p>${sport} coach, ${location}</p>
          <div class="meta"><span><b>${coach[3]}</b> experience</span><span><b>★ ${coach[4]}</b> rating</span><span><b>${coach[6]}</b></span></div>
          <div class="tags">${coach[5].split('|').map((tag) => `<span>${tag}</span>`).join('')}</div>
        </div>
        <div class="score"><strong>${score}%</strong><small>match score</small><button type="button" class="choose" data-name="${coach[0]}" data-time="${coach[6]}">Choose coach</button></div>
      </article>`;
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
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lock');
};

const getProfileContext = () => ({
  athlete: value('athlete'),
  age: value('age'),
  city: value('city'),
  phone: value('phone'),
  email: value('email'),
  sport: value('sport'),
  level: value('level'),
  goal: value('goal'),
  mode: value('mode'),
  schedule: value('schedule'),
  budget: value('budget'),
  plan: value('plan')
});

const postToBackend = async (payload, timeoutMs = 14000) => {
  if (!KHELSAATHI_API_URL) throw new Error('BACKEND_NOT_CONNECTED');
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(KHELSAATHI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    return await response.json();
  } finally {
    window.clearTimeout(timer);
  }
};

const saveLead = (selectedCoach) => {
  if (!KHELSAATHI_API_URL) return;
  postToBackend({
    action: 'saveLead',
    sessionId: chatSessionId,
    selectedCoach,
    profile: getProfileContext(),
    source: 'Website coach match'
  }, 9000).catch(() => {});
};

document.addEventListener('click', (event) => {
  const chooseButton = event.target.closest('.choose');
  if (chooseButton) {
    $('#modalText').textContent = `${chooseButton.dataset.name} has been selected for ${value('athlete')}. Your details are ready for the coach introduction.`;
    $('.confirm').innerHTML = `
      <div><span>Coach</span><b>${chooseButton.dataset.name}</b></div>
      <div><span>Sport</span><b>${value('sport')}</b></div>
      <div><span>Membership</span><b>${planNames[value('plan')]}</b></div>
      <div><span>Next availability</span><b>${chooseButton.dataset.time}</b></div>`;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lock');
    saveLead(chooseButton.dataset.name);
  }
  if (event.target.closest('.close-modal')) closeModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
    closeChat();
  }
});

const chatLauncher = $('.chat-launcher');
const chatPanel = $('.chat-panel');
const chatClose = $('.chat-close');
const chatForm = $('.chat-form');
const chatInput = $('#chatInput');
const chatMessages = $('.chat-messages');
const chatSendButton = $('.chat-form button');
const chatHistory = [];
const chatSessionId = sessionStorage.getItem('khelSaathiSession') || `KS-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
sessionStorage.setItem('khelSaathiSession', chatSessionId);

const openChat = () => {
  chatPanel.classList.add('open');
  chatPanel.setAttribute('aria-hidden', 'false');
  chatLauncher.setAttribute('aria-expanded', 'true');
  window.setTimeout(() => chatInput.focus(), 150);
};

function closeChat() {
  chatPanel?.classList.remove('open');
  chatPanel?.setAttribute('aria-hidden', 'true');
  chatLauncher?.setAttribute('aria-expanded', 'false');
}

chatLauncher?.addEventListener('click', () => chatPanel.classList.contains('open') ? closeChat() : openChat());
chatClose?.addEventListener('click', closeChat);

const appendMessage = (role, text) => {
  const wrapper = document.createElement('div');
  wrapper.className = `chat-message ${role}`;
  if (role === 'assistant') {
    const avatar = document.createElement('span');
    avatar.className = 'message-avatar';
    const image = document.createElement('img');
    image.src = 'assets/logo.svg';
    image.alt = '';
    avatar.appendChild(image);
    wrapper.appendChild(avatar);
  }
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.textContent = text;
  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return wrapper;
};

const showTyping = () => {
  const wrapper = document.createElement('div');
  wrapper.className = 'chat-message assistant typing';
  wrapper.innerHTML = '<span class="message-avatar"><img src="assets/logo.svg" alt=""></span><div class="message-bubble"><i></i><i></i><i></i></div>';
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return wrapper;
};

const normaliseFormUpdates = (updates = {}) => {
  const allowed = ['sport', 'level', 'goal', 'mode', 'plan'];
  return Object.fromEntries(Object.entries(updates).filter(([key, updateValue]) => allowed.includes(key) && typeof updateValue === 'string' && updateValue.trim()));
};

const applyFormUpdates = (updates) => {
  const clean = normaliseFormUpdates(updates);
  Object.entries(clean).forEach(([name, selectedValue]) => {
    const controls = $$(`[name="${name}"]`, form);
    controls.forEach((control) => {
      if (control.type === 'radio') control.checked = control.value === selectedValue;
      else control.value = selectedValue;
      control.dispatchEvent(new Event('input', { bubbles: true }));
      control.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
  showStep(clean.level || clean.goal || clean.mode ? 2 : 1);
  $('#match')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  closeChat();
};

const appendActionButton = (label, handler) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'chat-action';
  button.textContent = label;
  button.addEventListener('click', handler, { once: true });
  chatMessages.appendChild(button);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

const localKhelSaathi = (message) => {
  const text = message.toLowerCase();
  if (/(injury|injured|pain|hurt|sprain|strain)/.test(text)) {
    return {
      reply: 'I cannot diagnose an injury or suggest treatment. Please speak with a qualified medical professional before continuing training.',
      intent: 'safety',
      action: 'none',
      formUpdates: {},
      suggestions: ['Help me find a coach']
    };
  }
  if (/(price|pricing|cost|plan|membership)/.test(text)) {
    return {
      reply: 'Explorer is free for basic coach discovery. Progress is ₹499 per month for regular development support. Performance is ₹1,999 per month for competitive or professional pathway goals. Tell me the athlete’s level and main goal, and I can suggest one.',
      intent: 'plan_guidance',
      action: 'scroll_to_plans',
      formUpdates: {},
      suggestions: ['Beginner athlete', 'Competitive athlete']
    };
  }
  if (/(parent|child|son|daughter)/.test(text)) {
    return {
      reply: 'I can help. Tell me your child’s age, sport and current level. I will guide you towards the right coaching type and plan.',
      intent: 'parent_guidance',
      action: 'none',
      formUpdates: {},
      suggestions: ['Help me choose a level', 'Show the coach form']
    };
  }
  if (/(how.*match|matching work|find.*coach|right coach)/.test(text)) {
    return {
      reply: 'Coach matching uses the athlete’s sport, level, goal, city, coaching preference, schedule and budget. Complete the profile and you will receive relevant verified coach options.',
      intent: 'coach_matching',
      action: 'scroll_to_match',
      formUpdates: {},
      suggestions: ['Start my profile', 'Which plan suits me?']
    };
  }
  const sportMatch = ['Cricket', 'Football', 'Badminton', 'Basketball', 'Athletics', 'Tennis'].find((sport) => text.includes(sport.toLowerCase()));
  if (sportMatch) {
    return {
      reply: `Great, ${sportMatch} is available. Tell me whether the athlete is a beginner, intermediate, competitive or advanced, and what they want to improve.`,
      intent: 'sport_guidance',
      action: 'prefill_form',
      formUpdates: { sport: sportMatch },
      suggestions: ['Beginner', 'Intermediate', 'Prepare for competition']
    };
  }
  return {
    reply: 'Tell me the sport, current playing level and main goal. I can suggest the next step, explain the plans or help fill the coach matching form.',
    intent: 'general_guidance',
    action: 'none',
    formUpdates: {},
    suggestions: ['Find the right coach', 'Choose a plan']
  };
};

const handleAssistantResponse = (response) => {
  const reply = response?.reply || 'I could not complete that request right now. You can still use the coach matching form below.';
  appendMessage('assistant', reply);
  chatHistory.push({ role: 'assistant', content: reply });

  const updates = normaliseFormUpdates(response?.formUpdates);
  if (Object.keys(updates).length) {
    appendActionButton('Use these details', () => applyFormUpdates(updates));
  } else if (response?.action === 'scroll_to_match') {
    appendActionButton('Open coach matching', () => {
      $('#match')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closeChat();
    });
  } else if (response?.action === 'scroll_to_plans') {
    appendActionButton('View membership plans', () => {
      $('#plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closeChat();
    });
  }

  if (Array.isArray(response?.suggestions) && response.suggestions.length) {
    const suggestions = $('.chat-suggestions');
    suggestions.innerHTML = '';
    response.suggestions.slice(0, 4).forEach((suggestion) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.message = suggestion;
      button.textContent = suggestion;
      suggestions.appendChild(button);
    });
  }
};

const sendChatMessage = async (message) => {
  const cleanMessage = message.trim();
  if (!cleanMessage) return;
  appendMessage('user', cleanMessage);
  chatHistory.push({ role: 'user', content: cleanMessage });
  chatInput.value = '';
  chatInput.style.height = '';
  chatSendButton.disabled = true;
  const typing = showTyping();

  try {
    let response;
    if (KHELSAATHI_API_URL) {
      response = await postToBackend({
        action: 'chat',
        sessionId: chatSessionId,
        message: cleanMessage,
        history: chatHistory.slice(-10),
        profile: getProfileContext(),
        page: {
          section: location.hash || '#top',
          plans: planNames
        }
      });
    } else {
      await new Promise((resolve) => setTimeout(resolve, 500));
      response = localKhelSaathi(cleanMessage);
    }
    typing.remove();
    handleAssistantResponse(response);
  } catch (error) {
    typing.remove();
    handleAssistantResponse(localKhelSaathi(cleanMessage));
  } finally {
    chatSendButton.disabled = false;
    chatInput.focus();
  }
};

chatForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  sendChatMessage(chatInput.value);
});

chatInput?.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = `${Math.min(chatInput.scrollHeight, 104)}px`;
});
chatInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

$('.chat-suggestions')?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-message]');
  if (!button) return;
  openChat();
  sendChatMessage(button.dataset.message);
});