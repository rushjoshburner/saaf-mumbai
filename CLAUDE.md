# SAAF Mumbai — AI Assistant Instructions

This file tells your AI assistant (Claude Code, Antigravity, Codex, etc.) everything it needs to know about this project and how the team works.

---

## What This Project Is

SAAF Mumbai is a civic accountability PWA for Mumbai. It lets any resident report a civic issue in under 10 seconds, see it on a live map, and share it to WhatsApp and Twitter. No accounts. No user data stored. Full details in `/docs`.

## Tech Stack

- **Next.js 15** with App Router — pages live in `src/app/`
- **TypeScript** — all files use `.tsx` or `.ts`
- **Tailwind CSS** — all styling via Tailwind utility classes only
- **Supabase** — PostgreSQL + PostGIS for database and geo queries
- **Cloudflare R2** — photo storage
- **MapLibre GL JS** — map rendering
- **Serwist** — PWA service worker

## Key Rules

1. No user accounts, no login, no user data collection — the PRD is explicit on this
2. TypeScript only — never plain `.js`
3. Tailwind only — no inline styles, no separate CSS files
4. Server-side secrets (`SUPABASE_SERVICE_ROLE_KEY`, R2 credentials) must never appear in client-side code — only in `/app/api/` routes
5. All new API routes must use the shared `checkRateLimit` helper in `src/lib/rate-limit.ts`
6. No new paid external services without opening a GitHub issue first

## Folder Structure

```
src/
  app/
    api/          → server-side API routes only
    (map)/        → main map view
    report/[id]/  → report detail page
    leaderboard/  → leaderboard page
    nearby/       → My Street View
    report-card/  → weekly report card
    about/        → about page
  components/
    map/          → MapLibre components
    report/       → report submission and detail components
    leaderboard/  → leaderboard components
    shared/       → shared UI components
  lib/            → utility functions and service clients
public/
  data/           → GeoJSON boundaries and lookup JSON files
docs/             → PRD and TRD — read before building anything
```

## Git Rules

**Never commit directly to `main`.** Always:

1. Pull latest before starting: `git pull`
2. Create a branch: `git checkout -b feature/what-you-are-building`
3. Commit often: `git commit -m "clear description of what was done"`
4. Push: `git push origin feature/your-branch`
5. Open a Pull Request on GitHub

Branch naming:
- New feature → `feature/name`
- Bug fix → `fix/name`
- Data update → `data/name`
- UI work → `ui/name`

## Merge Conflicts

Paste the conflicted file and say: "Fix this merge conflict, keep the most complete version of both changes."

---

*Read `/docs/PRD-v1.2.docx` and `/docs/TRD-v1.0.docx` before building any feature.*
