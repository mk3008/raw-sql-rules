# Authorized input-transfer manifest

Source commit: `e00f8864db6c706e66ac6c294a2775f20d525c30`
Source root: `benchmark/rawsql-harness-sensitivity-ts-v0.3/`

Only preregistration/freeze inputs were copied. No historical candidate, review, calibration result, qualification result, log, launch state, or outcome material was read or transferred. All copied inputs below are byte-identical.

| Source path | Source SHA-256 | Destination path | Destination SHA-256 |
| --- | --- | --- | --- |
| prompts/S01.txt | 4427b0530dff97ee3504519e00dab3fe98e78b598cd86a721198655599e5286f | prompts/S01.txt | 4427b0530dff97ee3504519e00dab3fe98e78b598cd86a721198655599e5286f |
| prompts/S02.txt | ba600148209f025b16720fab86bf6fb575948134792b2e2328c67b1edc1e8bd5 | prompts/S02.txt | ba600148209f025b16720fab86bf6fb575948134792b2e2328c67b1edc1e8bd5 |
| fixture/README.md | 526e71f097408626f55865fd6938a25415db636cceb678afa4087bc55a3b82db | fixture/README.md | 526e71f097408626f55865fd6938a25415db636cceb678afa4087bc55a3b82db |
| fixture/compose.yaml | 1f50579037eaafd226bf8342bfb4bf6ab4bebc76268ebe7c13ba8a167581b469 | fixture/compose.yaml | 1f50579037eaafd226bf8342bfb4bf6ab4bebc76268ebe7c13ba8a167581b469 |
| fixture/package-lock.json | 2a0ce11f1b17b6cdce6313f49661286a64fe360af46a0045aee4ebf5eeb4f324 | fixture/package-lock.json | 2a0ce11f1b17b6cdce6313f49661286a64fe360af46a0045aee4ebf5eeb4f324 |
| fixture/package.json | dcd1543adeb1bd5c7b5cfafc922a5e5fab64755f093847bc630e6f605911fbd5 | fixture/package.json | dcd1543adeb1bd5c7b5cfafc922a5e5fab64755f093847bc630e6f605911fbd5 |
| fixture/tsconfig.json | 752c62ca5f7cd9ffc2d34c4ea4f904467362eb61e7a55b0305581f67d08f6360 | fixture/tsconfig.json | 752c62ca5f7cd9ffc2d34c4ea4f904467362eb61e7a55b0305581f67d08f6360 |
| fixture/database/schema/001_inventory.sql | f3c38750a6dff73481a977108d6471d34bd96a7185145d5f15bc07d32d19f2f9 | fixture/database/schema/001_inventory.sql | f3c38750a6dff73481a977108d6471d34bd96a7185145d5f15bc07d32d19f2f9 |
| fixture/database/seed/001_inventory.sql | bf039b5897faff526765f2cdf891003bed06347b111e2c2d57975b41bb98525b | fixture/database/seed/001_inventory.sql | bf039b5897faff526765f2cdf891003bed06347b111e2c2d57975b41bb98525b |
| fixture/dist/server.js | af2d0a045be6524bbed08cb5bf14e642847bee86f0bccdcef54cc17617e65adf | fixture/dist/server.js | af2d0a045be6524bbed08cb5bf14e642847bee86f0bccdcef54cc17617e65adf |
| fixture/src/server.ts | adc3cb17f7225afa86a2a07ab24154aadc8f099f952d4bbd787c94c224e8ba70 | fixture/src/server.ts | adc3cb17f7225afa86a2a07ab24154aadc8f099f952d4bbd787c94c224e8ba70 |
| runner/Prepare-Arm.ps1 | d3aae0c27aae17305f3ae3b95b5d4a3245dda542195e30ce8b4e26798385ca95 | runner/Prepare-Arm.ps1 | d3aae0c27aae17305f3ae3b95b5d4a3245dda542195e30ce8b4e26798385ca95 |
| runner/released-v0.1.0-install.ps1 | d9b4b85623b70c98aa1e5d9d139c65be1c407e1428a210d7a5ecbd1a0c8655db | runner/released-v0.1.0-install.ps1 | d9b4b85623b70c98aa1e5d9d139c65be1c407e1428a210d7a5ecbd1a0c8655db |
| runner/evaluate.mjs | 6bd54a509f2318f58f4e464345299b2b2c218464801b60dbf205b99fbffcf0af | runner/evaluate.mjs | 6bd54a509f2318f58f4e464345299b2b2c218464801b60dbf205b99fbffcf0af |
| calibration/correct-s01.ts | dc0ce3a3c1e3b3f57efd4b51d4dd885951497a2d5ed1939bb6d8fabf83def8de | calibration/correct-s01.ts | dc0ce3a3c1e3b3f57efd4b51d4dd885951497a2d5ed1939bb6d8fabf83def8de |
| calibration/correct-s02.ts | a1d099fcf4bd4e5b08eb0262f87e55cecbf29feca45b4176f6640d93d2c8a433 | calibration/correct-s02.ts | a1d099fcf4bd4e5b08eb0262f87e55cecbf29feca45b4176f6640d93d2c8a433 |

`Evaluate.ps1`, `Run-Calibrations.ps1`, `Qualification.ps1`, `Gate.ps1`, candidate dispatch, and all v0.4 evidence definitions are new v0.4 protocol material. The only authorized deviation is the evaluator correction requiring declared production-start evaluation before clean reconstruction, calibrated by CAL11.
