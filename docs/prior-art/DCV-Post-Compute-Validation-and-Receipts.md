> **Defensive Publication / Prior Art — CC BY 4.0**
> © 2025 Cseperke Papp. This document is published to establish prior art.
> It enables independent implementation without requiring any specific UI or specific editor.

# DCV: Post‑Compute Validation & Machine‑Readable Receipts for Theming Systems

**Author:** Cseperke Papp
**Project:** Design Constraint Validator (DCV)
**Date:** 2025‑11‑07
**Keywords:** design tokens, constraint validation, WCAG, monotonicity, posets, receipts, governance, CI/CD, OKLCH, DAG

---

## 1) Abstract

This disclosure describes a **post‑compute validation method** for design systems. Given an **EffectiveConfig** (the computed token set a site/app actually ships), the validator evaluates the configuration against **policy packs** (WCAG contrast, monotonic token ordering, thresholds, cross‑axis rules), and emits a **machine‑readable receipt** that includes input hashes, policy hashes, results, and timing. The receipt is suitable for CI/CD, audits, and provenance.

The validator is **engine‑agnostic**: it does not dictate how tokens are computed (e.g., Decision Themes, Style Dictionary, custom pipelines). It only requires a minimal **contract** for inputs/outputs and runs **after** computation to mirror production reality.

---

## 2) Motivation

Conventional token linters check **schema** (keys/types) or editor‑specific states. They often:

1. validate **before** final computation (mismatch with shipped values),
2. lack **composability** across toolchains, and
3. generate **human‑only** reports (no durable proof).

DCV addresses these by:

* Operating **post‑compute** on the same values that ship,
* Providing a **plugin** model for constraints (WCAG, monotonicity, thresholds, cross‑axis),
* Generating a **receipt** (JSON) with cryptographic hashes for reproducibility.

---

## 3) Scope & Non‑Assumptions

* **Does not** require a specific editor, UI, or token authoring format.
* **Does not** assume a particular color space; supports conversion (e.g., to OKLCH) for perceptual checks.
* **Does** require resolvable token values (strings/numbers) and optional graph metadata.
* **Does** work at any breakpoint; may be run per breakpoint set.

---

## 4) Input & Output Contracts (Normative)

### 4.1 Inputs

1. **EffectiveConfig** (flattened map)
   Example shape:

   ```json
   {
     "resolved": {
       "color.text.body": "#1a1a1a",
       "color.bg.surface": "#ffffff",
       "typography.size.h1": "32px",
       "typography.size.h2": "24px"
     }
   }
   ```

2. **Policy Pack** (constraints)
   A set of rules the engine applies. Supported kinds include **Monotonic**, **WCAG**, **Threshold**, **Lightness**, and **Cross‑Axis** rules (see §7).

3. **(Optional) Dependency Graph metadata**
   Nodes/edges that describe references and constraint edges; helpful for provenance and graph‑level diagnostics.

### 4.2 Outputs

1. **Validation Result (JSON)** — structured violations + stats (see §8).
2. **Validation Receipt (JSON)** — durable artifact with hashes, environment, and inputs (see §9).

---

## 5) Post‑Compute Validation Pipeline

```
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ EffectiveConfig│ → │ Constraints   │ → │ Violations     │
│ (flattened)    │    │ (policy pack) │    │ + Stats        │
└───────────────┘    └───────────────┘    └───────────────┘
         │                                   │
         └───────────────┬───────────────────┘
                         ▼
                 Receipt Generation
                 (hashes + environment)
```

### 5.1 Normalization

* Parse and coerce familiar units (px, rem, %, OKLCH strings, HEX/RGB/HSL).
* Resolve references if present; otherwise treat `resolved` values as final.

### 5.2 Constraint Execution

* Run each plugin with access to a simple **Engine** API (get/set, graph, utilities).
* Plugins push **Violation** records; severity can be `error` or `warn`.

### 5.3 Summary & Exit Code

* Aggregate counts and durations.
* Exit code policy: `off | warn | error` (see §8.4), suitable for CI.

---

## 6) Determinism & Hashes

