# Clean rerun: C# VSA PostgreSQL dogfood

This directory records a clean rerun of PR #7's dogfood using the current product baseline and its actual installer.

## Status: NOT-YET

The Windows environment could fetch `install.sh` with `gh`, but could not execute the verbatim installer command because `sh` was unavailable. No manual Rules copy or manually managed Raw SQL block was used. Therefore installer-generated discovery, candidate Attempts, and primary Q1-Q9 evaluation were not exercised.

Previous run evidence under `dogfood/csharp-vsa-postgres/` is retained as historical/excluded calibration only: it used a pre-installer source commit, manual Rules installation, and strengthened AGENTS instructions.
