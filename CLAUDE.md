# SAAF Mumbai — AI Assistant Instructions

This file tells your AI assistant (Claude Code, Antigravity, Codex, etc.) everything it needs to know about this project and how the team works.

---

## What This Project Is

SAAF Mumbai is a PWA (Progressive Web App) built with Next.js 15. It runs in the browser and can be installed on phones like a native app. There are 3 developers on the team, all using AI assistants to build features.

## Tech Stack

- **Next.js 15** with App Router — pages live in `src/app/`
- **TypeScript** — all files use `.tsx` or `.ts`
- **Tailwind CSS** — all styling done with Tailwind utility classes, no separate CSS files
- **PWA** — the app should work offline and be installable on mobile

## Folder Structure

\`\`\`
src/
  app/          → pages and routes (Next.js App Router)
  components/   → reusable UI components
  lib/          → shared utility functions and helpers
  types/        → TypeScript type definitions
public/         → static assets (images, icons, manifest)
\`\`\`

## Coding Rules

1. Use TypeScript for every file — never plain `.js`
2. Style with Tailwind only — no inline styles, no separate CSS unless absolutely necessary
3. Put reusable UI pieces in `src/components/`
4. Keep each component in its own file
5. Use meaningful variable and function names
6. Do not add features beyond what is asked — keep it focused

## Git Rules (IMPORTANT)

**Never commit directly to `main`.** Always:

1. Create a branch before starting: `git checkout -b feature/your-feature-name`
2. Commit often with clear messages: `git commit -m "added login form with email input"`
3. Push your branch: `git push origin feature/your-feature-name`
4. Open a Pull Request on GitHub for review before merging

Branch naming convention:
- New feature → `feature/name`
- Bug fix → `fix/name`
- Design/UI → `ui/name`

## Before Starting Any Task

Always run:
\`\`\`bash
git pull
\`\`\`
This syncs the latest changes from teammates before you start.

## If You See a Merge Conflict

Paste the conflicted file content and say: "Fix this merge conflict, keep the most complete version of both changes."

---

*This file should be kept up to date as the project evolves.*
