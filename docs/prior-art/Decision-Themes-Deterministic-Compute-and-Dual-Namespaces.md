> **Defensive Publication / Prior Art — CC BY 4.0**
> © 2025 Cseperke Papp. This document is published to establish prior art.
> It enables independent implementation without requiring any specific UI.

# Decision Themes: Deterministic Compute from Visual & Decision Layers with Dual-Namespace Bootstrap

**Author:** Cseperke Papp
**Project:** Decision Themes (engine-agnostic; validates with DCV)
**Date:** 2025-11-07
**Keywords:** design tokens, deterministic theming, OKLCH, VT/DT, EffectiveConfig, post-compute validation, receipts, dual namespaces, live preview, explicit apply

---

## 1) Abstract

This disclosure describes a method to **compute a complete design system deterministically** from two complementary inputs:

* a **Visual Theme (VT)** containing perceptual primitives (e.g., OKLCH color anchors, base type size, density), and
* a **Decision Theme (DT)** defining **relations** (ratios, mappings, constraints) rather than literal values.

The method computes a flattened **EffectiveConfig** (CSS-ready tokens) in a deterministic way, **hashes** the normalized output (the “golden hash”), then validates **post-compute** and emits a machine-readable **receipt**.
To avoid circular dependencies, the authoring tool styles itself via `--ui-*` variables (bootstrap theme) while previews and exported systems use `--ds-*` variables (user theme) — a **dual-namespace** contract. Live feedback occurs within the publisher’s application; writes to external sites/tools are **explicit** (“Apply”) and produce a receipt.

This publication is intended to be **engine-agnostic** and **UI-agnostic**. Any engine that implements the contracts below can interoperate with a validator (e.g., DCV).

---

## 2) Glossary (plain English)

* **VT (Visual Theme):** The “look” primitives — base colors (OKLCH), base font/size, spacing quantum, density, motion scale.
* **DT (Decision Theme):** The “rules” — math relations (e.g., `h1 = base × ratio^k`), mappings (role → tokens), and policy targets.
* **EffectiveConfig (EC):** The fully computed, flattened token map your site/app consumes (e.g., `--ds-color-text-primary`).
* **Golden Hash:** Cryptographic hash (e.g., SHA-256) over the **sorted** EC key/value pairs to guarantee determinism.
* **Receipt:** JSON artifact containing hashes, policy, pass/fail, and violations — used for governance and audits.
* **Dual Namespace:** `--ui-*` styles the **tool**, `--ds-*` styles the **user preview/output**.

---

## 3) Problem & Motivation

Most “token” systems:

1. mix **values** and **relations** (hard to reason about),
2. validate **before** computing (not what ships),
3. entangle the tool’s own CSS with the user’s system (circulars), and
4. lack **proof** (governance/a11y receipts).

We address this with:

* **Relations over literals** (DT),
* **Validation after compute**,
* **Dual namespaces** to isolate the tool UI, and
* **Receipts** tied to a **golden hash** of the shipped configuration.

---

## 4) Method Overview

1. **Input:** VT (primitives) + DT (relations).
2. **Compute:** Resolve VT×DT → **EffectiveConfig** (flat CSS var map).
3. **Normalize & Hash:** Sort keys; build `{key}:{value}` string; hash → **golden hash**.
4. **Validate (post-compute):** Run policies (e.g., WCAG contrast, monotone type/spacing) **on EC**.
5. **Emit Receipt:** `{ timestamp, engineVersion, inputHash, policyHash, passed, violations[] }`.
6. **Apply (explicit):** On user confirmation, persist EC as `/ec/<hash>.json` and attach receipt.
7. **Dual-Namespace:** Tool UI consumes `--ui-*`; preview/output consumes `--ds-*`.

---

## 5) Data Structures (normative examples)

### 5.1 Visual Theme (VT) — primitives (OKLCH-first)

```json
{
  "name": "CalmEditorial",
  "baseFontFamily": "Inter, system-ui, sans-serif",
  "baseFontSizePx": 16,
  "textScaleRatio": 1.2,
  "density": 1.0,
  "spacingQuantumRem": 0.25,
  "colors": {
    "primary": { "L": 0.62, "C": 0.08, "H": 240.0 },
    "surface1": { "L": 0.98, "C": 0.02, "H": 240.0 },
    "accent":  { "L": 0.62, "C": 0.18, "H": 260.0 }
  }
}
```

### 5.2 Decision Theme (DT) — relations (no hard literals)

