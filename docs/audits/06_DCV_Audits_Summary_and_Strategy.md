# DCV Audits Summary & Improvement Strategy

This document summarizes the five DCV audit documents and proposes a consolidated strategy for evolving the system. It is intentionally descriptive and planning-focused; it does not prescribe specific implementation steps or timelines.

## 1. System Overview (01_Design Constraint Validator (DCV) – System Overview.pdf)

**Summary**

- DCV is a reasoning validator for design tokens: it enforces mathematical and accessibility constraints over token values and relationships, not just schema or naming.
- Core capabilities cover four main constraint families: WCAG contrast and lightness bounds; monotonic ordering for scales (typography, spacing, color ramps); thresholds and policies (min/max and hard floors like touch target size); and cross-axis rules that couple different properties (size/weight/contrast, etc).
- Internally, DCV follows a staged pipeline: normalize token inputs via adapters, build a dependency graph over tokens, run constraint plugins against that graph, and report violations with explanations.
- The document emphasizes graph intelligence (Hasse/poset diagrams, "why" explanations) and incremental validation as key differentiators vs traditional linters.

**Opinion**

- The narrative is strong: it clearly positions DCV and articulates the value of constraint-based validation.
- A few promises (e.g., depth of "why" explanations, unified graph of references and constraints, incremental caching across runs) are more aspirational than fully realized in the current implementation.
- As we evolve the system, this overview should stay relatively high-level and defer technical specifics to Architecture/API docs to avoid divergence.

## 2. Documentation Audit (02_Design Constraint Validator Documentation Audit (Phase C.1).pdf)

**Summary**

- Maps the entire documentation landscape: root README, CONFIGURATION.md, /docs pages, prior-art papers, AI guide, wiki, examples, and internal maintainer notes.
- Provides a chronology of how docs evolved: from single README and configuration guide, through prior-art publications, to the more structured /docs set created near the 1.0 release.
- Builds a terminology map (token, constraint, violation, policy, theme, poset, EffectiveConfig, receipt, manifest, breakpoint, overrides, engine, plugin) and highlights where terms drift or overlap.
- Identifies red flags: duplicated config guides (root vs docs/Configuration.md), inconsistent CLI flags (--format vs --summary, failOn "off" vs "never"), JSON output naming mismatches (ruleId/level vs kind/severity), and ambiguous use of "themes" and "policy".
- Calls out missing documentation: adapters/input formats, custom constraint plugins, policy file schema, threshold constraints usage, CI integration patterns, and explicit explanation of defaults/strict mode.
- Recommends a canonical documentation set centered on /docs, with root README slimmed down and CONFIGURATION.md deprecated.

**Opinion**

- This audit is thorough and aligns closely with what I see in the repo: it correctly identifies duplication, drift, and gaps.
- The terminology map is especially valuable; it should be promoted into a Concepts/Glossary doc and used as the single source for naming decisions.
- The proposed canonical set (docs as "one truth", README as intro, prior-art as background) is sound and should guide how we restructure docs before any deeper architectural work.

## 3. Proposed Documentation Structure (03_DCV_Doc_Structure.md)

**Summary**

- Proposes a clean docs tree under /docs with public-facing files (README, Getting-Started, Constraints, Configuration, CLI, JSON-OUTPUT, API, Concepts, Adapters, Examples) and internal/architectural docs (Architecture, Extending-DCV, prior-art papers, WIKI-SETUP, RELEASE, CONTRIBUTING).
- Suggests a deprecation/merge plan: retire or clearly mark root CONFIGURATION.md; trim root README and docs/Home.md to avoid redundancy; consolidate config guidance into docs/Configuration.md.
- Argues for a dedicated Concepts.md to define core terms (constraint, token, violation, poset, policy, theme, receipt, manifest, etc.) as a shared vocabulary.

**Opinion**

- This structure matches what we need: a single, navigable manual plus a small internal section for design rationale and maintainer processes.
- The explicit deprecation plan is helpful; it can be adopted with minimal disruption (most content already exists in newer docs).
- Concepts.md and Adapters.md are the main missing pieces. Creating those will also let us surface domain language and input-format behavior that currently lives only in prose or code.

## 4. Architecture Audit (04_Architecture of the Design Constraint Validator (DCV).pdf)

**Summary**

- Restates DCV's architectural phases with more implementation detail: flattening and reference resolution, DAG construction, plugin-based constraint evaluation, and reporting.
- Walks through key modules: core engine and constraints, poset utilities, adapters (CSS/JSON/JS), CLI commands (validate, graph, why, build), and how they cooperate.
- Enumerates invariants: acyclic token reference graph; unique stable token IDs; pure, deterministic plugins; non-mutating adapters; violation referential integrity; incremental candidate-based evaluation; and reproducible outputs.
- Identifies architectural smells: scattered constraint configuration (mix of implicit files, config, and hardcoded defaults); core/CLI boundary blur due to file-system reads in core; reliance on plugins manually honoring candidate sets; checked-in compiled JS alongside TS; and implicit conventions (magic file names and paths).
- Proposes refactors: unify constraint loading in one configuration-driven layer; move file I/O out of core into a data-loading layer; extend engine API (validateAll, expose flat tokens) and avoid duplicate flattening; clarify/enforce plugin interfaces around candidates; and tighten layering between data loading, core, and CLI.

