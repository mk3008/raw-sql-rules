# Raw SQL Rules v0.1 reclassification

## Status and scope

This is an evidence-synthesis and product-direction analysis, not a normative
revision. `raw-sql-rules.md` (research revision v6, shipped as standalone
release 0.1) is unchanged. No candidate benchmark, Docker/PostgreSQL
experiment, calibration suite, or harness change was run for this analysis.

The requested starting commit was verified after fetching `origin`:
`38129afcb517341030071a2ccd7fd7e15c7f3adc` (`Merge PR #26: close Raw SQL
harness sensitivity study v0.6`). A stale local `main` initially pointed to an
older commit; this branch was explicitly reset to the verified remote starting
commit before this document was written.

## Executive conclusion

The evidence does **not** show that the eight Rules, as one instruction set,
causally improve modern-agent objective final quality over Control. In
particular, the best completed sensitivity study has no Treatment/Control
separation, and the earlier sensitivity studies are measurement-invalid. Raw
SQL Rules conformance is not a quality score.

It does support a smaller, more durable product:

1. preserve the deliberate Raw SQL/native-driver and application-ownership
   boundaries as **Contracts**, while splitting out broad architecture bans;
2. preserve source visibility, inspectable schema, and parameter naming where
   supported as human **Requirements**;
3. split Rules 4 and 8 because each mixes a durable safety/verification
   requirement with operational agent guidance; and
4. do not retain any agent-operational instruction merely because it is sound
   engineering advice. Such material needs a demonstrated, versioned,
   model-and-stack-specific benefit or should be removed.

The recommended present product is **Option B**: a durable `Raw SQL Contract /
Requirements` document. Option C is an extensibility pattern, not a document
to create now: no demonstrated agent-rule content warrants a separate layer.
The operational portions of Rules 4 and 8 are removal candidates pending
evidence, not assertions to preserve by default.

## Definitions used

| Term | Meaning in this analysis |
| --- | --- |
| Contract | A durable human/product choice defining the intended development boundary, meaningful even if models improve. |
| Requirement | A concrete human or project property, often for review, maintenance, consistency, or workflow. |
| Model-dependent Rule | An operational instruction retained only when evidence shows current-model behavior or quality improves; it is expected to decay. |
| Remove | No durable human choice supports it and useful current-model effect is not established. |

Objective quality means functional correctness, data integrity,
transaction/concurrency correctness, SQL/query safety, target
database/native-driver behavior, build/publish/production startup, regression
safety, and absence of confirmed final defects. It does not include `.sql`
placement, parameter spelling, abstraction choice, comments, style, or use of
canonical DDL by themselves.

## Evidence and provenance summary

### Normative text and provenance

- [`raw-sql-rules.md`](../raw-sql-rules.md) is the eight-rule source text.
  [`EVIDENCE.md`](../EVIDENCE.md) identifies it as research revision v6 and
  standalone release 0.1, and records its frozen SHA-256.
- [`RATIONALE.md`](../RATIONALE.md) records the Ashiba research lineage and
  expressly does not claim Raw SQL is universally superior to ORM/query-builder
  approaches. It is a provenance summary, not a substitute for the archived
  primary research it links.
- The archived Ashiba V0--V6 study is positive engineering provenance for the
  original boundary design, including a V3 mock-only negative result and later
  bootstrap/steady-state work for Rule 8. Its breadth remains limited,
  particularly by agent/task diversity and the MySQL/mysql2 lane.

### Standalone and benchmark evidence

| Evidence | What it supports | What it does not support |
| --- | --- | --- |
| [`dogfood/csharp-vsa-postgres/DOGFOOD_RESULT.md`](../dogfood/csharp-vsa-postgres/DOGFOOD_RESULT.md) | One clean C#/ASP.NET/PostgreSQL scenario used `.sql` assets, finite sort selection, named binding, and real-DB tests; 14 tests passed. | A per-rule causal effect, universal portability, or a general model claim. |
| [`dogfood/0.1-readiness/DECISION.md`](../dogfood/0.1-readiness/DECISION.md) | The prior readiness decision was `KEEP-AS-IS`; it found no repeated implementation-contract gap. | That every Rule has a measured causal benefit. |
| Historical `benchmark/rawsql-harness-validity-v0.1/REPORT.md` at commit `f23f3cd` | The evaluator distinguishes objective DB/application quality from conformance; inline and external SQL can both be safe. | A Treatment advantage. |
| Historical `benchmark/general-db-quality-v0.1/REPORT.md` at commit `1228ae9` | Control and Treatment both passed 2/2; all four candidates observed DDL, performed real-DB checks, and recovered from failures. | A valid estimate of a Rules effect: its launch/preflight defects make it measurement-invalid. |
| [`benchmark/rawsql-harness-sensitivity-ts-v0.6/FINAL-REPORT.md`](../benchmark/rawsql-harness-sensitivity-ts-v0.6/FINAL-REPORT.md) | The preregistered Mechanical Primary completed: 4/4 PASS; blind Sol review completed: 4/4. | A Treatment quality advantage, because there is no Treatment/Control separation. |

