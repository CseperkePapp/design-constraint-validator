# Git Hooks Setup

This directory contains git hooks that provide reminders during the release process.

## Installing Hooks

Git hooks in `.git/hooks/` are not tracked by git. To set them up on a new machine:

### On Unix/Linux/Mac:
```bash
chmod +x .git/hooks/post-push
```

### On Windows (PowerShell):
The post-push hook is a shell script. To use it on Windows:

**Option 1: Git Bash**
- Open Git Bash in the repository
- Run: `chmod +x .git/hooks/post-push`

**Option 2: Manual Reminder**
Since git hooks don't work reliably on Windows with PowerShell, use these alternatives:
- VS Code tasks (`.vscode/tasks.json` has release reminders)
- Check RELEASE.md before publishing
- GitHub release workflow will post a comment reminder

## What the Hook Does

**post-push**: After pushing tags, reminds you to run `npm publish` manually.

## Alternative Reminders

If hooks aren't working:
1. **VS Code Tasks**: Run "Release: Publish to npm" task
2. **GitHub Actions**: Release reminder workflow comments on releases
3. **PR Template**: Reminds maintainers after merging
4. **RELEASE.md**: Full step-by-step checklist

## Manual Hook Installation Script

Copy this to a file and run it to install hooks:

```bash
#!/bin/bash
# install-hooks.sh

echo "Installing git hooks..."

cat > .git/hooks/post-push << 'EOF'
#!/bin/sh
if git log --format=%d $2..$3 | grep -q 'tag:'; then
  echo ""
  echo "📦 TAG PUSHED - Remember to: npm publish"
  echo "See RELEASE.md for steps"
  echo ""
fi
EOF

chmod +x .git/hooks/post-push

echo "✓ Hooks installed!"
```
