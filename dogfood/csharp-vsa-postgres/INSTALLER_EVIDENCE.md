# Installer evidence

The native PowerShell installer was fetched from the frozen current-main
commit and executed from the application root. No manual Rules copy was used.

Command executed verbatim on each run:

```powershell
$ref='a27871e9d1f8ead99c764eca6b54ee522744dfa5'
$env:RAW_SQL_RULES_REF=$ref
$installer = gh api "repos/mk3008/raw-sql-rules/contents/install.ps1?ref=$ref" -H 'Accept: application/vnd.github.raw+json' | Out-String
& ([scriptblock]::Create($installer))
```

The command was run twice in `examples/csharp-vsa-postgres` using PowerShell
7.6.5. Both runs selected the frozen ref and completed successfully.

| Check | Result |
| --- | --- |
| Installer source SHA | `a27871e9d1f8ead99c764eca6b54ee522744dfa5` |
| Rules source SHA | `a27871e9d1f8ead99c764eca6b54ee522744dfa5` |
| Source Rules SHA-256 | `A0E1F71BFBF4CE664F581757284A08B8C9EB6EB28AE9E953CC38965189AB7375` |
| Installed `rules/raw-sql-rules.md` SHA-256 | `A0E1F71BFBF4CE664F581757284A08B8C9EB6EB28AE9E953CC38965189AB7375` |
| Source/installed bytes | identical (SHA-256 equality) |
| Generated managed blocks after run 1 | 1 |
| Generated managed blocks after run 2 | 1 |
| Rules bytes changed on run 2 | no |
| `AGENTS.md` bytes changed on run 2 | no |
| Unrelated VSA guidance | preserved |

The resulting `AGENTS.md` appended exactly one existing managed block:

```md
<!-- raw-sql-rules:start -->
## Raw SQL

Before changing or reviewing a Raw SQL data-access path, read `rules/raw-sql-rules.md`.
Follow it as the repository contract for Raw SQL work.
<!-- raw-sql-rules:end -->
```
