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
  try {
    return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
  } catch {
    return FRESH_SESSION();
  }
}

function writeSession(sessionObj) {
  fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionObj, null, 2));
}

function resetSession() {
  writeSession(FRESH_SESSION());
}

function updateSession(classifyResult, promptText, cwd) {
  const session = readSession();

  if (!classifyResult.shouldInject) {
    session.promptsPassedThrough += 1;
    writeSession(session);
    return;
  }

  session.promptsBlessed += 1;
  session.mistakesPrevented = session.promptsBlessed;
  session.tierBreakdown[String(classifyResult.tier)] += 1;

  if (cwd) {
    session.filePleaCounts[cwd] = (session.filePleaCounts[cwd] || 0) + 1;
  }

  const candidate = {
    text: promptText,
    tier: classifyResult.tier,
    score: classifyResult.score,
    timestamp: new Date().toISOString(),
    file: cwd || null,
  };
  if (session.mostDesperatePrompt === null || candidate.score > session.mostDesperatePrompt.score) {
    session.mostDesperatePrompt = candidate;
  }

  writeSession(session);
}

function readStreak() {
  try {
    return JSON.parse(fs.readFileSync(STREAK_FILE, 'utf8'));
  } catch {
    return { currentStreak: 0, personalBest: 0, lastSessionDate: null };
  }
}

function writeStreak(streakObj) {
  const dir = path.dirname(STREAK_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STREAK_FILE, JSON.stringify(streakObj, null, 2));
}

module.exports = { readSession, writeSession, resetSession, updateSession, readStreak, writeStreak };
