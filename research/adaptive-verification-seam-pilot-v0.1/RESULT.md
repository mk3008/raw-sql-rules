# INVALID / INSUFFICIENT PILOT

Pre-dispatch qualification stopped the pilot before packet freeze or any official candidate turn.

| Task | Broad command | Seeded-defect result | Measured wall-clock |
| --- | --- | --- | --- |
| Cheap | `npm test` | FAIL | 1.534 s |
| Expensive | `npm test` | FAIL | 24.372 s |

The cheap broad path did not satisfy the required approximate `<= 1 second` cost boundary. Per the pre-dispatch instruction, the fixture must not be enlarged or otherwise adjusted to rescue this pilot. No candidate packet was dispatched and no official candidate turn was consumed.

This INVALID classification reflects failure of the pre-dispatch fixture qualification boundary, not an observed Treatment/Control result; no candidate turn was dispatched.
