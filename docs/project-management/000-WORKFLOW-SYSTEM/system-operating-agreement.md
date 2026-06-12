# System Operating Agreement

## Purpose

Define the stable operating contract for how work, documentation, AI collaboration, synchronization, and status management function across all projects.

## Context

Applies to all personal development projects, research, writing, and system-building work executed primarily in an editor with Git as the canonical store.

## Source

- agent: human
- model: N/A

## Status

active

## Updated

2026-04-20

## Reviewed

- by: none
- on: unknown

---

## 1. Core Environment

- **Editor + filesystem** is the primary working environment.
- **Git hosting** (GitHub/GitLab/etc.) is canonical: synchronization, history, recovery, and future scaling.
- **AI** acts as executor, reviewer, and secretary — never as source of truth.
- **Third-party PM tools** (Notion, Jira, Linear, etc.) are excluded by default; later only as AI-operated, team-facing output if scaling requires it.

---

## 2. Documentation = Project Management

- There is no separation between documentation and project management.
- Markdown files are the operational system.
- Git tracks mechanical change; files express semantic state.

---

## 3. Universal Document Discipline (Project-Scoped)

- Every `.md` file includes a standardized header (purpose, context, source, prompt, status, updated, reviewed — as applicable to the document type).
- Provenance must be explicit.
- Unknown is allowed; invention is forbidden.
- Project-specific rules live in project instructions, not in this shared operating agreement.

---

## 4. Tasks Are Agent-Agnostic

- A **task** is defined as: intent + constraints + output.
- The executor may be AI or human.
- Prompts are compiled briefs, not special objects.
- Review is a separate role (AI or human).
- The arbiter (human) decides what persists.

---

## 5. Status Architecture (Three Layers)

### Project Level

- Monthly status files in `docs/project-management/status/YYYY-MM.md` — append-only operational truth.

### Global Level

- Optional: cross-project summary (out of scope for this system).

### Temporal Level

- Optional: daily log (out of scope for this system).

Logs are factual, not reflective.

---

## 6. Source Intelligence Management

Intelligence sources are treated as stateful systems whose knowledge must be explicitly managed.

```text
SOURCE_INTELLIGENCE/
├─ OpenAI_ChatGPT/
├─ Anthropic_Claude/
└─ Google_Gemini/
```

Per AI × project:

- `PROJECT_INSTRUCTIONS.md` (snapshot)
- `PROJECT_FILES/` (what the AI has seen)
- `LAST_SYNC.md` (date + version)
- optional `NOTES.md`

**Golden rule:** If it is not in this folder, the AI does not officially know it.

---

## 7. Drift Guardrails

- Repository instructions are canonical.
- AI project instructions are mirrors.
- Versioning and last-sync metadata make drift visible.
- Architectural changes require updating canonical instructions and syncing relevant AI projects.

---

## 8. Task-Level Enforcement

Tasks that change structure, terminology, or constraints must include:

```md
## Source Intelligence Check
- [ ] ChatGPT
- [ ] Claude
- [ ] Gemini
```

Only relevant sources are checked.

---

## 9. Client Work Boundary

- **Git hosting** — personal systems, IP, evolving projects.
- **Cloud storage** (Google Drive, Dropbox, OneDrive) — client assets and research exports.
- Repository files link to cloud sources; no duplication.
- AI may advise but must not autonomously modify client spaces.

---

## 10. Operating Philosophy

- Strict systems enable relaxed cognition.
- Constraints enable flow.
- Observability replaces paranoia.
- Boring structure protects creative work.

---

## Notes

This agreement is intentionally stable and minimal. Changes should be rare and deliberate.
