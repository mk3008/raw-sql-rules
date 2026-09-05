# Official Run Interruption

## Status

`A-control-1` was stopped before the candidate received a model response. It is not
an official effect-data observation and has not been evaluated or replaced.

## Observed infrastructure failure

The candidate launch began at `2026-09-05T03:38:12.373Z`. Its independent-repository
preflight passed, and the post-interruption runtime verifier also passed. The nested
Codex process then repeatedly failed to connect to the Responses service with
`invalid peer certificate: UnknownIssuer`, followed by repeated HTTPS connection
failures. After more than ten minutes without a candidate response, the process was
stopped at `2026-09-05T03:48:19.245Z`.

The raw `events.jsonl`, `stderr.txt`, `preflight.json`, `launch.json`, and the
candidate filesystem snapshot are preserved under `evidence/official-runs/A-control-1/`.
No evaluator was run, and this directory must not be counted as one of the preregistered
20 candidate outcomes.

## Required decision

All remaining candidate runs are paused because they use the same model-service route.
Resuming with a repaired service route, and whether the interrupted slot may be replaced
by a newly created fresh run, requires a protocol decision from ChatGPT. The frozen task,
fixture, evaluator, packets, model profile, execution order, and decision criteria remain
unchanged.

## Revalidation

On `2026-09-05T03:51Z`, a non-official direct Codex CLI probe using the same
`gpt-5.6-terra` / medium profile reproduced the `invalid peer certificate:
UnknownIssuer` error on WebSocket and the subsequent HTTPS retry failures. The probe
was stopped without a model response and is not study data. In contrast, Windows
Schannel `curl` successfully completed an HTTPS request to `https://api.openai.com/v1`.
This distinguishes general TCP/Schannel reachability from the Codex native TLS trust
path that the candidate launcher actually uses.
