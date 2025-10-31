# Contributing to design-token-validator

Thank you for your interest in contributing!

## Development Setup

```bash
git clone https://github.com/CseperkePapp/design-token-validator.git
cd design-token-validator
npm install
npm test
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

## Questions?

Open a GitHub Discussion!
