# Raw SQL v0.2 subtraction gate v0.1 freeze

This pre-execution Git freeze defines the study. It was created before any
official candidate turn.

## Identity

- Starting main: `396aecbb5a57c4b20457969540c73aef1aa6b261`
- Frozen PR #33 candidate: `ceed1cf7c91cce4dab01e48f05ec2d941439273e`
- Frozen candidate copy SHA-256: `989ea5bd3758b948fc0855b331d0e2d863769cb4c17656b4cae27bee4fa61c47`
- Candidate profile: `gpt-5.6-terra`, medium reasoning,
  `danger-full-access`, approval `never`.
- Each slot is a fresh local one-commit repository with no remote.

## Four official slots

1. Task A Reduced
2. Task A Guided
3. Task B Reduced
4. Task B Guided

There are no repetitions, no fifth slot, and no retry after `turn.started`.

## Frozen conditions

Reduced contains the frozen v0.2 candidate and only the minimal pointer in
`packets/reduced-AGENTS.md`. Guided contains byte-identical fixture, prompt, and
candidate plus `packets/guided-AGENTS.md`, whose G1--G5 contents are bounded by
`GUIDANCE_MANIFEST.md`. No superseded v0.1 Contract or Requirement is restored.
The runner must prove arm identity after excluding only `AGENTS.md`.

## Qualification

Before official execution, the frozen evaluator must accept the known-good and
reject the known-bad variants for both tasks. Task A's bad variant must expose a
query-safety or optional-filter semantic defect. Task B's bad variant must pass
source/static plausibility but fail the real node-postgres/PostgreSQL bigint
contract. Failure makes the study `INVALID_OR_INSENSITIVE` with zero launches.

## Primary and secondary records

Primary is independent final application/database quality: feature behavior,
tenant/data integrity, query safety, real DB/driver behavior, startup, and no
confirmed final defect. Candidate self-testing and Rules conformance are not
Primary criteria. Secondary records cover DDL inspection, real DB work, focused
or broad verification, localized failure/repair, review and merge timing,
abstractions, human intervention, wall-clock, and completion.

## Classification

- `SUBTRACTION_SUPPORTED`: Reduced is not worse on both matched tasks; no final
  defect is unique to Reduced; no Guided-only process action produces a material
  correction that Reduced misses; and Reduced needs no human technical fix.
- `GUIDANCE_OUTCOME_VALUE_OBSERVED`: Guided materially outperforms Reduced,
  including Guided PASS/Reduced FAIL or a Guided repair of a defect remaining in
  Reduced. Stop and recommend a later human-approved G1--G5 ablation.
- `GUIDANCE_PROCESS_ONLY_DIFFERENCE`: Primary is equal but Guided uniquely
  produces a clearly material process action. Stop for human product judgment.
- `NO_PRACTICAL_SEPARATION_OBSERVED`: objective outcome and relevant process
  behavior are essentially the same.
- `INVALID_OR_INSENSITIVE`: contamination, prompt leakage, unreachable Task A
  merge/review boundary, unavailable real DB boundary, failed calibration,
  environment mismatch, or evidence loss prevents interpretation.

A bundle-level no-difference result does not prove every G1--G5 sentence has no
isolated effect.

## Frozen SHA-256 inventory

| Path | SHA-256 |
| --- | --- |
| `frozen/rules/raw-sql-rules.md` | `989ea5bd3758b948fc0855b331d0e2d863769cb4c17656b4cae27bee4fa61c47` |
| `GUIDANCE_MANIFEST.md` | `80ab44f0fdaf1b3fb73f9ab2030b23edb5edd544cbc99608207adcb07c8d4719` |
| `PROTOCOL.md` | `3e2179f014a22bc1e101b2d6fe9a35fd0ff7dbca65c7ec53683ae170d738f85d` |
| `TASKS.md` | `7271259a89ad342bb094f2c49357784168f343f2b933577a8f821e355cbe2ff8` |
| `execution-order.json` | `38c4551f9432c23c2fa0d33aa1f70128bbc3ca6f6944eb1a34b47712834ac6a8` |
| `prompts/task-a.txt` | `712ecc6593415c0b1d52866098dcff7fe0582fa0c83e8989cd48f39980cd3c66` |
| `prompts/task-b.txt` | `b0f98230d1aecbbde6b7ab81cffb1d940887e955a763673f7c12a151844b4f9a` |
| `runner/evaluate.mjs` | `1e6b195b014fc053ecc6cb34c84cca126165086b72bc2d28928f3bb8f7537a64` |
| `runner/Run-Study.ps1` | `07fdcb9d97ac4a5df5e4da2e1fdac9094750444a790830164699c6ca3b56d7ec` |
| `packets/reduced-AGENTS.md` | `1cb083168529b7371b9a74179f878f1f9367d0ace47d09a47604282c9a4d6a5a` |
| `packets/guided-AGENTS.md` | `9ec4996e8412129122b3109972dc1d1f6ab1292c5a8d98e44fabf92044716b62` |
| `fixtures/task-a/database/schema.sql` | `efaec521de3ccc66d559140507d9f32d8182a21b62908ea631f9f2445df14be2` |
| `fixtures/task-a/package.json` | `4557c3aaf1f803ec38e69582a0f52dd1c9474946b31ea6254c47a2ffac4d5e95` |
| `fixtures/task-a/src/server.mjs` | `49dea5edc660e50747810255cdbc86f9c36aa3471b1d4104837a211e75ead5d7` |
| `fixtures/task-a/src/WorkItems.sql.mjs` | `a53eddae52b3cc2ad4d6087d5c7d193f03b02b6a073fb3960aaecd2cfdb0a680` |
| `fixtures/task-b/database/schema.sql` | `c0e0895bbe756f74b7a3aceeb98c22b6caf2a9f7112d048f553ef153c4acc96f` |
| `fixtures/task-b/package.json` | `c223f77d5d6bdc3badf3ed3adef5920f85d7b4a0683bf21910119f0b2fd5ebdc` |
| `fixtures/task-b/src/GetAccount.sql.mjs` | `0bff545363f49e1d90a49cc3b197ca94fd8398d7ffed72f3303a8950808f5be5` |
| `fixtures/task-b/src/server.mjs` | `cfc9967455ba4b1d752c3e78b232d41be935118b3ebf86d5c482299e0b5e186c` |

Raw SQL product files, PR #33, installers, releases, and historical v0.1
artifacts are not modified by this study.
