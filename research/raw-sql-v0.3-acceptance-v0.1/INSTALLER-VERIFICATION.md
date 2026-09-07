# Candidate-commit installer verification

The PowerShell installer was run in an empty, isolated directory with
`RAW_SQL_RULES_REF=016db35` (the then-current candidate commit).

- Installed Rules SHA-256: `153E96AFC88201FCD3EC2D7E9649C54A7CD066E400F78905EFE675D4F708DE5B`.
- It matches the frozen distribution text.
- The generated root `AGENTS.md` contains exactly one managed block pointing
  at `rules/raw-sql-rules.md`.

This confirms the existing installer can distribute the candidate text; it is
not an installer design change.