To make results **reproducible**:

* Compute **tokensHash** as a cryptographic hash (e.g., SHA‑256) over a stable serialization of the input `resolved` map (sorted `key:value` lines).
* Compute **constraintHashes** per policy file/content.
* Include both in the **receipt**.

> The validator itself need not be deterministic across versions; the **receipt** captures both the **inputs** and the **engine version** to preserve auditability.

---

## 7) Constraint Kinds (Plugin Model)

### 7.1 Monotonic

Enforce partial‑order / ordering rules (typography scales, spacing hierarchies).

```json
{ "order": [["typography.size.h1", ">=", "typography.size.h2"]] }
```

### 7.2 WCAG Contrast

Check contrast ratios between foreground/background colors. Accept HEX/RGB/HSL/OKLCH; convert to a common working space for calculation.

```json
{ "constraints": { "wcag": [{
  "foreground": "color.text.body",
  "background": "color.bg.surface",
  "ratio": 4.5,
  "description": "Body text (AA)"
}]}}
```

### 7.3 Threshold

Minimum/maximum guards (e.g., ≥44px touch targets).

### 7.4 Lightness Ordering

Perceptual lightness monotonicity across a palette (often via OKLCH L channel).

### 7.5 Cross‑Axis Rules

Conditional, multi‑property constraints (e.g., *IF* weight ≤ 400 *THEN* size ≥ 16px). Useful for readability, touch targets, responsive contrast.

> Implementations can add more plugins; the **receipt** records plugin names and versions where applicable.

---

## 8) Validation Result (Machine‑Readable)

### 8.1 Result Shape

```typescript
interface ValidationResult {
  ok: boolean;
  counts: { checked: number; violations: number; warnings: number; };
  violations: ConstraintViolation[];
  warnings?: ConstraintViolation[];
  stats: { durationMs: number; engineVersion: string; timestamp: string; };
}

interface ConstraintViolation {
  ruleId: string;              // e.g., "wcag-contrast", "mono-typography"
  level: 'error' | 'warn';
  message: string;             // human‑readable summary
  nodes?: string[];            // implicated token IDs
  edges?: [string, string][];  // optional dependency edges
  context?: Record<string, unknown>; // rule‑specific details
}
```

### 8.2 Example (JSON)

```json
{
  "ok": false,
  "counts": { "checked": 156, "violations": 3, "warnings": 1 },
  "violations": [
    {
      "ruleId": "wcag-contrast",
      "level": "error",
      "message": "Insufficient contrast ratio: 2.3:1 (requires 4.5:1)",
      "nodes": ["color.text.primary", "color.bg.surface"],
      "context": { "actual": 2.3, "expected": 4.5, "standard": "AA" }
    }
  ],
  "stats": {
    "durationMs": 247,
    "engineVersion": "1.0.0",
    "timestamp": "2025-11-07T10:00:00.000Z"
  }
}
```

### 8.3 Table Summary (Human‑Readable)

Implementations may also output tabular text for terminals; JSON remains the source of truth.

### 8.4 Exit Codes

* `0` — Success or `--fail-on off`
* `1` — Violations found (depending on `--fail-on warn|error`)
* `2` — Configuration error
* `3` — Runtime error

---

## 9) Receipt (Audit & Governance)

### 9.1 Receipt Shape

```typescript
interface ValidationReceipt extends ValidationResult {
  environment: { nodeVersion: string; platform: string; arch: string; };
  inputs: {
    tokensFile?: string;        // path hint (optional)
    tokensHash: string;         // hash of EffectiveConfig or tokens file
    constraintsDir?: string;    // base dir hint
    constraintHashes: Record<string, string>; // filename → hash
    breakpoint?: string;        // e.g., sm|md|lg
  };
  config: { failOn: 'off'|'warn'|'error'; overrides?: string[] };
}
```

### 9.2 Example Receipt

