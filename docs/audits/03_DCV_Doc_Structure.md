# Design Constraint Validator – Proposed Documentation Structure

## Public-Facing Docs (`/docs/`)

| Filename                  | Description                                                                 |
|--------------------------|-----------------------------------------------------------------------------|
| `README.md`              | Overview landing page. Short intro, goals, install guide, and links to deeper docs. |
| `Getting-Started.md`     | First-use tutorial walking through token setup, basic constraint config, and validation run. |
| `Constraints.md`         | Explanation and examples of all constraint types (monotonic, WCAG, threshold, etc). |
| `Configuration.md`       | How to configure DCV via files or CLI: token paths, breakpoints, themes (constraints), overrides, output, and validation behavior. |
| `CLI.md`                 | All CLI commands, flags, output modes, and usage examples (validate, graph, why, etc.). |
| `JSON-Output.md`         | Full reference for machine-readable JSON output, receipts, and exit codes. |
| `API.md`                 | How to use DCV programmatically (importing, `validate()`, `graph()`, engine plugin use, etc.). |
| `Concepts.md`            | Glossary and conceptual grounding: tokens, constraints, violations, breakpoints, posets, receipts, themes vs policies. |
| `Adapters.md`            | Guide to supported input formats (Tokens Studio, Style Dictionary, DTCG), how adapters normalize token structures. |
| `Examples.md`            | Index and descriptions of example setups under `/examples/`. Links to each and notes what formats or features they demonstrate. |

## Internal or Architectural Docs (`/docs/internal/`)

| Filename                        | Description                                                                 |
|---------------------------------|-----------------------------------------------------------------------------|
| `Architecture.md`              | Current architecture of DCV: token normalization, dependency graph, plugins, validation engine. |
| `Extending-DCV.md`             | How to write a custom constraint plugin, custom adapter, or CLI extension. |
| `Prior-Art-Dcv-Postcompute.md` | Design rationale behind DCV’s post-compute validation approach and receipts. |
| `Prior-Art-Decision-Themes.md` | Broader design framework DCV fits into (Visual vs Decision Themes, deterministic compute). |
| `WIKI-SETUP.md`                | Maintainer instructions for syncing docs to GitHub wiki. Not needed by users. |
| `RELEASE.md`                   | Steps to publish new versions to npm, tag releases, and CI pipelines. |
| `CONTRIBUTING.md`              | Guidelines for contributing, PR etiquette, local dev setup, and testing. |

## Deprecation / Merge Plan

| File                  | Action             | Rationale |
|-----------------------|--------------------|-----------|
| `CONFIGURATION.md`    | Deprecate/delete   | Superseded by `docs/Configuration.md`. |
| `README.md` (root)    | Trim + link docs   | Avoid duplication. |
| `docs/Home.md`        | Remove             | Redundant with top-level README. |

## Glossary / Concepts Justification

`Concepts.md` is mandatory for long-term clarity. It defines core terms like constraint, token, violation, poset, policy, theme, receipt, manifest, etc. Ensures shared language across docs and contributors.

## Proposed File Tree

```
/docs
├── README.md
├── Getting-Started.md
├── Constraints.md
├── Configuration.md
├── CLI.md
├── JSON-Output.md
├── API.md
├── Concepts.md
├── Adapters.md
├── Examples.md
│
├── internal
│   ├── Architecture.md
│   ├── Extending-DCV.md
│   ├── Prior-Art-Dcv-Postcompute.md
│   ├── Prior-Art-Decision-Themes.md
│   ├── WIKI-SETUP.md
│   ├── RELEASE.md
│   └── CONTRIBUTING.md
```