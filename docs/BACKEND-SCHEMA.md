# SAAF Mumbai — Backend Schema & API Contracts

The single source of truth for the database and API. Every API route and every data fetch in the app builds against this. Companion to the SQL migration in `supabase/migrations/0001_initial_schema.sql`.

See `DECISIONS.md` for product decisions that override the PRD/TRD.

---

## 1. Security Model (read this first)

The app has **no user accounts**. Every visitor's browser talks to Supabase with the **public anon key**. Therefore:

- **Visitors can only READ.** Row Level Security (RLS) lets the anon key `SELECT` public data (reports, photos, boundaries, leaderboard) and nothing else.
- **All WRITES go through our own API routes** (`src/app/api/*`), which run server-side with the `SUPABASE_SERVICE_ROLE_KEY`. The service key bypasses RLS. This is where rate-limiting, geo-fencing, and validation happen — they cannot be skipped by a malicious client.
- **Private data** (raw EXIF GPS, the moderator queue, vote records) has **no anon policy at all**, so it is invisible to the public and only reachable by the service role.

This is the core of "secure and safe": the client can never write directly to the database or read anything we didn't explicitly expose.

---

## 2. Enums

| Enum | Values |
|------|--------|
| `tab_type` | `garbage`, `monsoon` |
| `report_status` | `open`, `acknowledged`, `resolution_submitted`, `resolved` |

---

## 3. Tables

### 3.1 `report_groups` — one row per map pin
The heart of the platform. A pin clusters all reports within 30m of the same issue.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | auto-generated |
| `tab` | tab_type | `garbage` or `monsoon`, permanent |
| `sub_issue` | text, null | e.g. `waterlogging`, `fallen_tree` (monsoon); null for garbage |
| `geom` | geography(Point) | confirmed/displayed location (EPSG:4326) |
| `lat`, `lng` | double precision | denormalized copy for convenience |
| `ward_code` | text, null → `wards` | reverse-geocoded at creation |
| `neighbourhood` | text, null | reverse-geocoded display name |
| `mla_id` | uuid, null → `mla_constituencies` | reverse-geocoded |
| `mp_id` | uuid, null → `mp_constituencies` | reverse-geocoded |
| `status` | report_status | defaults to `open` |
| `reporter_count` | int | how many people submitted a photo here |
| `issue_upvote_count` | int | "I See This Too" tally |
| `latest_photo_url` | text | newest photo (the one shown) |
| `resolution_photo_url` | text, null | the "fixed" photo, once submitted |
| `first_reported_at` | timestamptz | when the first report landed |
| `updated_at` | timestamptz | last change |
| `resolved_at` | timestamptz, null | when it flipped to resolved (drives the 72h green window — see D-003) |

Indexes: GIST on `geom`, plus `tab` and `status`.
**Public read:** yes. **Public write:** no.

### 3.2 `report_exif` — raw GPS, kept private
Stores the original EXIF coordinates separately so they are **never** exposed publicly (PRD §5.4).

| Column | Type | Notes |
|--------|------|-------|
| `group_id` | uuid (PK) → `report_groups` | one row per group |
| `exif_lat`, `exif_lng` | double precision, null | raw EXIF GPS |

**Public read:** NO (service role only). **Public write:** no.

### 3.3 `report_photos` — every photo submitted
Photo history for a group. The latest one becomes `report_groups.latest_photo_url`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | |
| `group_id` | uuid → `report_groups` | cascade delete |
| `photo_url` | text | R2 URL |
| `submitted_at` | timestamptz | |
| `submitter_hash` | text, null | salted IP hash (D-001), private |

**Public read:** yes (photo_url is public anyway). **Public write:** no.

### 3.4 `resolution_submissions` — "this got fixed" photos
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | |
| `group_id` | uuid → `report_groups` | cascade delete |
| `photo_url` | text | the "after" photo |
| `submitted_at` | timestamptz | starts the 72h confirmation window |
| `resolution_upvote_count` | int | "Looks Fixed" tally |
| `reviewed` | boolean | set true once a moderator handles a timed-out one |
| `submitter_hash` | text, null | salted IP hash, private |

Only one active resolution per group at a time (app-enforced; a new one replaces the old and resets the window — TRD §5.1).
**Public read:** yes. **Public write:** no.

### 3.5 `resolution_upvotes` — who tapped "Looks Fixed"
Enforces **one vote per person** (D-001, D-002).

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | |
| `resolution_id` | uuid → `resolution_submissions` | cascade delete |
| `voter_hash` | text | salted IP hash |
| `created_at` | timestamptz | |

**Unique constraint:** `(resolution_id, voter_hash)` — a second vote is physically impossible.
**Public read:** no. **Public write:** no.

> **Issue upvotes ("I See This Too")** are intentionally simpler — no table. The API increments `report_groups.issue_upvote_count`, and the browser remembers (localStorage) that you already tapped, backed by the per-IP rate limit. Lower stakes, less complexity (D-001).

### 3.6 Geography / reference tables
All use `geography(MultiPolygon, 4326)` with a GIST index. Loaded once from `/public/data/*.json`. **Public read:** yes. **Public write:** no. Column names below match the **verified source files** (see §6).

| Table | Key columns | Rows |
|-------|-------------|------|
| `bmc_boundary` | `id` (single row), `geom` — the geo-fence | 1 |
| `wards` | `ward_code` (= source `name`, the letter), `gid`, `ward_name` (optional), `geom` | 24 |
| `mla_constituencies` | `ac_no`, `constituency`, `name`/`party`/`x_handle` (manual), `wikidata_qid`, `geom` | 36 |
| `mp_constituencies` | `pc_no`, `constituency`, `name`/`party`/`x_handle` (manual), `wikidata_qid`, `geom` | 6 |

