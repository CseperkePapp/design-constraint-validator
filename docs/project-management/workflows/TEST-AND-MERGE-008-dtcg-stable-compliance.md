# Prompt: Test and Merge Task 008

**Task:** [DONE-TASK-008](../tasks/DONE-TASK-008-CLAUDE-dcv-dtcg-stable-compliance.md)
**Status:** done
**Branch:** `task/008-dtcg-stable-compliance`
**Merged:** 2026-06-12 → `main` (merge commit, `--no-ff`)

## Source

- agent: Claude
- model: claude-opus-4-8

---

## Pre-Merge Checklist

### 1. Build Verification

```bash
npm run build   # tsc → exit 0
npm test        # 14 files, 94 passed, 2 skipped (5 new DTCG cases)
npm run lint    # exit 0
```

- [x] Build / test / lint / workflow-integrity green

### 2. Behavioral Verification (fixture + CLI)

Ran the committed `examples/dtcg/figma-export.tokens.json` against its
`dcv.config.json`:

- [x] Structured sRGB colors validate — `color.text` #888888 on `color.bg`
      #999999 → 1.24:1 error (`color.bg` has no `hex`, exercising the srgb
      components → color path)
- [x] `{alias}` resolves — `why color.brand` → chain `[color.brand, color.text]`,
      value `#888888`
- [x] Structured dimension — `size.touch {value:30,unit:px}` → `30px < 44px`
      threshold error
- [x] Non-sRGB — `color.neon` display-p3 → explicit `WARN Unparseable color(s):
      fg="<unsupported colorSpace: display-p3>"`, never coerced to sRGB
- [x] `$extensions` on `color.text` — no crash

### 3. Documentation

- [x] `examples/dtcg/README.md` "fully supports" overclaim replaced with a precise
      scope table; root README adapter line made precise
- [x] Task doc Resolution + acceptance recorded; `DONE-TASK-008` renamed

### 4. Task Status

- [x] Status: done, completed 2026-06-12, all acceptance criteria met

---

## Merge to Main

`git merge --no-ff task/008-dtcg-stable-compliance` → post-merge `main`: build
exit 0, 94 passed / 2 skipped. No publish, no tag.
