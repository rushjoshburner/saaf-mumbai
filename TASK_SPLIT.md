# SAAF Mumbai — Team Task Split

3 people, 3 clear ownership zones. Nobody edits the same files at the same time.

---

## The Split at a Glance

| Person | Role | They Own |
|--------|------|----------|
| **Rushabh** | The Plumber | Backend, APIs, database, infrastructure |
| **Teammate 2** | The Map Person | Map view, report submission, report detail |
| **Teammate 3** | The Dashboard Person | Leaderboard, report card, data files, secondary pages |

---

## Rushabh — The Plumber

**You own everything that runs on the server and connects services together. The other two cannot ship anything until your foundations are in place.**

### Files you own
```
src/app/api/report/route.ts          → Submit a report
src/app/api/report/[id]/route.ts     → Fetch a report
src/app/api/report/resolve/route.ts  → Submit resolution photo
src/app/api/report/upvote/route.ts   → Issue + resolution upvotes
src/app/api/leaderboard/route.ts     → Leaderboard data
src/app/api/report-card/route.ts     → Weekly report card data
src/app/api/cron/weekly/route.ts     → Monday cron job
src/app/layout.tsx                   → Root layout (you own this)
src/lib/supabase.ts                  → Supabase client
src/lib/r2.ts                        → Cloudflare R2 upload helper
src/lib/rate-limit.ts                → Rate limiting via Vercel KV
src/lib/geo.ts                       → Turf.js geo-fence + grouping helpers
src/lib/compress.ts                  → Image compression
src/lib/exif.ts                      → EXIF GPS extraction
src/app/sw.ts                        → PWA service worker
next.config.ts                       → Serwist PWA config
vercel.json                          → Cron job config
.env.example                         → Environment variable template
```

### What you set up
- Supabase project: tables, PostGIS functions (is_within_bmc, find_nearby_group), ward/MLA/MP boundary tables
- Cloudflare R2 bucket
- Vercel KV store
- All API routes with rate limiting
- PWA service worker
- Moderator queue table in Supabase (reviewed via Supabase dashboard directly — no custom UI in v1)

### Branch naming for you
- `feature/supabase-setup`
- `feature/api-report-submit`
- `feature/api-leaderboard`
- `feature/pwa-config`
- `feature/admin-auth`

---

## Teammate 2 — The Map Person

**You own the main experience: the map and everything around filing and viewing a report.**

### Files you own
```
src/app/(map)/page.tsx               → Main map view page
src/app/report/[id]/page.tsx         → Report detail page
src/components/map/                  → Everything MapLibre
  MapView.tsx                        → Main map component
  ReportPin.tsx                      → Individual pin on the map
  ClusterBubble.tsx                  → Clustered pin bubble
  SurgeOverlay.tsx                   → Surge neighbourhood highlight
  BmcBoundary.tsx                    → BMC boundary line on map
  TabSwitcher.tsx                    → Garbage / Monsoon tab toggle
src/components/report/              → Report submission + detail
  ReportForm.tsx                     → The submission form
  PhotoPicker.tsx                    → Camera / gallery picker
  LocationConfirm.tsx                → Pin confirmation map
  ReportDetail.tsx                   → Full report detail view
  AccountabilityChain.tsx            → Officials chain
  ContactSheet.tsx                   → Contact bottom sheet
  StatusBadge.tsx                    → Open / Resolved badges
  BeforeAfterPhoto.tsx               → Before/after photo pair
  ShareCard.tsx                      → WhatsApp + Twitter share
  UpvoteButton.tsx                   → I See This Too + Looks Fixed
```

### What you build
- MapLibre map centred on Mumbai with OpenFreeMap tiles
- Garbage and Monsoon tab switching
- Report pins with count badges and days-open label
- Cluster bubbles at higher zoom levels
- Surge neighbourhood overlay
- BMC boundary line
- Full report submission flow (photo → EXIF → GPS → pin → compress → submit)
- Report detail page with accountability chain and share buttons
- I See This Too and Looks Fixed upvote buttons
- Mark as Resolved flow

### Important: wait for Rushabh first
You need these from Rushabh before you can connect real data:
- `src/lib/supabase.ts` — to fetch report groups
- `src/lib/compress.ts` — for photo compression
- `src/lib/exif.ts` — for GPS extraction
- `src/lib/geo.ts` — for geo-fence check
- `/api/report` route — to actually submit

