# Examples

CLI-focused examples demonstrating Design Constraint Validator features.

## Directories

### `minimal/`
The simplest working example - great starting point for new users.
- `tokens.json` - Basic color and typography tokens
- `themes/wcag.json` - WCAG contrast constraints
- `themes/typography.order.json` - Typography hierarchy

**Try it:**
```bash
cd examples/minimal
dcv validate
```

### `tokens-studio/`
Native Tokens Studio format support with `$type` / `$value` syntax.
- Complete token file with colors, typography, spacing
- Constraint files in `themes/` directory
- Shows how to validate Figma Tokens Studio exports

**Try it:**
```bash
dcv validate --tokens examples/tokens-studio/tokens.json
```

### `style-dictionary/`
Style Dictionary integration guide with `value` property format.
- Example tokens in Style Dictionary format
- Build integration examples
- CI/CD workflow templates

**See:** [style-dictionary/README.md](style-dictionary/README.md)

### `dtcg/`
DTCG (Design Tokens Community Group) specification support.
- Full DTCG-compliant token examples
- Type inheritance and composite tokens
- Reference resolution examples

**See:** [dtcg/README.md](dtcg/README.md)

### `advanced-constraints/`
Advanced cross-axis constraint examples showing real-world scenarios.
- Typography readability rules (weight × size)
- Touch target accessibility (text size × tap target)
- Responsive contrast rules (breakpoint × contrast)
- Complete mobile ruleset

**See:** [advanced-constraints/README.md](advanced-constraints/README.md)

### `failing/`
Intentionally broken examples to demonstrate constraint violations.
- `contrast-fail.tokens.json` - WCAG contrast failure
- `monotonicity-fail.tokens.json` - Typography scale out-of-order

**Try it:**
```bash
dcv validate examples/failing/contrast-fail.tokens.json
dcv validate examples/failing/monotonicity-fail.tokens.json
```

### `patches/`
Examples of patch/override format for token mutations.
- Demonstrates the `dcv patch` command
- Shows how to export and apply token changes

**Try it:**
```bash
dcv patch --overrides examples/patches/basic-override.json
```

### `tokens/`
Additional token set examples for testing different scenarios.

## Usage Patterns

### Validate tokens
```bash
dcv validate examples/minimal/tokens.json
```

### Explain violations
```bash
dcv why typography.size.body --format table
```

### Export dependency graph
```bash
dcv graph --format mermaid --hasse typography > graph.mmd
```

### Build CSS output
```bash
dcv build --format css --tokens examples/minimal/tokens.json
```

---

For full CLI documentation, see [../README.md](../README.md)