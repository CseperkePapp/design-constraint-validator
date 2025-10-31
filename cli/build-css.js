// cli/build-css.ts
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { flattenTokens } from "../core/flatten.js";
import { valuesToCss } from "../adapters/css.js";
const tokens = JSON.parse(readFileSync("tokens/tokens.example.json", "utf8"));
const { flat } = flattenTokens(tokens);
const allValues = Object.fromEntries(Object.values(flat).map(t => [t.id, t.value]));
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
const argv = yargs(hideBin(process.argv)).option('out', {
    alias: 'o',
    type: 'string',
    description: 'Output file path',
    default: 'dist/tokens.css'
}).parseSync();
// ... existing code ...
const outFile = argv.out;
const css = valuesToCss(allValues, { layer: "tokens", selector: ":root" });
// ... existing code ...
mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, css);
console.log(`Wrote ${outFile}`);
