# Release Process

This document describes how to release a new version of `design-constraint-validator` to npm.

## Prerequisites

1. You must be logged into npm:
   ```bash
   npm login
   npm whoami  # Verify you're logged in
   ```

2. You must have write access to the `design-constraint-validator` package on npm

## Release Steps

### 1. Ensure Everything is Ready

```bash
# Make sure you're on main branch with latest changes
git checkout main
git pull

# Run all checks (tests, lint, typecheck)
npm run check

# Verify package builds correctly
npm run build
```

### 2. Update Version

Choose the appropriate version bump based on changes:

```bash
# Bug fixes (1.0.0 → 1.0.1)
npm version patch

# New features (1.0.0 → 1.1.0)
npm version minor

# Breaking changes (1.0.0 → 2.0.0)
npm version major
```

This will:
- Update `package.json` version
- Create a git commit with the version
- Create a git tag (e.g., `v1.0.1`)

### 3. Push Changes

```bash
# Push commits and tags to GitHub
git push
git push --tags
```

### 4. Publish to npm

```bash
# Dry run first (optional but recommended)
npm publish --dry-run

# Actually publish
npm publish
```

The `prepublishOnly` script will automatically run `npm run check && npm run build` before publishing.

### 5. Verify Publication

```bash
# Check it's published
npm view design-constraint-validator

# Try installing it
mkdir /tmp/test-install
cd /tmp/test-install
npm init -y
npm install design-constraint-validator
npx dcv --version
```

### 6. Create GitHub Release (Optional)

1. Go to https://github.com/CseperkePapp/design-constraint-validator/releases
2. Click "Draft a new release"
3. Select the tag you just pushed (e.g., `v1.0.1`)
4. Add release notes describing changes
5. Publish release

## Version Guidelines

Follow [Semantic Versioning](https://semver.org/):

- **PATCH** (1.0.x) - Bug fixes, documentation updates, internal refactoring
- **MINOR** (1.x.0) - New features, new constraint types, new CLI options (backwards compatible)
- **MAJOR** (x.0.0) - Breaking changes, removed features, changed APIs

## What Gets Published?

Only files listed in `package.json` `files` array:
- `adapters/`
- `cli/`
- `core/`
- `themes/`
- `tokens/`
- `examples/`
- `dist/` (if it exists)
- `README.md`
- `LICENSE`

**Not published:** `node_modules/`, `.git/`, test files, `.github/`, etc.

## Troubleshooting

### "You must be logged in to publish"
```bash
npm login
```

### "Cannot publish over existing version"
You're trying to publish the same version twice. Bump the version:
```bash
npm version patch
npm publish
```

### "prepublishOnly script failed"
Tests or lint are failing. Fix them first:
```bash
npm run check
```

### "Package name taken"
The package name is already taken. Choose a different name in `package.json`.

## Important Notes

1. **npm packages are immutable** - Once published, you cannot change that version
2. **Cannot unpublish after 72 hours** - Be sure before publishing
3. **GitHub ≠ npm** - Pushing to GitHub doesn't update npm. You must publish separately.
4. **Always test before publishing** - Run `npm run check` and test installation locally

## Emergency: Unpublish

Only possible within 72 hours and should be avoided:

```bash
npm unpublish design-constraint-validator@1.0.1
```

Better approach: Publish a new version with the fix.

## CI/CD (Future)

Consider setting up automated releases with GitHub Actions:
- When a tag is pushed, automatically publish to npm
- Requires setting up `NPM_TOKEN` in GitHub secrets
