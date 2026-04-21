'use strict';

const { readSession } = require('./session');

// SessionEnd hook — invoked by Claude Code when session ends.
// Reads session file and renders box-drawing report to stdout.

function printReport() {
  // TODO Phase 6: render full report with box-drawing characters
  const session = readSession();
  console.log('[pls-fix] Session report: not yet implemented');
}

// Allow direct invocation as SessionEnd hook
if (require.main === module) {
  printReport();
}

module.exports = { printReport };
