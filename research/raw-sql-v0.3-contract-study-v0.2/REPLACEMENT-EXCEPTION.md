# Approved Replacement Exception

## Decision

ChatGPT approved one explicit exception to the original 20-launch, no-replacement
protocol after the original `A-control-1` had started but before the candidate
received a model response. The only permitted replacement is
`A-control-1-replacement-1`.

This is not an infrastructure amendment, a normal retry, or a general retry
mechanism. No other replacement identifier is accepted by the runner.

## Basis and exclusion

The original `A-control-1` contains `thread.started` and `turn.started`, so it
remains preserved as a started infrastructure failure. Its event stream has no
agent message, no tool call, and no completed turn; `evaluation.json` does not
exist. Its saved fixture files match the frozen fixture byte-for-byte. It produced
no candidate implementation result and is excluded from effect analysis.

The original evidence directory, logs, and snapshot are immutable historical
evidence. They are not reset, overwritten, or reused by the replacement.

## Replacement mapping and aggregation

| Original attempt | Effect-data status | Replacement | Replacement storage |
| --- | --- | --- | --- |
| `A-control-1` | infrastructure failure excluded | `A-control-1-replacement-1` | `evidence/official-runs/A-control-1-replacement-1/` |

The final study accounting separates lifecycle launches from evaluated candidate
outcomes: **21 launches**, **1 infrastructure failure excluded**, and **20 effect
data evaluations**. Communication preflights and the earlier invalid v0.1 study
remain separate from both counts.

## Preconditions and order

The replacement starts from the frozen fixture in a newly created external Git
repository with a fresh model session and isolated runtime state. It does not resume
the interrupted session. The frozen Contract, Scope, author defaults, task, fixture,
evaluator, criteria, model, reasoning effort, and permissions are unchanged.

The replacement runs first; the remaining 19 originally unstarted slots then follow
the resumption order in `execution-order.json`. The resolved child CLI must remain
`codex-cli 0.153.3`; any different executable or version stops execution for report.
