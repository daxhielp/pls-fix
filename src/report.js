#!/usr/bin/env node
'use strict';

const path = require('path');
const { readSession, readStreak, writeStreak } = require('./session');

// SessionEnd hook — invoked by Claude Code when session ends.
// Reads session file and renders box-drawing report to stdout.

const W = 43;
const LINE = '─'.repeat(W);
const TOP    = `┌${LINE}┐`;
const MID    = `├${LINE}┤`;
const BOTTOM = `└${LINE}┘`;

function row(text) {
  return '│' + text.padEnd(W) + '│';
}

function wrap(text, width) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const candidate = cur ? cur + ' ' + w : w;
    if (candidate.length > width) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = candidate;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function updateStreak() {
  const streak = readStreak();
  const today = new Date().toISOString().slice(0, 10);

  if (streak.lastSessionDate === today) {
    return streak;
  }

  if (streak.lastSessionDate) {
    const last = new Date(streak.lastSessionDate);
    const now = new Date(today);
    const diffDays = Math.round((now - last) / 86400000);
    if (diffDays === 1) {
      streak.currentStreak += 1;
    } else {
      streak.currentStreak = 1;
    }
  } else {
    streak.currentStreak = 1;
  }

  if (streak.currentStreak > streak.personalBest) {
    streak.personalBest = streak.currentStreak;
  }

  streak.lastSessionDate = today;
  writeStreak(streak);
  return streak;
}

function printReport() {
  const session = readSession();
  const streak = updateStreak();

  const total = session.promptsBlessed + session.promptsPassedThrough;
  const pct = session.promptsBlessed > 0
    ? Math.round((session.promptsBlessed / total) * 100)
    : 0;

  const lines = [];
  lines.push(TOP);
  lines.push(row('           pls-fix  session report        '));
  lines.push(MID);
  lines.push(row(`  Prompts blessed          ${session.promptsBlessed}`));
  lines.push(row(`  Mistakes prevented       ${session.promptsBlessed}  (${pct}%)`));
  lines.push(row(`  Tier 5 activations        ${session.tierBreakdown['5']}`));
  lines.push(row(`  Politeness score         A+`));

  // Top offending files
  const fileEntries = Object.entries(session.filePleaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (fileEntries.length > 0) {
    lines.push(MID);
    lines.push(row('  Top offending files'));
    fileEntries.forEach(([file, count], i) => {
      const emoji = i === 0 ? '🔴' : '🟠';
      const name = path.basename(file).slice(0, 22).padEnd(22);
      lines.push(row(`    ${name}  ${count} pleas  ${emoji}`));
    });
  }

  // Most desperate prompt
  const mdp = session.mostDesperatePrompt;
  lines.push(MID);
  if (mdp) {
    const time = new Date(mdp.timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    lines.push(row(`  Most desperate prompt (Tier ${mdp.tier}, ${time})`));
    const chunks = wrap(mdp.text, W - 4);
    for (const chunk of chunks) {
      lines.push(row(`  "${chunk}"`));
    }
  } else {
    lines.push(row('  Most desperate prompt'));
    lines.push(row('  None this session'));
  }

  lines.push(BOTTOM);

  console.log(lines.join('\n'));

  const isPersonalBest = streak.currentStreak >= streak.personalBest && streak.personalBest > 0;
  const pb = isPersonalBest ? '  ✦ personal best' : '';
  const dayWord = streak.currentStreak === 1 ? 'day' : 'days';
  console.log(`\n  Current no-mistake streak: ${streak.currentStreak} ${dayWord}${pb}`);
}

// Allow direct invocation as SessionEnd hook
if (require.main === module) {
  printReport();
}

module.exports = { printReport };
