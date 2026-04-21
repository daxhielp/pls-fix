# pls-fix

## What This Is

`pls-fix` is a Claude Code plugin distributed via `npx`. It installs a `UserPromptSubmit` hook into the user's Claude Code setup that intercepts prompts before they reach Claude, classifies them as fix/debug/code requests, scores desperation level using emotional signal detection, appends the appropriate tier phrase as context, and tracks session metrics — outputting a report at session end.

**Install UX:** `npx pls-fix install`
**Uninstall UX:** `npx pls-fix uninstall`
**Report UX:** Auto-printed at session end, or `npx pls-fix report`

## Core Value

Developers using Claude Code get motivational, severity-tiered encouragement automatically injected into their fix/debug prompts — preventing mistakes through the Optimistic Attribution Model™.

## Current State

| Attribute | Value |
|-----------|-------|
| Type | Application |
| Version | 0.0.0 |
| Status | Building |
| Last Updated | 2026-04-21 |

## Requirements

### Core Features

- Prompt classifier with 5-tier desperation scoring (eligibility check + signal scoring)
- `UserPromptSubmit` hook that intercepts prompts, injects tier phrase as context via stdout
- Session tracker (temp file + persistent streak) with per-file plea counts and most-desperate-prompt tracking
- Session report renderer with box-drawing UI (printed at `SessionEnd` hook)
- CLI installer/uninstaller that mutates Claude Code's `~/.claude/settings.json`
- Dry-run mode via `PLS_FIX_DRY_RUN=true` env var

### Validated (Shipped)
- [x] IMPLEMENTATION-PLAN.md — complete technical spec for all 8 build phases — Phase 1
- [x] Project scaffold — all source files wired, tier phrases authored — Phase 2
- [x] Prompt classifier with 5-tier desperation scoring — 16 tests, all passing — Phase 3
- [x] Session tracker — 6 functions, real fs I/O, streak storage primitives — Phase 4
- [x] UserPromptSubmit hook — stdin parse, classify, inject phrase, dry-run, session update — Phase 5
- [x] Session report renderer — box-drawing output, streak update, top files, most desperate prompt — Phase 6

### Active (In Progress)
- [ ] Phase 7: CLI — `cli.js` handling install/uninstall/report subcommands

### Planned (Next)
- Phase 8: Launch — README, end-to-end verification, v1.0.0 tag
- Phase 7: CLI — `cli.js` handling install/uninstall/report subcommands
- Phase 8: Launch — README, end-to-end verification, v1.0.0 tag

### Out of Scope
- Windows support — deferred post-v1 (Claude Code config paths differ on Windows)
- Phrase randomization within tiers — nice-to-have, not v1
- Weekly digest — explicitly deferred ("planned maybe")

## Constraints

### Technical Constraints
- Claude Code hook protocol: `UserPromptSubmit` receives JSON on stdin with `prompt` field; plain text written to stdout is injected as context alongside the user's prompt
- Session report uses `SessionEnd` hook (fires once at true session end, not per-turn)
- Config target: `~/.claude/settings.json` (user-level, or `$CLAUDE_CONFIG_DIR/settings.json`)
- Node.js only — distributed via npx, no build step, CommonJS throughout
- Tier phrase text is user-authored config (not hardcoded by plugin)
- Streak persistence: `~/.pls-fix/streak.json` (persistent across sessions)

### Business Constraints
- Mac/Linux only for v1 (Windows support deferred)
- Each unit-build phase (3–7) requires checkpoint before proceeding to next
- Phrases live in `src/tiers.js` as plain exported object — user edits this directly

## Key Decisions

| Decision | Rationale | Date | Status |
|----------|-----------|------|--------|
| Phrases in `src/tiers.js` as exported object | Easy to edit, easy to swap — user owns the content | 2026-04-20 | Active |
| `mistakesPrevented` always equals `promptsBlessed` | Optimistic Attribution Model™ — by design, not a bug | 2026-04-20 | Active |
| Mac/Linux only for v1 | Windows config paths differ; controlled scope | 2026-04-20 | Active |
| `Politeness score` always A+ | Rubric is proprietary | 2026-04-20 | Active |
| `UserPromptSubmit` + `SessionEnd` hooks | PreToolUse has no prompt field; Stop fires per-turn not session-end | 2026-04-20 | Active |
| `~/.claude/settings.json` as config target | Confirmed via official docs — not claude_code_config.json | 2026-04-20 | Active |
| `~/.pls-fix/streak.json` for streak persistence | Persistent across sessions; created on first install | 2026-04-20 | Active |
| `node:test` for unit testing | Built-in, zero extra dependency | 2026-04-20 | Active |
| Pin neutral timestamp in tier tests | `time_of_day` uses system clock as fallback; tests must provide noon context to stay deterministic at any hour | 2026-04-21 | Active |
| Imperative verb eligibility: first word only | `words[0]` check prevents false matches like "don't debug" | 2026-04-21 | Active |
| `filePleaCounts` keyed by `cwd` for now | stdin provides cwd; filename extraction from promptText is a deferred decision | 2026-04-21 | Active |
| Streak increment logic lives in report.js | SessionEnd is the right moment to update streak; session.js provides storage only | 2026-04-21 | Active |
| hook.js exits 0 on all paths | Hooks must be non-blocking — JSON parse error, classify error, any failure → exit 0 silently | 2026-04-21 | Active |
| stdout is injection-only channel | No debug output ever written to stdout in hook.js — only the tier phrase or nothing | 2026-04-21 | Active |
| personalBest guard: only show ✦ when personalBest > 0 | Prevents false "personal best" on first-ever run when streak=1=personalBest | 2026-04-21 | Active |
| updateStreak() fires unconditionally in printReport() | Streak tracks days used, not blessed sessions — increments even on 0-blessing sessions | 2026-04-21 | Active |

## Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| `npx pls-fix install` end-to-end | Works in test Claude Code env | - | Not started |
| Classifier test coverage | 8+ cases, all passing | 16 cases, all passing | ✅ Complete |
| All 5 tiers activate correctly | Verified via test suite | Tiers 1–5 boundary-tested | ✅ Complete |
| Dry-run mode outputs correctly | Logs to stderr, no injection | - | Not started |

## Tech Stack / Tools

| Layer | Technology | Notes |
|-------|------------|-------|
| Runtime | Node.js ≥18 | CLI distribution via npx, CommonJS |
| Hook protocol | Claude Code `UserPromptSubmit` + `SessionEnd` | stdin JSON → stdout plain text (context injection) |
| Distribution | npm / npx | Package name: `pls-fix`, no build step |
| Config target | `~/.claude/settings.json` | User-level; `$CLAUDE_CONFIG_DIR/settings.json` if env set |
| Testing | `node:test` (built-in) | `node --test src/classifier.test.js` |
| Session storage | `os.tmpdir()/pls-fix-session.json` | Temp; streak at `~/.pls-fix/streak.json` (persistent) |

## Links

| Resource | URL |
|----------|-----|
| PRD | pls-fix-prd.md |
| Implementation Plan | IMPLEMENTATION-PLAN.md |

---
*PROJECT.md — Updated when requirements or context change*
*Last updated: 2026-04-21 after Phase 6*
