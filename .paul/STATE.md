# Project State

## Project Reference

See: .paul/PROJECT.md (updated 2026-04-20)

**Core value:** Developers get motivational, severity-tiered encouragement auto-injected into fix/debug prompts — preventing mistakes via the Optimistic Attribution Model™
**Current focus:** Phase 3 complete — classify() implemented and fully tested

## Current Position

Milestone: v1.0.0 Initial Release
Phase: 3 of 8 (Classifier) — Complete
Plan: 03-01 complete
Status: Ready for next PLAN
Last activity: 2026-04-21 — Phase 3 complete. classify() TDD: 16 tests, all passing.

Progress:
- Milestone: [███░░░░░░░] 37%
- Phase 3: [██████████] 100% ✓

## Loop Position

Current loop state:
```
PLAN ──▶ APPLY ──▶ UNIFY
  ✓        ✓        ✓     [Loop complete — ready for next PLAN]
```

## Accumulated Context

### Decisions
- Phrases live in `src/tiers.js` as plain exported object — user edits directly
- `mistakesPrevented` always equals `promptsBlessed` — Optimistic Attribution Model™, by design
- Mac/Linux only for v1 — Windows config paths deferred
- `Politeness score` always A+ — rubric proprietary
- **Hook types corrected**: Use `UserPromptSubmit` (not PreToolUse) for prompt interception; use `SessionEnd` (not Stop) for session report. PreToolUse has no prompt field; Stop fires per-turn not session-end.
- **time_of_day signal**: Uses system clock when no `context.timestamp` provided. Tests that don't exercise this signal must pin a noon timestamp to stay deterministic.
- **Eligibility — imperative verb**: Only matches when verb is `words[0]` (first word of prompt). "don't debug" won't match.
- **Signal regex on original casing**: all_caps detection runs on original `promptText`, not lowercased, to correctly detect `[A-Z]{3,}`.

### Deferred Issues

| Issue | Origin | Effort | Revisit |
|-------|--------|--------|---------|
| Windows config path support | PRD open questions | M | Post-v1.0.0 |
| filePleaCounts filename extraction | Phase 1 concern | S | Phase 5 (Hook) — stdin has cwd but not active file; need to decide how to extract filename from prompt text |
| src/tiers.js Tier 4 typo: "fix ts" | Phase 2 checkpoint | XS | User can fix anytime — not a blocker |

### Blockers/Concerns
None.

## Session Continuity

Last session: 2026-04-21
Stopped at: Phase 3 complete — classify() implemented, 16/16 tests passing
Next action: Run /paul:plan to start Phase 4 (Session Tracker)
Resume file: .paul/phases/03-classifier/03-01-SUMMARY.md

---
*STATE.md — Updated after every significant action*
