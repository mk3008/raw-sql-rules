# Installer evidence

## Verbatim command

Run from `examples/csharp-vsa-postgres`:

```sh
gh api "repos/mk3008/raw-sql-rules/contents/install.sh?ref=fe7bea9dd510e3d19547b3135c5682944b752259" -H "Accept: application/vnd.github.raw+json" | sh -c 'RAW_SQL_RULES_REF=fe7bea9dd510e3d19547b3135c5682944b752259 sh'
```

## Observed result

Exit code: non-zero.

stderr:

```text
sh: The term 'sh' is not recognized as a name of a cmdlet, function, script file, or executable program.
```

`gh` was available. `Get-Command sh,awk,grep,mktemp` returned no commands. The installer itself requires `gh`, `awk`, `grep`, and `mktemp`, but execution did not reach those checks because PowerShell could not invoke `sh`.

## Consequence

No `rules/raw-sql-rules.md` was generated, no managed AGENTS block was generated, and no second installer run was possible. Byte identity, idempotence, and fresh-agent installer discovery are `not exercised`, not inferred.

This is an observed Windows portability finding. Manual copy or an alternate installation path was deliberately not used.
