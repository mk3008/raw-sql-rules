# Excluded preflight attempts

These attempts did not reach a candidate model session and are not official
launches or effect-study data.

1. `A-control-1` ended before a model session because this CLI version rejects
   simultaneous `--sandbox` and `--approve-for-me` flags. The launcher was
   corrected to let `--approve-for-me` select its workspace-write mode.
2. `A-control-1` then waited for stdin before consuming the candidate prompt.
   Its preserved process evidence is in `A-control-1-stdin-open/`; its event
   stream is empty and the candidate source remained unchanged. The launcher
   now closes stdin immediately after spawn.
