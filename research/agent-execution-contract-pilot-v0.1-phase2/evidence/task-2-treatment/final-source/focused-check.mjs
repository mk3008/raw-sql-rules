import assert from "node:assert/strict";
import { toResponse } from "./mapper.mjs";

assert.deepEqual(toResponse({ id: "acct-42", status: "ACTIVE" }), {
  id: "acct-42",
  status: "ACTIVE",
});
console.log("Focused response mapping check passed.");
