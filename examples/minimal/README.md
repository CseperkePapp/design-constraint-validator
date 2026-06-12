# Minimal Example

This is the smallest complete DCV example.

## Files

```text
minimal/
  tokens.json
  dcv.config.json
  themes/
    typography.order.json
```

- `tokens.json`: Basic color and typography tokens.
- `dcv.config.json`: WCAG contrast policy for `color.text` on
  `color.background`.
- `themes/typography.order.json`: Ensures `h1 >= h2 >= body`.

## Try It

```bash
cd examples/minimal
npx dcv validate --tokens tokens.json
```

Passing output:

```text
validate: 0 error(s), 0 warning(s)
```

## Experiment

Change `typography.size.h2` in `tokens.json` to `40px`, then run validation
again. The monotonic typography rule will report the failed comparison.

## Next Steps

- [Main examples index](../README.md)
- [Getting Started](../../docs/Getting-Started.md)
- [Configuration](../../docs/Configuration.md)
