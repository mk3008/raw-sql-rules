# Raw SQL Rules v0.3

## Scope

These Rules apply to application paths where Raw SQL is the selected query
representation. For covered paths, application data access is expressed as
directly reviewable ordinary SQL and executed through the selected database
driver. This scope does not claim Raw SQL is superior to another representation,
and it does not require every data-access path in a mixed application to use Raw
SQL. A covered path must not be changed to another query representation merely
to avoid these Rules.

Connections and pools, transactions, retries, logging, result mapping,
migrations, tests, deployment and execution integration, and business semantics
remain application-owned. These Rules do not prescribe application architecture,
frameworks, or implementation of those concerns. They neither require a
home-grown implementation nor prohibit use of existing libraries.

## Safety Contract

Runtime input must not supply arbitrary SQL syntax. The application retains
control of SQL syntax and structural choices. Application-controlled, reviewed
structural variation remains permitted.

## Default Requirements

These are the author's human requirements. A project may customize or omit them
without changing the Safety Contract. When they are adopted, an implementation
must satisfy them; a candidate or tool may not silently weaken or omit them.

### 1. Executable application SQL has a dedicated reviewable source

Each executable application SQL statement has one dedicated authoritative source file
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

### 2. Parameters use named definitions and named bindings

The authoritative application SQL uses meaningful named parameters, and the
calling code binds values by those names. Positional or anonymous parameters,
such as `$1`, `$2`, `?`, or `:1`, do not satisfy this requirement when comments,
aliases, or manual value-array ordering are used to maintain the correspondence.
For example, `$1 AS tenant_id` does not make a positional parameter named.

A selected driver may require a positional or anonymous representation at its
boundary. That representation is permitted only when the correspondence and
value array are mechanically derived from the authoritative names, without a
second manually maintained authoritative source or mapping table. Values are
passed as bound values, never embedded into SQL syntax.

These Rules do not require a particular named-marker notation, DBMS, driver,
library, file extension, or lowering implementation.

### 3. Current schema is directly inspectable

The current relevant database structure is directly inspectable without requiring
a reviewer to mentally reconstruct current state by replaying migration history.
A canonical current DDL source, a schema definition, or another directly
inspectable current-schema representation may satisfy this requirement. Migration
history alone does not satisfy it when current state cannot be determined
directly.

### 4. DB/driver-dependent behavior is verifiable at the real boundary

When correctness depends on database-engine or driver behavior, the project has
a path to verify that behavior through the target database engine and selected
driver. These Rules do not prescribe a test framework, test architecture, or
execution environment. Having that path does not mean every change has already
been verified through it.
