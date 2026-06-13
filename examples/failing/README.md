# Failing Examples

Use these to see DCV's diagnostics in action. Each fixture ships with the
constraints that flag it (`dcv.config.json` for the WCAG rule,
`typography.order.json` for the heading scale), so pass `--config` and
`--constraints-dir` pointing at this folder:

```bash
# WCAG contrast failure (text too low vs background)
npx dcv validate ./examples/failing/contrast-fail.tokens.json \
  --config ./examples/failing/dcv.config.json \
  --constraints-dir ./examples/failing

# Monotonicity failure (heading scale out-of-order)
npx dcv validate ./examples/failing/monotonicity-fail.tokens.json \
  --config ./examples/failing/dcv.config.json \
  --constraints-dir ./examples/failing
```

Expected: non-zero exit code and a clear violation. (Run `dcv why <tokenId>` for
the provenance/"why" table on any implicated token.)

## contrast-fail.tokens.json

**Expected:** WCAG contrast FAIL — `color.text.primary` (#949494) on
`color.bg.body` (#f2f2f2) is **2.71:1**, below the AA minimum of 4.5:1 for normal
text.

## monotonicity-fail.tokens.json

**Expected:** Monotonicity FAIL — the scale requires `h1 >= h2 >= h3 >= body`, but
`h2` (21px) is smaller than `h3` (22px).
