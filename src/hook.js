#!/usr/bin/env node
'use strict';

// UserPromptSubmit hook — invoked by Claude Code on every user prompt submission.
// Reads JSON from stdin, classifies prompt, injects tier phrase via stdout.

const { classify } = require('./classifier');
const tiers = require('./tiers');
const { updateSession, readSession } = require('./session');

const DRY_RUN = process.env.PLS_FIX_DRY_RUN === 'true';

let raw = '';
process.stdin.on('data', chunk => { raw += chunk; });
process.stdin.on('end', () => {
  // TODO Phase 5: parse input, classify prompt, inject phrase, update session
  process.exit(0);
});