Historical TS sensitivity studies v0.1--v0.5 are not product-comparison
evidence: v0.1 had an installer-treatment failure; v0.2 stopped before Control
dispatch; v0.3 lost Docker access in the candidate sandbox; v0.4 launched zero
candidates; v0.5 consumed only three of four slots and did not estimate the
paired effect. They retain engineering observations, but their `INVALID`
classification prevents causal product claims.

### Required handling of v0.6

The v0.6 preregistered Mechanical Primary is **4/4 PASS**. The later blind Sol
review was completed for **4/4** candidates. Its post-hoc mechanically
adjudicated quality evidence is **FAIL for all four** candidates, with no
Treatment/Control separation. Confirmed examples include malformed JSON
handling, request-ID handling, database-refusal behavior, bigint and timestamp
fidelity, out-of-range date conversion, and production error disclosure.

Those findings are valuable secondary quality evidence, but their procedure was
frozen after Sol findings had been inspected. They are explicitly post-hoc and
must not be combined with, or alter, the preregistered Primary score. Neither
the Primary nor the post-hoc layer establishes a Treatment effect.

## Eight-rule classification matrix

| # | Current normalized meaning | Original problem | Supporting / weakening evidence | Control behavior and treatment result | Classification / confidence | Future v0.2 action |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Visible dialect SQL via native driver; no parallel ORM/builder/hidden path. | Prevent split-brain data access and declare an intentional Raw SQL boundary. | Rationale supports capability of visible SQL/native-driver work; it rejects a universal Raw SQL superiority claim. Control already used native Npgsql. | Treatment did not demonstrate objective-quality improvement; form/boundary choice changed. | **MIXED / SPLIT_REQUIRED — high** | Keep the Raw SQL/native-driver Contract; reassess blanket bans on local layers and alternate paths. |
| 2 | Application DDL/DML are independent `.sql` assets. | Searchability, diffs, human review, and retrieval. | Validity calibration treats inline and external SQL as potentially safe. Dogfood shows assets can work, not that they improve quality. | Control can use inline SQL; Treatment used assets. No quality separation. | **REQUIREMENT — high** | Rewrite as a review/maintenance requirement, conditional on application needs. |
| 3 | Current canonical DDL is directly inspectable. | Current schema discovery without replaying migration history. | Repository context and dogfood use canonical DDL; no isolated quality effect. | Controls can inspect and use DDL without Rules. | **REQUIREMENT — high** | Keep as a directly inspectable current-schema requirement. |
| 4 | Runtime values never become SQL syntax; only bound values or finite reviewed choices. | SQL injection and user-owned query structure. | Safety boundary is durable; controls commonly whitelist and bind values, but one control also assembled filter text. No causal quality estimate. | Treatment makes the form more explicit; no objective final-quality separation shown. | **MIXED / SPLIT_REQUIRED — high** | Keep the safety requirement; isolate or remove agent-specific anti-fragment wording unless future evidence supports it. |
| 5 | Use named parameters when the native application API supports them. | Preserve meaning and reduce positional bookkeeping. | Rationale says names help review/maintenance but do not prove business semantics; `pg` needs adaptation. | Named placeholders appear in Controls too. No named-vs-positional quality effect shown. | **REQUIREMENT — medium-high** | Rewrite as a driver-capability-dependent maintenance requirement. |
| 6 | Format SQL and comment only non-obvious intent/correctness/performance decisions. | Make non-obvious behavior reviewable without noise. | Human review benefit is plausible, but source clarity remains unproven and no isolated outcome evidence exists. | Comment/style conformance is descriptive, not quality. | **REMOVE — medium** | Remove as normative text; optional style guidance belongs outside the product contract. |
| 7 | Application owns pool, transactions, retries, mapping, migrations, tests, and semantics. | Prevent framework ownership creep. | Rationale and controls support the ownership boundary; neither arm shows a quality effect from wording. | Both arms can use application-owned Npgsql resources. | **CONTRACT — high** | Rewrite as the application-ownership boundary. |
| 8 | Verify representative SQL through target DB and native driver; bootstrap the smallest path if absent. | Avoid DDL/type/mock-only runtime claims. | V3 records a completion/evidence gap, not a final defect or Treatment benefit; later DB-backed work shows feasibility. Controls often already inspect/run real DB. v0.6 has no arm separation. | A: DB-backed verification is a human runtime-evidence Requirement. B: instruction materially improves modern-agent behavior over Control is unproven. | **MIXED / SPLIT_REQUIRED — high** | Keep DB-backed regression as a Requirement; remove or separately test agent bootstrap/operational prose. |

