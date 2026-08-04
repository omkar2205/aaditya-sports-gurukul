(() => {
  const API_URL = 'https://script.google.com/macros/s/AKfycbypuCFhBf6B15McAP4WtTe65ryExAvIoHQhpPO6TlWd5N083P8Ll-ekXlrmLJTV2uJ-jA/exec';
  const chatForm = document.querySelector('.chat-form');
  const chatInput = document.querySelector('#chatInput');
  const chatMessages = document.querySelector('.chat-messages');
  const suggestions = document.querySelector('.chat-suggestions');
  const coachForm = document.querySelector('#coachForm');
  const statusElement = document.querySelector('.chat-identity small');
  if (!chatForm || !chatInput || !chatMessages) return;

  const history = [];
  const sessionId = sessionStorage.getItem('khelSaathiSession') || `KS-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  sessionStorage.setItem('khelSaathiSession', sessionId);

  const style = document.createElement('style');
  style.textContent = `
    .chat-status i{transition:background .2s ease;background:#f0bd4f!important}
    .chat-status[data-state="connected"] i{background:#78dcc8!important}
    .chat-status[data-state="ready"] i{background:#8ec9ff!important}
    .chat-status[data-state="fallback"] i{background:#ffb16e!important}
    .chat-status[data-state="error"] i{background:#ff8a78!important}
  `;
  document.head.appendChild(style);

  const setStatus = (state, label) => {
    if (!statusElement) return;
    statusElement.classList.add('chat-status');
    statusElement.dataset.state = state;
    statusElement.innerHTML = `<i></i><span>${label}</span>`;
  };

  const profile = () => {
    const value = (name) => coachForm?.elements?.[name]?.value || '';
    return {
      athlete: value('athlete'), age: value('age'), city: value('city'),
      phone: value('phone'), email: value('email'), sport: value('sport'),
      level: value('level'), goal: value('goal'), mode: value('mode'),
      schedule: value('schedule'), budget: value('budget'), plan: value('plan')
    };
  };

  const trustedOrigin = (origin) => (
    origin === 'https://script.google.com' ||
    /^https:\/\/[^/]+\.googleusercontent\.com$/.test(origin)
  );

  const requestViaIframe = (payload, timeoutMs = 20000) => new Promise((resolve, reject) => {
    const requestId = payload.requestId || `WEB-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const frameName = `ksFrame_${requestId.replace(/[^a-zA-Z0-9_]/g, '')}`;
    const iframe = document.createElement('iframe');
    const form = document.createElement('form');
    const input = document.createElement('input');

    iframe.name = frameName;
    iframe.hidden = true;
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
      origin: window.location.origin
    });
    form.appendChild(input);

    let finished = false;
    const cleanup = () => {
      window.removeEventListener('message', onMessage);
      iframe.remove();
      form.remove();
    };
    const finish = (callback) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      cleanup();
      callback();
    };
    const onMessage = (event) => {
      if (!trustedOrigin(event.origin)) return;
      if (!event.data || event.data.source !== 'KhelSaathiBackend') return;
      if (event.data.requestId !== requestId) return;
      finish(() => resolve(event.data.data));
    };
    const timer = setTimeout(() => finish(() => reject(new Error('IFRAME_TIMEOUT'))), timeoutMs);

    window.addEventListener('message', onMessage);
    document.body.append(iframe, form);
    form.submit();
  });

  const requestBackend = async (payload, timeoutMs = 14000) => {
    const requestId = payload.requestId || `WEB-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const requestPayload = { ...payload, requestId };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
        cache: 'no-store',
        redirect: 'follow'
      });
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      return await response.json();
    } catch (error) {
      return await requestViaIframe(requestPayload, Math.max(timeoutMs, 20000));
    } finally {
      clearTimeout(timer);
    }
  };

  const appendMessage = (role, text) => {
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

  const localResponse = (message) => {
    const text = message.toLowerCase();
    if (/(who are you|what are you|what is your name|your name)/.test(text)) {
      return {
        reply: 'I am KhelSaathi, the Sports Gurukul assistant. I can help athletes and parents understand coaching options, plans and coach matching.',
        action: 'none', formUpdates: {}, suggestions: ['Find the right coach', 'Choose a plan']
      };
    }
    if (/(injury|injured|pain|hurt|sprain|strain)/.test(text)) {
      return {
        reply: 'I cannot diagnose an injury or recommend treatment. Please speak with a qualified medical professional before continuing training.',
        action: 'none', formUpdates: {}, suggestions: ['Help me find a coach']
      };
    }
    if (/(price|pricing|cost|plan|membership)/.test(text)) {
      return {
        reply: 'Explorer is free. Progress is ₹499 per month for regular development support. Performance is ₹1,999 per month for competitive or professional pathway goals.',
        action: 'scroll_to_plans', formUpdates: {}, suggestions: ['Beginner athlete', 'Competitive athlete']
      };
    }
    return {
      reply: 'Tell me the sport, current playing level and main goal. I can suggest the next step, explain the plans or help fill the coach matching form.',
      action: 'none', formUpdates: {}, suggestions: ['Find the right coach', 'Choose a plan']
    };
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

  const actionButton = (label, handler) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chat-action';
    button.textContent = label;
    button.addEventListener('click', handler, { once: true });
    chatMessages.appendChild(button);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const renderResponse = (response) => {
    appendMessage('assistant', response.reply || 'I could not complete that request right now.');
    history.push({ role: 'assistant', content: response.reply || '' });
    const updates = response.formUpdates || {};

    if (Object.values(updates).some(Boolean)) {
      actionButton('Use these details', () => applyUpdates(updates));
    } else if (response.action === 'scroll_to_match') {
      actionButton('Open coach matching', () => {
        document.querySelector('#match')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        document.querySelector('.chat-close')?.click();
      });
    } else if (response.action === 'scroll_to_plans') {
      actionButton('View membership plans', () => {
        document.querySelector('#plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        document.querySelector('.chat-close')?.click();
      });
    }

    if (Array.isArray(response.suggestions) && suggestions) {
      suggestions.innerHTML = '';
      response.suggestions.slice(0, 4).forEach((item) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.message = item;
        button.textContent = item;
        suggestions.appendChild(button);
      });
    }
  };

  const sendMessage = async (message) => {
    const clean = String(message || '').trim();
    if (!clean) return;
    appendMessage('user', clean);
    history.push({ role: 'user', content: clean });
    chatInput.value = '';
    chatInput.style.height = '';
    const sendButton = chatForm.querySelector('button[type="submit"]');
    if (sendButton) sendButton.disabled = true;
    const typing = showTyping();

    try {
      const response = await requestBackend({
        action: 'chat', sessionId, message: clean,
        history: history.slice(0, -1).slice(-10), profile: profile()
      });
      typing.remove();
      if (!response?.ok) throw new Error(response?.errorCode || 'BACKEND_ERROR');
      setStatus('connected', 'AI connected');
      renderResponse(response);
    } catch (error) {
      typing.remove();
      setStatus('fallback', 'Basic mode');
      renderResponse(localResponse(clean));
    } finally {
      if (sendButton) sendButton.disabled = false;
      chatInput.focus();
    }
  };

  chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    sendMessage(chatInput.value);
  }, true);

  suggestions?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-message]');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    sendMessage(button.dataset.message);
  }, true);

  const checkHealth = async () => {
    setStatus('checking', 'Checking connection');
    try {
      const health = await requestBackend({ action: 'health' }, 12000);
      if (health?.spreadsheet?.ok && health?.groq?.apiKeyConfigured) {
        setStatus('ready', 'Backend ready');
      } else {
        setStatus('error', 'Setup incomplete');
      }
    } catch (error) {
      setStatus('fallback', 'Basic mode');
    }
  };

  setTimeout(checkHealth, 350);
})();
