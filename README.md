# Design Constraint Validator (DCV)

> Mathematical constraint validator for design systems — ensuring consistency, accessibility, and logical coherence.

[![npm version](https://img.shields.io/npm/v/design-constraint-validator.svg)](https://www.npmjs.com/package/design-constraint-validator)
[![npm downloads](https://img.shields.io/npm/dm/design-constraint-validator.svg)](https://www.npmjs.com/package/design-constraint-validator)
[![CI](https://github.com/CseperkePapp/design-constraint-validator/actions/workflows/ci.yml/badge.svg)](https://github.com/CseperkePapp/design-constraint-validator/actions/workflows/ci.yml)
[![SBOM](https://img.shields.io/badge/SBOM-CycloneDX-brightgreen)](https://github.com/CseperkePapp/design-constraint-validator/actions/workflows/sbom.yml)
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

```bash
# Validate tokens with default constraints
npx dcv validate ./tokens/tokens.json

# Explain failures
npx dcv why --format table

# Export dependency graph
npx dcv graph --format mermaid > graph.mmd
```

**Example Output:**

```
Constraint                    Status   Details
────────────────────────────  ──────   ─────────────────────────────────────────────
WCAG Contrast ≥ 4.5:1        FAIL     text.primary(#5A5A5A) on bg.body(#F5F5F5) ⇒ 3.8
Typography monotonic scale   FAIL     h3(22) < body(18) < h2(21) < h1(34)  ✖ out-of-order: h2<h3
Cross-axis (weight vs size)  PASS     all headings satisfy min weight for size bucket
Exit code: 1 (violations found)
```

---

## Programmatic API

```ts
import { validate } from 'design-constraint-validator';

const result = await validate({
  tokensPath: './tokens/tokens.json',
  policyPath: './themes/policies/aa.json'
});

if (!result.ok) {
  for (const v of result.violations) {
    console.log(`[${v.kind}] ${v.message}`, v.context);
  }
  process.exitCode = 1;
}
```

See **[API Reference](docs/API.md)** for complete programmatic usage.

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
- **DTCG** (Design Tokens Community Group) - See [examples/dtcg/](examples/dtcg/)

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
- **Releases:** SBOM files (JSON + XML) attached to GitHub releases
- **Manual:** Run `npx @cyclonedx/cyclonedx-npm` in project root

**Download:**
- [GitHub Actions Artifacts](https://github.com/CseperkePapp/design-constraint-validator/actions/workflows/sbom.yml)
- [Latest Release](https://github.com/CseperkePapp/design-constraint-validator/releases/latest)

---

## Roadmap

- Plugin API for **custom constraints**
- **VS Code** diagnostics (inline explain)
- **Cross-axis packs** (typography × weight × contrast)
- **Receipts & provenance** (hashes, signable reports)
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
