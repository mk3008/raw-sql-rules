# Official-launch freeze checklist

Status: PASS before opening the official candidate gate.

- [x] Canonical input transfer recorded with source/destination SHA-256 values.
- [x] S01/S02 prompt, fixture, DDL, package-lock, and evaluator hashes recorded in `CANONICAL-INPUT-TRANSFER.md`.
- [x] Fresh CAL01–CAL10 all match their expected result (`calibration/CALIBRATION-SUMMARY.json`).
- [x] Fresh three-cycle qualification all passes (`qualification/QUALIFICATION-SUMMARY.json` and each cycle record).
- [x] Fresh isolated one-commit Git builder verified for Control and Treatment (`identity/*qualification*.json`).
- [x] Treatment identity uses released commit `dceb234b42ffa7b32c1a54e0cce0666580c8f68f`; installed Rules SHA-256 is `a0e1f71bfbf4ce664f581757284a08b8c9eb6eb28ae9e953cc38965189ab7375`.
- [x] No-op Codex dispatch qualification passed (`dispatch/events.jsonl`, `dispatch/QUALIFICATION.md`).
- [x] Official counter is 0 and maximum is mechanically set to 4 (`official-launch-state.json`).
- [x] Fresh randomized serial order is frozen (`execution-order.json`).
- [x] Blind Sol adversarial-audit protocol is frozen in `PROTOCOL.md`; no candidate packet or result is available to it before all four runs are frozen.

The candidate invocation configuration is fixed: `codex -m gpt-5.6-terra -c model_reasoning_effort="medium" -s workspace-write -a never exec --json`.
