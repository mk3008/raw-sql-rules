# v0.1 to candidate v0.2 decision matrix

| v0.1 item | Decision | Proposed v0.2 destination | Durable product reason | Evidence | Remaining limitation |
| --- | --- | --- | --- | --- | --- |
| 1. One visible query representation | KEEP | Contract 1: Selected query representation | Preserve visible SQL/native-driver ownership without comparative claims or architecture prescription. | Both new probes; merged C# dogfood. | Two tested stacks only. |
| 2. Application SQL is source | SPLIT | Requirement 1 plus Requirement 3 | Keep dedicated reviewable executable SQL and inspectable schema, but permit host-language source instead of requiring runtime `.sql` assets. | C# host-source probe. | Host-language wrapper readability varies. |
| 3. Current schema is directly inspectable | KEEP | Requirement 3 | Current structure must be reviewable without replaying migrations; layout remains application-owned. | C# DDL and positional `schema.sql`. | No broad layout comparison. |
| 4. Runtime data never supplies SQL syntax | KEEP | Requirement 4 | Retain the durable values-versus-application-owned-structure safety boundary while removing prescriptive implementation examples. | Positional real-driver probe and existing evidence. | Does not re-prove every dynamic-query edge case. |
| 5. Preserve parameter meaning | NARROW | Requirement 2 | Preserve human semantic review surface; do not mandate a generic named-to-positional adapter. | Positional CTE-alias probe; native Npgsql bindings. | CTE aliasing is one driver/dialect idiom. |
| 6. Make non-obvious SQL reviewable | REMOVE | No normative destination | Comment prescriptions are style guidance, not a durable Raw SQL product boundary. | v0.2 proposal scope decision. | Teams may retain local comment conventions. |
| 7. Keep application ownership with the application | KEEP | Contract 2: Application ownership | Preserve the ownership boundary while avoiding test/transaction/framework architecture prescription. | C# VSA/transaction structure; positional probe has no new layer. | One application architecture observed. |
| 8. Verify at the real database boundary | NARROW | Requirement 5 | Keep real DB/driver authority without embedding bootstrap/test-pyramid instructions. | Both new real PostgreSQL probes; historical C# suite. | No other DBMS/driver added. |
| Decision rule | REMOVE | No normative destination | It is operational agent/process advice, not a Raw SQL product contract. | v0.2 proposal and separate Agent Rule research boundary. | Teams may keep local engineering guidance. |
