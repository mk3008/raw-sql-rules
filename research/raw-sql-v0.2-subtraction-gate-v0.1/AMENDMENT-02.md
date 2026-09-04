# Amendment 02 — Windows npm working directory

Recorded before any candidate `thread.started` or `turn.started` event. The
first attempted Amendment-01 command, `npm.cmd --prefix <workspace> install`,
still caused npm 10.9.2 on this Windows host to resolve the parent repository as
its package root and fail because that root has no `package.json`.

The runner now enters the already-selected disposable workspace, invokes
`npm.cmd install --ignore-scripts --silent`, and restores the prior directory in
`finally`. This is the same pre-turn dependency-install path correction. It
does not change any candidate-visible file, evaluator behavior, profile, order,
or classification. `FREEZE.md` remains unchanged; Amendments 01 and 02 are the
complete record of pre-launch infrastructure corrections.
