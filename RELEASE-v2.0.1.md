# v2.0.1 - Patch Release

## 🐛 Bug Fix

Fixed ESLint error in DecisionThemes adapter placeholder that prevented v2.0.0 from publishing to npm.

### Changes
- Prefixed unused `input` parameter with underscore in `decisionthemesAdapter()` function to comply with ESLint rules

### Details
The v2.0.0 release included a placeholder adapter for future DecisionThemes integration. The function parameter was intentionally unused (it's a placeholder that throws), but ESLint requires unused parameters to be prefixed with `_` to indicate they are intentionally unused.

---

## What's in v2.0.x

For full v2.0 release notes including breaking changes, new features, and DecisionThemes integration documentation, see [v2.0.0 release notes](https://github.com/CseperkePapp/design-constraint-validator/releases/tag/v2.0.0).

---

## 📦 Installation

```bash
npm install design-constraint-validator@2.0.1
```

---

🤖 Release notes generated with [Claude Code](https://claude.com/claude-code)
