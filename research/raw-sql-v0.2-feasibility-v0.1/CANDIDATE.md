# Candidate Raw SQL v0.2 Contracts and Requirements

This is a verbatim copy of the proposed Contracts and Requirements in `research/raw-sql-v0.2-proposal.md`. It is the candidate evaluated by this study.

## Contracts

### 1. Selected query representation

For the application paths covered by this contract, application data access is expressed as ordinary SQL and executed through the database driver.

This records the selected representation. It does not make a comparative claim about ORM or query-builder quality, and it does not prescribe a broader application architecture.

### 2. Application ownership

The application owns connections and pools, transactions, retries, result mapping, migrations, tests, and business semantics.

This is an ownership boundary, not a direction to use a particular framework, test structure, retry policy, or transaction architecture.

## Requirements

### 1. One executable SQL statement has one dedicated reviewable source file

Each executable application SQL statement is kept in its own dedicated source file so that a reviewer can find and review it as ordinary SQL. A file may be `GetUser.sql`, `GetUser.sql.ts`, or another host-language source file; a runtime `.sql` asset is not required. In a host-language file, the SQL must be directly visible as ordinary SQL rather than hidden behind generated or opaque query construction.

A statement may use CTEs or subqueries and remains one statement. Do not put multiple unrelated executable SQL statements in a shared source file such as `queries.ts`. This requirement does not require generating a `.sql` projection or maintaining duplicate sources.

### 2. Parameters are named by meaning at the human review surface

The reviewable SQL representation identifies parameters by meaningful names, such as `customerId` or `status`. Driver-specific positional binding may exist below that review boundary, but positional placeholders alone are not the intended human review representation. Placeholder syntax, translation mechanism, and binding implementation are not prescribed.

### 3. Current schema is directly inspectable

The current database schema is available in a directly inspectable form. A reviewer must be able to understand the current relevant structure without mentally replaying migration history. The representation may be a DDL snapshot, a schema definition, or another directly inspectable current-schema source.

### 4. Runtime input does not own SQL syntax

Runtime or user data supplies values, not arbitrary SQL structure. Query syntax and structural choices remain controlled and reviewable by the application.

This is a durable safety boundary. It deliberately does not prescribe a particular null-guard, whitelist form, query-selection mechanism, or other implementation pattern.

### 5. DB/driver-dependent behavior is verifiable at the real boundary

When correctness depends on database-engine or driver behavior, the project has a path to verify that behavior through the target database and driver.

This requirement does not prescribe Docker, a reusable harness, a test framework, a test pyramid, or that every change run an end-to-end test.
