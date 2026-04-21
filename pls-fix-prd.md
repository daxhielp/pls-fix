# PRD: `pls-fix` — Claude Code Plugin

> A production-grade Claude Code hook that automatically appends motivational, severity-tiered phrases to fix/debug prompts. Built for maximum sincerity. Zero mistakes guaranteed™.

---

## What this is

`pls-fix` is a Claude Code plugin distributed via `npx`. It installs a `PreToolUse` hook into the user's Claude Code setup that:

1. Intercepts prompts before they reach Claude
2. Classifies them as fix/debug/code requests
3. Scores desperation level based on emotional signal detection
4. Appends the appropriate tier phrase
5. Tracks session metrics and outputs a report on exit

**Install UX:** `npx pls-fix install`
**Uninstall UX:** `npx pls-fix uninstall`
**Report UX:** auto-printed at session end, or `npx pls-fix report`

---

## Severity tier system

There are 5 tiers of escalating desperation. Tier assignment is based on a score computed from signals in the prompt (see classifier spec below). **The actual phrase text for each tier will be authored by the user and slotted in as string constants** — the plugin treats them as config.

| Tier | Name | Score range | Trigger profile |
|------|------|-------------|-----------------|
| 1 | Professional | 0–1 | Standard fix/debug request |
| 2 | Concerned | 2–3 | Mild frustration signals |
| 3 | Invested | 4–5 | Repeated attempts, emotional language |
| 4 | Existential | 6–8 | Desperation keywords, deadline language |
| 5 | Rock Bottom | 9+ | ALL CAPS, "still broken", demo/prod/boss, late-night timestamp |

Phrases live in `src/tiers.js` as a plain exported object. Easy to edit, easy to swap.

---

## Prompt classifier spec

The classifier reads the raw prompt string and returns `{ shouldInject: boolean, tier: 1-5 }`.

### Step 1 — Eligibility check

Inject only if the prompt matches one or more of:

- Contains fix/debug intent keywords: `fix`, `broken`, `error`, `bug`, `not working`, `failing`, `crash`, `issue`, `wrong`, `help`, `why is`, `why isn't`, `why doesn't`, `can't get`, `doesn't work`
- Is a follow-up on a code file (Claude Code context: active file is a code file)
- Starts with an imperative verb followed by code-related noun (`update`, `refactor`, `rewrite`, `debug`, `check`)

If none match → pass through unchanged, log as "unblessable prompt."

### Step 2 — Desperation scoring

Score starts at 0. Add points for each signal present:

| Signal | Points |
|--------|--------|
| Word "still" or "again" | +2 |
| Word "why" (rhetorical) | +1 |
| Excessive punctuation `??` or `!!` | +2 |
| Any ALL CAPS word (3+ letters) | +2 |
| Deadline words: `demo`, `deploy`, `prod`, `launch`, `presentation`, `client`, `boss`, `interview` | +3 |
| Existential words: `please`, `begging`, `desperate`, `dying`, `killing me`, `hate this` | +2 |
| Time-of-day: prompt sent between 11pm–4am local time | +2 |
| This file has been mentioned 3+ times this session | +2 |
| Prompt contains `"` (user quoting an error message) | +1 |
| Prompt length > 300 chars | +1 |

Score → tier lookup via the table above.

---

## Session tracking

The plugin maintains a lightweight in-memory session log (written to a temp JSON file per session):

```json
{
  "sessionStart": "2025-04-20T14:14:00Z",
  "promptsBlessed": 47,
  "promptsPassedThrough": 12,
  "tierBreakdown": { "1": 20, "2": 14, "3": 8, "4": 4, "5": 3 },
  "filePleaCounts": {
    "auth/middleware.ts": 11,
    "utils/dateParser.js": 8,
    "webpack.config.js": 6
  },
  "mostDesperatePrompt": {
    "text": "...",
    "tier": 5,
    "timestamp": "2025-04-20T17:11:00Z",
    "file": "webpack.config.js"
  },
  "mistakesPrevented": 47
}
```

`mistakesPrevented` is always equal to `promptsBlessed`. This is by design. See methodology.

---

## Session report

Printed to terminal at session end (Claude Code `Stop` hook) or via `npx pls-fix report`:

```
┌─────────────────────────────────────────┐
│           pls-fix  session report        │
├─────────────────────────────────────────┤
│  Prompts blessed          47             │
│  Mistakes prevented       47  (100%)     │
│  Tier 5 activations        3             │
│  Politeness score         A+             │
├─────────────────────────────────────────┤
│  Top offending files                     │
│    auth/middleware.ts     11 pleas  🔴   │
│    utils/dateParser.js     8 pleas  🟠   │
│    webpack.config.js       6 pleas  🟠   │
├─────────────────────────────────────────┤
│  Most desperate prompt (Tier 5, 5:11pm) │
│  "Claude, I am asking you with my whole │
│   heart. fix this. make. no. mistakes." │
└─────────────────────────────────────────┘

  Current no-mistake streak: 14 days  ✦ personal best
```

`Politeness score` is always A+. The rubric is proprietary.

---

## `--dry-run` mode

Run with `PLS_FIX_DRY_RUN=true` or `npx pls-fix install --dry-run`.

In dry-run mode, phrases are **not** appended. Instead, the plugin logs to stderr:

