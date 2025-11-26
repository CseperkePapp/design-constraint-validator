# v2.0.0 - Major Release 🚀

## ⚠️ Breaking Changes

This major version removes deprecated modules that were marked for removal in v1.1.0:

### Removed Modules
- **cli/constraints-loader.ts** - Use `cli/constraint-registry.ts` instead
- **cli/engine-helpers.ts** - Use `cli/constraint-registry.ts` instead
- **core/cross-axis-config.ts** - Use `cli/cross-axis-loader.ts` instead

**Total code removed:** 882 lines

### Migration Guide
If you were using internal APIs (not recommended), update imports:

```typescript
// Before (v1.x)
import { attachRuntimeConstraints } from './cli/constraints-loader.js';

// After (v2.x)
import { setupConstraints } from './cli/constraint-registry.js';
```

**Note:** If you're using the CLI (`dcv validate`), no changes needed - the CLI interface remains stable.

---

## ✨ New Features

### Version Banner & Attribution
DCV now shows version info when validation runs, providing transparency about which version is being used:

**Console output:**
```
design-constraint-validator v2.0.0 | https://github.com/CseperkePapp/design-constraint-validator
```

**JSON output:** Includes `dcv` field with version metadata:
```json
{
  "ok": true,
  "violations": [],
  "dcv": {
    "name": "design-constraint-validator",
    "version": "2.0.0",
    "repository": "https://github.com/CseperkePapp/design-constraint-validator"
  }
}
```

Banner is automatically suppressed for JSON output mode to keep data clean.

### DecisionThemes Integration Documentation
Added documentation and placeholder adapter for the upcoming DecisionThemes framework integration (coming 2026):

- **New adapter:** `adapters/decisionthemes.ts` - TypeScript interfaces for VT/DT integration
- **Updated docs:** `docs/Adapters.md` with DecisionThemes section
- **New documentation:** `docs/POSets.md` explaining 5-axis decision model
- **Architecture diagrams:** SVG visualizations of DCV and DecisionThemes architecture

DCV remains fully standalone - DecisionThemes is an optional framework that uses DCV for validation.

---

## 📚 Documentation Updates

- Updated [Architecture.md](docs/Architecture.md) to reflect v2.0.0 deprecation removal
- Updated [Adapters.md](docs/Adapters.md) with DecisionThemes adapter documentation
- Added [POSets.md](docs/POSets.md) explaining partial ordering in design systems
- README remains intentionally lean with links to comprehensive documentation

---

## 🧪 Quality Assurance

- ✅ All 22 tests passing
- ✅ TypeScript compilation successful
- ✅ Internal API consistency verified

---

## 📦 Installation

```bash
npm install design-constraint-validator@2.0.0
```

Or update your package.json:
```json
{
  "devDependencies": {
    "design-constraint-validator": "^2.0.0"
  }
}
```

---

## 🔗 Links

- **Documentation:** [docs/README.md](docs/README.md)
- **Migration from v1.x:** See breaking changes section above
- **DecisionThemes Preview:** [www.decisionthemes.com](https://www.decisionthemes.com)

---

## 🙏 Thank You

Thank you to everyone using DCV! This major version cleanup sets a solid foundation for future enhancements while maintaining the lean, focused design validation engine you've come to rely on.

🤖 Release notes generated with [Claude Code](https://claude.com/claude-code)