## Detailed reasoning by rule

### 1. One visible query representation

The durable part is an explicit product decision: the application intentionally
uses Raw SQL and its native driver. That is not a claim about which technology
produces better code. The benchmark and rationale do not establish a universal
quality advantage for Raw SQL, and Controls already use native-driver
execution. Keep that boundary as a Contract; do not phrase it as a
model-performance mechanism. Split or reconsider the blanket bans on a hidden
data-access layer and alternate execution path: they are architecture choices
and risk conflicting with Rule 7's stated non-prescription of architecture.

### 2. Application SQL is source

Separate assets make application SQL easier to find, diff, format, and review.
Those are durable human maintenance goals. The valid calibration intentionally
recognised both safe inline and safe external SQL, so asset placement cannot be
credited as objective quality. This is a Requirement if the product wants that
review surface, not a model-dependent Rule.

### 3. Current schema is directly inspectable

Canonical current DDL helps both reviewers and agents locate the present schema
without deriving it from migrations. That remains meaningful with a stronger
model because it is a repository discoverability property. No result isolates
an agent-quality effect, so this should be a human/project Requirement.

### 4. Runtime data never supplies SQL syntax

This combines two concerns. The durable safety requirement is that untrusted
runtime data stays in the value channel, while structural variation is bounded
and reviewed; that protects query safety and maintains application ownership of
query shape. The more prescriptive advice about avoiding all runtime fragment
assembly may be a useful current-agent tactic, but it has not been shown to
alter objective final quality relative to Control. Split it rather than
claiming one classification. Any retained operational wording needs evidence
specific to model, driver, dialect, and task shape.

### 5. Preserve parameter meaning

Named parameters can improve review and maintenance by making value identity
visible. They do not establish business correctness, and a positional-only
driver makes a universal mandate impossible without an adapter. Keep a
capability-qualified Requirement; do not represent naming as a quality proof.

### 6. Make non-obvious SQL reviewable

This is a focused human-review convention, not a runtime mechanism. Although
restricting comments can avoid noise, the repository's readiness evidence calls
source clarity unproven and no direct clarity failure or agent-quality delta was
observed. It should not survive as a normative Rule merely because it sounds
reasonable. Remove it, or retain a much narrower version as non-normative
guidance after a human decides it serves a specific review workflow.

### 7. Keep application ownership with the application

This describes who owns operational behavior; it intentionally prevents the
Rules product from becoming a framework. It survives model improvement and is
not architecture prescription. Keep it as a Contract, with no claim that
prompting it improves a candidate's final quality.

### 8. Verify behavior at the real database boundary

Two propositions must remain separate. **A**: target-engine/native-driver
verification is a human requirement for establishing runtime behavior that DDL,
static types, mocks, and assertions alone do not prove. The V3 mock-only result
is evidence of a completion/evidence gap, not proof of a final objective defect
or a Treatment benefit; later DB-backed work shows feasibility of the
verification path. **B**: telling a modern agent to perform it produces a
material improvement over Control; this is not demonstrated.
Controls frequently inspect DDL, start/use PostgreSQL where permitted,
build/run/check/repair, and perform real-DB verification. v0.6 supplies no arm
separation. Keep A as a Requirement; treat the agent bootstrap and completion
prose as unproven operational guidance.

## Cross-cutting findings

1. Existing Controls are not blank slates. Modern candidates often inspect DDL,
   use PostgreSQL when available, build/run/check/repair autonomously, and
   perform real-DB verification without Treatment. This is evidence of behavior
   observed in these bounded environments, not a claim of universal behavior.
2. Implementation-form differences are visible: Treatment commonly uses `.sql`
   assets, finite asset choice, and named binding. No study demonstrates that
   those form differences improve objective final quality.
3. A real DB/native-driver test is valuable as an engineering gate, but that
   does not prove that adding it to a modern agent's instruction file changes
   behavior. The distinction is decisive for Rule 8.
4. Invalid studies can preserve defects, environment facts, and engineering
   observations; they cannot be converted into a product Treatment claim.
5. The evidence is stack-dependent: MySQL/mysql2 research, bounded
   C#/ASP.NET/PostgreSQL dogfood, small agent/task diversity, and a separate
   PostgreSQL named-parameter adaptation concern. General claims should not
   exceed that provenance.

## Contract, Requirement, and model-dependent Rule boundary

