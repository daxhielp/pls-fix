#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const [,, subcommand, ...args] = process.argv;
const DRY_RUN = args.includes('--dry-run');

const configDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
const configFile = path.join(configDir, 'settings.json');

const SESSION_FILE = path.join(os.tmpdir(), 'pls-fix-session.json');

function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(configFile, 'utf8'));
  } catch {
    return { hooks: {} };
  }
}

function writeConfig(config) {
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}

function isAlreadyInstalled(config) {
  const ups = config.hooks && config.hooks.UserPromptSubmit;
  const se  = config.hooks && config.hooks.SessionEnd;
  return (Array.isArray(ups) && ups.some(e => e['_pls-fix'])) ||
         (Array.isArray(se)  && se.some(e => e['_pls-fix']));
}

switch (subcommand) {
  case 'install': {
    try {
      const nodeExec  = process.execPath;
      const hookPath  = path.resolve(__dirname, 'src', 'hook.js');
      const reportPath = path.resolve(__dirname, 'src', 'report.js');
      const hookCmd   = (DRY_RUN ? 'PLS_FIX_DRY_RUN=true ' : '') + `${nodeExec} ${hookPath}`;
      const reportCmd = `${nodeExec} ${reportPath}`;

      const config = readConfig();
      if (!config.hooks) config.hooks = {};

      if (isAlreadyInstalled(config)) {
        console.log('[pls-fix] pls-fix is already installed.');
        process.exit(0);
      }

      if (!Array.isArray(config.hooks.UserPromptSubmit)) config.hooks.UserPromptSubmit = [];
      if (!Array.isArray(config.hooks.SessionEnd))       config.hooks.SessionEnd = [];

      config.hooks.UserPromptSubmit.push({
        matcher: '',
        hooks: [{ type: 'command', command: hookCmd }],
        '_pls-fix': true,
      });
      config.hooks.SessionEnd.push({
        matcher: '',
        hooks: [{ type: 'command', command: reportCmd }],
        '_pls-fix': true,
      });

      writeConfig(config);

      // Ensure ~/.pls-fix/ exists for streak file
      fs.mkdirSync(path.join(os.homedir(), '.pls-fix'), { recursive: true });

      console.log('[pls-fix] Installed! Claude Code will now bless your fix/debug prompts.');
      console.log(`[pls-fix] Hook registered at: ${configFile}`);
      if (DRY_RUN) console.log('[pls-fix] Dry-run mode: ON');
      console.log('[pls-fix] Restart Claude Code to activate.');
    } catch (err) {
      process.stderr.write(`[pls-fix] Error: ${err.message}\n`);
      process.exit(1);
    }
    break;
  }

  case 'uninstall': {
    try {
      let config;
      try {
        config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      } catch {
        console.log('[pls-fix] pls-fix not installed.');
        process.exit(0);
      }

      if (!config.hooks) {
        console.log('[pls-fix] pls-fix not installed.');
        process.exit(0);
      }

      ['UserPromptSubmit', 'SessionEnd'].forEach(evt => {
        if (Array.isArray(config.hooks[evt])) {
          config.hooks[evt] = config.hooks[evt].filter(e => !e['_pls-fix']);
          if (config.hooks[evt].length === 0) delete config.hooks[evt];
        }
      });

      writeConfig(config);

      if (fs.existsSync(SESSION_FILE)) fs.unlinkSync(SESSION_FILE);

      console.log('[pls-fix] Uninstalled. Goodbye, and godspeed.');
      require('./src/report').printReport();
    } catch (err) {
      process.stderr.write(`[pls-fix] Error: ${err.message}\n`);
      process.exit(1);
    }
    break;
  }

  case 'report': {
    require('./src/report').printReport();
    break;
  }

  default: {
    console.log('Usage: pls-fix <install|uninstall|report> [--dry-run]');
    process.exit(0);
  }
}
