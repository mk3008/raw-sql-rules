# Pre-dispatch setup amendment

The Phase 2 fixture, prompts, Treatment, observer checks, metrics, slot order,
and stopping rule remain the freeze recorded in `FREEZE.md`. Before any model
turn began, three pre-turn setup incidents occurred:

1. `Copy-Item -LiteralPath` did not expand the fixture wildcard.
2. The disposable copy-regression block had a PowerShell `$name:` interpolation
   parse error.
3. The local copy helper placed `param(...)` after `Set-StrictMode`.

None copied a candidate fixture, initialized an official candidate repository,
started a model process, or changed candidate-visible experimental content.
The official count therefore remained **0 / 4** before resumption.

The final correction moves the existing `param(...)` block to the valid start
of the local setup/copy helper. It does not alter copied content. The one
authorized focused copy regression then passed: Task 1 `package.json` and
`runner.mjs` matched the SHA-256 values in `FREEZE.md`; the disposable Control
repository was one clean commit with no remote and no `AGENTS.md`; it was then
deleted. No fixture behavior qualification was rerun.