Start by building the UI with hardcoded dummy data. Once Rushabh's API routes exist, swap the dummy data for real API calls.

### Branch naming for you
- `feature/map-view`
- `feature/report-pins`
- `feature/report-form`
- `feature/report-detail`
- `feature/accountability-chain`
- `feature/share-cards`

---

## Teammate 3 — The Dashboard Person

**You own everything about accountability data, secondary pages, and all the static data files.**

### Files you own
```
src/app/leaderboard/page.tsx         → Leaderboard page
src/app/report-card/page.tsx         → Weekly Report Card page
src/app/nearby/page.tsx              → My Street View page
src/app/about/page.tsx               → About page
src/components/leaderboard/         → Leaderboard components
  LeaderboardTabs.tsx                → MLA / Wards / MPs / Contractors tabs
  LeaderboardEntry.tsx               → Single row in leaderboard
  JurisdictionBadge.tsx              → Ward / constituency label
src/components/shared/              → Shared UI used across the app
  SurgeAlert.tsx                     → Surge banner
  WeeklyReportCard.tsx               → Report card display
  OfflineBadge.tsx                   → Shown when user is offline
public/data/                        → All static data files
  bmc-boundary.json                  → BMC outer boundary GeoJSON
  wards.json                         → 24 BMC wards GeoJSON
  mla-lookup.json                    → 36 MLAs: name, party, constituency, x_handle
  mp-lookup.json                     → 6 MPs: name, party, constituency, x_handle
  neighbourhoods.json                → Neighbourhood names for display
```

### What you build
- Leaderboard with MLA, Wards, and MP tabs
- Each entry: rank, name, party, open group count, days since oldest open issue
- Twitter/X handle as a tappable link
- Weekly Report Card page (total filed, resolved, top wards, top issues, longest open)
- My Street View page (500m GPS radius, prompts for location permission)
- About page
- Surge alert banner component
- All the static data files (source MLA/MP names, ward data, GeoJSON boundaries)

### Data sourcing (important — this is your research task)
You need to manually compile:
- `mla-lookup.json` — 36 MLAs with name, party, constituency, Twitter handle
- `mp-lookup.json` — 6 Mumbai MPs with same fields
- BMC helpline numbers for contact sheet

Sources: Election Commission of India, Wikipedia, official social media profiles.

### Important: wait for Rushabh first
You need these from Rushabh before connecting real data:
- `/api/leaderboard` route
- `/api/report-card` route

Start by building all pages with dummy data, then wire up the API once it exists.

### Branch naming for you
- `feature/leaderboard`
- `feature/report-card-page`
- `feature/my-street-view`
- `feature/about-page`
- `data/mla-mp-lookup`
- `data/geojson-boundaries`

---

## Build Order (who goes first)

```
Week 1
├── Rushabh:     Supabase setup + lib utilities (everyone blocked until this is done)
├── Teammate 2:  Map UI with dummy data (doesn't need backend yet)
└── Teammate 3:  Data files + leaderboard UI with dummy data

Week 2+
├── Rushabh:     API routes (report submit, leaderboard, upvote, cron)
├── Teammate 2:  Wire map + report form to real APIs
└── Teammate 3:  Wire leaderboard + report card to real APIs
```

---

## The Rule: Never Touch Each Other's Files

| File | Owner |
|------|-------|
| `src/app/api/**` | Rushabh |
| `src/lib/**` | Rushabh |
| `src/app/layout.tsx` | Rushabh |
| `src/app/(map)/**` | Teammate 2 |
| `src/app/report/**` | Teammate 2 |
| `src/components/map/**` | Teammate 2 |
| `src/components/report/**` | Teammate 2 |
| `src/app/leaderboard/**` | Teammate 3 |
| `src/app/report-card/**` | Teammate 3 |
| `src/app/nearby/**` | Teammate 3 |
| `src/app/about/**` | Teammate 3 |
| `src/components/leaderboard/**` | Teammate 3 |
| `src/components/shared/**` | Teammate 3 |
| `public/data/**` | Teammate 3 |

If you need to edit someone else's file — open a Pull Request and tag them to review.

---

## Shared Daily Ritual

Every morning before starting:
```bash
git pull
```

Every time you finish something:
```bash
git add .
git commit -m "clear description"
git push origin your-branch-name
```

Open a PR → tag Rushabh → he merges.
