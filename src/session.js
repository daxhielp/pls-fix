'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const SESSION_FILE = path.join(os.tmpdir(), 'pls-fix-session.json');
const STREAK_FILE = path.join(os.homedir(), '.pls-fix', 'streak.json');

const FRESH_SESSION = () => ({
  sessionStart: new Date().toISOString(),
  promptsBlessed: 0,
  promptsPassedThrough: 0,
  tierBreakdown: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
  filePleaCounts: {},
  mostDesperatePrompt: null,
  mistakesPrevented: 0,
});

function readSession() {
  // TODO Phase 4: read SESSION_FILE, return FRESH_SESSION() if missing
  return FRESH_SESSION();
}

function writeSession(sessionObj) {
  // TODO Phase 4: write sessionObj to SESSION_FILE as JSON
}

function resetSession() {
  // TODO Phase 4: write FRESH_SESSION() to SESSION_FILE
}

function updateSession(classifyResult, promptText, cwd) {
  // TODO Phase 4: increment counters, update mostDesperatePrompt, write back
}

module.exports = { readSession, writeSession, resetSession, updateSession };
