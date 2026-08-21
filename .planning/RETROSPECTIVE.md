# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Updates, Debugging and Refinements

**Shipped:** 2026-08-21
**Phases:** 6 | **Plans:** 27 | **Sessions:** ~8

### What Was Built
- Full regression net (10 jest suites / 85 tests) + reusable Lighthouse/PSI CWV capture recipe with an honest median-of-3 baseline
- Foundation cleanup: single yarn lockfile, unambiguous Node version (24 enforced), dead components/deps removed, Italian README
- Core stack modernized: Gatsby 5.16.1 lockstep, dart-sass, Decap CMS, GA4, single sitemap
- Plain-SCSS contact form (MUI removed) with honest success/failure handling and env-var credentials
- All images on gatsby-plugin-image with Italian SEO (lang="it", og:image fixed, clean privacy page)
- Performance: @fontsource self-hosting, assets 61→23, single PWA manifest, **LCP −52%/−70%/−71%, perf scores 100/100/100**

### What Worked
- The regression net (Phase 1) paid off repeatedly: every refactor in Phases 4-6 landed on a green suite; the UPGR-02 test caught the font-import regression before it shipped
- Tracer-first planning (Phase 5, 6): the wave-1 tracer de-risked the whole gatsby-plugin-image migration (the enum-form gotcha surfaced on one page, not five)
- Research-corrected versions: the registry-verified 3.16.0 gatsby-plugin-image pin and the layout-entry font path saved hours of broken-build debugging
- The blocking-human checkpoints (deploy gate, package legitimacy) prevented real damage: stale-state capture and unvetted dependency both intercepted
- Empirical verification discipline: AST-level tests for the remark autolink, live pipe tests for the deletion script, pixel/occurrence-count greps — the checker caught 4 gate-formulation bugs

### What Was Inefficient
- /tmp tmpfs quota exhaustion (EDQUOT) broke builds mid-milestone — TMPDIR=/home/simos/tmp workaround should have been set from day 1
- The plan-checker caught several verify-gate bugs only at review time (grep -c vs grep -o, multi-file grep -c, minified-line counting, order-tolerant CSS greps) — these cost 2-3 revision rounds per phase
- Phase 2's node-sass failure blocked its UAT for days; the debug sessions stayed "diagnosed" until milestone close (they were resolved by Phase 3 but never closed)
- The milestone close needed 4 artifact reconciliations (2 debug sessions, 1 UAT, 1 VERIFICATION) that were all known-resolved but never canonicalized

### Patterns Established
- Layout-entry CSS imports for font transport (SCSS @use path is broken in this repo — verified)
- Reference-grep deletion script with read-only default (auditable destructive operations)
- Order-tolerant, occurrence-counting verify greps (grep -o | wc -l; [^}]*display:block)
- blocking-human gates for anything an auto-approve could corrupt (deploys, package installs)
- Additive-only SCSS discipline (Phase 5 precedent)

## Key Lessons
1. **Verify commands must be tested against the actual build output** (minified single-line HTML breaks grep -c; dart-sass property order breaks anchored greps) — the checker is the last line, but the planner should assume it
2. **Empirical corrections beat documented claims**: every "verified" claim that mattered (3.16.0 exists, layout-entry works, span kills autolink) was reproduced in a git worktree — do this before planning
3. **TMPDIR needs to be set before the first build**, not after the first EDQUOT
4. **Close debug sessions when the fix lands**, not at milestone close — they pile up
5. **The tracer-first wave structure paid for itself**: one surface proven end-to-end before expanding is worth the extra wave

## Cost Observations
- Model mix: ~80% sonnet (executors/researchers), ~20% opus (planner)
- Sessions: ~8
- Notable: the planner's opus runs produced plans that survived the checker with only gate-formulation issues — the expensive planning was the right call

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~8 | 6 | First milestone: regression net first, empirical research, blocking-human gates |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 85 | n/a | 5 |

### Top Lessons (Verified Across Milestones)

1. **Verify commands must be verified against the live output** — caught 4+ gate formulation bugs at plan check; verify greps are the executor's truth.
2. **Empirical proof beats documentation** — registry-verified versions and git-worktree reproduction changed two UI-SPEC claims during planning.
