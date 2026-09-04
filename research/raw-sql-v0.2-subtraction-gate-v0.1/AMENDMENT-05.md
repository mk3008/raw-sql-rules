# Amendment 05 — source-manifest path character array

Recorded before any candidate `thread.started` or `turn.started` event. The
first official-mode attempt completed the frozen calibration but stopped at
official count `0` while producing the pre-turn arm manifest. PowerShell could
not convert the two-character escaped backslash string passed to `TrimStart`.

The runner now passes an explicit two-character array for backslash and slash.
This affects only evidence path normalization. It does not change any
candidate-visible content, manifest membership, evaluator check, profile, order,
or classification. `FREEZE.md` remains unchanged; this is the fifth recorded
pre-launch infrastructure correction.
