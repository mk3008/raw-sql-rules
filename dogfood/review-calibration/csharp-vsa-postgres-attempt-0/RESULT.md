# RESULT — Raw SQL Rules-only blind calibration

## Scope

- Starting main: `168f4a0d0c34628c7b6912c3791ec9d4b94c2b62`.
- Candidate: frozen Attempt 0
  `30dca66ec9aa4014cc4e7d092f5e2d6c474d6e9f`.
- Preregistration: `818a2849b484f1bbbf9490ce2b30a344807a4636`.
- Blind-output freeze: `1d1e2c9b06704a2d7932a9f664d4e11ff17cd40e`.
- Arm: three fresh Raw SQL Rules-only reviews; no Review Rules, Source Clarity
  Rules, known findings, later commits, or repair evidence supplied.

## Observed

| Metric | Result |
| --- | --- |
| Known confirmed-defect recall per run | Run 1 `0/2`; Run 2 `0/2`; Run 3 `0/2` |
| Known evidence-gap detection per run | Run 1 `1/2`; Run 2 `1/2`; Run 3 `1/2` |
| Union recall | confirmed defects `0/2`; evidence gaps `1/2` |
| 3/3 stable detection | K-EG-02 direct asset coverage; A-EG-02 page-size-cap gap; K-CD-02 only as uncertainty |
| 2/3 detection | A-CD-01 missing published SQL assets; A-EG-01 atomic rollback gap; A-EG-03 default/range coverage gap |
| 1/3 detection | none |
| Confirmed additional findings | A-CD-01, publish output omits SQL assets and endpoint fails HTTP 500 |
| False positives / style noise | 0 / 0 |
| Actionable finding count | Run 1: 3; Run 2: 5; Run 3: 3 |
| Human intervention count | 0 reviewer-supplied findings; no blind run was contaminated |

Review environment effects: model/effort and precise timings were
`unavailable`. All snapshots lacked `.git`; tracked source matched Attempt 0.
Run 1 reported `dotnet test` 5/5. Run 2 reported a sandbox-blocked first test
attempt and a 5/5 retry. Run 3 could not obtain trustworthy visible test output
because of a sandbox NuGet.Config restriction. Runs 2 and 3 performed
publish/runtime verification and independently found A-CD-01.

Verification used: snapshot/source blob comparison, `dotnet test` where
available, `dotnet publish`, published-output SQL enumeration, and localhost
HTTP requests. Independent scoring reproduction found zero published SQL files
and HTTP 500 from the published `GET /work-items` endpoint.

## Inference

In this one frozen candidate, Raw SQL Rules-only review consistently noticed
test-evidence gaps around finite selection and page-size bounds. It did not
produce a confirmed report for either known historical defect. The
repeat-completion behavior was noticed by all three reviewers but reasonably
downgraded because the supplied requirements did not define retries. Two of
three reviews found a deployability defect outside the historical corpus.

This is a detection baseline, not a conclusion that Review Rules are necessary
or unnecessary, that Raw SQL Rules-only review is complete, or that the result
generalizes across languages, databases, models, or candidates.

## Hypotheses

- A future frozen Review Rules candidate may be worth blind comparison for
  portability and deployment-boundary detection, but this calibration does not
  test it.
- Source-clarity comparison may be worth exploring because no source-clarity
  observation arose naturally; that absence is not a defect score.
- A future recovery-loop dogfood could test whether the detected, classified
  findings converge through minimal repair or verification strengthening.

## Human blockers and limits

No human supplied a finding to any reviewer. Environment limitations affected
some test invocations (sandbox NuGet.Config access); they are recorded rather
than treated as candidate defects. Reviewers were instructed to avoid
modification; generated publish/test artifacts occurred only in isolated
temporary exports, and tracked candidate source comparison reported
`SOURCE_MISMATCHES=0`. Candidate source and existing dogfood evidence were not
changed.
