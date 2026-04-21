# Roadmap: pls-fix

## Overview

Build `pls-fix` from zero to npm-published v1.0.0: a Claude Code PreToolUse hook that classifies fix/debug prompts, scores desperation, injects tier-appropriate encouragement, and reports session stats. Eight phases carry the project from written plan through individual module builds to public launch.

## Current Milestone

**v1.1.0 Pause Toggle** (v1.1.0)
Status: Complete
Phases: 1 of 1 complete

## Completed Milestones

**v1.0.0 Initial Release** (v1.0.0)
Status: Complete
Phases: 8 of 8 complete

## Phases

| Phase | Name | Plans | Status | Completed |
|-------|------|-------|--------|-----------|
| 1 | Plan | 1 | Complete | 2026-04-20 |
| 2 | Architect | 1 | Complete | 2026-04-20 |
| 3 | Classifier | 1 | Complete | 2026-04-21 |
| 4 | Session Tracker | 1 | Complete | 2026-04-21 |
| 5 | Hook | 1 | Complete | 2026-04-21 |
| 6 | Report Renderer | 1 | Complete | 2026-04-21 |
| 7 | CLI | 1 | Complete | 2026-04-21 |
| 8 | Launch | 1 | Complete | 2026-04-21 |
| 9 | Pause Toggle | 1 | Complete | 2026-04-21 |

## Phase Details

### Phase 1: Plan

**Goal:** Written implementation plan covering file structure, classifier logic, hook registration approach, and npx distribution setup — no code yet
**Depends on:** Nothing (first phase)
**Research:** Unlikely (PRD already defines the approach)

**Scope:**
- Review PRD and answer any clarifying questions
- Document classifier logic decisions (eligibility check, scoring)
- Document hook registration approach (claude_code_config.json mutation)
- Document npx distribution setup
- Confirm tier phrase format before Phase 2

**Plans:**
- [ ] 01-01: Implementation plan document

---

### Phase 2: Architect

**Goal:** Full project scaffold with all files created as stubs, package.json complete, imports wired, tiers.js ready for user to fill in phrases
**Depends on:** Phase 1 (approved plan)
**Research:** Unlikely (structure defined in PRD)

**Scope:**
- Scaffold all files per PRD structure
- `package.json` with correct `bin` entry and dependencies
- All source files with correct exports/imports wired
- `tiers.js` stubbed with `[TIER_N_PHRASE]` placeholders

**Plans:**
- [ ] 02-01: Project scaffold

---

### Phase 3: Classifier

**Goal:** `src/classifier.js` fully implemented and test-passing — eligibility check + 5-tier desperation scoring
**Depends on:** Phase 2 (scaffold exists)
**Research:** Unlikely (scoring rules fully defined in PRD)

**Scope:**
- Implement `classify(promptText, context)` returning `{ shouldInject, tier, score, signals }`
- Test-first: `classifier.test.js` with 8+ cases covering edge cases
- All tests passing before proceeding

**Plans:**
- [ ] 03-01: Classifier implementation + tests

---

### Phase 4: Session Tracker

**Goal:** `src/session.js` fully implemented — temp file read/write, counter increments, file plea tracking, most-desperate-prompt storage
**Depends on:** Phase 3 (classifier complete)
**Research:** Unlikely (session JSON schema defined in PRD)

**Scope:**
- Read/write session JSON to temp file
- Increment blessed/passthrough counters
- Track per-file plea counts
- Store most desperate prompt
- `resetSession()` for fresh starts
- Decide: streak persistence strategy (`~/.pls-fix/streak.json` vs temp-only)

**Plans:**
- [ ] 04-01: Session tracker implementation

---

### Phase 5: Hook

**Goal:** `src/hook.js` fully implemented — PreToolUse handler reading stdin, classifying, injecting phrase, updating session, writing to stdout
**Depends on:** Phase 4 (session tracker complete)
**Research:** Likely (Claude Code hook stdin/stdout protocol details)
**Research topics:** Exact Claude Code PreToolUse hook I/O format, env var availability inside hooks

**Scope:**
- Read incoming prompt from stdin (Claude Code hook protocol)
- Call classifier
- Append tier phrase if applicable
- Update session
- Write modified prompt to stdout
- Handle dry-run mode via `PLS_FIX_DRY_RUN` env var

**Plans:**
- [ ] 05-01: Hook implementation

---

### Phase 6: Report Renderer

**Goal:** `src/report.js` fully implemented — reads session JSON, renders full box-drawing report to stdout
**Depends on:** Phase 4 (session tracker complete)
**Research:** Unlikely (report format fully defined in PRD)

**Scope:**
- Read session JSON
- Render blessed count, mistakes prevented, tier breakdown
- Top 3 files by plea count with color indicators
- Most desperate prompt display
- No-mistake streak (with "personal best" flag)
- `Politeness score: A+` (always)

**Plans:**
- [ ] 06-01: Report renderer implementation

---

### Phase 7: CLI

**Goal:** `cli.js` fully implemented — install/uninstall/report subcommands working against real Claude Code config
**Depends on:** Phase 5 + Phase 6 (hook and report complete)
**Research:** Unlikely (install/uninstall behavior defined in PRD)

**Scope:**
- `install`: locate config, register PreToolUse + Stop hooks, write back, print confirmation
- `uninstall`: locate config, remove pls-fix entries, delete session temp, print final lifetime stats
- `report`: call report renderer directly
- `--dry-run` flag support

**Plans:**
- [ ] 07-01: CLI implementation

---

### Phase 8: Launch

**Goal:** v1.0.0 shipped — README complete, npx install verified end-to-end, package tagged
**Depends on:** Phase 7 (CLI complete)
**Research:** Unlikely (internal work)

**Scope:**
- README: one-liner, install command, what it does, dry-run flag, how to edit tier phrases, disclaimer verbatim from PRD
- ASCII report screenshot in README
- End-to-end test: `npx pls-fix install` in a test Claude Code environment
- Tag v1.0.0

**Plans:**
- [ ] 08-01: README + end-to-end verification + v1.0.0 tag

---

### Phase 9: Pause Toggle

**Goal:** Runtime pause/resume of pls-fix injection via Claude Code slash commands — no reinstall required
**Depends on:** Phase 8 (v1.0.0 shipped)
**Research:** None (mechanism fully defined)

**Scope:**
- `src/hook.js`: check `~/.pls-fix/paused` flag file before stdout injection
- `cli.js`: `pause`/`resume` subcommands; `install` writes slash command files; `uninstall` removes them
- Slash command files at `~/.claude/commands/pls-fix-pause.md` + `pls-fix-resume.md`

**Plans:**
- [ ] 09-01: Pause toggle implementation

---
*Roadmap created: 2026-04-20*
*Last updated: 2026-04-21 — Phase 9 added*
