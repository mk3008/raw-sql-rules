# Classification analysis

## Question

Classify the present v0.2 Scope, Contracts, and Default Requirements without
changing the normative product file.

## Existing evidence

- `raw-sql-rules.md` defines the current text.
- `research/raw-sql-rules-v0.1-reclassification.md` separates durable human
  boundaries from model-dependent operational guidance.
- `research/raw-sql-v0.2-feasibility-v0.1/RESULT.md` records bounded
  feasibility across Npgsql and node-postgres/PostgreSQL.
- `research/raw-sql-v0.2-subtraction-gate-v0.1/RESULT.md` found no practical
  separation from removing a legacy operational/HOW bundle; it is not an
  isolated Contract 3 experiment.

## Observation

| Current item | Observable purpose | Provisional classification |
| --- | --- | --- |
| Scope | Limits the Rules to application paths that selected Raw SQL; it does not prescribe how unrelated application concerns are implemented. | Scope |
| Contract 1 | Declares the selected, directly reviewable Raw SQL/native-driver representation for covered paths. | Contract; its wording must not expand into a blanket architecture ban. |
| Contract 2 | Reserves connection, pool, transaction, retry, logging, mapping, migration, test, deployment, and application architecture choices to the application. | Contract / ownership boundary, not a safety mechanism. |
| Contract 3 | Prevents runtime data from becoming arbitrary SQL syntax, while allowing reviewed application-controlled structural variation. | Safety Contract candidate. |
| Default Requirements 1–4 | State the author's selected reviewability, parameter-meaning, schema-inspection, and real-boundary-verification defaults. | Default Requirements. |

## Inference

Contract 3 is the only current Contract whose text directly controls a
runtime-input safety boundary. Contract 1 and Contract 2 are durable product
boundaries but are not suitable for a study that claims an isolated safety
treatment effect. The default Requirements are feasible in the bounded v0.2
study, but their universal necessity is not established.

## Limitations

This analysis classifies current text; it does not demonstrate how a particular
model responds to the text. The v0.2 feasibility scope was two PostgreSQL
stacks, and prior comparison studies did not isolate Contract 3.

## Provisional classification

Use Contract 3 alone as the candidate-visible treatment in a new effect study.
Do not promote any v0.3 product change until the effect study and final
synthesis are complete.
