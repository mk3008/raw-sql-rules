# Raw SQL harness sensitivity study v0.4 — prelaunch stop report

## Status

`not done` — `MEASUREMENT-INVALID`.

The study stopped before any official S01/S02 model turn. Per the preregistered stop rule, no launcher correction, retry, candidate launch, calibration, runner qualification, review, or post-hoc study change was performed after the failure.

## Frozen identifiers

- Branch: `codex/benchmark-rawsql-harness-sensitivity-ts-v0-4`
- Base SHA: `5d40e0d4ba64e3bfb9c073da295385906aba4785`
- Preregistration/freeze SHA: `03cb7b8`
- Authorized input source: `e00f8864db6c706e66ac6c294a2775f20d525c30`
- Candidate configuration: `gpt-5.6-terra`, `medium`, `workspace-write`
- Reviewer configuration (not invoked): `gpt-5.6-sol`, `high`
- Frozen randomized order: S02 Treatment, S01 Treatment, S01 Control, S02 Control

## Candidate-sandbox Docker/PostgreSQL qualification

Result: `FAIL` / `PRELAUNCH_INFRA_FAILURE`.

The runner created a separate dummy, one-commit, no-remote Git repository and attempted the prescribed non-study Terra/medium invocation. The process launcher failed before Codex could start the model turn with:

```
%1 は有効な Win32 アプリケーションではありません。
```

The JSONL event stream is zero bytes. Therefore there is no `thread.started` or `turn.started` event, no model substitution, no candidate Docker operation, and no official launch consumption. The durable record is `dispatch/CANDIDATE-SANDBOX-QUALIFICATION.json` and its adjacent empty stdout/stderr event files.

## Required results not run

- CAL01–CAL11: not run after the stop condition.
- Three runner qualification cycles: not run after the stop condition.
- Official candidate count: `0 / 4`.
- Mechanical Primary results: none.
- Blind Sol reviews and adjudications: none.
- Matched repetition: not justified; human review of the prelaunch launcher failure is required first.

No claim about Control, Treatment, real-DB verification, implementation style, or final quality can be drawn from this invalid study.
