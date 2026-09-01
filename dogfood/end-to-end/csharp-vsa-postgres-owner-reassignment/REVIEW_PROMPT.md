# Review prompt

This exact prompt was supplied to each fresh review context, together with the feature requirements, canonical DDL, installed Raw SQL Rules, applicable application instructions, and the appropriate frozen candidate snapshot.

```text
Review this frozen implementation against:

- the supplied feature requirements;
- the canonical DDL;
- the Raw SQL Rules;
- applicable repository instructions.

Do not modify the candidate.

You may inspect source files and run non-destructive verification when useful.

Report only:

1. confirmed defects, with concrete evidence and impact;
2. resolvable evidence gaps;
3. uncertainties or requirement ambiguities.

Do not invent style or naming findings merely to produce feedback.
```
