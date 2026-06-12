# Release Process

This document describes how to release a new version of `design-constraint-validator` to npm.

## Prerequisites

Publishing runs in CI, not from your laptop, so the prerequisite is a one-time
GitHub setup (see "Automated Releases" below):

1. An `NPM_TOKEN` secret (npm **Automation** token) is configured in the repo,
   **or** the package is set up for npm **trusted publishing / OIDC** (preferred —
   no long-lived token can silently expire).
2. The token/identity has write access to the `design-constraint-validator` package.

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

### 4. CI publishes automatically (no manual `npm publish`)

Pushing the `vX.Y.Z` tag in step 3 triggers `.github/workflows/publish.yml`, which:

1. Builds and runs `npm run check`.
2. Verifies the tag matches `package.json`'s version.
3. Runs `npm publish --access public --provenance`.
4. **Polls the npm registry and fails the run if the version is not live** — so a
   release can never silently not happen (this is the gap that stranded `v2.0.2`).

Do **not** run `npm publish` by hand — there is exactly one canonical flow
(tag push → CI). To publish locally only as an emergency fallback, you can run the
`publish.yml` workflow via **workflow_dispatch** from the Actions tab.

### 5. Verify Publication

The workflow's own verification step is authoritative. To double-check manually:

```bash
npm view design-constraint-validator version   # should show the new version

# Optional: install it in a scratch dir
mkdir /tmp/test-install && cd /tmp/test-install && npm init -y
npm install design-constraint-validator && npx dcv --version
```

A GitHub Release is **not** required by the flow — the tag is the source of truth.
Create one only if you want human-readable release notes.
The SBOM workflow also runs on version tags and uploads SBOM artifacts; if you
create a GitHub Release, the same workflow attaches `sbom.json` and `sbom.xml`
to that release.

## Version Guidelines

Follow [Semantic Versioning](https://semver.org/):

- **PATCH** (1.0.x) - Bug fixes, documentation updates, internal refactoring
- **MINOR** (1.x.0) - New features, new constraint types, new CLI options (backwards compatible)
- **MAJOR** (x.0.0) - Breaking changes, removed features, changed APIs

## What Gets Published?

Only files listed in `package.json` `files` array (verify with `npm pack --dry-run`):
- `cli/`
- `core/`
- `adapters/`
- `themes/`
- `LICENSE`
- `README.md`

Built `.js` / `.d.ts` are emitted by `prepublishOnly` (`check && build`) and ship
via those directories even though they are not committed to git (TASK-007).

**Not published:** `node_modules/`, `.git/`, `test/`, `.github/`, `docs/`, `examples/`, `tokens/`, source-only `.ts` config, etc.

## Troubleshooting

### "You must be logged in to publish"
```bash
npm login
```

### "Cannot publish over existing version"
You're trying to publish the same version twice. Bump the version and push the new tag:
```bash
npm version patch
git push && git push --tags
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
3. **A pushed tag is the trigger** - Pushing a `vX.Y.Z` tag is what publishes to npm (via `publish.yml`). Pushing ordinary commits/branches does not.
4. **Always test before publishing** - Run `npm run check` and test installation locally

## Emergency: Unpublish

Only possible within 72 hours and should be avoided:

```bash
npm unpublish design-constraint-validator@1.0.1
```

Better approach: Publish a new version with the fix.

## Automated Releases (GitHub Actions)

This is the **canonical (and only) release flow**. The workflow
`.github/workflows/publish.yml` triggers on pushing a version tag (e.g. `v2.1.0`)
and:
1. Builds and runs all checks (`npm run check`)
2. Verifies the tag matches `package.json`'s version
3. Publishes to npm with provenance (using `NPM_TOKEN` / OIDC)
4. Verifies the version is live on the npm registry, failing loudly if not

### Setup

1. Create an npm access token:
   - Visit https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Click "Generate New Token" → "Automation"
   - Copy the token

2. Add it to GitHub secrets:
   - Go to https://github.com/CseperkePapp/design-constraint-validator/settings/secrets/actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: paste your npm token
   - Click "Add secret"

3. Push a tag to trigger the workflow:
   ```bash
   npm version patch  # or minor/major
   git push --tags
   ```

The workflow will handle publishing automatically.

**Note:** VS Code may show warnings in `publish.yml` about `secrets.NPM_TOKEN` being "unrecognized". This is a false positive from the editor's schema validator—the workflow will run correctly once the secret is configured in GitHub.
