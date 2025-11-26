# Contributing to Design Constraint Validator

Thank you for your interest in contributing!

## Development Setup

```bash
git clone https://github.com/CseperkePapp/design-constraint-validator.git
cd design-constraint-validator
npm install
npm run build
npm test
```

## Quick Test

```bash
# Link locally to test the dcv command
npm link

# Test the CLI
dcv --help
dcv validate
```

## Running Tests

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run typecheck        # TypeScript checking
npm run lint             # Linting
npm run check            # All checks
```

## Code Style

- TypeScript with strict mode
- ESLint + Prettier
- Run `npm run format` before committing
- Run `npm run check` before opening PR

## Pull Request Process

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes
4. Add tests
5. Run `npm run check`
6. Commit (`git commit -m 'feat: add amazing feature'`)
7. Push (`git push origin feature/amazing-feature`)
8. Open Pull Request

## Commit Convention

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Tests
- `chore:` - Maintenance

## Reporting Issues

Use GitHub Issues with:
- Clear description
- Reproduction steps
- Expected vs actual behavior
- Environment (Node version, OS)

## Releasing (Maintainers Only)

See [RELEASE.md](./RELEASE.md) for the complete release process.

**Quick reminder:**
```bash
npm run release:patch   # Bug fixes (1.0.0 → 1.0.1)
npm run release:minor   # New features (1.0.0 → 1.1.0)  
npm run release:major   # Breaking changes (1.0.0 → 2.0.0)
# Then manually run: npm publish
```

⚠️ **Remember:** GitHub (git push) and npm (npm publish) are separate - pushing to GitHub does NOT automatically publish to npm!

## Security

This project implements supply chain security measures. When updating dependencies or GitHub Actions:

- Pin GitHub Actions to SHA hashes (see existing workflows for format)
- Review dependency changes carefully before merging
- Report security issues privately (see [SECURITY.md](./SECURITY.md))

## Questions?

Open a GitHub Discussion!
