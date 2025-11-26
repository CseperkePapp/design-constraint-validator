# Security Policy

## Supply Chain Security

This project implements multiple layers of supply chain security to protect against attacks like [Shai-Hulud](https://www.bleepingcomputer.com/news/security/shai-hulud-malware-infects-500-npm-packages-leaks-secrets-on-github/) and similar npm/GitHub supply chain threats.

### Measures Implemented

#### 1. GitHub Actions SHA Pinning

All GitHub Actions are pinned to immutable SHA commit hashes instead of mutable version tags. This prevents attackers from injecting malicious code by modifying a tag.

```yaml
# Instead of this (vulnerable):
- uses: actions/checkout@v4

# We use this (secure):
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
```

**Pinned Actions:**
| Action | Version | SHA |
|--------|---------|-----|
| actions/checkout | v4.2.2 | `11bd71901bbe5b1630ceea73d27597364c9af683` |
| actions/setup-node | v4.4.0 | `49933ea5288caeca8642d1e84afbd3f7d6820020` |
| actions/upload-artifact | v4.6.2 | `ea165f8d65b6e75b540449e92b4886f43607fa02` |
| actions/github-script | v7.1.0 | `f28e40c7f34bde8b3046d885e986cb6290c5673b` |
| amannn/action-semantic-pull-request | v5.5.3 | `0723387faaf9b38adef4775cd42cfd5155ed6017` |

#### 2. Install Script Protection

CI workflows use `npm ci --ignore-scripts` to prevent automatic execution of potentially malicious `preinstall`/`postinstall` scripts from dependencies.

This blocks the primary infection vector used by supply chain attacks like Shai-Hulud, which rely on install scripts to execute malicious payloads.

#### 3. npm Provenance

Published packages include [npm provenance](https://docs.npmjs.com/generating-provenance-statements) attestation (`--provenance` flag), which:

- Cryptographically links the published package to its source repository
- Provides a verifiable build attestation signed by Sigstore
- Allows users to verify the package was built from this repository

#### 4. Software Bill of Materials (SBOM)

Every release includes a CycloneDX SBOM attached as a release artifact, enabling:

- Dependency transparency
- Vulnerability scanning
- License compliance verification

#### 5. Automated IoC Scanning

Every CI run includes a security scan that checks for known Shai-Hulud indicators of compromise (IoCs):

| Check | Description |
|-------|-------------|
| Malicious files | `setup_bun.js`, `bun_environment.js`, `bun_setup.js` |
| Install script injection | `curl \| bash` or `bun.sh/install` in preinstall/postinstall |
| Malware signatures | "Sha1-Hulud: The Second Coming" and variants |
| Credential exfiltration | TruffleHog abuse, token export patterns |
| Self-hosted runners | Unexpected runner configurations |
| Unpinned actions | GitHub Actions using version tags instead of SHAs |

The security scan runs **before** tests and will fail the build if critical IoCs are detected.

#### 6. Minimal Dependencies

This package maintains a minimal dependency footprint (only 3 production dependencies) to reduce attack surface:

- `fast-glob` - File pattern matching
- `yargs` - CLI argument parsing
- `zod` - Schema validation

### Verifying Package Integrity

You can verify the provenance of published packages:

```bash
npm audit signatures
```

### For Contributors

When updating GitHub Actions:

1. Always pin to full SHA hashes (40 characters)
2. Add version comment after the SHA: `# v4.2.2`
3. Verify SHAs come from the official action repository, not forks
4. Use tools like [pin-github-action](https://github.com/mheap/pin-github-action) to automate updates

### Reporting Security Issues

If you discover a security vulnerability, please report it privately:

1. **Do not** open a public issue
2. Email the maintainers directly or use GitHub's private vulnerability reporting
3. Provide details about the vulnerability and steps to reproduce

We aim to respond to security reports within 48 hours.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 2.x     | Yes       |
| 1.x     | No        |
| < 1.0   | No        |