```json
{
  "name": "AA-Editorial",
  "typography": {
    "exponents": { "h1": 3.2, "h2": 2.4, "h3": 1.8, "body": 0 },
    "dampening": 0.15
  },
  "spacing": {
    "multipliers": { "xs": 1, "sm": 2, "md": 4, "lg": 6, "xl": 8 }
  },
  "colors": {
    "darkerShift": -0.12,
    "lighterShift": 0.09,
    "contrastTarget": 4.5
  },
  "mappings": {
    "roles": {
      "text.body": ["color.text.primary"],
      "button.primary": ["color.text.on-accent", "color.bg.accent"]
    }
  }
}
```

### 5.3 EffectiveConfig (EC) — flattened CSS-ready

```json
{
  "hash": "sha256:example123",
  "resolved": {
    "--ds-font-size-h1": "48px",
    "--ds-font-size-h2": "34.6px",
    "--ds-space-2": "8px",
    "--ds-color-text-primary": "oklch(0.62 0.08 240)",
    "--ds-surface-1": "oklch(0.98 0.02 240)",
    "--ds-color-bg-accent": "oklch(0.62 0.18 260)",
    "--ds-color-text-on-accent": "oklch(0.98 0.02 260)"
  },
  "source": { "vt": "CalmEditorial", "dt": "AA-Editorial" }
}
```

> **Note:** Include real examples in `docs/prior-art/examples/`:
>
> * `effective-config.example.json`
> * `role-map.example.json`
> * `receipt.example.json`

---

## 6) Deterministic Compute & Hashing

### 6.1 Representative algorithm (language-agnostic pseudocode)

```ts
function computeEffectiveConfig(vt, dt):
  // Typography via exponent on damped ratio
  damp = 1 + ln(vt.textScaleRatio) * dt.typography.dampening
  px = (exp) => round(vt.baseFontSizePx * pow(damp, exp), 2) + "px"

  // Spacing
  rem = (mult) => (vt.spacingQuantumRem * vt.density * mult).toFixed(3) + "rem"

  // Colors (OKLCH ΔL only; keep C,H)
  darker = (c) => oklch(c.L + dt.colors.darkerShift, c.C, c.H)
  lighter = (c) => oklch(c.L + dt.colors.lighterShift, c.C, c.H)

  ec = {
    "--ds-font-size-h1": px(dt.typography.exponents.h1),
    "--ds-font-size-h2": px(dt.typography.exponents.h2),
    "--ds-space-2": rem(2),
    "--ds-color-text-primary": oklch(vt.colors.primary),
    "--ds-surface-1": oklch(vt.colors.surface1),
    "--ds-color-bg-accent": oklch(vt.colors.accent),
    "--ds-color-text-on-accent": oklch(lighter(vt.colors.accent))
  }

  return ec
```

### 6.2 Golden Hash

* Serialize EC as **sorted** `key:value` pairs separated by `\n`.
* Hash with SHA-256 (or BLAKE3).
* The result is the **content address** for storage and parity tests.

---

## 7) Validation **after** Compute & Receipts

### 7.1 Role Map (minimal schema)

```json
{
  "roles": [
    { "id": "text.body", "fgToken": "--ds-color-text-primary", "bgToken": "--ds-surface-1", "selectors": ["p",".text-body"] },
    { "id": "button.primary", "fgToken": "--ds-color-text-on-accent", "bgToken": "--ds-color-bg-accent", "selectors": ["button.primary","a.btn-primary"] }
  ]
}
```

### 7.2 Policy Packs

* WCAG AA/AAA contrast thresholds.
* Monotone scale checks (type & spacing).
* Project/brand minima (e.g., min radius, density bounds).

### 7.3 Receipt (machine-readable proof)

```json
{
  "at": "2025-11-07T10:00:00Z",
  "engineVersion": "1.0.0",
  "inputHash": "sha256:example123",
  "policy": "AA",
  "policyHash": "sha256:pol123",
  "passed": true,
  "violations": []
}
```

* **InputHash:** the EC golden hash.
* **PolicyHash:** hash of the policy pack used.
* **Violations:** array with `{ ruleId, level, roleId, selectors, details }`.

---

## 8) Dual-Namespace Bootstrap (prevent circulars)

* The authoring tool (editor) styles **itself** using `--ui-*`.
* The preview/output pane styles **user content** using `--ds-*`.
* The two must **never** cross; this guarantees that editing user themes cannot break the tool’s own UI.

### 8.1 Minimal CSS example

