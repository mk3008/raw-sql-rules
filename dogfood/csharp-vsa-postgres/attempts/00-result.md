# Attempt 0 — frozen candidate

- Fresh context: yes; no previous candidate source was provided.
- Commit / frozen SHA: `30dca66ec9aa4014cc4e7d092f5e2d6c474d6e9f`
- Outcome: initial `GET /work-items` and transactional
  `POST /work-items/{id}/complete` implementation.

Observable discovery evidence from the implementation agent's tool log:

1. It opened `examples/csharp-vsa-postgres/AGENTS.md`.
2. It followed the generated instruction and opened
   `examples/csharp-vsa-postgres/rules/raw-sql-rules.md`.
3. It then introduced canonical SQL assets, finite reviewed selection, named
   Npgsql parameters, and a PostgreSQL-backed test project.

This is agent-reported/tool-log evidence, not an inference from the source.
No direct prompt told the agent to read the Rules or comply with them.

The candidate's initial build succeeded. Its first independent review found
two confirmed defects and test-evidence gaps; those were repaired in a
separate follow-up commit rather than modifying this frozen candidate.
