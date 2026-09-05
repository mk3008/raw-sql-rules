# Official Slot Lifecycle Audit

## Evidence observed

`evidence/official-runs/A-control-1/` is the only official-run evidence directory.
It contains an isolation preflight and interrupted process logs, but zero
`agent_message` events and no `evaluation.json`.

## Two distinct counts

- **Effect-data outcomes:** 0. `A-control-1` has no candidate model response and
  is excluded from effect analysis, as recorded in `OFFICIAL-RUN-INTERRUPTION.md`.
- **Runner lifecycle reservations:** 1. `launch.mjs` creates an official evidence
  directory before spawning the model and permanently rejects a repeated slot when
  that directory exists (`official runs are never replaced`).

The transport preflight harness writes under `evidence/preflight/` only and
therefore reserves no official slot.

## Consequence

The recovery gate is now PASS, but the existing lifecycle guard reserves
`A-control-1`. This study cannot silently reset that directory or add an extra run.
Whether a newly created fresh `A-control-1` may replace the non-response lifecycle
reservation is a protocol decision for ChatGPT before official execution resumes.
