# Raw SQL v0.2 minimal proposal

## Status and scope

This is a proposal for human review, not a normative revision. It is based on
the merged [v0.1 reclassification](raw-sql-rules-v0.1-reclassification.md).
It does not modify `raw-sql-rules.md`, installation behavior, or any released
contract. The separate Agent Execution Contract hypothesis is intentionally
kept in [its own pilot-design document](agent-execution-contract-pilot-v0.1.md).

The test for every item below is durable human/product value: it should remain
meaningful if an AI model became substantially more capable. This proposal does
not claim Raw SQL produces objectively better AI-generated code than an ORM or
query builder.

## Proposed Contracts

### 1. Selected query representation

For the application paths covered by this contract, application data access is
expressed as ordinary SQL and executed through the database driver.

This records the selected representation. It does not make a comparative claim
about ORM or query-builder quality, and it does not prescribe a broader
application architecture.

### 2. Application ownership

The application owns connections and pools, transactions, retries, result
mapping, migrations, tests, and business semantics.

This is an ownership boundary, not a direction to use a particular framework,
test structure, retry policy, or transaction architecture.

## Proposed Requirements

### 1. One executable SQL statement has one dedicated reviewable source file

Each executable application SQL statement is kept in its own dedicated source
file so that a reviewer can find and review it as ordinary SQL. A file may be
`GetUser.sql`, `GetUser.sql.ts`, or another host-language source file; a
runtime `.sql` asset is not required. In a host-language file, the SQL must be
directly visible as ordinary SQL rather than hidden behind generated or opaque
query construction.

A statement may use CTEs or subqueries and remains one statement. Do not put
multiple unrelated executable SQL statements in a shared source file such as
`queries.ts`. This requirement does not require generating a `.sql` projection
or maintaining duplicate sources.

### 2. Parameters are named by meaning at the human review surface

Where source exposes a parameter identity, it is meaningful to a reviewer, such
as `customerId` or `status`. Placeholder syntax and binding mechanism are not
prescribed. Positional-only placeholders remain allowed when the surrounding
binding makes each value's identity reviewable; this requirement does not
require an adapter or conversion mechanism.

### 3. Current schema is directly inspectable

The current database schema is available in a directly inspectable form. A
reviewer must be able to understand the current relevant structure without
mentally replaying migration history. The representation may be a DDL snapshot,
a schema definition, or another directly inspectable current-schema source.

### 4. Runtime input does not own SQL syntax

Runtime or user data supplies values, not arbitrary SQL structure. Query syntax
and structural choices remain controlled and reviewable by the application.

This is a durable safety boundary. It deliberately does not prescribe a
particular null-guard, whitelist form, query-selection mechanism, or other
implementation pattern.

### 5. DB/driver-dependent behavior is verifiable at the real boundary

When correctness depends on database-engine or driver behavior, the project has
a path to verify that behavior through the target database and driver.

This requirement does not prescribe Docker, a reusable harness, a test
framework, a test pyramid, or that every change run an end-to-end test.

## Removed v0.1 material

v0.2 would remove SQL-comment-specific normative requirements. A host-language
source file may use ordinary host-language comments where useful, but comments
are not a Raw SQL v0.2 requirement.

It would also remove operational instructions about failure handling, test
granularity, bootstrapping a test path, or agent execution. Those ideas are not
Raw SQL-specific product requirements and must earn adoption separately.

## Boundaries and unresolved decisions

- The exact wording of “directly visible as ordinary SQL” needs review against
  host-language embedding styles, without accidentally requiring a runtime
  asset or a generated mirror.
- “One statement per file” applies to executable application SQL, not to
  migrations, schema sources, driver control statements, or documentation.
  Whether any project needs further exceptions should be decided before a
  normative revision.
- The proposal preserves a human review surface for parameter meaning but does
  not decide how a positional-only driver exposes that surface.
- This document proposes no product-version change. A later human decision is
  required before changing the v0.1 contract, README, or installer.
