# pls-fix

An innovative Claude Code hook that injects encouragement for your Claude Code session. **pls-fix** classifies your fix/debug prompts, tracks desperation level, and auto-injects tier-appropriate encouragement. Prevents mistakes through the Optimistic Attribution Model™.

## Background
One of the greatest issues in agentic SWE is the problem of hallucination. As advanced as a model can get, the probability of it forgetting or overlooking a mistake is always nonzero. Top engineers have been racking their brains on how to address and mitigate this issue, but despite creating advanced harnesses and plugins, bugs still ocurr. That is why I built `pls-fix`

`pls-fix` is a ✨complete✨, plug-and-play solution to hallucination and *ALL* logic errors during agentic developemnt. 

[See disclaimer below](#disclaimer)

## Install

```bash
npx pls-fix install
```

Registers `pls-fix` hooks into your Claude Code setup (`~/.claude/settings.json`).
Restart Claude Code after installing to activate.

To install for the current project only (writes to `.claude/settings.json` in the current directory):

```bash
npx pls-fix install --local
```

Local and global installs can coexist. Uninstall locally with:

```bash
npx pls-fix uninstall --local
```

To uninstall globally:

```bash
npx pls-fix uninstall
```

## What it does

On every prompt you submit to Claude Code, `pls-fix` checks whether it's a fix/debug/code request. If eligible, it scores your desperation level (0–9+ points) across 10 signals — repeated attempts, ALL CAPS words, deadline language, late-night timestamps, quoted error messages, and more — and maps the score to one of 5 tiers. The tier phrase is appended as context before Claude sees your prompt. At session end, a box-drawing report shows your stats.

## Session report

```
┌───────────────────────────────────────────┐
│           pls-fix  session report         │
├───────────────────────────────────────────┤
│  Prompts blessed         47               │
│  Mistakes prevented      47  (100%)       │
│  Tier 5 activations       3               │
│  Politeness score        A+               │
├───────────────────────────────────────────┤
│  Top offending files                      │
│    auth/middleware.ts    11 pleas  🔴     │
│    utils/dateParser.js    8 pleas  🟠     │
│    webpack.config.js      6 pleas  🟠     │
├───────────────────────────────────────────┤
│  Most desperate prompt  (Tier 5, 11:47pm) │
│  "PLEASE fix this it's been 3 hours why   │
│   doesn't this WORK"                      │
└───────────────────────────────────────────┘

  Current no-mistake streak: 14 days  ✦ personal best
```

Print the report at any time:

```bash
npx pls-fix report
```

## Dry-run mode

`--local` and `--dry-run` can be combined: `npx pls-fix install --local --dry-run`

Install with `--dry-run` to track sessions without injecting phrases:

```bash
npx pls-fix install --dry-run
```

In dry-run mode, `pls-fix` logs to stderr what it *would have* injected but does not modify your prompt. Tracking and reporting continue normally.

## Customizing tier phrases

Phrases live in `src/tiers.js` inside the installed package. To customize:

1. Install globally instead of via npx: `npm install -g pls-fix`
2. Find the global install: `npm root -g`
3. Edit `<global-root>/pls-fix/src/tiers.js` — change any of the 5 tier strings
4. Restart Claude Code

The five tiers (1 = professional, 5 = rock bottom) ship with these defaults:

```js
module.exports = {
  1: 'Please fix.',
  2: 'pls fix. make no mistakes.',
  3: 'PLS fix, WITHOUT mistakes this time.',
  4: "PLEASE fix ts. I'm begging you my job depends on this...",
  5: '😭😭😭 fix this plsssss 🙏🙏🙏',
};
```

## Disclaimer
⚠️Use at your own risk⚠️

> *With great power comes great responsibility*     - Uncle Ben


> **Mistake prevention methodology:** `pls-fix` reports mistakes prevented as equal to the number of blessed prompts. This figure is calculated using our proprietary Optimistic Attribution Model™ (OAM), which assumes counterfactual mistake occurrence in all non-blessed prompts. `pls-fix` has never observed a mistake following a successful blessing. Past performance is not indicative of future results. Politeness score rubric is not publicly available.
