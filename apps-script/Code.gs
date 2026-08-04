const SPREADSHEET_ID = '12rKH3EgaTiitEqbAOefRnbq-MUv2TJWBe1kJ0siT8Mg';
const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

function doGet() {
  return jsonResponse_({
    ok: true,
    service: 'KhelSaathi',
    message: 'KhelSaathi backend is available.'
  });
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const action = String(payload.action || 'chat');

    if (action === 'chat') return jsonResponse_(handleChat_(payload));
    if (action === 'saveLead') return jsonResponse_(saveLead_(payload));

    return jsonResponse_({ ok: false, error: 'Unsupported action.' });
  } catch (error) {
    logServerError_(error);
    return jsonResponse_({
      ok: false,
      reply: 'I could not complete that request right now. You can still use the coach matching form below.',
      error: String(error && error.message ? error.message : error)
    });
  }
}

function handleChat_(payload) {
  const config = getConfig_();
  const fallback = config.FALLBACK_MESSAGE || 'I could not complete that request right now. You can still use the coach matching form below.';

  if (String(config.ACTIVE).toUpperCase() === 'FALSE') {
    return { ok: true, reply: fallback, intent: 'disabled', action: 'none', formUpdates: {}, suggestions: [] };
  }

  const message = cleanText_(payload.message, 600);
  if (!message) {
    return { ok: true, reply: 'Tell me what sport you play or what you would like help with.', intent: 'greeting', action: 'none', formUpdates: {}, suggestions: ['Find the right coach', 'Choose a plan'] };
  }

  enforceRateLimit_(payload.sessionId);
  const apiKey = PropertiesService.getScriptProperties().getProperty('GROQ_API_KEY');
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured in Script Properties.');

  const profile = normaliseProfile_(payload.profile || {});
  const history = normaliseHistory_(payload.history || []);
  const knowledge = getKnowledgeContext_();
  const coaches = getCoachContext_(profile.sport);
  const systemPrompt = buildSystemPrompt_(config, knowledge, coaches, profile);

  const messages = [{ role: 'system', content: systemPrompt }]
    .concat(history.slice(-8))
    .concat([{ role: 'user', content: message }]);

  const requestBody = {
    model: config.MODEL_NAME || DEFAULT_MODEL,
    messages: messages,
    temperature: numberOr_(config.TEMPERATURE, 0.35),
    max_completion_tokens: Math.round(numberOr_(config.MAX_TOKENS, 500)),
    response_format: { type: 'json_object' },
    user: cleanText_(payload.sessionId || 'anonymous', 100)
  };

  const response = UrlFetchApp.fetch(GROQ_CHAT_URL, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + apiKey },
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true
  });

  const statusCode = response.getResponseCode();
  const responseText = response.getContentText();
  if (statusCode < 200 || statusCode >= 300) {
    logConversation_(payload, message, fallback, 'error', {}, config.MODEL_NAME || DEFAULT_MODEL, '', '', responseText);
    throw new Error('Groq API request failed with status ' + statusCode + '.');
  }

  const groqData = JSON.parse(responseText);
  const rawContent = groqData.choices && groqData.choices[0] && groqData.choices[0].message
    ? groqData.choices[0].message.content
    : '';

  const parsed = parseAssistantJson_(rawContent, fallback);
  const result = normaliseAssistantResponse_(parsed);
  const usage = groqData.usage || {};

  logConversation_(
    payload,
    message,
    result.reply,
    'success',
    result,
    groqData.model || requestBody.model,
    usage.prompt_tokens || '',
    usage.completion_tokens || '',
    ''
  );

  return Object.assign({ ok: true }, result);
}

function saveLead_(payload) {
  const profile = normaliseProfile_(payload.profile || {});
  const selectedCoach = cleanText_(payload.selectedCoach, 120);
  const now = new Date();
  const leadId = 'LEAD-' + Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + '-' + Math.floor(Math.random() * 900 + 100);
  const sheet = getSpreadsheet_().getSheetByName('Leads');
  if (!sheet) throw new Error('Leads sheet was not found.');

  sheet.appendRow([
    now,
    leadId,
    profile.athlete,
    profile.age,
    profile.city,
    profile.phone,
    profile.email,
    profile.sport,
    profile.level,
    profile.goal,
    profile.mode,
    profile.schedule,
    profile.budget,
    profile.plan,
    selectedCoach,
    'New',
    cleanText_(payload.source || 'Website', 100),
    '',
    '',
    now
  ]);

  return { ok: true, leadId: leadId };
}

