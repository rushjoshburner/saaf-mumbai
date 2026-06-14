# SAAF Mumbai

A civic accountability PWA for Mumbai residents to report, track, and amplify civic issues. Built by Mumbaikars, for Mumbaikars. Zero monetization. Open to all.

## What It Does

- Report a civic issue (garbage, waterlogging, fallen trees) in under 10 seconds — no account needed
- See all reports plotted live on a map
- Share directly to WhatsApp and Twitter to build public pressure
- Track accountability by ward, MLA, and MP

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL + PostGIS) |
| File Storage | Cloudflare R2 |
| Maps | MapLibre GL JS + OpenFreeMap |
| PWA | Serwist |
| Hosting | Vercel |

## Contributing

Read the full product and technical docs in `/docs` before touching anything.

```bash
git clone https://github.com/rushjoshburner/saaf-mumbai.git
cd saaf-mumbai
cp .env.example .env.local   # fill in your own values
npm install
npm run dev
```

Open a GitHub Issue before starting any significant work. One feature per PR. See `CONTRIBUTING.md` for the full guidelines.

## Security

- Never commit `.env.local` or any file containing API keys or credentials
- `SUPABASE_SERVICE_ROLE_KEY` and R2 credentials must only appear in server-side API routes — never in client code
- See `.env.example` for the full list of required environment variables

## License

MIT
