#!/usr/bin/env ts-node
import { readFileSync } from "node:fs";
import { flattenTokens } from "../core/flatten.js";
import { Engine } from "../core/engine.js";
import { WcagContrastPlugin } from "../core/constraints/wcag.js";

const tokensRoot = JSON.parse(readFileSync("tokens/tokens.example.json","utf8"));
const { flat, edges } = flattenTokens(tokensRoot);

// Build init values map
const init: Record<string, string|number> = {};
for (const [id, t] of Object.entries(flat)) init[id] = t.value;

// Engine + plugin (example pairs; adjust IDs to your roles)
const engine = new Engine(init, edges).use(
  WcagContrastPlugin([
    { fg: "color.role.text.default", bg: "color.role.surface.default", min: 4.5, where: "Body text" },
    { fg: "color.role.accent.default", bg: "color.role.surface.default", min: 3.0, where: "Accent on surface" }
  ])
);

// Apply overrides if present
let overrides: Record<string, string|number> = {};
try {
  const maybe = JSON.parse(readFileSync("tokens/overrides/local.json","utf8"));
  overrides = maybe.overrides ?? maybe;
} catch {
  // File doesn't exist or invalid JSON, use empty overrides
}

import { patchToJson } from "../adapters/json.js";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

const argvPromise = yargs(hideBin(process.argv)).option('json', {
  alias: 'j',
  type: 'boolean',
  description: 'Output result as JSON'
}).argv;

// ... existing code ...

(async () => {
  const argv = await argvPromise;
  for (const [id, val] of Object.entries(overrides)) {
    const res = engine.commit(id, val);
    if (argv.json) {
      const jsonOutput = patchToJson(res);
      console.log(JSON.stringify(jsonOutput, null, 2));
    } else {
      console.log(JSON.stringify(res, null, 2));
    }
  }
})();
