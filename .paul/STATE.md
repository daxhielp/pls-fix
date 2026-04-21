# Project State

## Project Reference

See: .paul/PROJECT.md (updated 2026-04-21)

**Core value:** Developers get motivational, severity-tiered encouragement auto-injected into fix/debug prompts — preventing mistakes via the Optimistic Attribution Model™
**Current focus:** Phase 4 complete — session.js fully implemented with 6 exported functions

## Current Position

Milestone: v1.0.0 Initial Release
Phase: 5 of 8 (Hook) — Not started
Plan: Not started
Status: Ready to plan
Last activity: 2026-04-21 — Phase 4 complete, transitioned to Phase 5

Progress:
- Milestone: [█████░░░░░] 50%
- Phase 4: [██████████] 100% ✓

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
- **filePleaCounts key**: Uses `cwd` (directory) as key for now — Phase 5 may refine to filename extracted from promptText.
- **Streak logic in Phase 6**: session.js provides readStreak/writeStreak storage only; increment/personalBest logic belongs in report.js at SessionEnd.
- **mostDesperatePrompt**: Replaced only on strict greater-than score — ties keep the earlier prompt.

### Deferred Issues

| Issue | Origin | Effort | Revisit |
|-------|--------|--------|---------|
| Windows config path support | PRD open questions | M | Post-v1.0.0 |
| filePleaCounts filename extraction | Phase 1 concern | S | Phase 5 (Hook) — decide whether to extract filename from promptText or keep cwd as key |
| src/tiers.js Tier 4 typo: "fix ts" | Phase 2 checkpoint | XS | User can fix anytime — not a blocker |

### Blockers/Concerns
None.

## Session Continuity

Last session: 2026-04-21
Stopped at: Phase 4 complete, transitioned to Phase 5 — ready to plan Hook
Next action: /paul:plan for Phase 5 (Hook)
Resume file: .paul/phases/04-session-tracker/04-01-SUMMARY.md

### Git State
Last commit: (Phase 4 commit pending)
Branch: master
Feature branches merged: none

---
*STATE.md — Updated after every significant action*
