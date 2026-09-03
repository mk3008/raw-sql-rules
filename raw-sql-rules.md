# Raw SQL Rules v0.2 — Draft

## Scope

These Rules apply to application paths where Raw SQL is the selected query
representation. They do not claim that Raw SQL is superior to other approaches,
and they do not require every application or every data-access path to use Raw
SQL.

## Contracts

### 1. Raw SQL is the selected query representation

For covered paths, application data access is expressed as directly reviewable
ordinary SQL and executed through the selected database driver. This selects the
representation for those paths; it does not prescribe the rest of the
application architecture.

### 2. Application concerns remain application-owned

The application owns connections and pools, transactions, retries, logging where
applicable, result mapping, migrations, tests, deployment and execution
integration, and business semantics. These Rules do not prescribe an application
architecture, framework, or a transaction, retry, mapping, or testing strategy.

## Requirements

### 1. Executable application SQL has a dedicated reviewable source

Each executable application SQL statement has one dedicated authoritative source
that a reviewer can locate and read directly as ordinary SQL. A runtime `.sql`
asset is not required: a dedicated host-language source file is acceptable when
the SQL remains directly visible. Do not hide it behind query construction,
generated output, or another opaque representation, and do not maintain a
generated mirror or duplicate canonical source.

CTEs and subqueries remain part of one statement. When an operation executes
multiple executable application statements, each has its own dedicated source.
File extension and directory layout are application choices.

This requirement applies only to executable application SQL. It does not impose
one-statement-per-file on migrations, current or canonical schema sources,
driver or control statements, non-application health or probe statements, or
non-executable documentation and examples. These boundaries do not permit
application query logic to be reclassified to avoid review.

### 2. Parameters are named by meaning at the human review surface

At the human SQL review surface, parameters are identified by meaningful names,
such as `customerId`, `tenantId`, `status`, or `completedFrom`. Positional
placeholders alone, such as `$1`, `$2`, `?`, or `:1`, do not satisfy this
requirement.

Driver-specific positional or anonymous binding may exist below that review
boundary. A derived driver representation is not a second authoritative source
merely because the selected driver ultimately receives positional placeholders.

### 3. Current schema is directly inspectable

The current relevant database structure is directly inspectable without requiring
a reviewer to mentally reconstruct current state by replaying migration history.
A canonical current DDL source, a schema definition, or another directly
inspectable current-schema representation may satisfy this requirement. Migration
history alone does not satisfy it when current state cannot be determined
directly.

### 4. Runtime input does not own arbitrary SQL syntax

Runtime and user data supply values. The application retains control of SQL
syntax and structural choices; arbitrary runtime input must not become SQL
syntax. Application-controlled, reviewed structural variation remains permitted.

### 5. DB/driver-dependent behavior is verifiable at the real boundary

When correctness depends on database-engine or driver behavior, the project has
a path to verify that behavior through the actual target database and selected
driver. These Rules do not prescribe a test framework, test architecture, or
execution environment.
