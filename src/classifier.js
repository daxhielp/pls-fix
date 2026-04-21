'use strict';

// classify(promptText, context) → { shouldInject, tier, score, signals }
// context: { fileMentionCounts: {}, timestamp: Date }

const FIX_KEYWORDS = [
  'fix', 'broken', 'error', 'bug', 'not working', 'failing',
  'crash', 'issue', 'wrong', 'help', 'why is', "why isn't",
  "why doesn't", "can't get", "doesn't work",
];
const IMPERATIVE_VERBS = ['update', 'refactor', 'rewrite', 'debug', 'check'];
const CODE_NOUNS = ['function', 'component', 'class', 'module', 'file', 'code', 'script', 'test'];

function isEligible(lower) {
  for (const kw of FIX_KEYWORDS) {
    if (lower.includes(kw)) return true;
  }
  const words = lower.split(/\s+/);
  if (words.length >= 1 && IMPERATIVE_VERBS.includes(words[0])) {
    for (const noun of CODE_NOUNS) {
      if (lower.includes(noun)) return true;
    }
  }
  return false;
}

function scoreToTier(score) {
  if (score >= 9) return 5;
  if (score >= 6) return 4;
  if (score >= 4) return 3;
  if (score >= 2) return 2;
  return 1;
}

function classify(promptText, context = {}) {
  if (typeof promptText !== 'string') throw new TypeError('promptText must be a string');

  const lower = promptText.toLowerCase();

  if (!isEligible(lower)) {
    return { shouldInject: false, tier: 1, score: 0, signals: [] };
  }

  let score = 0;
  const signals = [];

  if (/\b(still|again)\b/i.test(promptText)) {
    score += 2;
    signals.push('still_again');
  }
  if (/\bwhy\b/i.test(promptText)) {
    score += 1;
    signals.push('rhetorical_why');
  }
  if (/\?\?/.test(promptText) || /!!/.test(promptText)) {
    score += 2;
    signals.push('excessive_punctuation');
  }
  if (/\b[A-Z]{3,}\b/.test(promptText)) {
    score += 2;
    signals.push('all_caps');
  }
  if (/\b(demo|deploy|prod|launch|presentation|client|boss|interview)\b/i.test(promptText)) {
    score += 3;
    signals.push('deadline_words');
  }
  if (/\b(please|begging|desperate|dying|killing me|hate this)\b/i.test(promptText)) {
    score += 2;
    signals.push('existential_words');
  }
  const h = (context.timestamp || new Date()).getHours();
  if (h >= 23 || h <= 3) {
    score += 2;
    signals.push('time_of_day');
  }
  if (Object.values(context.fileMentionCounts || {}).some(c => c >= 3)) {
    score += 2;
    signals.push('file_repeat');
  }
  if (promptText.includes('"')) {
    score += 1;
    signals.push('quoted_error');
  }
  if (promptText.length > 300) {
    score += 1;
    signals.push('long_prompt');
  }

  const tier = scoreToTier(score);
  return { shouldInject: true, tier, score, signals };
}

module.exports = { classify };
