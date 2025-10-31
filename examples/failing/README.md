# Failing Examples

Use these to see DCV's diagnostics in action:

```bash
# WCAG contrast failure (text too low vs background)
npx dcv validate ./examples/failing/contrast-fail.tokens.json

# Monotonicity failure (heading scale out-of-order)
npx dcv validate ./examples/failing/monotonicity-fail.tokens.json
```

Expected: non-zero exit code and clear "why" table.

## contrast-fail.tokens.json

**Expected:** WCAG contrast FAIL near ~3.9:1 for text.primary on bg.body (AA requires 4.5:1 for normal text).

## monotonicity-fail.tokens.json

**Expected:** Monotonicity FAIL because `h2` is smaller than `h3`.
