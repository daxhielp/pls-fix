#!/usr/bin/env node
'use strict';

const [,, subcommand, ...args] = process.argv;

switch (subcommand) {
  case 'install':
    // TODO Phase 7: locate ~/.claude/settings.json, register UserPromptSubmit + SessionEnd hooks
    console.log('[pls-fix] install: not yet implemented');
    break;
  case 'uninstall':
    // TODO Phase 7: remove _pls-fix tagged entries from settings.json, print final report
    console.log('[pls-fix] uninstall: not yet implemented');
    break;
  case 'report':
    // TODO Phase 7: call printReport from src/report.js
    console.log('[pls-fix] report: not yet implemented');
    break;
  default:
    console.log('Usage: pls-fix <install|uninstall|report> [--dry-run]');
    process.exit(0);
}
