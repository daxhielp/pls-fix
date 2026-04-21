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
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const promptText = input.prompt || '';
  const cwd = input.cwd || '';

  const session = readSession();
  const context = {
    fileMentionCounts: session.filePleaCounts,
    timestamp: new Date(),
  };

  let result;
  try {
    result = classify(promptText, context);
  } catch {
    process.exit(0);
  }

  if (result.shouldInject) {
    const phrase = tiers[result.tier];
    if (DRY_RUN) {
      process.stderr.write(
        `[pls-fix dry-run] Would have appended (Tier ${result.tier}):\n  "${phrase}"\n` +
        `⚠️  Prompt sent without blessing. Mistake prevention not guaranteed.\n`
      );
    } else {
      process.stdout.write(phrase + '\n');
    }
  }

  updateSession(result, promptText, cwd);
  process.exit(0);
});
