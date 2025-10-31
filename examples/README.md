# Examples

Self‑proof pages demonstrating that every visual primitive (color, spacing, radius, typography, elevation, motion) is expressed exclusively through generated token variables derived from Larissa's underlying poset → lattice graph.

## Files

- `index.html` – Basic component buttons consuming role + palette tokens.
- `smoke.html` – System status style page (legacy M2 example) still driven by tokens.
- `demos/demo_lean.html` – Minimal palette + role swatch board referencing only token vars (no hard‑coded design values).
- `demos/demo_lab.html` – Interactive design lab; adjust accent role tokens via OKLCH sliders; recomputes UI live.
- `demos/simpleConfigurator.html` – Simple one‑off override tool (ephemeral) for experimenting with individual token adjustments in the browser.
- `demos/simpleConfigurator-new.html` – Advanced batch override + JSON export (array‑of‑ops) suited for piping into `larissa set --json - --write`.
- `app/app.js` – Tiny script showing runtime theme variant toggling using role tokens only.

## Conventions

- All layout / component spacing = `--size-spacing-*` tokens.
- All color backgrounds & text = palette (`--color-palette-*`) or semantic role (`--color-role-*`) tokens.
- No hex, rgb, hsl, oklch literals in styles except where generating an ephemeral override preview.
- Typography uses weight / size / line-height tokens; where a size token does not yet exist a temporary scale is avoided (keeps proof strict).
- Interactive overrides intentionally patch only CSS custom properties (no stylesheet rewriting) to mirror what the CLI `set` operation persists.

## Extending

Add new showcase pages under `demos/` ensuring:

1. Zero raw design literals (numbers, colors) except ephemeral experimental inline JS output.
2. Derive every visual style from an existing token variable.
3. If a needed semantic layer token does not exist yet, add it via the domain graph and rebuild rather than inlining.

## Next Ideas

- Focused graph diff visualization embedding (Mermaid) for a before/after token edit.
- Accessibility contrast matrix referencing role tokens.
- Motion playground deriving durations / easings.

---

Generated: keep this doc short, practical, and trustworthy as a self‑audit checklist.