> **No `neighbourhoods` table in v1** — no neighbourhood boundary dataset exists for Mumbai (verified). Surge runs at ward level via the `ward_surge_counts` function, and `report_groups.neighbourhood` is an optional display label. See `DECISIONS.md` D-004.

### 3.7 `moderator_queue` — flagged items
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | |
| `group_id` | uuid → `report_groups` | |
| `reason` | text | e.g. `resolution_timeout` |
| `created_at` | timestamptz | |
| `reviewed` | boolean | |

**Public read:** NO (service role only). Moderators use the Supabase dashboard.

### 3.8 `weekly_report_cards` — Monday summaries
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | |
| `week_start`, `week_end` | timestamptz | |
| `total_filed`, `total_resolved` | int | |
| `top_wards`, `top_sub_issues`, `surge_events` | jsonb | precomputed lists |
| `longest_open_group_id` | uuid, null | link to the oldest open issue |
| `created_at` | timestamptz | |

**Public read:** yes. **Public write:** no.

---

## 4. PostGIS Functions (RPCs)

Called from API routes via `supabase.rpc(...)`. We use the `geography` type so distances are in **metres** directly.

| Function | Args | Returns | Does |
|----------|------|---------|------|
| `is_within_bmc` | `lat`, `lng` | boolean | `ST_Covers(bmc_boundary.geom, point)` — the hard geo-fence gate |
| `find_nearby_group` | `lat`, `lng`, `tab`, `radius_metres` | uuid (group id or null) | `ST_DWithin` — finds an existing OPEN group within radius in the same tab (30m grouping) |
| `reverse_geocode` | `lat`, `lng` | record(`ward_code`, `mla_id`, `mp_id`) | runs `ST_Covers` against each boundary table |
| `ward_surge_counts` | `threshold` | rows of (`ward_code`, `recent_count`) | wards with ≥threshold report groups in the last 24h (surge, D-004) |

> Note: this corrects a small inconsistency in the TRD snippets, which mixed `ST_Contains` (geometry, degree-based) with metre-based radii. Using `geography` + `ST_Covers`/`ST_DWithin` makes distances correct in metres.

---

## 5. API Route Contracts

All under `src/app/api/`. All writes run server-side with the service role and apply `checkRateLimit` first.

| Route | Method | Body / Params | Does | Limit (per IP/hr) |
|-------|--------|---------------|------|-------------------|
| `/api/report` | POST | FormData: `photo`, `lat`, `lng`, `tab`, `subIssue` | rate-limit → geo-fence → find/create group → upload photo to R2 → reverse-geocode → upsert | 5 |
| `/api/report/[id]` | GET | path `id` | fetch one group + photos for detail page | — |
| `/api/report/resolve` | POST | FormData: `groupId`, `photo` | rate-limit → validate state → upload → create resolution_submission → status `resolution_submitted` | 3 |
| `/api/report/upvote` | POST | JSON: `groupId` or `resolutionId`, `type: 'issue' \| 'resolution'` | rate-limit → record vote (dedup by hash) → increment count → auto-resolve at 2 | 10 |
| `/api/leaderboard` | GET | query `tab: mla \| ward \| mp` | grouped open counts by jurisdiction; cached 15 min | — |
| `/api/report-card` | GET | query `week?` | latest or specified weekly card | — |
| `/api/cron/weekly` | GET | header `Authorization: Bearer CRON_SECRET` | generate weekly card + flag stale resolutions | — |

### Auto-resolve rule (D-002)
On a `resolution` upvote, after incrementing: if `resolution_upvote_count >= 2`, set the group's `status = 'resolved'` and `resolved_at = now()`. The submitter's own vote counts.

---

## 6. What still needs data before this fully works

**Verified open-data sources** (all DataMeet, CC-BY-SA — confirmed 2026-06-14):

| Target table | Source file | How to prepare it | Source property → column |
|--------------|-------------|-------------------|--------------------------|
| `wards` (24) | [`BMC_Wards.geojson`](https://github.com/datameet/Municipal_Spatial_Data/tree/master/Mumbai) | Use directly. Use the **admin** ward file (letters), NOT the 227 electoral prabhags | `name`→`ward_code`, `gid`→`gid` |
| `mp_constituencies` (6) | [`india_pc_2019_simplified.geojson`](https://github.com/datameet/maps/tree/master/parliamentary-constituencies) | Filter `st_name='Maharashtra'` + the 6 Mumbai PCs | `pc_no`→`pc_no`, `pc_name`→`constituency`, `wikidata_qid`→`wikidata_qid` |
| `mla_constituencies` (36) | [`India_AC.shp`](https://github.com/datameet/maps/tree/master/assembly-constituencies) | **Convert shapefile → GeoJSON** (mapshaper/ogr2ogr), filter Mumbai's 36. Verify boundaries (datameet notes accuracy caveats) | AC no/name → `ac_no`/`constituency` |
| `bmc_boundary` (1) | derive | Dissolve/union the 24 ward polygons into one MultiPolygon | — |

**Manual sourcing** (not in any boundary file — PRD §7.1): MLA/MP `name`, `party`, `x_handle`. The `wikidata_qid` (present in the PC file) is a useful key for looking these up.

**Not available:** neighbourhood boundaries — none exist; we use ward-level surge instead (D-004).

Until a boundary is loaded, `reverse_geocode` returns null for that field and the UI shows "Unknown" (PRD §7.2 degradation rules).
