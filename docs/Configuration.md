# Configuration

This page documents the configuration DCV reads today.

Configuration controls constraint policy. Token paths, output paths, receipts,
breakpoints, and build options are command-line options, not active config-file
settings in the current runtime.

## Discovery

When `--config` is not provided, DCV checks these files in the current working
directory, in order:

1. `dcv.config.json`
2. `.dcvrc.json`
3. `package.json` under the `"dcv"` key

DCV does not currently walk parent directories during discovery. Use
`--config path/to/file.json` when the config is not in the process working
directory.

```bash
dcv validate --config ./dcv.config.json
```

JavaScript config files are not supported. Use JSON config files or a
`package.json` `"dcv"` object.

## Minimal Config

```json
{
  "version": "1",
  "constraints": {
    "wcag": [
      {
        "foreground": "color.text.default",
        "background": "color.bg.surface",
        "ratio": 4.5,
        "description": "Body text on surface"
      }
    ]
  }
}
```

## Supported Runtime Fields

```ts
interface DcvConfig {
  version?: string;
  constraints?: {
    enableBuiltInWcagDefaults?: boolean;
    enableBuiltInThreshold?: boolean;
    wcag?: Array<{
      foreground: string;
      background: string;
      ratio?: number;
      description?: string;
      backdrop?: string;
    }>;
    thresholds?: Array<{
      id: string;
      op: '>=' | '<=';
      valuePx: number;
      where?: string;
    }>;
  };
}
```

The parser is permissive and may accept additional keys for forward
compatibility, but keys outside the runtime-supported fields above are currently
ignored by validation.

## Built-In Constraints

By default, DCV enables two built-in policy sources:

- WCAG defaults for commonly named role tokens such as
  `color.role.text.default` on `color.role.bg.surface`.
- A touch-target threshold requiring `control.size.min >= 44px`.

Disable either source explicitly when you want only your project rules to run:

```json
{
  "constraints": {
    "enableBuiltInWcagDefaults": false,
    "enableBuiltInThreshold": false
  }
}
```

## WCAG Contrast Rules

WCAG rules live in `constraints.wcag`.

```json
{
  "constraints": {
    "enableBuiltInWcagDefaults": false,
    "wcag": [
      {
        "foreground": "color.text.default",
        "background": "color.bg.surface",
        "ratio": 4.5,
        "description": "Body text on surface"
      },
      {
        "foreground": "color.text.muted",
        "background": "color.bg.surface",
        "ratio": 3,
        "description": "Muted large text on surface",
        "backdrop": "#ffffff"
      }
    ]
  }
}
```

Fields:

- `foreground`: Token ID for the foreground color.
- `background`: Token ID for the background color.
- `ratio`: Minimum contrast ratio. Defaults to `4.5`.
- `description`: Optional label surfaced as `context.where`.
- `backdrop`: Optional token ID or color literal used when compositing a
  transparent background.

WCAG JSON violations expose `context.actual` and `context.required`.

## Threshold Rules

Project threshold rules live in `constraints.thresholds`.

```json
{
  "constraints": {
    "enableBuiltInThreshold": false,
    "thresholds": [
      {
        "id": "control.size.min",
        "op": ">=",
        "valuePx": 44,
        "where": "Touch target"
      },
      {
        "id": "layout.container.max",
        "op": "<=",
        "valuePx": 1440,
        "where": "Maximum content width"
      }
    ]
  }
}
```

Fields:

- `id`: Token ID to evaluate.
- `op`: `">="` or `"<="`.
- `valuePx`: Numeric threshold in pixels.
- `where`: Optional label surfaced as `context.where`.

## Order And Cross-Axis Files

The config file does not name the order/cross-axis directory. Use
`--constraints-dir` for that:

```bash
dcv validate --constraints-dir constraints
```

The default directory is `themes`, a historical name that means "constraint
policy files" in DCV.

Files loaded from that directory:

- `typography.order.json`
- `spacing.order.json`
- `layout.order.json`
- `color.order.json`
- `cross-axis.rules.json`
- Breakpoint variants such as `typography.md.order.json` and
  `cross-axis.md.rules.json`

Example order file:

```json
{
  "order": [
    ["typography.size.h1", ">=", "typography.size.h2"],
    ["typography.size.h2", ">=", "typography.size.body"]
  ]
}
```

## package.json Config

```json
{
  "name": "my-design-system",
  "dcv": {
    "constraints": {
      "enableBuiltInThreshold": false,
      "wcag": [
        {
          "foreground": "color.text.default",
          "background": "color.bg.surface",
          "ratio": 4.5
        }
      ]
    }
  }
}
```

## CLI Options Commonly Used With Config

```bash
# Token file
dcv validate --tokens tokens/tokens.json

# Constraint directory for order/cross-axis files
dcv validate --constraints-dir constraints

# JSON output and receipt
dcv validate --format json --output validation.json
dcv validate --format json --receipt validation.receipt.json

# Breakpoints
dcv validate --breakpoint md
dcv validate --all-breakpoints

# Exit behavior
dcv validate --fail-on error
dcv validate --fail-on warn
dcv validate --fail-on off
```

See [CLI.md](./CLI.md) for the full command reference.

## Troubleshooting

### Config file not found

Use an explicit path if the config is outside the current working directory:

```bash
dcv validate --config packages/tokens/dcv.config.json
```

### Tokens pass with zero checks

If no active constraint references any token in the file, DCV emits a no-match
note. Add matching `constraints.wcag` / `constraints.thresholds` entries or point
`--constraints-dir` at the directory containing your order and cross-axis files.

### Unsupported config fields

Older documentation mentioned config keys such as `tokens`, `themes`,
`overrides`, `validation`, `graph`, and `output`. These keys may still parse, but
they are not active validation settings. Prefer the CLI flags shown above.

## Related Docs

- [CLI Reference](./CLI.md)
- [API Reference](./API.md)
- [JSON Output Schema](./JSON-OUTPUT.md)
- [Concepts](./Concepts.md)
