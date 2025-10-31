// cli/smoke-test.ts
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { flattenTokens } from "../core/flatten";
import { Engine } from "../core/engine";
import { WcagContrastPlugin } from "../core/constraints/wcag";
import { patchToCss } from "../adapters/css";

// 1. Flatten tokens
const tokensRoot = JSON.parse(readFileSync("tokens/tokens.example.json", "utf8"));
const { flat, edges } = flattenTokens(tokensRoot);

// 2. Build engine
const init: Record<string, string | number> = {};
for (const [id, t] of Object.entries(flat)) init[id] = t.value;

const engine = new Engine(init, edges).use(
  WcagContrastPlugin([
    { fg: "color.role.text.default", bg: "color.role.bg.surface", min: 4.5, where: "Body text" },
  ])
);

// 3. Commit one change
const overrideId = "color.palette.brand.600";
const overrideValue = "#FF00FF"; // A loud magenta to make it obvious
const result = engine.commit(overrideId, overrideValue);

console.log("--- Smoke Test ---");
console.log(`Committed: ${overrideId} = ${overrideValue}`);
console.log("Affected:", result.affected);
console.log("Issues:", result.issues);
console.log("Patch:", result.patch);

// 4. Write overrides.css using the adapter
const css = patchToCss(result.patch);
const outFile = "css/overrides.css";
mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, css);
console.log(`\nWrote ${outFile}`);
console.log("--- End Smoke Test ---");
