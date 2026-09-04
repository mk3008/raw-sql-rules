# Guided-only legacy guidance manifest

Both arms receive the byte-identical frozen PR #33 v0.2 candidate and the same
minimal Raw SQL pointer. Only this manifest's G1--G5 substance is appended to
the Guided `AGENTS.md`; no old Contract or Requirement is restored.

| ID | Historical source | Guided-only substance |
| --- | --- | --- |
| G1 | released installer | Before merge, run a fresh review against requirements, canonical DDL, and the Rules. |
| G2 | v0.1 Rule 4 | Bind values; use finite reviewed sort/complete-source choices; prefer a fixed bound optional filter; do not assemble runtime predicate fragments. |
| G3 | v0.1 Rule 5 | Use native named parameters where supported; deterministic positional lowering may be application-owned. |
| G4 | v0.1 Rule 8 | Exercise SQL through the target DB/driver; static types, DDL, mocks, and assertions alone do not establish runtime behavior; retain/extend a DB-backed path or bootstrap the smallest reusable one. |
| G5 | v0.1 Decision rule | Before a new abstraction, first try existing SQL source, current schema, native driver, and application test. |

Explicitly excluded: runtime `.sql` asset requirements, old one-file wording,
comment/style policy, broad architecture bans, and superseded schema, ownership,
parameter, safety, and real-boundary Requirements.
