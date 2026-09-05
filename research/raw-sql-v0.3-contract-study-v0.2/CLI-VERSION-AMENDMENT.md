# CLI Version Recording Amendment

The approved replacement was launched after a runner-equivalent preflight and an
immediate Node-child version check confirmed `codex-cli 0.153.3`. No alternate CLI
or provider was used.

Before the remaining 19 launches, `execution-order.json` records this resolved CLI
version and `launch.mjs` now verifies it immediately after candidate isolation
preflight. A mismatch fails before model spawn; the resolved version is saved in
both preflight and launch evidence.

This is a fail-closed execution-recording amendment only. It does not alter the
candidate prompt, task, fixture, packets, evaluator, model, reasoning effort,
permissions, or criteria.
