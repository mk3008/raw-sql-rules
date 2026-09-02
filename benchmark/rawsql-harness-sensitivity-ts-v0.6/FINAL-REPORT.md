# Raw SQL harness sensitivity study v0.6 — final report

## Preregistered Mechanical Primary

All four official candidates completed. Mechanical Primary was frozen before post-hoc work and is PASS for every slot.

| Slot | Mechanical Primary | Post-hoc adversarial adjudicated quality |
| --- | --- | --- |
| S02-Control | PASS | FAIL |
| S02-Treatment | PASS | FAIL |
| S01-Control | PASS | FAIL |
| S01-Treatment | PASS | FAIL |

## Post-hoc secondary evidence

Sol findings were inspected before the adjudication procedure was frozen; that fact and hashes/copies of all findings are retained with the preserved run. The adjudication procedure and all resulting classifications are explicitly **POST-HOC SECONDARY EVIDENCE**. They do not alter the preregistered Mechanical Primary result and must not be combined into one score.

Confirmed minimal reproductions included malformed JSON returning HTTP 500, object request IDs and refused database connection ending the S02-Treatment process, bigint-to-Number precision loss, timestamptz microsecond truncation, out-of-range Date conversion failure, and a production error response disclosing stack/path details. Idle-pool termination and the bounded concurrency claim remain UNCONFIRMED; uncertainty was not converted into confirmation.

No Treatment/Control separation is shown by the post-hoc adjudication: all four candidates have at least one CONFIRMED eligible finding. Any such secondary pattern would in any event be exploratory, not a confirmatory treatment-effect result.

## Frozen evidence

- Preserved run: `C:\tmp\raw-sql-rules-runner\rawsql-v06-b8a363a00f4c4fcd8fa88d84bb0ac02d`
- Official candidates: 4 / 4
- Mechanical Primary: 4 / 4 PASS
- Blind review: 4 / 4 complete
- Post-hoc evidence: `post-hoc-adjudication\ADJUDICATION-PROCEDURE.json` and `ADJUDICATION-SUMMARY.json`