function buildSystemPrompt_(config, knowledge, coaches, profile) {
  const basePrompt = config.SYSTEM_PROMPT || [
    'You are KhelSaathi, the Sports Gurukul chatbot.',
    'Help athletes and parents understand coaching needs, plans and the coach matching journey.',
    'Be warm, direct and concise. Ask one useful question at a time.',
    'Never invent facts, coaches, prices, features, availability or outcomes.'
  ].join(' ');

  return [
    basePrompt,
    '',
    'RESPONSE FORMAT',
    'Return one valid JSON object only, with no markdown and no text outside JSON.',
    '{"reply":"short response","intent":"short_intent","action":"none|prefill_form|scroll_to_match|scroll_to_plans","formUpdates":{"sport":"","level":"","goal":"","mode":"","plan":""},"suggestions":["short option 1","short option 2"]}',
    'Use empty strings or omit fields that are not known. Never include personal data in suggestions.',
    '',
    'CURRENT ATHLETE PROFILE',
    JSON.stringify(profile),
    '',
    'APPROVED SPORTS GURUKUL KNOWLEDGE',
    knowledge || 'No additional knowledge rows are active.',
    '',
    'ACTIVE COACH DIRECTORY',
    coaches || 'No coach records are available for the selected sport.',
    '',
    'WEBSITE SECTIONS',
    'Coach matching form: #match. Membership plans: #plans. Reviews: #reviews.',
    '',
    'PLAN RULES',
    'Explorer uses form value Free. Progress uses form value Pro. Performance uses form value Elite.',
    'Explorer is suitable for browsing and basic coach discovery.',
    'Progress is suitable for regular structured development.',
    'Performance is suitable for competitive or professional pathway goals.',
    'Recommendations are guidance, not guarantees. The user makes the final choice.'
  ].join('\n');
}

function getConfig_() {
  const sheet = getSpreadsheet_().getSheetByName('AI_Config');
  const defaults = {
    AGENT_NAME: 'KhelSaathi',
    MODEL_NAME: DEFAULT_MODEL,
    TEMPERATURE: '0.35',
    MAX_TOKENS: '500',
    ACTIVE: 'TRUE',
    FALLBACK_MESSAGE: 'I could not complete that request right now. You can still use the coach matching form below.'
  };
  if (!sheet || sheet.getLastRow() < 2) return defaults;

  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getDisplayValues();
  values.forEach(function(row) {
    const key = String(row[0] || '').trim();
    if (key) defaults[key] = String(row[1] || '').trim();
  });
  return defaults;
}

function getKnowledgeContext_() {
  const sheet = getSpreadsheet_().getSheetByName('Knowledge_Base');
  if (!sheet || sheet.getLastRow() < 2) return '';
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, Math.min(sheet.getLastColumn(), 8)).getDisplayValues();
  return rows
    .filter(function(row) { return String(row[5]).toUpperCase() === 'TRUE'; })
    .map(function(row) { return row[0] + ' | ' + row[2] + ' | ' + row[3]; })
    .join('\n');
}

function getCoachContext_(sport) {
  const sheet = getSpreadsheet_().getSheetByName('Coach_Directory');
  if (!sheet || sheet.getLastRow() < 2) return '';
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, Math.min(sheet.getLastColumn(), 18)).getDisplayValues();
  return rows
    .filter(function(row) {
      const active = String(row[12]).toUpperCase() === 'TRUE';
      const sameSport = !sport || String(row[3]).toLowerCase() === String(sport).toLowerCase();
      return active && sameSport;
    })
    .slice(0, 8)
    .map(function(row) {
      return [
        'Name: ' + row[1],
        'Sport: ' + row[3],
        'City: ' + row[4],
        'Mode: ' + row[5],
        'Experience: ' + row[6] + ' years',
        'Rating: ' + row[7],
        'Specialities: ' + row[8] + ', ' + row[9],
        'Availability: ' + row[10],
        'Fee range: ' + row[13]
      ].join(' | ');
    })
    .join('\n');
}

function logConversation_(payload, userMessage, assistantResponse, status, result, model, tokensIn, tokensOut, error) {
  try {
    const sheet = getSpreadsheet_().getSheetByName('Conversations');
    if (!sheet) return;
    const updates = result.formUpdates || {};
    sheet.appendRow([
      new Date(),
      cleanText_(payload.sessionId || '', 120),
      cleanText_(payload.leadId || '', 120),
      userMessage,
      assistantResponse,
      cleanText_(result.intent || '', 100),
      cleanText_(updates.sport || payload.profile && payload.profile.sport || '', 50),
      cleanText_(updates.level || payload.profile && payload.profile.level || '', 50),
      cleanText_(updates.goal || payload.profile && payload.profile.goal || '', 100),
      cleanText_(updates.plan || payload.profile && payload.profile.plan || '', 50),
      cleanText_(result.action || '', 50),
      JSON.stringify(updates),
      model,
      tokensIn,
      tokensOut,
      status,
      cleanText_(error || '', 1000),
      ''
    ]);
  } catch (loggingError) {
    console.error(loggingError);
  }
}

