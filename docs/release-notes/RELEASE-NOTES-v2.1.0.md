# design-constraint-validator v2.1.0

Paste this into the GitHub Release body for tag `v2.1.0`. Full detail in
[CHANGELOG.md](../../CHANGELOG.md).

---

First properly-published release since 2.0.1 — and the one that makes DCV usable
on **your own** tokens, validates **Figma's** native export, and exposes DCV to
**AI agents**.

## Highlights

- 🎨 **DTCG 2025.10 stable-spec support.** Structured color objects
  (`{ colorSpace, components, alpha, hex }`), structured dimensions, `{alias}`
  references, and `$extensions` passthrough all validate — so a native **Figma**
  token export works out of the box. Non-sRGB color spaces warn instead of
  silently mis-computing contrast.
- 🤖 **`dcv-mcp` MCP server.** A Model Context Protocol server exposing read-only
  `validate` / `why` / `graph` tools over stdio, so AI agents can validate design
  tokens directly. Ships as the `dcv-mcp` bin with registry metadata.
- 🐛 **Correct OKLCH contrast.** `oklch()` colors now compute their true WCAG
  contrast (the conversion was wrong before), and mixed hex/OKLCH lightness scales
  no longer produce false pass/fail.
- 🧩 **Usable on foreign tokens.** `--tokens` / a positional tokens path is now
  honored; a synchronous programmatic `validate({ tokensPath, configPath })` API
  is exported; `--config` + `dcv.config.json` discovery; missing files error
  clearly instead of silently validating nothing.
- 🚀 **Reliable publishing.** Releases are now tag-push driven and **verify the
  version is live on npm** — fixing the gap that left v2.0.2 tagged-but-never-
  published. (Its supply-chain CI hardening ships here.)
- 🔒 **Security.** Removed an unused dependency that pulled a high-severity
  `picomatch` ReDoS advisory; production `npm audit` is clean.
- 📚 **Docs that match reality.** README, API/JSON reference, AI guide, and all
  examples were brought into parity with the real API, output shape, and config
  model (verified end-to-end).

## Install

```bash
npm install -D design-constraint-validator
npx dcv validate tokens.json
```

## Notes

- Provenance-signed publish via GitHub Actions.
- `v2.0.2` was never published; its changes are included here.