**Opinion**

- The analysis is accurate and pragmatic: it focuses on maintainability and clarity rather than changing DCV's fundamental model.
- The invariants are worth preserving explicitly; they are part of DCV's "contract" and should be documented and guarded by tests.
- Refactoring around constraint loading and filesystem separation offers a high return on investment: it reduces duplication, makes behavior more transparent, and prepares the code for integration in non-CLI environments.

## 5. Module Dependency Graph (05_Dependency Graph of Modules.pdf)

**Summary**

- Catalogs dependencies between core, CLI, and adapter modules, confirming that imports form a directed acyclic graph: CLI -> core -> utilities, with no cycles.
- Traces end-to-end flows for all major entry points: validate, graph (dependency and Hasse modes), build, set (incremental editing), patch/patch:apply, and why.
- Highlights drifts between architecture/docs and actual behavior:
  - Engine graph contains only reference edges; constraint relationships live in separate poset structures and plugin logic.
  - Default token paths diverge from docs (tokens/tokens.example.json vs tokens.json).
  - WCAG defaults are applied in some paths (createEngine) but not others (createValidationEngine).
  - The 44px threshold rule is hardcoded and treated as an error, whereas docs show it as a warning and do not clearly state it is always on.
  - Incremental validation is only used within a single Engine instance (set), not across CLI runs, despite documentation language that suggests broader caching.
  - Why explanations focus on provenance and references, not on constraint participation or violation chains as implied by overview/API docs.
  - Plugin extensibility exists in principle but lacks a user-level plugin loading mechanism; some constraints (thresholds, default WCAG pairs) are hard-wired rather than data-driven.
- Surfaces hidden invariants and assumptions: default WCAG checks on specific token IDs; always-on 44px threshold; silent skipping of unparseable numeric values while WCAG warns on unparseable colors; reliance on naming and file conventions (themes directory, order file names); permissive handling of unknown IDs in rules; and provenance heuristics based on specific file locations.
- Discusses risk areas for future extensions: multi-theme validation, cross-breakpoint rules, integration into Decision Themes Studio (DTS), and performance/usability under real-time editing.

**Opinion**

- This audit usefully grounds the high-level architecture in concrete code paths and reveals where user expectations might not match reality.
- The catalogue of hidden defaults and assumptions is particularly important; these need to be either made configurable or explicitly documented (or both) to avoid "mystery behavior".
- The recommendations align well with the Architecture audit: centralizing constraint loading, exposing configuration for built-in rules, and tightening docs/API to match behavior.

## 6. Cross-Cutting Observations

- The core engine and constraint model are solid: the plugin architecture, flatten-then-graph approach, and focus on relationships (not just schemas) are well thought out and already implemented.
- Documentation is rich but fragmented. Most of the confusion comes from evolution over time: older guides and examples remained in place after newer, better docs were added.
- Several important behaviors are encoded as hardcoded defaults or conventions (token IDs, file names, built-in rules) rather than as explicit configuration or clearly documented guarantees.
- Some documented capabilities (rich "why" reasoning, incremental caching across runs, unified graph of constraints plus references, plugin extensibility from the outside) are partially implemented or only present in earlier design intent.
- The audits themselves are consistent with each other: the documentation audit, doc-structure proposal, architecture review, and module-graph analysis all converge on the same themes and suggest compatible improvements.

## 7. Improvement Strategy (Conceptual, Not Yet Implemented)

This section consolidates the audit findings into a strategy for evolving DCV. It is intentionally implementation-agnostic: it outlines what to change and why, but not how or when.

### 7.1. Documentation and Terminology First

1. **Converge on /docs as the canonical source**
   - Treat docs/README.md, Getting-Started.md, Constraints.md, Configuration.md, CLI.md, JSON-OUTPUT.md, API.md, Architecture.md as the primary user/developer documentation set.
   - Trim the root README to a concise intro plus quick start and links into /docs.
   - Deprecate or remove root CONFIGURATION.md after folding any unique content into docs/Configuration.md (with a clear "deprecated" banner if kept temporarily).
   - Keep prior-art papers in docs/prior-art as non-versioned background references, linked from Architecture.md rather than treated as living docs.

