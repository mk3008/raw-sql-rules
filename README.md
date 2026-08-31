# Raw SQL Rules

**Raw SQL, with rules instead of a framework.**

Raw SQL Rules is a small set of natural-language rules for safe, reviewable Raw SQL application development.

- **DBMS-agnostic** — the Rules themselves do not depend on one database product.
- **Language-agnostic** — no programming language is prescribed.
- **Incrementally adoptable** — use the Rules only on the Raw SQL paths of an application that may still use an ORM elsewhere.

Current release: **0.1**. The Rules are evidence-backed, but real-world dogfooding is still limited.

The authoritative contract is [raw-sql-rules.md](raw-sql-rules.md).

## Install

From the root of your application repository:

```sh
gh api repos/mk3008/raw-sql-rules/contents/install.sh \
  -H 'Accept: application/vnd.github.raw+json' |
  sh
```

The installer copies the Rules to `rules/raw-sql-rules.md` and adds a small reference block to the root `AGENTS.md`. Re-running it updates the same block instead of duplicating it.

## Learn more

- [raw-sql-rules.md](raw-sql-rules.md) — the normative contract
- [RATIONALE.md](RATIONALE.md) — why these Rules exist and how they were validated
- [EVIDENCE.md](EVIDENCE.md) — evidence, provenance, and known limits
- [examples/mysql2](examples/mysql2) — one non-normative real-database example
