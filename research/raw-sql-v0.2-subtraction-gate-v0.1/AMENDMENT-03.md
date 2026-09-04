# Amendment 03 — evaluator process termination

Recorded before any candidate `thread.started` or `turn.started` event. During
calibration the evaluator emitted its JSON but did not terminate because the
fixture's node-postgres pool remained live. The evaluator now calls
`process.exit` immediately after writing its complete JSON result instead of
only assigning `process.exitCode`.

This changes evaluator process termination only. The HTTP/DB checks, produced
JSON, PASS/FAIL semantics, fixtures, prompts, arm packets, candidate profile,
order, and classification remain unchanged. `FREEZE.md` remains unchanged; this
is the third and final recorded pre-launch infrastructure correction.