2. **Clarify and unify terminology**
   - Create docs/Concepts.md that formalizes the terminology map from the audits (token, constraint, violation, policy, theme, poset, EffectiveConfig, receipt, manifest, breakpoint, overrides, engine, plugin).
   - Explicitly distinguish:
     - "Constraint files"/"policies" (rule definitions) from "themes" (visual token sets) and from "Decision Themes" (upstream theming concept).
     - Internal types/fields vs JSON output fields (rule vs ruleId, kind vs level) and standardize on one vocabulary across docs.
   - Decide on consistent flag and enum names (for example, failOn values "off"/"warn"/"error") and propagate that across CLI docs, examples, and JSON output docs.

3. **Document current behavior, including defaults**
   - Add a "Defaults and assumptions" section (likely in Configuration.md or Concepts.md) that lists:
     - Built-in WCAG checks and which token IDs they target.
     - The hardcoded 44px threshold rule and its severity.
     - Handling of unknown token IDs in constraint files (skipped versus warning).
     - How unparseable numeric values are treated by monotonic/threshold plugins versus WCAG.
     - Expected default locations for tokens, themes/constraints, overrides, and cross-axis rules.
   - Update CLI.md and JSON-OUTPUT.md to reflect the actual flags and JSON schema (ruleId/level versus kind/severity, --format versus --summary, exit codes, etc).
   - Fill in missing areas: adapters/input formats (Adapters.md), custom plugin guidance (Extending-DCV.md), and concrete examples of policy JSON layouts.

### 7.2. Architectural Cleanup Around Constraints and I/O

4. **Centralize constraint discovery and loading**
   - Introduce a single conceptual "constraint loader" that knows where rules come from (config, per-axis order files, cross-axis rules, thresholds, default policies).
   - Make constraint loading data-driven where feasible (JSON policies, order/threshold files), reducing hardcoded behavior (like always-on 44px) and duplicated plugin-wiring code.
   - Ensure all entry points (validate, set, graph --highlight-violations, API) rely on this shared mechanism so they apply constraints consistently.

5. **Separate core logic from filesystem conventions**
   - Keep core modules (engine, constraints, poset, flatten) operating on in-memory data structures only; move file-system access and project layout assumptions into a dedicated loading layer or CLI helpers.
   - Treat paths and default locations as configuration concerns, not core invariants, to make it straightforward to embed DCV in other environments (DTS, CI services, custom tooling).

6. **Tighten the Engine/Plugin interface**
   - Make candidate-based evaluation a first-class part of the plugin contract (documented and, ideally, enforced), so incremental validation remains reliable even for custom plugins.
   - Consider centralizing candidate filtering in the Engine where practical, based on explicit metadata from violations (involved token IDs), so plugins can focus on rule logic.
   - Expose a small, coherent core API (for example, validateAll, commit/affected, getFlatTokens) that CLI, tests, and external integrators can rely on without duplicating flattening or graph construction logic.

### 7.3. Explanations, Transparency, and User Experience

7. **Align "why" explanations with expectations**
   - Decide on the intended scope for why:
     - Minimal (provenance and reference graph) versus
     - Rich (provenance plus constraints and current violation status).
   - Once decided, update either implementation (to include constraint insights for a token) or documentation (to describe the current minimal behavior accurately).
   - Longer-term, consider a per-token explanation model that can be reused both in CLI and in future UIs (like DTS), tying together token provenance, relevant constraints, and violations.

8. **Surface hidden behavior explicitly**
   - Where possible, convert silent skips (unknown IDs, unparseable numeric values) into explicit but non-fatal warnings, especially when running in a "strict" mode.
   - Improve logging and verbose output around constraint loading: which files were found, which rules were activated, and which were ignored due to missing tokens or parse issues.
   - Ensure that CLI help and docs mention default rules so users understand why they see certain violations even without explicit constraint files.

### 7.4. Extension and Future Integration

9. **Plan for multi-theme and breakpoint workflows**
   - In the near term, support validating named themes more ergonomically (for example, via a --theme flag that mirrors build's behavior) while still treating each theme plus breakpoint combination as an independent validation scope.
   - Defer cross-theme and cross-breakpoint constraints until there is a clear product requirement (likely driven by DTS); at that point, design them explicitly rather than implicitly overloading existing mechanisms.

10. **Shape a pragmatic plugin and extensibility story**
    - Clarify how first-party constraints are configured (via data) versus when users are expected to write custom plugins (via code).
    - When ready, design a plugin registration mechanism that can be driven by configuration or programmatic API (without introducing uncontrolled dynamic code loading in CLI contexts).
    - Ensure any plugin API preserves the core invariants surfaced in the audits: purity, determinism, and clear involvement of token IDs in violations.

Taken together, these steps keep the core philosophy and strengths of DCV intact while resolving inconsistencies, making behavior more transparent, and creating a clear path toward deeper integration scenarios (Decision Themes Studio, richer UIs, and more sophisticated constraint sets) without committing to specific implementation work yet.

