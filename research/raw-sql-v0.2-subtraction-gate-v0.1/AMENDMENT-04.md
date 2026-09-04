# Amendment 04 — disable npm audit and funding network work

Recorded before any candidate `thread.started` or `turn.started` event. The
background calibration diagnostic showed that npm completed dependency retrieval
but remained in its audit request. Audit and funding requests neither install
the frozen dependencies nor evaluate a candidate. The runner adds `--no-audit
--no-fund` to its disposable pre-turn dependency installation.

This eliminates package-manager ancillary network work only. Dependency version
selection, candidate-visible files, evaluator checks, packets, profile, order,
and classification remain unchanged. `FREEZE.md` remains unchanged; this is the
fourth recorded pre-launch infrastructure correction.
