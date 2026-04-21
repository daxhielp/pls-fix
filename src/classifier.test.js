'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { classify } = require('./classifier');

// No-op cases
test('empty string returns shouldInject false', () => {
  const result = classify('');
  assert.strictEqual(result.shouldInject, false);
});

test('plain conversation returns shouldInject false', () => {
  const result = classify("what's the weather today?");
  assert.strictEqual(result.shouldInject, false);
});

test('non-string input throws TypeError', () => {
  assert.throws(() => classify(42), (err) => {
    assert.ok(err instanceof TypeError);
    assert.strictEqual(err.message, 'promptText must be a string');
    return true;
  });
});

// Eligibility via FIX_KEYWORDS
test('fix my bug returns shouldInject true', () => {
  const result = classify('fix my bug');
  assert.strictEqual(result.shouldInject, true);
  assert.ok(result.tier >= 1);
  assert.ok(Array.isArray(result.signals));
});

test('this is broken returns shouldInject true', () => {
  const result = classify('this is broken');
  assert.strictEqual(result.shouldInject, true);
});

test('getting an error returns shouldInject true', () => {
  const result = classify("I'm getting an error");
  assert.strictEqual(result.shouldInject, true);
});

// Eligibility via imperative verb + code noun
test('debug this function returns shouldInject true', () => {
  const result = classify('debug this function');
  assert.strictEqual(result.shouldInject, true);
});

test('refactor the component returns shouldInject true', () => {
  const result = classify('refactor the component');
  assert.strictEqual(result.shouldInject, true);
});

// Signal scoring and tier boundaries
// noon timestamp used in signal tests to prevent time_of_day from skewing scores
const NOON = { timestamp: new Date('2025-06-01T12:00:00') };

test('fix this again scores still_again and reaches tier 2', () => {
  const result = classify('fix this again', NOON);
  assert.strictEqual(result.shouldInject, true);
  assert.ok(result.signals.includes('still_again'), 'signals should include still_again');
  assert.ok(result.score >= 2, `score should be >= 2, got ${result.score}`);
  assert.strictEqual(result.tier, 2);
});

test("why isn't this working still?? reaches tier 3 with correct signals", () => {
  const result = classify("why isn't this working still??", NOON);
  assert.strictEqual(result.shouldInject, true);
  assert.ok(result.signals.includes('still_again'), 'missing still_again');
  assert.ok(result.signals.includes('rhetorical_why'), 'missing rhetorical_why');
  assert.ok(result.signals.includes('excessive_punctuation'), 'missing excessive_punctuation');
  assert.ok(result.score >= 4, `score should be >= 4, got ${result.score}`);
  assert.strictEqual(result.tier, 3);
});

test('PLEASE fix this for the demo reaches tier 4 with correct signals', () => {
  const result = classify('PLEASE fix this for the demo', NOON);
  assert.strictEqual(result.shouldInject, true);
  assert.ok(result.signals.includes('existential_words'), 'missing existential_words');
  assert.ok(result.signals.includes('all_caps'), 'missing all_caps');
  assert.ok(result.signals.includes('deadline_words'), 'missing deadline_words');
  assert.ok(result.score >= 6, `score should be >= 6, got ${result.score}`);
  assert.strictEqual(result.tier, 4);
});

test('WHY IS THIS STILL BROKEN for the demo presentation boss?? reaches tier 5', () => {
  const result = classify('WHY IS THIS STILL BROKEN for the demo presentation boss??');
  assert.strictEqual(result.shouldInject, true);
  assert.ok(result.score >= 9, `score should be >= 9, got ${result.score}`);
  assert.strictEqual(result.tier, 5);
});

// Context-based signals
test('time_of_day signal fires at 2am', () => {
  const result = classify('fix this', { timestamp: new Date('2025-01-01T02:00:00') });
  assert.strictEqual(result.shouldInject, true);
  assert.ok(result.signals.includes('time_of_day'), 'missing time_of_day signal');
  assert.ok(result.score >= 2, `score should include time_of_day +2, got ${result.score}`);
});

test('quoted_error signal fires when prompt contains a double quote', () => {
  const result = classify('fix this "TypeError: cannot read"');
  assert.strictEqual(result.shouldInject, true);
  assert.ok(result.signals.includes('quoted_error'), 'missing quoted_error signal');
});

test('long_prompt signal fires for prompts over 300 chars', () => {
  const result = classify('fix this ' + 'x'.repeat(300));
  assert.strictEqual(result.shouldInject, true);
  assert.ok(result.signals.includes('long_prompt'), 'missing long_prompt signal');
});

// Return shape validation
test('eligible prompt returns correct shape with all expected keys', () => {
  const result = classify('fix my code');
  assert.ok('shouldInject' in result, 'missing shouldInject');
  assert.ok('tier' in result, 'missing tier');
  assert.ok('score' in result, 'missing score');
  assert.ok('signals' in result, 'missing signals');
  assert.ok(Array.isArray(result.signals), 'signals must be an array');
  assert.strictEqual(Object.keys(result).length, 4, 'result must have exactly 4 keys');
});