```json
{
  "ok": true,
  "counts": { "checked": 91, "violations": 0, "warnings": 0 },
  "stats": {
    "durationMs": 131,
    "engineVersion": "1.0.0",
    "timestamp": "2025-11-07T10:00:00.000Z"
  },
  "environment": {
    "nodeVersion": "v20.10.0",
    "platform": "linux",
    "arch": "x64"
  },
  "inputs": {
    "tokensHash": "sha256:abc123…",
    "constraintsDir": "./themes",
    "constraintHashes": {
      "wcag.json": "sha256:1a2b3c…",
      "typography.order.json": "sha256:5e6f7g…"
    },
    "breakpoint": "md"
  },
  "config": { "failOn": "error" }
}
```

### 9.3 Intended Uses

* **CI/CD evidence** (attach artifact on failure or success)
* **Design reviews** (prove AA/AAA conformance at a commit)
* **Rollbacks** (pin to known‑good hashes)

---

## 10) Engine Interface (Informative)

A minimal runtime that plugins use:

```typescript
class Engine {
  get(tokenId: string): any;               // read resolved value
  set(tokenId: string, value: any): void;  // (optional) for derived checks
  use(plugin: ConstraintPlugin): void;     // register plugin
  validate(): ConstraintViolation[];       // run all plugins
  getGraph(): { nodes: Node[]; edges: Edge[] }; // for diagnostics
}

interface ConstraintPlugin {
  name: string;
  check(engine: Engine): ConstraintViolation[];
}
```

---

## 11) Color Handling (Informative)

* Accept **HEX / RGB / HSL / OKLCH**.
* Convert to a working space (e.g., linear RGB) for **contrast**; convert to OKLCH to assess **lightness**.
* For alpha colors, **composite** over background before computing contrast.

---

## 12) Provenance & “Why” Queries (Informative)

Implementations may expose `why(tokenId)` to report:

* value, source file, dependencies, and constraint outcomes concerning `tokenId`.
  This is useful for IDE/CLI explanations and for code review comments.

---

## 13) Breakpoints & Overrides

* Validate per **breakpoint** by applying overrides to the base tokens and re‑running constraints.
* The receipt should include the active `breakpoint` and any `overrides` used.

---

## 14) Performance & Incrementality

* Cache prior results; re‑validate only affected subgraphs when tokens change.
* Validate independent components in parallel if the graph allows.

---

## 15) Security & Privacy

* Receipts contain **configuration‑level** data (hashes, counts) but no private user content.
* Do not record raw token **values** in receipts unless explicitly requested; values normally live in the build artifacts.

---

## 16) Variations & Non‑Limiting Examples

* Hashing: SHA‑256, BLAKE3, or equivalent.
* Color spaces: OKLCH, Lab, sRGB; method unchanged.
* Output formats: JSON (canonical), tabular text (optional), HTML reports (optional).

---

## 17) Claims‑Style Disclosures

1. **Post‑compute validation** of a design system configuration against a plurality of constraints, where the input is a flattened configuration that mirrors shipped values.
2. Emission of a **machine‑readable receipt** that includes at least: an input hash of the configuration, a hash of the active policy pack, environment metadata, and validation outcomes.
3. A **plugin architecture** supporting at least monotonic ordering, accessibility contrast, thresholds, lightness ordering, and cross‑axis conditional rules.
4. Execution across **breakpoints**, with receipt fields indicating the active breakpoint and any overrides.
5. Optional **provenance tracing** that reports dependencies and constraint influences for a given token.

---

## 18) Example Artifacts (to accompany this publication)

Place minimal, working examples under `docs/prior-art/examples/`:

* `effective-config.example.json` — a tiny EC map,
* `receipt.example.json` — a sample receipt for that map,
* `role-map.example.json` — if the policy set references roles/selectors.

(*Toy values are acceptable; enablement is the point.*)

---

## 19) Licensing of This Document

* **License:** Creative Commons **CC BY 4.0**.
* Purpose: establish **prior art** and enable **citation**.

---

## 20) How to Cite

> Papp, C. (2025). *DCV: Post‑Compute Validation & Machine‑Readable Receipts for Theming Systems.* Defensive publication (CC BY 4.0). Git commit/tag: `v0.1-prior-art`.
> URL: (link to your GitHub file or release) • DOI (if minted via Zenodo)
