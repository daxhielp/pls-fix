# pls-fix — Implementation Plan

> Reference document for Phase 2 (Architect) and all subsequent build phases.
> All decisions here are final unless explicitly superseded.

---

## 1. File Structure

```
pls-fix/
├── package.json              # name: "pls-fix", bin: { "pls-fix": "./cli.js" }
├── cli.js                    # Entry point — install / uninstall / report subcommands
├── src/
│   ├── hook.js               # UserPromptSubmit handler — classifies + injects phrase
│   ├── classifier.js         # classify(promptText, context) → { shouldInject, tier, score, signals }
│   ├── tiers.js              # Tier phrase config — USER EDITS THIS
│   ├── session.js            # Session read/write helpers
│   └── report.js             # Session report renderer (called by SessionEnd hook)
├── README.md
└── LICENSE
```

### Responsibility per file

| File | Exports | Imports | Responsibility |
|------|---------|---------|----------------|
| `cli.js` | — (bin entry) | `./src/session.js`, `./src/report.js`, `path`, `fs`, `os` | Parse argv, route to install/uninstall/report, locate Claude config |
| `src/hook.js` | — (standalone script) | `./classifier.js`, `./tiers.js`, `./session.js` | Read stdin JSON, classify prompt, inject phrase via stdout, update session |
| `src/classifier.js` | `classify` | — (no deps) | Eligibility check + desperation scoring → tier |
| `src/tiers.js` | `tiers` (object) | — (no deps) | Phrase config — user-editable |
| `src/session.js` | `readSession`, `writeSession`, `resetSession`, `updateSession` | `path`, `os`, `fs` | Temp file read/write, counter management |
| `src/report.js` | `printReport` | `./session.js` | Render box-drawing report to stdout |

---

## 2. Hook Registration

### Corrected hook types (PRD had wrong names)

| PRD Said | Actual Hook | Why |
|----------|-------------|-----|
| `PreToolUse` | `UserPromptSubmit` | PreToolUse fires before tool calls, has no access to user prompt text. UserPromptSubmit fires on user message submission and exposes `prompt` field in stdin. |
| `Stop` | `SessionEnd` | Stop fires after every Claude response turn. SessionEnd fires once when the session terminates — correct for a session summary report. |

### Install behavior — mutations to `settings.json`

**Config file locations (in priority order):**
1. `$CLAUDE_CONFIG_DIR/settings.json` if env var set
2. `~/.claude/settings.json` (user-level, default)

**pls-fix uses user-level** (`~/.claude/settings.json`) so the plugin works across all projects.

**JSON structure to add:**

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "/absolute/path/to/pls-fix/node_modules/.bin/node /absolute/path/to/pls-fix/src/hook.js"
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "/absolute/path/to/pls-fix/node_modules/.bin/node /absolute/path/to/pls-fix/src/report.js"
          }
        ]
      }
    ]
  }
}
```

**Implementation approach for install:**
- Resolve the absolute path to `src/hook.js` and `src/report.js` at install time using `path.resolve(__dirname, 'src/hook.js')`
- Read existing `settings.json` (create `{ "hooks": {} }` if absent)
- Deep-merge: push new hook entries into `hooks.UserPromptSubmit` and `hooks.SessionEnd` arrays
- Write back with `JSON.stringify(config, null, 2)`
- Tag each hook entry with `"_pls-fix": true` for clean uninstall identification

**Entry format with tag:**
```json
{
  "type": "command",
  "command": "node /path/to/src/hook.js",
  "_pls-fix": true
}
```

### Uninstall behavior

- Read `settings.json`
- Filter out all hook entries where `_pls-fix === true` from both `UserPromptSubmit` and `SessionEnd` arrays
- Remove empty arrays/objects if they result from removal
- Write back
- Delete session temp file if it exists
- Print final lifetime stats (one last report call)

---

## 3. Hook I/O Protocol

### UserPromptSubmit — `src/hook.js`

**stdin JSON schema:**
```json
{
  "hook_event_name": "UserPromptSubmit",
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/directory",
  "permission_mode": "default",
  "prompt": "the exact text the user submitted"
}
```

**Reading stdin:**
```js
let raw = '';
process.stdin.on('data', chunk => raw += chunk);
process.stdin.on('end', () => {
  const input = JSON.parse(raw);
  const promptText = input.prompt;
  // ...
});
```

**stdout output (phrase injection):**

If eligible: write the tier phrase as plain text to stdout, exit 0.
Claude sees the phrase as additional context alongside the user's prompt.

```js
process.stdout.write(tierPhrase + '\n');
process.exit(0);
```

If not eligible (unblessable prompt): write nothing to stdout, exit 0.

**Dry-run mode (`PLS_FIX_DRY_RUN=true`):**
- Do NOT write to stdout (no injection)
- Write dry-run log to stderr:
  ```
  [pls-fix dry-run] Would have appended (Tier 3):
    "PLS FIX. this is the third time. NO mistakes. I believe in you."
  ⚠️  Prompt sent without blessing. Mistake prevention not guaranteed.
  ```
- Exit 0

**Exit codes:**
- `0` — success (normal operation)
- Non-zero — non-blocking error, Claude continues, stderr shown in transcript

**Context object passed to classifier:**
```js
const context = {
  fileMentionCounts: session.filePleaCounts,  // for "mentioned 3+ times" signal
  timestamp: new Date()                        // for time-of-day signal
};
```

### SessionEnd — `src/report.js`

**stdin JSON schema:**
```json
{
  "hook_event_name": "SessionEnd",
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl"
}
```

`report.js` ignores stdin — it reads the session temp file directly and renders to stdout.

---

## 4. Classifier Design

### Export

```js
// src/classifier.js
module.exports = { classify };

