---
name: project-context
description: "Gather project context quickly at session start. Use when you need to understand what a project is, what's been done recently, and what the current state is. Covers memory search, file exploration, config reading, and git history."
metadata:
  author: distill
  version: "1.0.0"
  project: implement-ai-mentor-module
  evidence:
    - session: ses_1269a426fffevR7ydJJeGGOUQB
      pattern: "Memory search → glob → read configs → git log/diff for orientation"
    - session: ses_1269a427dffe61E9jm4qK3eJzE
      pattern: "Memory search → glob → read key files for audit context"
---

# Project Context Gathering

## When to Use

- Starting a new session in an unfamiliar project
- Need to understand project structure, recent work, and current state
- Preparing for an audit, review, or continuation task

## Procedure

### Step 1: Search Memory for Context

```
memory search "project task work"
memory search "current session"
```

Look for:
- Project MEMORY.md for rules and architecture decisions
- Session checkpoints for recent activity
- Task progress for ongoing work

### Step 2: Explore Project Structure

```powershell
# List root directory
Get-ChildItem "project\root" -Name

# Find key config files
Get-ChildItem -Recurse -Name -Include "CLAUDE.md","AGENTS.md","README.md",".env*"
```

Read the most relevant config files:
- `README.md` - project overview
- `CLAUDE.md` / `AGENTS.md` - agent instructions and rules
- `.env` / `.env.local` - environment configuration (don't commit secrets)

### Step 3: Check Git History

```powershell
# Recent commits
git log --oneline -20

# Last commit details
git diff --stat HEAD~1

# Files changed in recent commits
git log --oneline -5 --name-only

# Current status
git status
```

### Step 4: Identify Key Source Files

Based on the project type, find and read the main entry points:
- **Next.js**: `src/app/**/page.tsx`, `src/lib/api.ts`
- **Express/FastAPI**: `src/server.ts`, `src/routes/`, `src/controllers/`
- **Vue**: `src/stores/`, `src/services/`
- **Prisma**: `prisma/schema.prisma`

## Output Format

After gathering context, summarize:
1. **What is this project?** (1-2 sentences)
2. **Tech stack** (key technologies)
3. **Recent work** (last 3-5 commits)
4. **Current state** (any uncommitted changes, ongoing tasks)
5. **Key files** (main entry points and configuration)

## Tips

- Start with memory search before file exploration - it's faster
- Don't read every file - focus on config and entry points
- Git log gives you the narrative of what happened
- Check for CLAUDE.md/AGENTS.md first - they often contain project-specific rules
