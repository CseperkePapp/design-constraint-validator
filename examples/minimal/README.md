# Minimal Example

This is the simplest possible working example of `design-constraint-validator`.

## File Structure

```
minimal/
├── tokens.json                      # Your design tokens
└── themes/
    ├── wcag.json                   # WCAG contrast constraints
    └── typography.order.json       # Typography hierarchy constraints
```

## What It Does

- **tokens.json** - Defines basic color and typography tokens
- **themes/wcag.json** - Ensures text has sufficient contrast against background (4.5:1 ratio)
- **themes/typography.order.json** - Ensures h1 ≥ h2 ≥ body in size

## Try It

```bash
cd examples/minimal
npx dcv validate
```

### Expected Output

```
✅ validate: 0 error(s), 0 warning(s)
```

This means all your tokens pass the validation constraints!

## Experiment

Try breaking a constraint to see what happens:

1. Edit `tokens.json` and change h2 to `"40px"` (larger than h1's 32px)
2. Run `npx dcv validate` again
3. You'll see an error explaining the violation

## Next Steps

- Check out the main [tokens/](../../tokens/) folder for more complex examples
- Read [../../README.md](../../README.md) for all constraint types
- See [../README.md](../README.md) for interactive demos
