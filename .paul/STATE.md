# Project State

## Project Reference

See: .paul/PROJECT.md (updated 2026-04-21)

**Core value:** Developers get motivational, severity-tiered encouragement auto-injected into fix/debug prompts — preventing mistakes via the Optimistic Attribution Model™
**Current focus:** v1.1.0 COMPLETE — pause toggle shipped

## Current Position

Milestone: v1.2.0 Local Install — COMPLETE
Phase: 10 of 10 (Local Install) — Complete
Plan: 10-01 complete
Status: Milestone complete — ready for npm publish or next milestone
Last activity: 2026-04-21 — Phase 10 complete, v1.2.0

Progress:
- Milestone: [██████████] 100% ✓
- Phase 10: [██████████] 100% ✓

## Loop Position

Current loop state:
```
PLAN ──▶ APPLY ──▶ UNIFY
  ✓        ✓        ✓     [Milestone complete]
```

## Accumulated Context

### Decisions
- Phrases live in `src/tiers.js` as plain exported object — user edits directly
- `mistakesPrevented` always equals `promptsBlessed` — Optimistic Attribution Model™, by design
- Mac/Linux only for v1 — Windows config paths deferred
- `Politeness score` always A+ — rubric proprietary
- **Hook types**: `UserPromptSubmit` (prompt interception) + `SessionEnd` (report)
- **hook.js exits 0 on all paths** — hooks must never block Claude
- **stdout injection-only** — hook.js writes only tier phrase or nothing to stdout
- **`_pls-fix: true` on outer hook entry** — filter at array level on uninstall
- **isAlreadyInstalled() guard** — prevents duplicate hook entries on repeated install
- **README tier customization via `npm install -g`** — npx cache is ephemeral
- **`~/.pls-fix/paused` flag file** — presence = paused; no config mutation; updateSession() still fires
- **Absolute paths baked into slash command .md files at install time** — stable across npx/global installs

### Deferred Issues

| Issue | Origin | Effort | Revisit |
|-------|--------|--------|---------|
| Windows config path support | PRD open questions | M | Post-v1.0.0 |
| filePleaCounts filename extraction | Phase 1 concern | S | Kept as cwd — revisit if report display looks wrong |
| src/tiers.js Tier 4 typo: "fix ts" | Phase 2 checkpoint | XS | User can fix anytime |
| npm publish | Phase 8 scope limit | XS | Manual step when ready |

### Blockers/Concerns
None.

## Session Continuity

Last session: 2026-04-21
Stopped at: v1.2.0 complete — local install support
Next action: `npm publish` when ready to release to registry
Resume file: .paul/phases/10-local-install/10-01-SUMMARY.md

### Git State
Last commit: (pending — phase commit)
Tag: v1.0.0
Branch: master
Feature branches merged: none

---
*STATE.md — Updated after every significant action*
