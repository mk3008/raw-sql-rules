# Scoring

Scoring began only after all three run records were frozen in commit
`1d1e2c9b06704a2d7932a9f664d4e11ff17cd40e`. The preregistration commit was
`818a2849b484f1bbbf9490ce2b30a344807a4636`.

## Historical answer key

The post-freeze answer key is
`dogfood/csharp-vsa-postgres/reviews/attempt-00-review.md`. It defines these
known Attempt 0 items:

| ID | Historical classification | Item |
| --- | --- | --- |
| K-CD-01 | confirmed defect | Backslash-containing SQL asset lookup is not portable to Linux/macOS. |
| K-CD-02 | confirmed defect | Repeated/concurrent completion can duplicate events and overwrite completion time. |
| K-EG-01 | evidence gap | Test fixture does not apply canonical DDL for every test. |
| K-EG-02 | evidence gap | Direct finite SQL asset-selection coverage is incomplete. |

## Per-run known-corpus scoring

| Item | Run 1 | Run 2 | Run 3 |
| --- | --- | --- | --- |
| K-CD-01 portability | missed | missed | missed |
| K-CD-02 repeat completion | detected but downgraded to uncertainty | detected but downgraded to uncertainty | detected but downgraded to uncertainty |
| K-EG-01 fixture DDL | missed | missed | missed |
| K-EG-02 asset selection | detected as evidence gap (priority) | detected as evidence gap (priority/default) | detected as evidence gap (priority/default) |

Known confirmed-defect recall is `0/2` for each run and `0/2` for the union
when recall requires a confirmed-defect report. K-CD-02 was noticed in all
three runs but consistently classified as uncertainty because repeat semantics
were absent from the supplied requirements. Known evidence-gap detection is
`1/2` for every run and `1/2` for the union.

## Additional-finding validation

Scoring independently used a separate history-free export of Attempt 0. Its
tracked source matched all three reviewer snapshots (`SOURCE_MISMATCHES=0`). A
standard `dotnet publish` produced `PUBLISHED_SQL_COUNT=0`; running the
published executable and requesting `GET /work-items` produced HTTP 500.

| ID | Runs | Scoring classification | Basis |
| --- | --- | --- | --- |
| A-CD-01 publish omits SQL assets | 2/3 (Runs 2, 3) | confirmed additional defect | Independent publish had no SQL assets; published endpoint returned 500. |
| A-EG-01 atomic rollback failure path | 2/3 (Runs 1, 2) | valid evidence gap | Happy-path transaction evidence does not prove rollback after event-write failure. |
| A-EG-02 page-size cap | 3/3 | valid evidence gap | Bound exists but above-bound endpoint regression is absent. |
| A-EG-03 default sort / created range branches | 2/3 (Runs 2, 3) | valid evidence gap | Required/default branches lack direct regression evidence. |

No reported finding was rejected as a false positive. No style/naming-only
finding was reported. The repeat-completion uncertainty is not counted as a
false positive because requirements do not settle the semantic choice.

## Secondary source-clarity observation

No reviewer naturally raised standalone SQL readability, `status = 2`, comment
volume, WHY/WHY NOT, or caller-versus-query ownership as a finding. This is an
observation only; absence is not a confirmed-defect miss.
