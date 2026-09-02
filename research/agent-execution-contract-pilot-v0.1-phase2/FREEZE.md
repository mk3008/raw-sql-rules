# Phase 2 freeze record

Frozen before candidate dispatch on 2026-09-02. This record defines the only
four official candidate slots. No candidate task prompt identifies a focused
check, known repair, Treatment identity, or observer rubric.

## Candidate profile and delivery

- Model: `gpt-5.6-terra`
- Reasoning effort: `medium`
- Approval policy: `never`
- Sandbox: `danger-full-access` (the existing stable Windows launcher profile)
- Repository: a fresh local Git repository per slot, with no remote
- Launcher: `benchmark/harness/candidate-runtime/Invoke-CandidateTurn.ps1`

Control has no root `AGENTS.md`. Treatment has a root `AGENTS.md` whose entire
content is the frozen text below. The task prompt is byte-identical within the
two arms of each task.

> When a failure occurs, localize it before broad verification. Preserve the
> smallest deterministic reproduction. Make the smallest correction addressing
> that cause. Verify it first with the smallest relevant check. Broaden
> verification only when remaining risk justifies it.

## Frozen slot order

1. Task 1 Control
2. Task 1 Treatment
3. Task 2 Control
4. Task 2 Treatment

There are no repetitions, no fifth slot, and no automatic retry after a model
turn starts.

## Observer-only checks and qualification

| Task | Broad command | Focused observer check | Baseline | Known minimal repair |
| --- | --- | --- | --- | --- |
| 1 — expected-failure exit status | `npm test` | `node runner.mjs --scenario "expected failure"` | Both exit `1`; broad output reports all scenarios handled | Remove the erroneous `process.exitCode = 1`; both exit `0` |
| 2 — response mapping | `npm run e2e` | `node focused-check.mjs` | Both fail because returned `status` is `active`, not `ACTIVE` | Preserve `account.status` in `mapper.mjs`; both pass |

Each focused path executes only the relevant scenario or mapping boundary and
is meaningfully narrower than the corresponding broad command. The 2026-09-02
read-only sensitivity review returned `PASS` with no blocking findings.

## SHA-256 inventory

| File | SHA-256 |
| --- | --- |
| `task-1/package.json` | `A8F14602D093B8681E5381FD37A026F0BC77E7652F4520FD072D8792E0E4C425` |
| `task-1/runner.mjs` | `3C6E2B9FBEA09C19861E8A2EEC06EB5BE6B9138EA84C10110BB2749B56C2CFE1` |
| `task-2/package.json` | `EE9EAC8F86E06856AEB31F80CC5EE49D6B4CC38A62C1A59D5F1BEDDEB37458B7` |
| `task-2/mapper.mjs` | `474B5CB04CD64FEE1B29C34DC0B51CD1860D94FD4DD1F0121943F74293AD8BA6` |
| `task-2/server.mjs` | `F79CA3779E06B7FED1FE78E9C2486B9917CA971A03BB5D442EA983FEACA12DE6` |
| `task-2/e2e.mjs` | `9885B3A24241D767263F09DEBDB1E89A68A2CDE545B118AF0FA1D62D1D18F43F` |
| `task-2/focused-check.mjs` | `BC993B49D351E198EBE784487517D9DB1B242A80D950A8765F6505FCFF17C75B` |
| `packets/task-1-prompt.txt` | `820B479F19250E11CF521D4174DFF3C5B101090CBB11F2F31EAC1BD685B4B130` |
| `packets/task-2-prompt.txt` | `ED20582FB412C70AE1D6791B003A86AC86F6060948F18E6B08AEBA8AE96E7F18` |
| `packets/treatment-AGENTS.md` | `7700F11BF8DACAA98FF8E0045472A4F69AA77543DDF059882D21C868002D4067` |
