# Why Raw SQL Rules exists

Raw SQL Rules is not a collection of preferred SQL practices assembled from intuition. It emerged from a larger effort to make application Raw SQL safer by building, comparing, removing, and re-testing different mechanisms.

That earlier project was called **Ashiba**, a project that explored how to use Raw SQL safely in application development. It initially owned a broader SQL-first toolchain and repeatedly tested which responsibilities were actually worth keeping. Understanding Ashiba is not required to use Raw SQL Rules; its archived evaluations matter here as research evidence for how this contract was reached.

Raw SQL Rules is intentionally short. That does not mean database work is simple, and it does not mean natural language replaces database behavior or tests.

The contract is small because it does not invent another data-access system. It assigns authority to things an application already has:

```text
SQL source assets        -> query intent
canonical current DDL    -> schema context
named parameters         -> input meaning
native database driver   -> execution boundary
real database tests      -> behavior and runtime-type authority
```

The Rules mainly constrain unsafe or ambiguous choices around those existing authorities. Ordinary application glue and architecture remain application-owned.

These Rules were not written once and declared correct. They were challenged with fresh agents, revised when failures exposed ambiguity, and finally confirmed against a real database. The archived Ashiba repository keeps that research trail.

## Product boundary

Raw SQL Rules is an instruction harness for AI-assisted Raw SQL work. It owns the contract that shapes how an agent starts and carries out that work, with the goal of materially improving first-pass direction and consistency.

It does not certify the code an agent produces. The resulting code is ordinary application code: requirements and prompts define what should be built, database-backed tests provide behavioral evidence, and normal review remains appropriate when the risk or change warrants it. A verifier, linter, review engine, or test framework would be a different product responsibility rather than a missing part of these Rules.

## Why can natural-language Rules be enough?

### Existing primitives already carry most of the semantics

SQL, DDL, the target database, and the native driver already define the real technical behavior. The Rules do not need to recreate a schema language, query language, transaction API, or type system.