```css
/* Tool chrome (immutable invariants) */
:root {
  --ui-bg: Canvas; --ui-fg: CanvasText;
  --ui-focus: oklch(0.75 0.10 230);
}

.app-shell { background: var(--ui-bg); color: var(--ui-fg); }

/* User design system preview (computed EC) */
.preview-root {
  color: var(--ds-color-text-primary);
  background: var(--ds-surface-1);
}

.btn-primary {
  color: var(--ds-color-text-on-accent);
  background: var(--ds-color-bg-accent);
  border-radius: var(--ds-radius-m, 8px);
}
```

---

## 9) Live Preview ↔ Explicit Apply (safe live loop)

* **Live:** VT/DT changes recompute EC and repaint **one** `<style id="dt-runtime">` block in the app/preview.
* **Explicit Apply:** User confirms; system persists `/ec/<hash>.json` and a **Receipt**; optionally updates a “latest” pointer.
* **External tools:** may **mirror** (overlay + diff) and only **write on Apply**. No silent, continuous edits.

---

## 10) Integration Modes (engine-agnostic)

* **HTML/TS sites:** load `/ec/<hash>.json`, paint `--ds-*` once:

  ```js
  function applyEC(ec){
    const css = Object.entries(ec.resolved).map(([k,v]) => `${k}:${v};`).join("");
    (document.getElementById("dt-runtime") ?? document.head.appendChild(Object.assign(document.createElement("style"),{id:"dt-runtime"}))).textContent = `:root{${css}}`;
    document.documentElement.dataset.dtHash = ec.hash;
  }
  ```
* **CMS (e.g., WordPress/Elementor):** plugin field for **Config URL**; injects same style block globally.
* **Design tools:** **mirror mode** (overlays & diff → Apply) — no background autosave.
* **CI:** verify golden parity between implementations by recomputing hash in tests.

---

## 11) Tokenization Discipline (no magic numbers)

* Component CSS must reference tokens or derived math (e.g., `calc(var(--ds-space-2) * 2)`), **not** raw literals.
* Provide a linter that flags raw hex/px where token bindings exist.
* Recommended layers: **primitives → semantic → component** tokens.

---

## 12) Security, Privacy, Governance

* Receipts include **hashes** and rule outcomes — no user content.
* Policies are versioned and hashed; include `policyHash` in receipts.
* EC files are immutable by hash; rollback equals pinning to a prior hash.

---

## 13) Variations (non-limiting)

* Color math: OKLCH → LCH/Lab/SRGB with gamut mapping; method unchanged.
* Hashing: SHA-256 → BLAKE3; maintain normalized ordering.
* Typography: exponents → modular scales; dampening function may vary.
* Storage: static files (CDN), KV, or database registry; method unchanged.

---

## 14) Claims-Style Disclosures (to block later monopolization)

1. **Computing** a theming configuration from **two layers** — a primitive **Visual Theme** and a relational **Decision Theme** — where the result is normalized and cryptographically **hashed** to identify configuration state and enforce parity.
2. **Validating post-compute** on the **EffectiveConfig** (contrast, monotonicity, bounds), and emitting a machine-readable **receipt** containing input and policy hashes.
3. **Dual-namespace bootstrap** styling that isolates tool UI (`--ui-*`) from user output (`--ds-*`) to prevent circular dependencies.
4. A **live preview** loop within the publisher’s app combined with **explicit Apply** for persistence and receipt generation; external tools consume the configuration via mirror/overlay and only write on Apply.
5. A **tokenization discipline** and audit process eliminating unaudited literals by enforcing primitives → semantic → component layering.

---

## 15) Implementation Notes (practical)

* Use **one** runtime `<style>` tag; batch updates; throttle slider events (16–32ms) for paint stability.
* Stamp provenance on `<html data-dt-hash="…">`.
* Host immutable EC at `/ec/<hash>.json` with long-cache; keep `/ec/latest` for dev.
* Keep the **tool UI** fast with a tiny invariant CSS core; everything else comes from computed vars.

---

## 16) Example Artifacts (provided with this publication)

Place in `docs/prior-art/examples/`:

* `effective-config.example.json`
* `role-map.example.json`
* `receipt.example.json`

(*Values may be toy examples; enablement is the point.*)

---

## 17) Licensing of This Document

* **License:** Creative Commons **CC BY 4.0**.
* Purpose is to establish **prior art** and permit **citation**.
* Code snippets are illustrative; any implementation may vary technology stack while conforming to the method.

---

## 18) How to Cite

> Papp, C. (2025). *Decision Themes: Deterministic Compute from Visual & Decision Layers with Dual-Namespace Bootstrap.* Defensive publication (CC BY 4.0). Git commit/tag: `v0.1-prior-art`.
> URL: (link to your GitHub file or release) • DOI (if minted via Zenodo)
