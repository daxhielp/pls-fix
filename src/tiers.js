'use strict';

// Tier phrase config — YOU edit these strings.
// Each key is a desperation tier (1 = professional, 5 = rock bottom).
// Phrases are appended to eligible prompts as context for Claude.

module.exports = {
  // Tier 1 — Standard fix/debug request (score 0–1)
  1: 'Please fix.',

  // Tier 2 — Mild frustration signals (score 2–3)
  2: 'pls fix. make no mistakes.',

  // Tier 3 — Repeated attempts, emotional language (score 4–5)
  3: 'PLS fix, WITHOUT mistakes this time.',

  // Tier 4 — Desperation keywords, deadline language (score 6–8)
  4: 'PLEASE fix ts. I\'m begging you my job depends on this...',

  // Tier 5 — ALL CAPS, "still broken", demo/prod/boss, late-night (score 9+)
  5: '😭😭😭 fix this plsssss 🙏🙏🙏',
};