function classify(promptText, context = {}) {
  // returns { shouldInject, tier, score, signals }
}
```

### Step 1 — Eligibility check

Inject only if prompt matches ONE OR MORE of:

```js
const FIX_KEYWORDS = [
  'fix', 'broken', 'error', 'bug', 'not working', 'failing',
  'crash', 'issue', 'wrong', 'help', 'why is', "why isn't",
  "why doesn't", "can't get", "doesn't work"
];

const IMPERATIVE_VERBS = ['update', 'refactor', 'rewrite', 'debug', 'check'];
const CODE_NOUNS = ['function', 'component', 'class', 'module', 'file', 'code', 'script', 'test'];
```

Eligibility logic:
1. `promptText.toLowerCase()` contains any `FIX_KEYWORDS` entry → eligible
2. Prompt starts with an IMPERATIVE_VERB followed by a CODE_NOUN → eligible
3. Neither → `shouldInject: false`, return early

### Step 2 — Desperation scoring

Score starts at 0. Check each signal:

| Signal | Detection | Points |
|--------|-----------|--------|
| Word "still" or "again" | `/\b(still\|again)\b/i` | +2 |
| Word "why" (rhetorical) | `/\bwhy\b/i` | +1 |
| Excessive punctuation `??` or `!!` | `/\?\?/` or `/!!/` | +2 |
| Any ALL CAPS word (3+ letters) | `/\b[A-Z]{3,}\b/` | +2 |
| Deadline words | `/\b(demo\|deploy\|prod\|launch\|presentation\|client\|boss\|interview)\b/i` | +3 |
| Existential words | `/\b(please\|begging\|desperate\|dying\|killing me\|hate this)\b/i` | +2 |
| Time-of-day 11pm–4am | `const h = context.timestamp.getHours(); h >= 23 \|\| h <= 3` | +2 |
| File mentioned 3+ times | `context.fileMentionCounts[filename] >= 3` | +2 |
| Prompt contains `"` (quoted error) | `promptText.includes('"')` | +1 |
| Prompt length > 300 chars | `promptText.length > 300` | +1 |

### Step 3 — Score to tier

| Score | Tier | Name |
|-------|------|------|
| 0–1 | 1 | Professional |
| 2–3 | 2 | Concerned |
| 4–5 | 3 | Invested |
| 6–8 | 4 | Existential |
| 9+ | 5 | Rock Bottom |

### Return shape

```js
return {
  shouldInject: true,
  tier: 3,
  score: 4,
  signals: ['still_again', 'excessive_punctuation']  // keys of matched signals
};
```

### Edge cases

- Empty string → `shouldInject: false`
- Non-string input → throw `TypeError('promptText must be a string')`
- `context` is optional → default to `{}`; missing fields → treat as falsy/0
- Score can only go up (no negative signals)

---

## 5. Session Storage

### Temp file path

```js
const path = require('path');
const os = require('os');
const SESSION_FILE = path.join(os.tmpdir(), 'pls-fix-session.json');
```

### Streak file path (persistent)

```js
const STREAK_FILE = path.join(os.homedir(), '.pls-fix', 'streak.json');
```

Created on first install. Directory `~/.pls-fix/` created if absent.

### Session JSON schema

```json
{
  "sessionStart": "2025-04-20T14:14:00Z",
  "promptsBlessed": 0,
  "promptsPassedThrough": 0,
  "tierBreakdown": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
  "filePleaCounts": {},
  "mostDesperatePrompt": null,
  "mistakesPrevented": 0
}
```

`mostDesperatePrompt` shape when set:
```json
{
  "text": "...",
  "tier": 5,
  "timestamp": "2025-04-20T17:11:00Z",
  "file": "webpack.config.js"
}
```

`mistakesPrevented` is always equal to `promptsBlessed`. Updated atomically.

