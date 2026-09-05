# Evidence and provenance

## Current normative revision

- Raw SQL Rules: **v0.3 draft (not yet tagged or released)**
- Normative source: [raw-sql-rules.md](raw-sql-rules.md)
- `raw-sql-rules.md` SHA-256: `153E96AFC88201FCD3EC2D7E9649C54A7CD066E400F78905EFE675D4F708DE5B`
- v0.1 and v0.2 remain historical provenance; no v0.3 tag or GitHub Release is
  claimed here.

The current product has three non-customizable Contracts and four
project-customizable Default Requirements. This is a human product structure,
not a flat list of seven equally mandatory agent instructions.

The exact draft text was exercised in four isolated acceptance cases (C# /
Npgsql / PostgreSQL and Node.js / node-postgres / PostgreSQL, each for a new
feature and a maintenance change). First outcomes, bounded repairs, and limits
are preserved in `research/raw-sql-v0.3-acceptance-v0.1/RESULT.md`. This is a
distribution-text acceptance, not a causal Safety Contract effect study.

## Evidence ladder

| Evidence | Question and status | What it supports | What it does not support |
| --- | --- | --- | --- |
| Historical Ashiba / v0.1 origin | Archived research provenance. | The historical origin of the standalone boundary and engineering exploration. | A current v0.3 release claim, a runtime dependency, or universal conclusions. |
| [Valid Raw SQL harness comparison](benchmark/rawsql-harness-sensitivity-ts-v0.6/FINAL-REPORT.md) | No-Rules vs Full-Rules bounded comparison; no practical Primary-quality separation observed. | In these tasks, the complete instruction bundle did not demonstrate a practical final-quality advantage. | Zero isolated effect for every historical Rule or universal agent behavior. |
| [v0.1 reclassification](research/raw-sql-rules-v0.1-reclassification.md) | Evidence synthesis and product-direction analysis. | Separating durable human/product boundaries from model-dependent operational instructions. | A normative revision or a new causal benchmark. |
| [v0.2 feasibility](research/raw-sql-v0.2-feasibility-v0.1/RESULT.md) | `PROCEED_TO_NORMATIVE_DRAFT`. | Directly visible dedicated host-language SQL, meaningful review-surface parameter identity with positional drivers, and incremental adoption are practical in the tested scope. | Language/DBMS universality or a prescribed lowering technique/package. |
| [v0.2 subtraction gate](research/raw-sql-v0.2-subtraction-gate-v0.1/RESULT.md) | `NO_PRACTICAL_SEPARATION_OBSERVED`; four Primary-PASS final trees. | Removing the tested legacy non-Requirement operational/HOW bundle did not show practical degradation on top of identical v0.2 material. | Zero isolated effect for every G1--G5 sentence or universal irrelevance of operational guidance. |
| [v0.3 Contract study](research/raw-sql-v0.3-contract-study-v0.2/FINAL-SYNTHESIS.md) | Frozen Primary: 20 PASS; post-hoc evaluator coverage is separate. | The Scope/Contract/Defaults product organization and limits for a bounded study record. | A Contract quality-effect claim, a v0.3 Default-2 acceptance result, or a universal safety guarantee. |
| Ashiba [PR #116](https://github.com/mk3008/ashiba/pull/116) | Read-only technical reference. | Native named and mechanically lowered named bindings can be technically exercised through node-postgres/PostgreSQL. | Sponsoring, reviving, moving, or depending on a standalone package. |

## Invalid studies

Invalid studies are retained as engineering evidence, including harness and
environment observations. They are not used as valid causal benchmark claims
and their INVALID findings are not promoted to Primary evidence.

## Current supported statement

In the evaluated tasks, adding the full legacy operational Rules bundle did not
demonstrate a practical final-quality advantage. Removing the legacy
non-Requirement operational/HOW layer from the v0.2 Contracts and Default
Requirements likewise produced no observed practical degradation.

This bounded evidence is distinct from the human product choice: v0.3 has a
narrow Safety Contract, while Scope defines applicability and the four Default
Requirements are project-customizable author defaults. The prior v0.3 study's
ten comment-labelled positional examples and the earlier CTE-alias probe are
not evidence that those techniques meet v0.3's named-definition and
named-binding Default 2.

## Known limits

- Samples of tasks and models are small.
- Recent comparisons are PostgreSQL-heavy.
- The subtraction gate is a bounded four-turn bundle comparison.
- No universal agent-behavior claim is supported.
- Bundle comparisons cannot establish zero isolated effect for every sentence.
- Default Requirements are not proven universally necessary or a Contract
  effect.
- Raw SQL Rules does not claim Raw SQL universally beats ORM or query-builder
  approaches.

## Provenance

The archived [Ashiba PR #114](https://github.com/mk3008/ashiba/pull/114) and
its linked materials remain historical provenance. They do not create a
runtime, configuration, CLI, or package dependency for this standalone
repository.
