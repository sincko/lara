---
schema_version: 1
open_count: 1
waived_count: 0
fixed_count: 0
total_count: 1
last_updated: 2026-08-19T07:02:14.569Z
---

# Broken Windows Ledger

> Cross-phase defect register. `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 01 | unmet-truth | .planning/baseline/capture-baseline.js |  | INP numericValue unavailable from pinned recipe: interaction-to-next-paint is timespan-only in LH 13.4.1 (excluded from navigation runs; notApplicable without interactions). Baseline records INP as n/a for static pages — Phase 6 must compare INP only if a recipe change provides it. | open |  | 2026-08-19T07:02:14.569Z |  |

````json
[
  {
    "id": 1,
    "kind": "unmet-truth",
    "phase": "01",
    "file": ".planning/baseline/capture-baseline.js",
    "line": null,
    "description": "INP numericValue unavailable from pinned recipe: interaction-to-next-paint is timespan-only in LH 13.4.1 (excluded from navigation runs; notApplicable without interactions). Baseline records INP as n/a for static pages — Phase 6 must compare INP only if a recipe change provides it.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-19T07:02:14.569Z",
    "resolved_at": null
  }
]
````
