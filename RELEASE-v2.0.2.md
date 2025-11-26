# v2.0.2 - Supply Chain Security Release

## 🚨 Security & CI Improvements

This release introduces major supply chain security hardening and CI/CD improvements.

### 🔒 Key Changes
- **SHA-pinned all GitHub Actions** (5 actions) for reproducible CI/CD
- **Added `--ignore-scripts` to all `npm ci` commands** to block malicious install scripts
- **Enabled npm provenance attestation** for package authenticity
- **Automated Shai-Hulud IoC scanner** runs before tests to detect indicators of compromise
- **Created `SECURITY.md` documentation** (security policy, reporting, and best practices)
- **Updated `README.md` and `CONTRIBUTING.md`** with new security and supply chain info

---

## 📝 Details

These changes significantly improve supply chain security, CI/CD integrity, and documentation for contributors and users. All workflows now use SHA-pinned actions and npm provenance. The new IoC scanner helps detect supply chain attacks before code is published or deployed.

---

## 📦 Installation

```bash
npm install design-constraint-validator@2.0.2
```

---

For full release history, see [Releases](https://github.com/CseperkePapp/design-constraint-validator/releases).

🤖 Release notes generated with GitHub Copilot
