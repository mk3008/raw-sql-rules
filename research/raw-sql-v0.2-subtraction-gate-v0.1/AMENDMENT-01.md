# Amendment 01 — Windows npm prefix invocation

Recorded before any candidate `thread.started` or `turn.started` event. The
first calibration attempt stopped with official launch count `0` because the
runner invoked `npm install ... --prefix <workspace>`. npm interpreted the
working repository, which has no root `package.json`, instead of the intended
fixture workspace.

The runner now invokes `npm.cmd --prefix <workspace> install --ignore-scripts
--silent` in the two pre-turn dependency-install locations. This is a Windows
command argument-order/path correction only. It does not change a fixture,
prompt, frozen v0.2 Rules copy, Reduced/Guided packet text, evaluator semantics,
candidate profile, order, or classification rule. `FREEZE.md` remains the
unaltered pre-execution record; this amendment records the post-freeze
pre-launch infrastructure correction allowed by `PROTOCOL.md`.
