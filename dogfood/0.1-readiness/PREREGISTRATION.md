# Raw SQL Rules 0.1 readiness assessment preregistration

- Starting remote `main`: `2bb7d1464032d2fe0abce3a7061f976e510ea88b`.
- Scope: evidence-only synthesis of the existing 0.1 product, installer, dogfood, review-calibration, recovery-calibration, and end-to-end evidence. No implementation, new dogfood, or Rules change is permitted.
- Primary decision: choose `KEEP-AS-IS`, `MODIFY-BEFORE-0.1`, or `NOT-READY` for the current normative Rules text.

## Decision criteria

1. Determine whether there is a confirmed and repeated Raw SQL implementation-contract gap.
2. Distinguish an independent misunderstanding of an existing Rule from a missing or harmful Rule.
3. Classify each material finding as Raw-SQL-specific, general application/code, requirement ambiguity, or tooling/product; do not treat reviewer labels as ground truth.
4. Keep generation-contract pressure separate from review-detection pressure.
5. Require reproducible added value over Raw-SQL-Rules-only review before permanently owning Review Rules.
6. Require direct evidence before permanently owning Source Clarity Rules.
7. Separate supported observations and bounded inferences from unsupported generalizations.

The assessment will record both evidence for and against the selected verdict. A single finding is insufficient to recommend a normative Rule change unless its severity and direct contract grounding justify an explicit exception.