The durable layer is the Raw SQL/native-driver portion of Rule 1 and Rule 7 as
Contracts; Rules 2, 3, and 5 as Requirements; and the durable safety and
verification portions of Rules 4 and 8 as split Requirements. Rule 6 is a
removal candidate. This places retained behavior under human ownership rather
than treating agent compliance as a proxy for quality.

No current Rule qualifies as a retained **MODEL_DEPENDENT_RULE** on this
evidence alone. That is not a finding that operational prompts never help. It
is a refusal to retain them absent a valid, separated comparison showing a
material behavior or objective-quality benefit. The operational portions of
Rules 4 and 8 are therefore `further evidence required` / removal candidates,
not durable mandates.

## Future product structure options

| Option | Clarity and durability | Human usefulness | Staleness / maintenance | Installation and AGENTS.md implication |
| --- | --- | --- | --- | --- |
| A. One document, `Raw SQL Rules` | Lowest: durable boundaries and decaying agent tactics remain conflated. | Familiar single install. | Highest risk of preserving stale tactics. | Simple installer, but agents receive mixed-purpose text. |
| B. Contract / Requirements only | High: all retained text has human ownership. | High for teams that intentionally choose Raw SQL. | Low. | Install one durable file; no agent-effect claim. |
| C. Durable layer + versioned Agent Rules | Highest conceptual precision when an operational effect exists. | High if users want optional, evidence-backed tactics. | Moderate: agent layer needs scope, version, expiry, and deletion review. | Installer must make the optional layer explicit; AGENTS.md must not imply it is a product contract. |
| D. General Agent Execution Contract combined here | Poor: this broadens a Raw SQL product into unrelated execution guidance. | Misleading. | High and out of scope. | Do not do this in Raw SQL Rules. |

**Recommendation: Option B now.** Publish a durable Raw SQL Contract /
Requirements layer and remove unproven operational language. In particular,
narrow Rule 1 to the selected query-representation boundary or explicitly
state which application-owned layers remain permissible; it must not retain a
blanket architecture ban while Rule 7 says architecture is application-owned.
Treat Option C as a future extensibility pattern only: create a versioned Agent
Rules layer if, and only if, a valid comparison demonstrates a material model-
and stack-specific benefit. This follows the project's subtraction/minimalism
direction without creating an empty layer merely for symmetry.

The separate research idea about localising failures, smallest reproductions and
corrections, bounded verification, phase progress, avoiding re-opened gates,
and preserving expensive completed work belongs, if pursued, in a future
**Agent Execution Contract**. It was not tested or designed here and must not
be folded into Raw SQL Rules.

## Recommended direction for a future v0.2

Do not implement v0.2 from this document alone. If a human chooses to do so,
start with the following product decisions:

1. state the Raw SQL/native-driver and application-ownership Contracts;
2. express source assets, inspectable current schema, and capability-qualified
   parameter naming as Requirements; remove Rule 6 from normative text;
3. split Rule 4 into durable query-safety ownership and any optional agent
   operation; and split Rule 8 into database-boundary regression coverage and
   any agent bootstrap/completion operation;
4. remove unproven operation language by default, or place it in a separate
   versioned Agent Rules layer only after a valid comparison demonstrates a
   material benefit; and
5. resolve the Rule 1/Rule 7 boundary by defining permissible
   application-owned layers rather than retaining an unqualified architecture
   ban; and
6. keep installer and `AGENTS.md` behavior aligned with the chosen layer so a
   durable project Requirement is not presented as an AI-quality claim.

## Unresolved questions

- Does any isolated Rule 4 or Rule 8 operational instruction change behavior or
  objective quality for a specified current model, task family, driver, and
  dialect?
- What minimal wording best preserves the source-asset and named-parameter
  maintenance benefits without overclaiming runtime quality?
- Which driver capability tests and adapters make a parameter-meaning
  Requirement portable enough to be useful?
- If a human later elects to create an Agent Rules product, does a larger valid
  multi-model/multi-task study reproduce Controls' autonomous DDL and real-DB
  behavior and show a model-specific incremental effect?
- Is a separate, versioned Agent Rules layer worth its ongoing measurement and
  deletion burden if no operational rule currently qualifies?

## Not tested and not proven

This analysis did not run new candidates, Docker/PostgreSQL, calibrations, or
harnesses. It did not change normative text, README claims, installers, or
product behavior. It does not prove universal Raw SQL superiority, universal
agent compliance, a causal effect for any Rule, cross-DBMS/language
generalisability, a quality advantage of `.sql` assets or named parameters, or
that real DB verification instructions improve Control-relative modern-agent
behavior. It also does not turn v0.6 post-hoc quality findings into Primary
results.
