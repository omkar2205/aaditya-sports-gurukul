(() => {
  'use strict';

  const API_URL = 'https://script.google.com/macros/s/AKfycbypuCFhBf6B15McAP4WtTe65ryExAvIoHQhpPO6TlWd5N083P8Ll-ekXlrmLJTV2uJ-jA/exec';
  const launcher = document.querySelector('#ksLauncher');
  const panel = document.querySelector('#ksChat');
  const closeButton = document.querySelector('#ksClose');
  const status = document.querySelector('#ksStatus');
  const messages = document.querySelector('#ksMessages');
  const quick = document.querySelector('#ksQuick');
  const form = document.querySelector('#ksForm');
  const input = document.querySelector('#ksInput');
  const sendButton = form?.querySelector('button[type="submit"]');
  const coachForm = document.querySelector('#coachForm');

  if (!launcher || !panel || !messages || !form || !input) return;

  const sessionId = sessionStorage.getItem('khelSaathiSession') || `KS-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  sessionStorage.setItem('khelSaathiSession', sessionId);
  const history = [];
  let callbackCount = 0;
  let busy = false;

  const messageIcon = `
    <span class="ks-message-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6A8.38 8.38 0 0 1 12.5 3h.5a8.48 8.48 0 0 1 8 8z"/></svg>
    </span>`;

  const setStatus = (state, label) => {
    if (!status) return;
    status.dataset.state = state;
    status.innerHTML = `<i></i>${label}`;
  };

  const openChat = () => {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    launcher.setAttribute('aria-expanded', 'true');
    window.setTimeout(() => input.focus(), 120);
  };

  const closeChat = () => {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    launcher.setAttribute('aria-expanded', 'false');
  };

  const profile = () => {
    const value = (name) => coachForm?.elements?.[name]?.value || '';
    return {
      age: value('age'),
      city: value('city'),
      sport: value('sport'),
      level: value('level'),
      goal: value('goal'),
      mode: value('mode'),
      schedule: value('schedule'),
      budget: value('budget'),
      plan: value('plan')
    };
  };

  const requestJsonp = (payload, timeoutMs = 30000) => new Promise((resolve, reject) => {
    callbackCount += 1;
    const callbackName = `__khelSaathi_${Date.now()}_${callbackCount}`;
    const script = document.createElement('script');
    let complete = false;
    let timer;

    const cleanup = () => {
      window.clearTimeout(timer);
      script.remove();
      try { delete window[callbackName]; } catch (error) { window[callbackName] = undefined; }
    };

    const finish = (action) => {
      if (complete) return;
      complete = true;
      cleanup();
      action();
    };

    timer = window.setTimeout(() => finish(() => reject(new Error('REQUEST_TIMEOUT'))), timeoutMs);
    window[callbackName] = (response) => finish(() => resolve(response));
    script.onerror = () => finish(() => reject(new Error('SCRIPT_LOAD_FAILED')));

    const safePayload = {
      ...payload,
      requestId: payload.requestId || `WEB-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      history: Array.isArray(payload.history)
        ? payload.history.slice(-4).map((item) => ({
            role: item.role === 'assistant' ? 'assistant' : 'user',
            content: String(item.content || '').slice(0, 320)
          }))
        : []
    };

    const params = new URLSearchParams({
      callback: callbackName,
      payload: JSON.stringify(safePayload),
      _: String(Date.now())
    });
    script.src = `${API_URL}?${params.toString()}`;
    document.head.appendChild(script);
  });

  const appendMessage = (role, text) => {
    const row = document.createElement('div');
    row.className = `ks-row ${role === 'user' ? 'ks-user' : 'ks-assistant'}`;
    if (role !== 'user') row.insertAdjacentHTML('beforeend', messageIcon);
    const bubble = document.createElement('div');
    bubble.className = 'ks-bubble';
    bubble.textContent = text;
    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    return row;
  };

  const showTyping = () => {
    const row = document.createElement('div');
    row.className = 'ks-row ks-assistant ks-typing';
    row.innerHTML = `${messageIcon}<div class="ks-bubble"><i></i><i></i><i></i></div>`;
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    return row;
  };

  const addAction = (label, handler) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ks-action';
    button.textContent = label;
    button.addEventListener('click', handler, { once: true });
    messages.appendChild(button);
    messages.scrollTop = messages.scrollHeight;
  };

  const updateQuickReplies = (items = []) => {
    if (!quick || !Array.isArray(items) || !items.length) return;
    quick.innerHTML = '';
    items.slice(0, 4).forEach((item) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.message = item;
      button.textContent = item;
      quick.appendChild(button);
    });
  };

  const applyFormUpdates = (updates = {}) => {
    if (!coachForm) return;
    const allowed = ['sport', 'level', 'goal', 'mode', 'plan'];
    Object.entries(updates).forEach(([name, selectedValue]) => {
      if (!allowed.includes(name) || !selectedValue) return;
      coachForm.querySelectorAll(`[name="${name}"]`).forEach((control) => {
        if (control.type === 'radio') control.checked = control.value === selectedValue;
        else control.value = selectedValue;
        control.dispatchEvent(new Event('input', { bubbles: true }));
        control.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
    closeChat();
    document.querySelector('#match')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleResponse = (response) => {
    const reply = response?.reply || 'KhelSaathi could not complete that request. Please try again.';
    appendMessage('assistant', reply);
    history.push({ role: 'assistant', content: reply });

    if (!response?.ok) {
      setStatus('error', 'Unavailable');
      return;
    }

    setStatus('online', 'Online');
    const updates = response.formUpdates || {};
    if (Object.values(updates).some(Boolean)) {
      addAction('Use these details', () => applyFormUpdates(updates));
    } else if (response.action === 'scroll_to_match') {
      addAction('Open coach matching', () => {
        closeChat();
        document.querySelector('#match')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } else if (response.action === 'scroll_to_plans') {
      addAction('View membership plans', () => {
        closeChat();
        document.querySelector('#plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    updateQuickReplies(response.suggestions);
  };

  const sendMessage = async (message) => {
    const clean = String(message || '').trim();
    if (!clean || busy) return;

    busy = true;
    appendMessage('user', clean);
    const previousHistory = history.slice(-4);
    history.push({ role: 'user', content: clean });
    input.value = '';
    input.style.height = '';
    if (sendButton) sendButton.disabled = true;
    const typing = showTyping();

    try {
      const response = await requestJsonp({
        action: 'chat',
        sessionId,
        message: clean,
        history: previousHistory,
        profile: profile()
      });
      typing.remove();
      handleResponse(response);
    } catch (error) {
      typing.remove();
      setStatus('error', 'Unavailable');
      appendMessage('assistant', 'I could not connect to KhelSaathi right now. Please try again in a moment.');
    } finally {
      busy = false;
      if (sendButton) sendButton.disabled = false;
      input.focus();
    }
  };

  const checkHealth = async () => {
    setStatus('connecting', 'Connecting');
    try {
      const response = await requestJsonp({ action: 'health' }, 18000);
      setStatus(response?.ok ? 'online' : 'error', response?.ok ? 'Online' : 'Unavailable');
    } catch (error) {
      setStatus('error', 'Unavailable');
    }
  };

  launcher.addEventListener('click', () => panel.classList.contains('open') ? closeChat() : openChat());
  closeButton?.addEventListener('click', closeChat);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeChat(); });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage(input.value);
  });

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 104)}px`;
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  quick?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-message]');
    if (!button) return;
    openChat();
    sendMessage(button.dataset.message);
  });

  checkHealth();
})();
