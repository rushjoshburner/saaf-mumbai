# SAAF Mumbai — AI Agent Instructions

Canonical instructions for **any** AI assistant in this repo (Claude Code, Codex, Antigravity, Gemini, Cursor). Read this fully, then read `CONTRIBUTING.md` and the docs in `/docs` before building anything.

---

## Context (read these first)

- **What the app is + every product rule:** `docs/PRD-v1.2.docx`
- **How it is built + every technical decision:** `docs/TRD-v1.0.docx`
- **Full contribution rules (shared with humans):** `CONTRIBUTING.md`

If your code ever conflicts with the PRD or TRD, **the docs win.** Stop and tell the user.

## The two hard constraints

1. **Never push to `main`.** Every change goes through a branch and a Pull Request. GitHub rejects direct pushes to `main`.
2. **No user accounts, no login, no tracking, no user data.** Reports are anonymous. This is a hard product constraint — never add auth, signups, analytics, or ad code.

## Per-Feature Workflow — run this EVERY time, without being reminded

```bash
git checkout main && git pull          # 1. sync latest shared code
git checkout -b feature/<short-name>   # 2. branch (feature/ fix/ ui/ data/)
# 3. build ONLY what was asked
git add . && git commit -m "..."       # 4. commit in small, clear steps
git push origin <branch-name>          # 5. push
gh pr create --fill                    # 6. open a Pull Request
```

7. Tell the user the PR is open and ready for review. **Do not merge it yourself** unless they explicitly say to.

## Staying out of teammates' way

- Only edit files related to the feature you were asked to build.
- If the task requires changing a file that clearly belongs to a different part of the app, **stop and tell the user** before editing. Suggest a separate PR tagging whoever owns that area.
- One feature per branch. One branch per PR. Keep PRs small.

## The rules that matter most while coding

(Full list in `CONTRIBUTING.md` — these are the ones AIs most often get wrong.)

- **TypeScript only.** Tailwind only — no inline styles, no separate CSS.
- Server-side secrets (`SUPABASE_SERVICE_ROLE_KEY`, R2 keys) appear ONLY in `src/app/api/` routes — **never** in client code.
- Every new API route must use the `checkRateLimit` helper in `src/lib/rate-limit.ts`.
- Env vars go in `.env.example` with a placeholder + comment — never commit real values.
- Don't change report grouping radius or geo-fence logic without the user opening an issue first.

## Before you finish

- App still builds: `npm run build` (or `npm run dev` starts cleanly).
- You did NOT commit to `main`.
- No secrets were committed.
- On a merge conflict: resolve it keeping the most complete version of both changes — never silently discard a teammate's work.
