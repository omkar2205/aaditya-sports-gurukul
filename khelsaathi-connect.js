(() => {
  const API_URL = 'https://script.google.com/macros/s/AKfycbypuCFhBf6B15McAP4WtTe65ryExAvIoHQhpPO6TlWd5N083P8Ll-ekXlrmLJTV2uJ-jA/exec';
  const VERSION = '20260805-5';

  const originalForm = document.querySelector('.chat-form');
  const originalSuggestions = document.querySelector('.chat-suggestions');
  if (!originalForm || !originalSuggestions) return;

  // Clone these controls to remove the older local-fallback event listeners.
  const chatForm = originalForm.cloneNode(true);
  const suggestions = originalSuggestions.cloneNode(true);
  originalForm.replaceWith(chatForm);
  originalSuggestions.replaceWith(suggestions);

  const chatInput = chatForm.querySelector('#chatInput');
  const chatMessages = document.querySelector('.chat-messages');
  const coachForm = document.querySelector('#coachForm');
  const statusElement = document.querySelector('.chat-identity small');
  const sendButton = chatForm.querySelector('button[type="submit"]');
  if (!chatInput || !chatMessages) return;

  const history = [];
  const sessionId = sessionStorage.getItem('khelSaathiSession') || `KS-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  sessionStorage.setItem('khelSaathiSession', sessionId);

  const setStatus = (state, label) => {
    if (!statusElement) return;
    statusElement.classList.add('chat-status');
    statusElement.dataset.state = state;
    statusElement.innerHTML = `<i></i><span>${label}</span>`;
  };

  const getProfile = () => {
    const value = (name) => coachForm?.elements?.[name]?.value || '';
    return {
      age: value('age'), city: value('city'), sport: value('sport'),
      level: value('level'), goal: value('goal'), mode: value('mode'),
      schedule: value('schedule'), budget: value('budget'), plan: value('plan')
    };
  };

  const trustedOrigin = (origin) => (
    origin === 'https://script.google.com' ||
    origin === 'https://script.googleusercontent.com' ||
    /^https:\/\/[^/]+\.googleusercontent\.com$/.test(origin)
  );

  const requestBackend = (payload, timeoutMs = 24000) => new Promise((resolve, reject) => {
    const requestId = payload.requestId || `WEB-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const frameName = `ksFrame_${requestId.replace(/[^a-zA-Z0-9_]/g, '')}`;
    const iframe = document.createElement('iframe');
    const form = document.createElement('form');
    const input = document.createElement('input');
    let completed = false;

    iframe.name = frameName;
    iframe.hidden = true;
    iframe.setAttribute('aria-hidden', 'true');
    form.method = 'POST';
    form.action = API_URL;
    form.target = frameName;
    form.hidden = true;
    input.type = 'hidden';
    input.name = 'payload';
    input.value = JSON.stringify({
      ...payload,
      requestId,
      transport: 'iframe',
      origin: window.location.origin,
      history: Array.isArray(payload.history)
        ? payload.history.slice(-6).map((item) => ({
            role: item.role === 'assistant' ? 'assistant' : 'user',
            content: String(item.content || '').slice(0, 500)
          }))
        : []
    });
    form.appendChild(input);

    const cleanup = () => {
      window.removeEventListener('message', onMessage);
      iframe.remove();
      form.remove();
    };
    const finish = (fn) => {
      if (completed) return;
      completed = true;
      clearTimeout(timer);
      cleanup();
      fn();
    };
    const onMessage = (event) => {
      if (!trustedOrigin(event.origin)) return;
      if (!event.data || event.data.source !== 'KhelSaathiBackend') return;
      if (event.data.requestId !== requestId) return;
      finish(() => resolve(event.data.data));
    };

    const timer = setTimeout(() => finish(() => reject(new Error('REQUEST_TIMEOUT'))), timeoutMs);
    window.addEventListener('message', onMessage);
    document.body.appendChild(iframe);
    document.body.appendChild(form);
    form.submit();
  });

  const appendMessage = (role, text, meta = '') => {
    const wrapper = document.createElement('div');
    wrapper.className = `chat-message ${role}`;
    if (role === 'assistant') {
      const avatar = document.createElement('span');
      avatar.className = 'message-avatar';
      avatar.innerHTML = '<img src="assets/logo.svg" alt="">';
      wrapper.appendChild(avatar);
    }
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;
    if (meta) {
      const detail = document.createElement('small');
      detail.className = 'chat-response-meta';
      detail.textContent = meta;
      bubble.appendChild(detail);
    }
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

  const updateSuggestions = (items = []) => {
    suggestions.innerHTML = '';
    const safeItems = items.length ? items : ['Find the right coach', 'Choose a plan'];
    safeItems.slice(0, 4).forEach((item) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.message = item;
      button.textContent = item;
      suggestions.appendChild(button);
    });
  };

  const applyUpdates = (updates = {}) => {
    const allowed = ['sport', 'level', 'goal', 'mode', 'plan'];
    Object.entries(updates).forEach(([name, selectedValue]) => {
      if (!allowed.includes(name) || !selectedValue || !coachForm) return;
      coachForm.querySelectorAll(`[name="${name}"]`).forEach((control) => {
        if (control.type === 'radio') control.checked = control.value === selectedValue;
        else control.value = selectedValue;
        control.dispatchEvent(new Event('input', { bubbles: true }));
        control.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
    document.querySelector('#match')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.querySelector('.chat-close')?.click();
  };

  const addActionButton = (label, handler) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chat-action';
    button.textContent = label;
    button.addEventListener('click', handler, { once: true });
    chatMessages.appendChild(button);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const renderResponse = (response) => {
    const reply = response.reply || 'KhelSaathi could not prepare a response just now.';
    const meta = response.requestId ? `Request ${response.requestId}` : '';
    appendMessage('assistant', reply, response.ok ? '' : meta);
    history.push({ role: 'assistant', content: reply });

    const updates = response.formUpdates || {};
    if (Object.values(updates).some(Boolean)) {
      addActionButton('Use these details', () => applyUpdates(updates));
    } else if (response.action === 'scroll_to_match') {
      addActionButton('Open coach matching', () => {
        document.querySelector('#match')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        document.querySelector('.chat-close')?.click();
      });
    } else if (response.action === 'scroll_to_plans') {
      addActionButton('View membership plans', () => {
        document.querySelector('#plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        document.querySelector('.chat-close')?.click();
      });
    }
    updateSuggestions(Array.isArray(response.suggestions) ? response.suggestions : []);
  };

  const sendMessage = async (message) => {
    const clean = String(message || '').trim();
    if (!clean || sendButton?.disabled) return;

    appendMessage('user', clean);
    const previousHistory = history.slice(-6);
    history.push({ role: 'user', content: clean });
    chatInput.value = '';
    chatInput.style.height = '';
    if (sendButton) sendButton.disabled = true;
    const typing = showTyping();

    try {
      setStatus('checking', 'KhelSaathi is thinking');
      const response = await requestBackend({
        action: 'chat',
        sessionId,
        message: clean,
        history: previousHistory,
        profile: getProfile()
      });
      typing.remove();

      if (!response?.ok) {
        setStatus('error', response?.errorCode || 'Connection issue');
        renderResponse(response || {
          ok: false,
          reply: 'KhelSaathi could not reach the AI service. Please try again shortly.'
        });
        return;
      }

      setStatus('connected', 'AI connected');
      renderResponse(response);
    } catch (error) {
      typing.remove();
      setStatus('error', 'Connection issue');
      renderResponse({
        ok: false,
        reply: 'KhelSaathi could not connect to the backend. Please refresh the page and try again.',
        requestId: String(error?.message || 'NETWORK_ERROR'),
        suggestions: ['Try again', 'Open coach matching']
      });
    } finally {
      if (sendButton) sendButton.disabled = false;
      chatInput.focus();
    }
  };

  chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage(chatInput.value);
  });

  chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      chatForm.requestSubmit();
    }
  });

  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = `${Math.min(chatInput.scrollHeight, 104)}px`;
  });

  suggestions.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-message]');
    if (!button) return;
    sendMessage(button.dataset.message);
  });

  const checkHealth = async () => {
    setStatus('checking', 'Checking connection');
    try {
      const health = await requestBackend({ action: 'health' }, 15000);
      if (health?.spreadsheet?.ok && health?.groq?.apiKeyConfigured) {
        setStatus('ready', 'Backend ready');
      } else {
        setStatus('error', 'Setup incomplete');
      }
    } catch (error) {
      setStatus('error', 'Backend unavailable');
    }
  };

  updateSuggestions(Array.from(suggestions.querySelectorAll('button')).map((button) => button.dataset.message || button.textContent));
  setTimeout(checkHealth, 250);
})();