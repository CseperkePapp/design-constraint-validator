# Design Constraint Validator

> Mathematical constraint validator for design systems — ensuring consistency, accessibility, and logical coherence.

[![CI](https://github.com/CseperkePapp/design-constraint-validator/actions/workflows/ci.yml/badge.svg)](https://github.com/CseperkePapp/design-constraint-validator/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/CseperkePapp/design-constraint-validator/blob/main/LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.x-339933.svg)](#)
[![npm](https://img.shields.io/npm/v/design-constraint-validator)](https://www.npmjs.com/package/design-constraint-validator)

Welcome to the Design Constraint Validator (DCV) documentation! This wiki provides comprehensive guides for using DCV to validate design tokens and enforce design system constraints.

## 📚 Documentation

### Getting Started
**[→ Getting Started Guide](./Getting-Started)**

New to DCV? Start here! This guide will have you validating tokens in 5 minutes.

- Installation
- Your first validation
- Understanding failures
- Common issues

---

### Core Concepts

**[→ Constraint Types](./Constraints)**

Learn all 5 constraint types that DCV supports:

- **Monotonic** - Typography hierarchies, spacing scales
- **WCAG** - Color contrast accessibility  
- **Threshold** - Touch target sizes, min/max guards
- **Lightness** - Color palette progression
- **Cross-Axis** - Multi-domain relationships

---

**[→ CLI Reference](./CLI)**

Complete command-line reference:

- `dcv validate` - Validate constraints
- `dcv graph` - Generate dependency graphs
- `dcv why` - Explain token provenance
- `dcv build` - Build token outputs
- `dcv set` - Set token values
- Global options and CI/CD integration

---

**[→ Configuration](./Configuration)**

Customize DCV for your project:

- Config file discovery
- Full configuration schema
- JavaScript configs
- Multi-project setups
- Environment variables

---

### Advanced Topics

**[→ Architecture](./Architecture)**

Understand how DCV works internally:

- Token parsing and normalization
- Dependency graph construction
- Plugin architecture
- Performance optimizations
- Color space handling
- Extension points

---

**[→ API Reference](./API)**

Use DCV programmatically:

- TypeScript/ESM API
- Validation functions
- Engine class
- Built-in plugins
- Custom plugins
- Utilities

---

## Quick Links

### Installation

```bash
# Local (recommended)
npm install -D design-constraint-validator

# One-off
npx dcv --help
```

### Quick Start

```bash
# Validate tokens
dcv validate

# Explain violations
dcv why typography.size.h1

# Export graph
dcv graph --format mermaid > graph.mmd
```

### Examples

- **[Minimal Example](https://github.com/CseperkePapp/design-constraint-validator/tree/main/examples/minimal)** - Simplest working setup
- **[Failing Examples](https://github.com/CseperkePapp/design-constraint-validator/tree/main/examples/failing)** - See error diagnostics
- **[Patch Examples](https://github.com/CseperkePapp/design-constraint-validator/tree/main/examples/patches)** - Token overrides

---

## Resources

- **[GitHub Repository](https://github.com/CseperkePapp/design-constraint-validator)**
- **[npm Package](https://www.npmjs.com/package/design-constraint-validator)**
- **[Issue Tracker](https://github.com/CseperkePapp/design-constraint-validator/issues)**
- **[Discussions](https://github.com/CseperkePapp/design-constraint-validator/discussions)**

---

## Contributing

Contributions welcome! See **[CONTRIBUTING.md](https://github.com/CseperkePapp/design-constraint-validator/blob/main/CONTRIBUTING.md)**

---

## What is DCV?

**Design Constraint Validator (DCV)** validates design constraints across token sets:

✅ **Accessibility** - WCAG contrast, perceptual lightness  
✅ **Order & Monotonicity** - Typography scales, spacing hierarchies  
✅ **Thresholds & Policies** - Touch targets, min/max ranges  
✅ **Graph Intelligence** - Dependency visualization, provenance tracing

This is **not** a schema linter; it's a **reasoning validator** for values and relationships.

### Why Constraints, Not Conventions?

Conventional linters catch **schema** issues ("has a value, has a type").  
**DCV** enforces **relationships** that matter to users and brand integrity:

- Legible contrast under all themes
- Proper hierarchical spacing/typography
- Policy conformance (AA/AAA, internal thresholds)
- Coherent cross-axis behavior

This transforms tokens from "bags of numbers" into a **formal design system**.

---

## Philosophy

> **Constraints, not conventions.**

Design systems need more than naming conventions - they need mathematical guarantees.

---

## License

MIT © Cseperke Papp
