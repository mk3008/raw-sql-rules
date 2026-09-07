# Default 1 placement decision for v0.3

## Decision

**A — relax dedicated-file placement in v0.3.** Retain one authoritative,
directly reviewable definition per executable application SQL statement, which
a reviewer can locate from its execution sites. Permit a dedicated source or
placement with the operation that binds/executes it. Do not prefer colocation
universally. This is a product judgment supported by bounded mechanism evidence,
not a measured improvement in review quality.

This document completes the specification assessment requested in
[Issue #40](https://github.com/mk3008/raw-sql-rules/issues/40). The user's subsequent
instruction targets the next version: this branch leaves the published main
v0.2 normative text, README, RATIONALE, EVIDENCE, and installers unchanged.
The wording below is a proposal for integration into v0.3, not a second normative
source or an already-applied release change.

## Frozen inputs

- Raw SQL Rules main: `7d211f53dc67b40c49042fbb671304880bad0319`.
- Read-only v0.3 preparation branch: `codex/v0-3-release-prep`,
  `6edd3b7805304db7c356a1d285a47448062d32f2`.
- External Serene [PR #13](https://github.com/mk3008/serene/pull/13), merge
  `78bfbee21c722978555f8cc69abd447bd42516a7`: inspected report, verifier, paired
  fixtures, and results under `evaluation/layout-ownership/`.
- Local [v0.2 feasibility result](raw-sql-v0.2-feasibility-v0.1/RESULT.md),
  [C# host-source probe](raw-sql-v0.2-feasibility-v0.1/probes/csharp-host-source.md),
  [v0.2 proposal](raw-sql-v0.2-proposal.md),
  [subtraction result](raw-sql-v0.2-subtraction-gate-v0.1/RESULT.md), and
  `examples/csharp-vsa-postgres`.

The v0.2 feasibility probe established dedicated host-language source was
practical; it did not compare dedicated with colocated placement. The subtraction
study held Default 1 fixed, so it cannot establish dedicated placement's benefit.
Neither result is retroactively reclassified.

## Smallest distinguishing evidence

The existing Serene lookup and shared pairs contain identical ordinary SQL and
exactly matching operation bodies. Each alternative has one authoritative SQL
definition. The shared specimen has two callers in the same operation file;
colocation does not require copying SQL for each caller. Names are bound through
the same `bind` call and executed through native `node:sqlite` in both layouts.

At the frozen merge, `npm ci --ignore-scripts`, `npm run build`, and
`node evaluation/layout-ownership/verify.mjs` succeeded on Node 24.19.0 /
SQLite 3.53.3. The verifier checked frozen input hashes, exact SQL and function
body equality, one definition per alternative, binding/execution traces, and
**20 native DB cases** against expected results. Three static negative controls
also passed; these concern Serene's analyzer, not the Rules layout decision.
An initial build attempt using the environment's dependency directory failed
because TypeScript was absent there; installing the frozen lockfile resolved
that setup issue without changing fixtures or expectations.

Starting at the known operation file, the same mechanical objective (find SQL,
follow binding, reach execution) used 2 full-file reads / 1 import edge for
dedicated and 1 read / 0 edges for colocated, in each pair. This is not a
measurement of discoverability from an unknown starting point, cognitive effort,
review speed, or defect detection. Serene audit/strict labels are not decision
criteria for Raw SQL Rules.

For a Rules-owned cross-check, inspected the existing C# dedicated
`ListCompletedWorkItems.sql.cs` from the feasibility evidence and the
`GetCompletedWorkItemsEndpoint.cs` example. An in-memory relocation placed the
same constant in the handler and changed only its reference. Assertions checked
one definition in each alternative, identical SQL (also matching the existing
runtime asset after whitespace normalization), and identical operation/binding/
result code after normalizing the source reference. SQL text SHA-256:
`675fb768c010761c4d5cd588293ea8a6bf3beba155b78e89c7c9b12c3d6a0059`.
These were disposable alternatives, not two installed canonical sources.
No new C# build, publish, or PostgreSQL execution is claimed. The earlier dedicated
C# probe's DB/build/publish results remain historical evidence only.

## Product questions

| Question | Finding and implication |
| --- | --- |
| Unique, reviewable source | Both existing paired layouts preserve it. File isolation is sufficient but not necessary. Retain direct location from execution sites explicitly. |
| Discovery and inventory | Dedicated `.sql` / `.sql.cs` names support a cheap file inventory. Colocation loses that particular shortcut and may require searching operations or SQL definitions. In the complete paired directories every definition and execution is traceable; general repository-wide recall was not measured. Even the old default allowed arbitrary extensions/directories, so it did not guarantee a universal filename-only inventory. Keep dedicated placement available where inventory matters. |
| Binding, execution, transactions, results | Exact paired operation bodies preserve binding and result behavior; colocation removes one definition import on the recorded route. The Rules C# completion operation keeps its transaction and three named commands in the handler already. Locating those statements there would not inherently move transaction ownership. Transaction equivalence was not exercised in the 20 read-oriented DB cases. Long SQL can make the operation harder to scan; this supports retaining a dedicated option. |
| Reuse and review | Two colocated callers already reuse one definition. Cross-feature reuse can benefit from a dedicated shared definition; that does not require every unshared statement to have its own file. Do not duplicate SQL to obtain colocation. SQL-only review can also favor dedicated files. Neither advantage is necessary for every operation. |
| Duplication and abstraction | Both choices must forbid canonical duplicates and generated mirrors. A dedicated-only rule can require otherwise unnecessary exports/imports; unrestricted colocation can encourage copy/paste. The proposed unique-definition rule permits shared sources and prevents copies from being treated as compliance. |
| DB/driver boundary | Moving a definition need not change SQL, values, driver, schema, or test entry point. The SQLite pairs demonstrate the same boundary in use. Rules C# schema, driver and regression path remain available in the proposed relocation; availability is not a claim of newly verified C# execution. |
| Scope of decision | Contracts and Defaults 2–4 are unchanged by this proposal. No Serene dependency, analyzer-driven layout rule, new framework, or universal architecture ranking follows. |

Dedicated files have real optional benefits. The stronger universal default is
nevertheless broader than the property being protected: ordinary SQL with clear
ownership and a reviewable execution connection. A placement-neutral requirement
captures that property without treating one file arrangement as its only proof.
No unresolved fresh-review behavior is needed to make this bounded product
decision. No AI participant, subagent, or effectiveness measurement was used.

## Proposed replacement for v0.3 Default 1 only

### 1. Executable application SQL has one authoritative reviewable source

Each executable application SQL statement has one authoritative definition that
a reviewer can locate from its execution sites and read directly as ordinary
SQL. The definition may be in a dedicated source or colocated with the operation
that binds or executes it. A runtime `.sql` asset is not required: host-language
source is acceptable when the SQL remains directly visible. Do not hide it
behind query construction, generated output, or another opaque representation,
and do not maintain a generated mirror or duplicate canonical source.

CTEs and subqueries remain part of one statement. When an operation executes
multiple executable application statements, each has its own identifiable
authoritative definition; they may share the operation's source file. Multiple
callers may reference the same definition. File extension and directory layout
are application choices.

This requirement applies only to executable application SQL. It does not
prescribe placement for migrations, current or canonical schema sources, driver
or control statements, non-application health or probe statements, or
non-executable documentation and examples. These boundaries do not permit
application query logic to be reclassified to avoid review.

## v0.3 integration surface

| File | Minimal future change |
| --- | --- |
| `raw-sql-rules.md` | Replace only Default 1 with the proposed block. Preserve the target version's other sections byte-for-byte. |
| `README.md` | Change the Default 1 summary to “Executable application SQL has one authoritative reviewable source.” |
| `RATIONALE.md` | Replace the dedicated-source bullet with authoritative-source discoverability; explain dedicated placement remains useful for inventory, long SQL, and cross-operation reuse. Link this assessment and state its limits. |
| `EVIDENCE.md` | Recompute the normative hash; add this bounded placement decision. Existing feasibility/subtraction records tested dedicated wording and do not validate the new exact text. Qualify the statement that the exact draft was acceptance-tested: it describes the frozen earlier draft, not the new wording. |

The v0.3 preparation branch independently reorganizes the three Contracts into
Scope and Safety Contract and strengthens Default 2. Those decisions are outside
Issue #40; this assessment neither reopens nor implements them. The Rules-owned
C# named bindings and external SQLite name-based bindings do not rely on the
historical positional CTE-alias technique, which does not meet proposed v0.3
Default 2.

The inspected preparation branch's EVIDENCE also still describes the current
product as “three non-customizable Contracts,” unlike its current Scope/Safety
Contract text. This is a pre-existing release-documentation inconsistency to
correct during v0.3 integration, not evidence against this Default 1 proposal.
Do not change installers or frozen study snapshots to make the new wording
appear previously tested.

## Preliminary instruction review

No active repository-root AGENTS.md, local SKILL.md, or orchestrator skill was
tracked on main or the inspected v0.3 preparation branch. Example and frozen
research AGENTS files are not current repository orchestration instructions.
Added a minimal root AGENTS.md: Astra works directly; any specifically needed
fresh-agent test uses Luna/medium within the task budget. Historical instructions
remain unchanged. No skill was deleted or introduced and no effectiveness study
was performed. This prerequisite is separate from the Default 1 decision.
