# Attempt 2 — completed view maintenance

- Fresh context: yes.
- Commit / frozen SHA: `96d2bd3`
- Prompt: `../prompts/attempt-02.md`
- Outcome: added `GET /work-items/completed`, whose SQL fixes successful
  completion state (`status = 2`) and non-null completion timestamp; callers
  cannot choose the status predicate.

The endpoint optionally filters owner and completion timestamps using named
parameters and keeps the feature-local endpoint, SQL asset, and tests together.
The agent reported 14 passing tests at its freeze point.