function logServerError_(error) {
  console.error(error && error.stack ? error.stack : error);
}

function enforceRateLimit_(sessionId) {
  const key = 'rate:' + cleanText_(sessionId || 'anonymous', 100);
  const cache = CacheService.getScriptCache();
  const current = Number(cache.get(key) || 0);
  if (current >= 20) throw new Error('Please wait a few minutes before sending more messages.');
  cache.put(key, String(current + 1), 300);
}

function parsePayload_(e) {
  const raw = e && e.postData && e.postData.contents ? e.postData.contents : '';
  if (!raw) return e && e.parameter ? e.parameter : {};
  try {
    return JSON.parse(raw);
  } catch (error) {
    return e && e.parameter ? e.parameter : {};
  }
}

function parseAssistantJson_(content, fallback) {
  try {
    return JSON.parse(content);
  } catch (error) {
    const match = String(content || '').match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch (ignored) {}
    }
    return { reply: cleanText_(content || fallback, 1000), intent: 'general_guidance', action: 'none', formUpdates: {}, suggestions: [] };
  }
}

function normaliseAssistantResponse_(input) {
  const allowedActions = ['none', 'prefill_form', 'scroll_to_match', 'scroll_to_plans'];
  const action = allowedActions.indexOf(input.action) >= 0 ? input.action : 'none';
  const updates = input.formUpdates && typeof input.formUpdates === 'object' ? input.formUpdates : {};

  return {
    reply: cleanText_(input.reply || '', 1200) || 'Tell me what sport you play or what you would like help with.',
    intent: cleanText_(input.intent || 'general_guidance', 100),
    action: action,
    formUpdates: {
      sport: allowedValue_(updates.sport, ['Cricket', 'Football', 'Badminton', 'Basketball', 'Athletics', 'Tennis']),
      level: allowedValue_(updates.level, ['Beginner', 'Intermediate', 'Competitive', 'Advanced']),
      goal: allowedValue_(updates.goal, ['Learn the basics', 'Improve performance', 'Prepare for competition', 'Build a professional pathway']),
      mode: allowedValue_(updates.mode, ['In person', 'Online', 'Either works']),
      plan: allowedValue_(updates.plan, ['Free', 'Pro', 'Elite'])
    },
    suggestions: Array.isArray(input.suggestions)
      ? input.suggestions.slice(0, 4).map(function(item) { return cleanText_(item, 80); }).filter(Boolean)
      : []
  };
}

function normaliseHistory_(history) {
  if (!Array.isArray(history)) return [];
  return history.slice(-10).map(function(item) {
    const role = item && item.role === 'assistant' ? 'assistant' : 'user';
    return { role: role, content: cleanText_(item && item.content || '', 1000) };
  }).filter(function(item) { return item.content; });
}

function normaliseProfile_(profile) {
  return {
    athlete: cleanText_(profile.athlete, 120),
    age: cleanText_(profile.age, 10),
    city: cleanText_(profile.city, 80),
    phone: cleanText_(profile.phone, 20),
    email: cleanText_(profile.email, 160),
    sport: allowedValue_(profile.sport, ['Cricket', 'Football', 'Badminton', 'Basketball', 'Athletics', 'Tennis']),
    level: allowedValue_(profile.level, ['Beginner', 'Intermediate', 'Competitive', 'Advanced']),
    goal: allowedValue_(profile.goal, ['Learn the basics', 'Improve performance', 'Prepare for competition', 'Build a professional pathway']),
    mode: allowedValue_(profile.mode, ['In person', 'Online', 'Either works']),
    schedule: cleanText_(profile.schedule, 80),
    budget: cleanText_(profile.budget, 80),
    plan: allowedValue_(profile.plan, ['Free', 'Pro', 'Elite'])
  };
}

function allowedValue_(value, allowed) {
  const clean = cleanText_(value, 120);
  return allowed.indexOf(clean) >= 0 ? clean : '';
}

function cleanText_(value, maxLength) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim().slice(0, maxLength || 500);
}

function numberOr_(value, fallback) {
  const number = Number(value);
  return isFinite(number) ? number : fallback;
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}