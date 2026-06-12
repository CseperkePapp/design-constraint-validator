# Design Constraint Validator (DCV)

> Mathematical constraint validator for design systems — ensuring consistency, accessibility, and logical coherence.

[![npm version](https://img.shields.io/npm/v/design-constraint-validator.svg)](https://www.npmjs.com/package/design-constraint-validator)
[![npm downloads](https://img.shields.io/npm/dm/design-constraint-validator.svg)](https://www.npmjs.com/package/design-constraint-validator)
[![CI](https://github.com/CseperkePapp/design-constraint-validator/actions/workflows/ci.yml/badge.svg)](https://github.com/CseperkePapp/design-constraint-validator/actions/workflows/ci.yml)
[![SBOM](https://img.shields.io/badge/SBOM-CycloneDX-brightgreen)](https://github.com/CseperkePapp/design-constraint-validator/actions/workflows/sbom.yml)
[![Supply Chain Security](https://img.shields.io/badge/security-hardened-blue)](SECURITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.x-339933.svg)](#)

**Design Constraint Validator (DCV)** validates design constraints across token sets and styles:
- ✅ **Accessibility:** WCAG text contrast, perceptual lightness floor/ceilings
- ✅ **Order & Monotonicity:** increasing typography scales, spacing hierarchies
- ✅ **Thresholds & Policies:** min/max ranges, cross-axis guards (size × weight × contrast)
- ✅ **Graph Intelligence:** Hasse/poset graph export; "why" explanations with implicated edges

This is **not** a schema linter; it's a **reasoning validator** for values and relationships.

---

## Installation

```bash
# Local (recommended)
npm i -D design-constraint-validator

# One-off run
npx dcv --help
```

**Requirements:** Node.js ≥ 18.x (ESM)

---

## Quick Start

DCV validates **your** tokens against **your** constraints. From an empty directory:

```bash
# 1. Your design tokens (DTCG-style "$value")
cat > tokens.json <<'JSON'
{
  "color": {
    "text": { "$value": "#888888" },
    "bg":   { "$value": "#999999" }
  }
}
JSON

# 2. Your constraints — auto-discovered as dcv.config.json in the cwd
cat > dcv.config.json <<'JSON'
{
  "constraints": {
    "enableBuiltInWcagDefaults": false,
    "enableBuiltInThreshold": false,
    "wcag": [
      { "foreground": "color.text", "background": "color.bg", "ratio": 4.5, "description": "Body text on background" }
    ]
  }
}
JSON

# 3. Validate (positional path or --tokens; exits non-zero on violations)
npx dcv validate tokens.json --summary table

# Explain one token (the tokenId is required)
npx dcv why color.text --tokens tokens.json --format table

# Export the dependency graph
npx dcv graph --tokens tokens.json --format mermaid > graph.mmd
```

**Example output** (`validate`):

```text
validate: 1 error(s), 0 warning(s)
ERROR wcag-contrast  color.text|color.bg @ Body text on background — Contrast 1.24:1 < 4.5:1
scope   rules  warnings  errors
------  -----  --------  ------
global  1      0         1
```

Exit code is `1` when violations are found, `0` when clean (use `--fail-on off` to always exit `0`). The built-in WCAG/threshold defaults target the bundled example token ids, so disable them (as above) when validating your own token names.

---

## Programmatic API

```ts
import { validate } from 'design-constraint-validator';

// Synchronous. Point at files, or pass `tokens` / `constraints` inline.
const result = validate({
  tokensPath: './tokens.json',
  configPath: './dcv.config.json', // omit to auto-discover dcv.config.json in the cwd
});

if (!result.ok) {
  for (const v of result.violations) {
    console.log(`[${v.ruleId}] ${v.message}`);
  }
  process.exitCode = 1;
}
```

See **[API Reference](docs/API.md)** for complete programmatic usage.

---

## Use from AI agents (MCP)

DCV ships a second binary, `dcv-mcp`, that exposes the validator over MCP stdio for agent clients. Add it to a Claude Desktop or generic MCP client config like this:

```json
{
  "mcpServers": {
    "dcv": {
      "command": "npx",
      "args": ["-y", "--package", "design-constraint-validator", "dcv-mcp"]
    }
  }
}
```

The server exposes exactly three JSON-returning tools:

- `validate` - validate inline `tokens` or a `tokensPath` against inline `constraints` or a config file.
- `why` - explain provenance, aliases, dependencies, dependents, and alias chain for one token id.
- `graph` - return token dependency `nodes` and `edges`.

Tool failures are returned as structured JSON: `{ "ok": false, "error": { "code": "...", "message": "..." } }`.

---

## Documentation

### For Everyone
- **[Getting Started](docs/Getting-Started.md)** - 5-minute tutorial
- **[Features & Complete Guide](docs/Features.md)** - All features, examples, and FAQ
- **[Examples](docs/Examples.md)** - Sample projects and use cases

### For Users
- **[Constraints](docs/Constraints.md)** - All 5 constraint types in detail
- **[CLI Reference](docs/CLI.md)** - Complete command documentation
- **[Configuration](docs/Configuration.md)** - Config file options
- **[Concepts](docs/Concepts.md)** - Core terminology and defaults

### For Developers
- **[API Reference](docs/API.md)** - Programmatic usage
- **[Architecture](docs/Architecture.md)** - Internal design
- **[Adapters](docs/Adapters.md)** - Input/output formats

### Additional Resources
- **[Prior Art / Method](docs/prior-art/)** - Design rationale (Decision Themes, receipts)
- **[AI Guide](docs/AI-GUIDE.md)** - Using DCV with ChatGPT/Claude/Copilot
- **[Contributing](CONTRIBUTING.md)** - Contribution guidelines
- **[Security](SECURITY.md)** - Supply chain security measures

---

## Why Constraints, Not Conventions?

Conventional linters catch **schema** issues ("has a value, has a type").
**DCV** enforces **relationships** that matter to users and brand integrity:

- Legible contrast under all themes and states
- Proper hierarchical spacing/typography (monotonic scales)
- Coherent cross-axis behavior (e.g., weight increases with size where needed)
- Policy conformance (AA/AAA, internal thresholds)

This transforms tokens from "bags of numbers" into a **formal design system**.

---

## Comparison: Schema Linters vs DCV

| Feature | Schema Linters | DCV |
|---------|----------------|-----|
| **Validates** | JSON structure, types | Mathematical relationships, accessibility |
| **Catches** | Missing fields, wrong types | Contrast violations, hierarchy breaks |
| **Purpose** | Format compliance | Design system integrity |
| **Examples** | DTCG schema validator | WCAG checks, monotonic scales |

> DCV is not affiliated with Anima's `design-tokens-validator` (schema-focused).

---

## Input Formats

DCV accepts **token JSON** (flat or nested) and optional **policy JSON**.
Adapters normalize common ecosystems:

- **Style Dictionary** - See [examples/style-dictionary/](examples/style-dictionary/)
- **Tokens Studio JSON** - See [examples/tokens-studio/](examples/tokens-studio/)
- **DTCG** (Design Tokens Community Group) — reads the **2025.10 stable spec** (structured sRGB colors, structured dimensions, `{alias}` references, `$extensions` passthrough; non-sRGB spaces warn rather than mis-calculate; composite types out of scope). See [examples/dtcg/](examples/dtcg/)

Full adapter documentation: **[Adapters](docs/Adapters.md)**

---

## DCV & DecisionThemes

DCV is the **standalone validation engine** — use it for any token system.

**DecisionThemes** (coming 2026) is a complete design system framework built on DCV:
- **5-axis decision model** (Tone, Emphasis, Size, Density, Shape)
- **VT/DT pipeline** (Value Themes + Decision Themes → deterministic CSS configs)
- **Studio UI** + **Hub marketplace** for sharing Decision Systems

DCV powers DecisionThemes' validation layer — but works perfectly standalone.
Preview: [www.decisionthemes.com](https://www.decisionthemes.com)

---

## Method & Prior Art

The Design Constraint Validator engine is based on a theming and validation method published as **defensive prior art**.

To understand the underlying architecture (Decision Themes / Value Themes, deterministic compute, post-compute validation and receipts):

- [Decision Themes Method](docs/prior-art/Decision-Themes-Deterministic-Compute-and-Dual-Namespaces.md)
- [DCV Validation & Receipts](docs/prior-art/DCV-Post-Compute-Validation-and-Receipts.md)

These documents keep the method openly implementable and prevent patent lock-up.

---

## Security & Supply Chain

### SBOM (Software Bill of Materials)

DCV generates CycloneDX-compliant SBOMs for supply chain transparency:

- **CI Builds:** SBOM artifacts on every CI run (90-day retention)
- **Version tags:** SBOM artifacts for release tags
- **GitHub Releases:** SBOM files (JSON + XML) attached when a GitHub Release is created
- **Manual:** Run `npx @cyclonedx/cyclonedx-npm` in project root

**Download:**
- [GitHub Actions Artifacts](https://github.com/CseperkePapp/design-constraint-validator/actions/workflows/sbom.yml)
- [Latest Release](https://github.com/CseperkePapp/design-constraint-validator/releases/latest)

---

## Roadmap

- Plugin API for **custom constraints**
- **VS Code** diagnostics (inline explain)
- **Cross-axis packs** (typography × weight × contrast)
- **Signed / attestable receipts** — `dcv validate --receipt` already emits environment + input content hashes today; cryptographic **signing** is the roadmap part
- UI graph explorer (node inspector, violations focus)

---

## Philosophy

> **Constraints, not conventions.**

Design systems need mathematical guarantees. This validator:

1. **Enforces relationships** - Typography hierarchies, color progressions
2. **Validates accessibility** - WCAG contrast with alpha compositing
3. **Explains violations** - Provenance tracing shows why rules fail
4. **Scales with complexity** - Incremental validation of 1000s of tokens

---

## Related Projects

This is the **core validation engine**. For a complete decision-driven design system with a 5-axis framework (Tone, Emphasis, Size, Density, Shape) and theme configurator UI, see **DecisionThemes** (coming soon).

---

## Contributing

Contributions welcome! See **[CONTRIBUTING.md](CONTRIBUTING.md)**

---

## License

[MIT](LICENSE) © Cseperke Papp
