# Contributing to SAAF Mumbai

SAAF Mumbai is an open source civic accountability platform for Mumbai. The goal is for anyone who can code to pick up an issue, understand the codebase, and ship a PR without needing to ask questions. This document is the canonical guide for human contributors. AI assistants should read `AGENTS.md`.

---

## Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/rushjoshburner/saaf-mumbai.git
   cd saaf-mumbai
   ```
2. Copy the environment template and fill in your own values (Supabase, R2, KV):
   ```bash
   cp .env.example .env.local
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```
5. Read the full PRD and TRD in `/docs` before touching anything. They are the source of truth.

## How to Contribute

- **Open an issue before starting** anything significant. Describe what you want to build and why.
- **One feature per PR.** Small PRs get reviewed and merged faster.
- **Never push directly to `main`.** All work happens on a branch and merges via Pull Request. Direct pushes to `main` are blocked.
- PRs must not break existing API contracts (see the Backend Schema doc once published).
- All new API routes must apply rate limiting using the shared `checkRateLimit` helper in `src/lib/rate-limit.ts`.
- No new external paid services without opening an issue and getting agreement first.
- **TypeScript only.** No plain `.js` files.
- Environment variables go in `.env.example` with a placeholder value and a comment explaining what they are for.

### Branch naming

| Type of work | Branch prefix | Example |
|--------------|---------------|---------|
| New feature | `feature/` | `feature/report-form` |
| Bug fix | `fix/` | `fix/map-crash-android` |
| UI / design | `ui/` | `ui/leaderboard-spacing` |
| Data files | `data/` | `data/mla-lookup` |

### The workflow, every time

```bash
git checkout main && git pull        # sync latest
git checkout -b feature/my-thing     # branch
# ...do the work...
git add .
git commit -m "clear description"    # commit
git push origin feature/my-thing     # push
gh pr create --fill                  # open a Pull Request
```

## What Not to Do

- **Do not add analytics, tracking scripts, or ad code. Ever.**
- **Do not add features that require user accounts** beyond the moderator role.
- **Do not expose `SUPABASE_SERVICE_ROLE_KEY` or R2 credentials** in client-side code. Server-side API routes only.
- **Do not change the report grouping radius or geo-fence logic** without opening an issue first.

## Data Files

- `/public/data/` contains all static lookup data. Changes to these files affect the entire platform.
- If you are adding or correcting MLA/MP data, open a **separate PR for data changes only**.
- All GeoJSON must use **EPSG:4326** (standard GPS latitude/longitude).

## Docs Are the Source of Truth

The `/docs` folder contains all product documents. If your code conflicts with the PRD or TRD, **the documents win.** Open an issue to discuss before deviating.

| File | Purpose |
|------|---------|
| `docs/PRD-v1.2.docx` | Product requirements — what the platform does and why |
| `docs/TRD-v1.0.docx` | Technical requirements — how it is built and why |
| `docs/DESIGN.md` | Visual design and component library |
| `docs/APPFLOW.docx` | Screen-by-screen flow (to be created) |
| `docs/BACKEND-SCHEMA.docx` | Database schema and API contracts (to be created) |