Ashiba had already converged on visible SQL, separate values, finite reviewed dynamic syntax, native-driver execution, and application/live tests while rejecting ownership of application architecture and broad framework surface. See [Ashiba Scope](https://github.com/mk3008/ashiba/blob/main/docs/design/ashiba-scope.md).

### The Rules constrain choices instead of prescribing How

A capable coding agent can usually write ordinary driver calls, load a SQL file, or follow an existing test example. The durable knowledge is the boundary: what must remain visible, what is authoritative, and what escape hatches are not allowed.

This was visible in the [AI-native construction baseline](https://github.com/mk3008/ashiba/blob/main/docs/evaluations/ai-native-construction-baseline.md): fresh agents reached correct live PostgreSQL behavior without requiring a generator or scaffold, while generated/scaffolded paths sometimes added repair or non-fitting material.

### Repository examples supply the How after bootstrap

The difficult case was when no database-backed test existed yet. Once one small real-database verification path existed, later fresh agents could follow and extend that example without special completion prose.

See the [V5 bootstrap/steady-state results](https://github.com/mk3008/ashiba/blob/main/packages/raw-sql-rules/evidence/v5/results.md) and the final [V6 confirmation](https://github.com/mk3008/ashiba/blob/main/packages/raw-sql-rules/evidence/v6/confirmation.md).

That is why Rule 8 distinguishes normal maintenance from the zero-to-one bootstrap case instead of carrying a permanent testing tutorial.

### Code remains valid for genuinely mechanical gaps

The contract does not claim that all problems belong in prose. When a driver lacks a capability needed to express the Rules naturally, a small deterministic adapter may be justified.

The [named-parameter ownership evaluation](https://github.com/mk3008/ashiba/blob/main/docs/evaluations/named-parameter-ownership/NAMED_PARAMETER_OWNERSHIP_REPORT.md) confirmed that mysql2 and mssql expose natural named binding while `pg` is positional. It also showed the limit: named identity helps review and maintenance, but does not prove business semantics. Real application/database tests remain authoritative.

## How the hypothesis emerged

Ashiba first ran a broader comparison with Prisma, sqlc, Drizzle, Kysely, and native `pg`. The important result was not a universal winner. Native `pg` performed strongly when given explicit Raw SQL safety constraints, while the Ashiba package did not demonstrate a general task-success advantage over it.

That led to the hypothesis:

```text
native driver
+ Raw SQL safety rules
+ application/live tests
```

rather than a larger runtime framework.

The reasoning, measured results, and limitations are documented in:

- [Post-Benchmark Product Interpretation](https://github.com/mk3008/ashiba/blob/main/docs/evaluations/current-ashiba-competitive-benchmark-v3/POST_BENCHMARK_PRODUCT_INTERPRETATION.md)
- [AI-First Strategic Interpretation](https://github.com/mk3008/ashiba/blob/main/docs/evaluations/current-ashiba-competitive-benchmark-v3/AI_FIRST_STRATEGIC_INTERPRETATION.md)

Those documents explicitly avoid claiming that Raw SQL or Ashiba universally beats an ORM. The benchmark instead supported subtraction: much of the useful boundary could be expressed without permanent framework ownership.

## How Raw SQL Rules itself was tested

The standalone contract then received a separate evaluation. The initial Rules were frozen by hash; amendments preserved prior evidence; tests looked for both unsafe underconstraint and unreasonable overconstraint. See the [preregistered evaluation plan](https://github.com/mk3008/ashiba/blob/main/packages/raw-sql-rules/EVALUATION_PLAN.md).

The [full evaluation report](https://github.com/mk3008/ashiba/blob/main/packages/raw-sql-rules/EVALUATION_REPORT.md) records the progression:

1. **V0-V2:** adversarial scenarios and independent fresh judgments established the SQL/source/schema/dynamic-syntax boundaries and exposed an optional-filter ambiguity.
2. **V3:** goal-driven implementation probes were added. Two safe implementations stopped at mock-only tests, so the result was downgraded to **NOT-YET**.
3. **V4:** a separate completion-contract experiment was inconclusive because Rules-only agents also used the live database once that path was clearly discoverable.
4. **V5:** the study separated the zero-test bootstrap case from normal steady-state work. A minimal bootstrap succeeded, and two ordinary fresh changes reused it without extra testing instructions.
5. **V6:** the two-state model was made normative in Rule 8 and confirmed again with fresh MySQL 8.4/mysql2 execution.

The final result was **READY-WITH-LIMIT**. The limit is evidence breadth — one primary final driver/dialect and small agent/task diversity — not a known unsafe escape that was hidden from the report.

## Why each Rule exists

| Rule | Why it exists | Main evidence |
| --- | --- | --- |
| **1. One visible query representation** | Avoid split-brain data access where local problems create a second ORM/builder/generated path. Visible SQL + native driver was already capable in measured bounded work. | [Post-benchmark interpretation](https://github.com/mk3008/ashiba/blob/main/docs/evaluations/current-ashiba-competitive-benchmark-v3/POST_BENCHMARK_PRODUCT_INTERPRETATION.md), [AI-first interpretation](https://github.com/mk3008/ashiba/blob/main/docs/evaluations/current-ashiba-competitive-benchmark-v3/AI_FIRST_STRATEGIC_INTERPRETATION.md) |
| **2. Application SQL is source** | Make query logic searchable, format-able, diffable, reviewable, and directly retrievable by humans and agents. One-line application DML still carries application logic; trivial control/probe SQL may stay inline. | [AI-native baseline](https://github.com/mk3008/ashiba/blob/main/docs/evaluations/ai-native-construction-baseline.md), [Rules evaluation](https://github.com/mk3008/ashiba/blob/main/packages/raw-sql-rules/EVALUATION_REPORT.md) |
| **3. Current schema is directly inspectable** | Current structure should not require replaying migration history. Large monolithic DDL is allowed, but must not become the only impractical context. No special DDL framework is required. | [Rules evaluation](https://github.com/mk3008/ashiba/blob/main/packages/raw-sql-rules/EVALUATION_REPORT.md), [DDL Docs ownership decision](https://github.com/mk3008/ashiba/blob/main/docs/evaluations/ddl-docs-ownership/DDL_DOCS_DECISION.md) |
| **4. Runtime data never supplies SQL syntax** | Keep external data in the parameter channel. Allow legitimate structural variation only through finite reviewed choices instead of arbitrary fragment construction. | [Rules evaluation](https://github.com/mk3008/ashiba/blob/main/packages/raw-sql-rules/EVALUATION_REPORT.md), [AI-native baseline](https://github.com/mk3008/ashiba/blob/main/docs/evaluations/ai-native-construction-baseline.md) |
| **5. Preserve parameter meaning** | Names reduce positional bookkeeping and preserve intent during maintenance. They are not semantic proof; positional-only drivers may need a small deterministic adapter. | [Named-parameter evaluation](https://github.com/mk3008/ashiba/blob/main/docs/evaluations/named-parameter-ownership/NAMED_PARAMETER_OWNERSHIP_REPORT.md) |
| **6. Make non-obvious SQL reviewable** | SQL is kept visible partly so humans and agents can reason about it. Comments are useful for non-obvious intent, locking/correctness, or performance — not as mechanical noise. | [Rules evaluation](https://github.com/mk3008/ashiba/blob/main/packages/raw-sql-rules/EVALUATION_REPORT.md), [Ashiba Scope](https://github.com/mk3008/ashiba/blob/main/docs/design/ashiba-scope.md) |
| **7. Keep application ownership with the application** | Pools, transactions, retries, logging, mapping, migrations, and business semantics should not become framework surface merely because they are useful. | [AI-native baseline](https://github.com/mk3008/ashiba/blob/main/docs/evaluations/ai-native-construction-baseline.md), [DDL Docs ownership](https://github.com/mk3008/ashiba/blob/main/docs/evaluations/ddl-docs-ownership/DDL_DOCS_DECISION.md) |
| **8. Verify at the real database boundary** | DDL/static types/mocks can describe expectations but cannot prove target DB + driver behavior or runtime representations. V3 exposed this as a real failure; V5/V6 established the bootstrap/steady-state solution. | [V5 results](https://github.com/mk3008/ashiba/blob/main/packages/raw-sql-rules/evidence/v5/results.md), [V6 confirmation](https://github.com/mk3008/ashiba/blob/main/packages/raw-sql-rules/evidence/v6/confirmation.md) |

## What this evidence does not justify

Raw SQL Rules is **not** evidence that:

- Raw SQL is universally superior to an ORM or query builder;
- every coding agent will follow these Rules in every repository;
- MySQL/mysql2 results automatically generalize to every driver and dialect;
- named parameters prevent business-level cross-wiring;
- database-backed tests prove all business correctness;
- PostgreSQL needs no named-parameter adaptation;
- no future mechanical tool can ever be justified.

The strongest supported statement is narrower:

> For applications that intentionally choose visible Raw SQL, a small natural-language contract plus ordinary repository context and real database regression evidence was sufficient in the evaluated scope without adding a data-access framework.

## Full research trail

- [Ashiba PR #114 — complete Raw SQL Rules development/review history](https://github.com/mk3008/ashiba/pull/114)
- [Raw SQL Rules evaluation plan](https://github.com/mk3008/ashiba/blob/main/packages/raw-sql-rules/EVALUATION_PLAN.md)
- [Raw SQL Rules evaluation report, V0-V6](https://github.com/mk3008/ashiba/blob/main/packages/raw-sql-rules/EVALUATION_REPORT.md)
- [V5 bootstrap/steady-state results](https://github.com/mk3008/ashiba/blob/main/packages/raw-sql-rules/evidence/v5/results.md)
- [V6 confirmation](https://github.com/mk3008/ashiba/blob/main/packages/raw-sql-rules/evidence/v6/confirmation.md)
- [Post-Benchmark Product Interpretation](https://github.com/mk3008/ashiba/blob/main/docs/evaluations/current-ashiba-competitive-benchmark-v3/POST_BENCHMARK_PRODUCT_INTERPRETATION.md)
- [AI-First Strategic Interpretation](https://github.com/mk3008/ashiba/blob/main/docs/evaluations/current-ashiba-competitive-benchmark-v3/AI_FIRST_STRATEGIC_INTERPRETATION.md)
- [AI-native construction baseline](https://github.com/mk3008/ashiba/blob/main/docs/evaluations/ai-native-construction-baseline.md)
- [Named Parameter Durable Ownership Evaluation](https://github.com/mk3008/ashiba/blob/main/docs/evaluations/named-parameter-ownership/NAMED_PARAMETER_OWNERSHIP_REPORT.md)
- [DDL Docs Ownership Decision](https://github.com/mk3008/ashiba/blob/main/docs/evaluations/ddl-docs-ownership/DDL_DOCS_DECISION.md)
- [Ashiba Scope](https://github.com/mk3008/ashiba/blob/main/docs/design/ashiba-scope.md)

These are evidence/provenance links, not runtime dependencies. The standalone [raw-sql-rules.md](raw-sql-rules.md) remains the normative contract.
