# Style Dictionary Integration

Style Dictionary commonly uses `value` token leaves. DCV expects `$value`
leaves, so normalize Style Dictionary output before validation.

## Recommended Flow

```text
Style Dictionary source tokens
  -> transform value fields to $value
  -> run dcv validate
  -> build platform outputs
```

## Example Source

Style Dictionary-style input:

```json
{
  "color": {
    "base": {
      "black": { "value": "#000000" },
      "white": { "value": "#ffffff" }
    },
    "text": {
      "primary": { "value": "{color.base.black.value}" }
    },
    "background": {
      "primary": { "value": "{color.base.white.value}" }
    }
  }
}
```

Normalize to DCV/DTCG-style tokens:

```json
{
  "color": {
    "base": {
      "black": { "$value": "#000000" },
      "white": { "$value": "#ffffff" }
    },
    "text": {
      "primary": { "$value": "{color.base.black}" }
    },
    "background": {
      "primary": { "$value": "{color.base.white}" }
    }
  }
}
```

## Constraint Setup

Use `dcv.config.json` for WCAG and threshold rules:

```json
{
  "constraints": {
    "wcag": [
      {
        "foreground": "color.text.primary",
        "background": "color.background.primary",
        "ratio": 4.5,
        "description": "Primary text"
      }
    ]
  }
}
```

Use order files for scale constraints:

```json
{
  "order": [
    ["font.size.h1", ">=", "font.size.h2"],
    ["font.size.h2", ">=", "font.size.body"]
  ]
}
```

## Build Integration

Validate the normalized token file before building platform outputs:

```js
import { execFileSync } from 'node:child_process';
import StyleDictionary from 'style-dictionary';

execFileSync(
  'npx',
  [
    'dcv',
    'validate',
    '--tokens',
    'build/tokens.dcv.json',
    '--config',
    'dcv.config.json',
    '--constraints-dir',
    'themes'
  ],
  { stdio: 'inherit' }
);

const sd = new StyleDictionary('config.json');
await sd.buildAllPlatforms();
```

## CI Example

```yaml
name: Validate Tokens
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run tokens:normalize
      - run: npx dcv validate --tokens build/tokens.dcv.json --format json --output validation-results.json
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: validation-results
          path: validation-results.json
```

## Notes

- DCV does not currently auto-convert Style Dictionary `value` fields.
- Keep normalization in your build pipeline or adapter layer.
- Use `{token.path}` references after normalization rather than
  `{token.path.value}`.

## Resources

- [Style Dictionary Documentation](https://amzn.github.io/style-dictionary/)
- [DCV Adapters Guide](../../docs/Adapters.md)
- [DCV Configuration Guide](../../docs/Configuration.md)