```
[pls-fix dry-run] Would have appended (Tier 3):
  "PLS FIX. this is the third time. NO mistakes. I believe in you."
⚠️  Prompt sent without blessing. Mistake prevention not guaranteed.
```

---

## Distribution & install spec

### Package structure

```
pls-fix/
├── package.json          # name: "pls-fix", bin: { "pls-fix": "./cli.js" }
├── cli.js                # entry: handles install / uninstall / report subcommands
├── src/
│   ├── hook.js           # the actual PreToolUse hook script (run by Claude Code)
│   ├── classifier.js     # eligibility check + desperation scorer
│   ├── tiers.js          # tier phrase config — USER EDITS THIS
│   ├── session.js        # session read/write helpers
│   └── report.js         # report renderer
├── README.md
└── LICENSE
```

### Install behavior (`npx pls-fix install`)

1. Detect Claude Code config location (`~/.claude/` or `CLAUDE_CONFIG_DIR`)
2. Read existing `claude_code_config.json` (or create if absent)
3. Register `src/hook.js` under `hooks.PreToolUse`
4. Register `src/report.js` under `hooks.Stop`
5. Write config back
6. Print confirmation + first-run message

### Uninstall behavior (`npx pls-fix uninstall`)

1. Read Claude Code config
2. Remove `pls-fix` entries from hooks arrays
3. Write config back
4. Delete session temp file if present
5. Print final lifetime stats before exit (one last report, for closure)

---

## PAUL implementation phases

This project is built step-by-step using the PAUL framework inside Claude Code (VSCode). Each phase ends with a review checkpoint before proceeding.

---

### Phase P — Plan

**Claude Code prompt to start:**
> "Read this PRD. Ask me any clarifying questions before we begin. Then produce a written implementation plan covering: file structure, the classifier logic, the hook registration approach, and the npx distribution setup. Do not write any code yet."

**Checkpoint:** Review the plan. Confirm tier phrase format. Approve before Phase A.

---

### Phase A — Architect

**Claude Code prompt:**
> "Based on the approved plan, scaffold the full project structure for `pls-fix`. Create all files with stubs and TODO comments. Set up `package.json` with the correct `bin` entry and dependencies. Do not implement logic yet — just the skeleton."

**Deliverables:**
- All files created with correct exports/imports wired
- `package.json` complete and valid
- `tiers.js` stubbed with `[TIER_N_PHRASE]` placeholders

**Checkpoint:** User fills in tier phrases in `tiers.js` before Phase U.

---

### Phase U — Unit-build

Build each module independently, in this order:

#### U1 — Classifier
> "Implement `src/classifier.js` in full. It should export `classify(promptText, context)` returning `{ shouldInject, tier, score, signals }`. Write it test-first: create `classifier.test.js` with at least 8 test cases covering edge cases (no-op prompts, tier boundary scores, ALL CAPS detection, deadline words, time-of-day). Run tests and confirm passing before moving on."

#### U2 — Session tracker
> "Implement `src/session.js`. It should handle reading and writing the session JSON to a temp file, incrementing counters, tracking per-file plea counts, and storing the most desperate prompt. Include a `resetSession()` for fresh starts."

#### U3 — Hook
> "Implement `src/hook.js`. This is the script Claude Code runs on every PreToolUse event. It should: read the incoming prompt from stdin (Claude Code hook protocol), call the classifier, append the tier phrase if applicable, update the session, and write the modified prompt to stdout. Handle dry-run mode via env var."

#### U4 — Report renderer
> "Implement `src/report.js`. It should read the session JSON and render the full report to stdout using box-drawing characters. Include: blessed count, mistakes prevented, tier breakdown, top 3 files by plea count, most desperate prompt, and the no-mistake streak."

#### U5 — CLI
> "Implement `cli.js`. Handle three subcommands: `install`, `uninstall`, `report`. For install/uninstall, locate the Claude Code config, mutate the hooks array, and write it back. Print friendly confirmation messages."

**Checkpoint after each U step.** Do not proceed to next unit until current one passes its tests.

---

### Phase L — Launch

> "Prepare `pls-fix` for public release. Complete the README with: one-line description, install command, what it does, the dry-run flag, how to edit tier phrases, and the disclaimer ('mistake prevention not independently verified'). Verify `npx pls-fix install` works end-to-end in a test Claude Code environment. Tag version 1.0.0."

**README must include:**
- Install/uninstall commands
- Screenshot or ASCII of the session report
- Link to tiers.js for customization
- The disclaimer section (keep it in-character)

---

## Open questions / deferred

- **Streak persistence:** The no-mistake streak survives across sessions only if we write to a persistent file (not temp). Decide: `~/.pls-fix/streak.json`? Defer to Phase U2.
- **Weekly digest:** Listed in roadmap as `planned (maybe)`. Do not implement in v1.
- **Windows support:** Claude Code on Windows may have different config paths. Scope to Mac/Linux for v1, note in README.
- **Phrase randomization:** Could randomize within a tier (multiple phrases per tier). Nice-to-have, not v1.

---

## The disclaimer

To be included verbatim in README:

> **Mistake prevention methodology:** `pls-fix` reports mistakes prevented as equal to the number of blessed prompts. This figure is calculated using our proprietary Optimistic Attribution Model™ (OAM), which assumes counterfactual mistake occurrence in all non-blessed prompts. `pls-fix` has never observed a mistake following a successful blessing. Past performance is not indicative of future results. Politeness score rubric is not publicly available.