### Session module API

```js
// src/session.js
module.exports = {
  readSession,    // () → sessionObj (creates fresh if file missing)
  writeSession,   // (sessionObj) → void
  resetSession,   // () → void (writes fresh session to file)
  updateSession,  // (classifyResult, promptText, cwd) → void (increments counters, updates most desperate)
};
```

`updateSession` logic:
1. Read current session
2. Increment `promptsBlessed` (or `promptsPassedThrough` if `!shouldInject`)
3. Increment `tierBreakdown[tier]`
4. Update `filePleaCounts` for any file mentioned in CWD context
5. Update `mostDesperatePrompt` if new score > existing
6. Set `mistakesPrevented = promptsBlessed`
7. Write back

### Streak schema

```json
{
  "currentStreak": 14,
  "personalBest": 14,
  "lastSessionDate": "2025-04-20"
}
```

Streak increments once per day (checked by date of last session). Report shows "personal best" badge if `currentStreak === personalBest`.

---

## 6. Tier Phrase Format

### `src/tiers.js` export shape

```js
module.exports = {
  1: "Professional tier phrase here.",
  2: "Concerned tier phrase here.",
  3: "Invested tier phrase here.",
  4: "Existential tier phrase here.",
  5: "Rock Bottom tier phrase here."
};
```

- Single string per tier (no arrays in v1)
- Keys are integers 1–5
- User edits the string values directly
- Scaffold uses `[TIER_N_PHRASE]` placeholders (user fills before Phase 3)

### How `hook.js` reads it

```js
const tiers = require('./tiers');
const phrase = tiers[result.tier]; // e.g. tiers[3]
```

---

## 7. npx Distribution

### `package.json` required fields

```json
{
  "name": "pls-fix",
  "version": "0.0.0",
  "description": "Motivational severity-tiered phrase injection for Claude Code fix/debug prompts.",
  "main": "cli.js",
  "bin": {
    "pls-fix": "./cli.js"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "license": "MIT"
}
```

- No build step — pure CommonJS (`require`/`module.exports`)
- No TypeScript, no transpilation
- `cli.js` must start with `#!/usr/bin/env node`
- `src/hook.js` and `src/report.js` must also start with `#!/usr/bin/env node`

### Dependencies

No external runtime dependencies for v1. Use only Node.js built-ins:
- `fs` — file I/O
- `os` — `os.tmpdir()`, `os.homedir()`
- `path` — path construction
- `readline` / stdin streaming — for hook I/O

Dev dependencies (for testing):
- TBD in Phase 3 — likely `node:test` (built-in, no install needed) or `jest`

### npx compatibility

`npx pls-fix install` works because:
1. npx downloads the package to a temp cache
2. Runs `./cli.js` as the `pls-fix` bin
3. `cli.js` resolves `__dirname` to find `src/hook.js` path for registration

**Important:** The hook command in `settings.json` must use an absolute path resolvable after npx cache. Use `process.execPath` (node binary) + `path.resolve(__dirname, 'src/hook.js')`:

```js
const hookCommand = `${process.execPath} ${path.resolve(__dirname, 'src/hook.js')}`;
```

---

## 8. Dry-run Mode

### Activation

```js
const DRY_RUN = process.env.PLS_FIX_DRY_RUN === 'true';
```

Also activated by install flag: `npx pls-fix install --dry-run`
When installed with `--dry-run`, set `PLS_FIX_DRY_RUN=true` in hook command:

```json
{
  "command": "PLS_FIX_DRY_RUN=true node /path/to/src/hook.js"
}
```

### Behavior in `hook.js`

```
if (DRY_RUN && result.shouldInject) {
  write to stderr:
    [pls-fix dry-run] Would have appended (Tier {N}):
      "{phrase}"
    ⚠️  Prompt sent without blessing. Mistake prevention not guaranteed.
  exit 0  // no stdout — no injection
}
```

Session is still updated in dry-run (tracking continues, injection skipped).

---

## Open Questions Resolved

| Question | Resolution |
|----------|------------|
| Streak persistence | `~/.pls-fix/streak.json` — persistent across sessions |
| Weekly digest | Deferred to post-v1 — do not implement |
| Windows support | Mac/Linux only for v1 — note in README |
| Phrase randomization | Single string per tier — no arrays in v1 |
| Hook type for prompt interception | `UserPromptSubmit` (not PreToolUse) |
| Hook type for session report | `SessionEnd` (not Stop) |
| Config file | `~/.claude/settings.json` (user-level) |
| Node.js require style | CommonJS (`require`/`module.exports`) — no ESM |
| Test framework | `node:test` (built-in) — no external dependency |

---
*Generated: Phase 1 — Plan*
*Feeds into: Phase 2 — Architect*
