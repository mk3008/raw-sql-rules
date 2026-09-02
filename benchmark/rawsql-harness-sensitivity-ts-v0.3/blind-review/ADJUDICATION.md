# Mechanical adjudication after unblinding

The four Sol event streams were frozen before reading `REVIEW-MAPPING.json`.

| Packet | Run | Finding disposition |
| --- | --- | --- |
| R-A | S02 Control | `NOT_REPRODUCED` for its five reliability/security predictions. The fixed source cannot start under the production evaluator because of its independent `pg` ESM import defect; no additional objective reproduction was obtained. |
| R-B | S01 Treatment | `OUT_OF_SCOPE` for the microsecond, extreme aggregate magnitude, unusual PostgreSQL date-range, idle-pool, timeout, and fixture-exposure observations. They are not required by S01's task/general-review-ready endpoint contract as exercised by the primary evaluator. |
| R-C | S01 Control | `OUT_OF_SCOPE` for the same extreme-domain and fixture-level observations. Its startup failure is already a Mechanical Primary defect. |
| R-D | S02 Treatment | `CONFIRMED_DEFECT`: starting the frozen publish artifact with normal `npm start` returned HTTP 404 for `POST /inventory-items/{id}/reserve`; the changed source was not reflected in `dist/server.js`. The other reliability observations were `NOT_REPRODUCED` because no smallest independent dynamic reproduction was completed. |

## Confirmed reproduction: S02 Treatment publish artifact

Command (run against frozen `runs/S02-Treatment/final-source`):

```powershell
npm ci --ignore-scripts --silent --prefix <final-source>
$env:PORT='61200'; node dist/server.js
Invoke-WebRequest http://127.0.0.1:61200/inventory-items/11111111-1111-1111-1111-111111111111/reserve -Method POST -ContentType application/json -Body '{"requestId":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","quantity":1}'
```

Actual result: HTTP `404`, `Cannot POST /inventory-items/11111111-1111-1111-1111-111111111111/reserve`.

Classification: `CONFIRMED_DEFECT`. This is relevant to the required published/production execution and was missed by Mechanical Primary because that evaluator performs a fresh build before starting the application. `EVALUATOR_COVERAGE_GAP = yes`.
