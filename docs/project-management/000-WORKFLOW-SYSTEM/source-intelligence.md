# Source Intelligence Management Workflow

## Purpose

Define a clear, repeatable workflow for managing, synchronizing, and auditing what each AI source (ChatGPT, Claude, Gemini) knows about a project, in order to prevent instruction drift and stale context.

## Context

Applies to all long-running or architecturally evolving projects developed primarily in an editor + Git workflow, and supported by multiple AI systems.

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

## Core Principle

**The repository is the single source of truth.**
AI project instructions are mirrors of that truth and may become stale unless explicitly synchronized.

If information exists only in an AI project UI and not in the repo, it is considered *non-authoritative*.

---

## Canonical Folder Structure

At the workspace or repository root:

```
SOURCE_INTELLIGENCE/
├─ OpenAI_ChatGPT/
│  └─ <Project_Name>/
├─ Anthropic_Claude/
│  └─ <Project_Name>/
└─ Google_Gemini/
   └─ <Project_Name>/
```

Each **AI → Project** folder represents the *current known context* of that intelligence source.

---

## Required Files per AI Project

Each `SOURCE_INTELLIGENCE/<AI>/<Project>/` folder must contain:

### 1. `PROJECT_INSTRUCTIONS.md`

- Exact copy of the project instructions as last synced to the AI UI
- Includes instruction version and last updated date
- Never edited directly in the AI UI first

This file is a **snapshot**, not the canonical source.

---

### 2. `PROJECT_FILES/`

Contains copies of all files explicitly uploaded or pasted into the AI project, such as:

- architecture summaries
- constraint documents
- terminology references
- key specs

Only files the AI is expected to know belong here.

---

### 3. `LAST_SYNC.md`

Minimal, factual record of synchronization state:

```md
Last synced: YYYY-MM-DD
Repo instruction version: vX.X
AI project name: <exact name in UI>
Notes: <optional>
```

This file exists to make drift *visible*.

---

### 4. `NOTES.md` (optional)

Used for:

- known AI quirks
- recurring misunderstandings
- limitations or reminders ("AI X confuses Y with Z")

No operational data belongs here.

---

## Synchronization Rules (Non-Negotiable)

1. **Canonical instructions live in the repo**, outside `SOURCE_INTELLIGENCE`.
2. Changes are made **only** to canonical files first.
3. After changes, instructions are copied into the AI project UI.
4. The copied version is stored in `SOURCE_INTELLIGENCE`.
5. `LAST_SYNC.md` is updated immediately.

Manual friction is intentional and acts as a safeguard.

---

## Task-Level Guardrail

Any task that changes architecture, terminology, constraints, or project structure must include this checklist:

```md
## Source Intelligence Check
- [ ] OpenAI (ChatGPT) instructions up to date
- [ ] Anthropic (Claude) instructions up to date
- [ ] Google (Gemini) context up to date
```

Only relevant sources need to be checked.

---

## Drift Detection

Drift is indicated by any of the following:

- Instruction version mismatch
- Missing files in `PROJECT_FILES/`
- Old `LAST_SYNC` date after major changes

When drift is detected:

- AI must be resynced before further work
- Or explicitly acknowledged as operating on stale context

---

## AI Self-Policing Rule

Project-level AI instructions must include:

> If repo structure, terminology, or constraints appear inconsistent with these instructions, pause and ask for confirmation before proceeding.

This turns confidence into caution.

---

## Summary

This workflow treats AI systems as **stateful intelligence sources** that require:

- explicit configuration
- visible synchronization
- versioned context

The goal is not automation, but **clarity, auditability, and calm collaboration** between human and AI agents.
