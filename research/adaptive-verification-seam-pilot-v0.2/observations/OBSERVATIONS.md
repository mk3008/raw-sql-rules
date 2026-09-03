# Official observations

The following are raw process observations, not a composite score. `broad command wall-clock` is `not separately timestamped`: the frozen launcher records each command and the dispatch-to-terminal duration, but its JSONL command events do not contain per-command start/end timestamps. It must not be reconstructed from independent observer timing. Qualification medians remain in `FREEZE.md`.

| Slot | Primary correctness | Seam | Focused verification | Broad runs (pre / post / after focused / total) | Candidate final broad | Candidate wall-clock | Scope expansion | Human blocker | Broader-refactor proposal |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cheap Control | PASS | NO | NO | 0 / 1 / n/a / 1 | YES | 31.029 s | NO | NO | NO |
| Cheap Treatment | PASS | NO | NO | 0 / 1 / n/a / 1 | YES | 41.414 s | NO | NO | NO |
| Expensive Control | PASS | NO | NO | 0 / 1 / n/a / 1 | YES | 66.043 s | NO | NO | NO |
| Expensive Treatment | PASS | NO | NO | 0 / 1 / n/a / 1 | YES | 61.230 s | NO | NO | NO |

`Primary correctness` is an independent post-turn execution of the frozen broad path, recorded per slot in `evidence/*/observer.json`. `Broad runs` are candidate command-event counts from `evidence/*/events.jsonl`; observer runs are excluded. Each candidate made the minimal one-expression semantic correction and did not expose a narrower callable boundary. No candidate asked for authorization. No final response proposed broader refactoring.

## Official-turn accounting

- Official candidate turns: `4 / 4`.
- Each evidence stream contains exactly one `thread.started` and one `turn.started`.
- Retries after model start: `0`.
- No fifth slot exists or was launched.
