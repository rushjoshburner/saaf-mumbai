# Decision Log

Records product/technical decisions that change or clarify the PRD/TRD. Newest first. Each entry says what changed, why, and which document section it supersedes. These are authoritative until folded into a future PRD/TRD revision.

---

### D-004 — Surge detection at ward level; no neighbourhood boundaries in v1
**Date:** 2026-06-14
**Supersedes/clarifies:** PRD §4.6 (surge defined per-neighbourhood) and §7.1 (neighbourhoods.json dependency)

Research into the actual open data found **no official or reliable neighbourhood-boundary dataset for Mumbai** (only ward, pincode, and slum-cluster layers exist publicly). Therefore in v1:
- **Surge detection runs at WARD level** (5+ report groups in a ward within 24h) using the verified BMC ward boundaries, instead of per-neighbourhood.
- The `neighbourhoods` table is **dropped**. `report_groups.neighbourhood` remains as an optional free-text display label that can be filled later via OSM reverse-geocoding (free) or left null → shown as "Unknown".

**Verified data sources** (DataMeet, CC-BY-SA):
- Wards (24): `BMC_Wards.geojson` — `properties.name` = ward letter, `properties.gid` = id
- MP constituencies (6): `india_pc_2019_simplified.geojson` — filter `st_name='Maharashtra'` + Mumbai PCs; fields `pc_no`, `pc_name`, `wikidata_qid`
- MLA constituencies (36): `India_AC.shp` — **shapefile, must convert to GeoJSON** and filter Mumbai; datameet notes accuracy caveats (verify Maharashtra)
- BMC outer boundary: derive by dissolving the ward polygons (no separate file)
- MLA/MP **names, parties, X handles**: not in any boundary file — manual sourcing (PRD §7.1)

**Why:** Build against data that actually exists rather than a dataset that doesn't. Ward-level surge is meaningful and uses verified boundaries.

---

### D-003 — Resolved pins stay visible (green) for 72 hours
**Date:** 2026-06-14
**Supersedes:** PRD §4.2.2 (which hid resolved pins immediately, behind a toggle)

When a report becomes **Resolved**, its pin turns green and **remains on the map for 72 hours** so the community can see the win. After 72 hours it leaves the active map but stays accessible in the weekly report card and behind the "show resolved" toggle.

**Why:** Showing fixed issues is more motivating and tells the accountability story better than hiding them instantly.

---

### D-002 — The resolution submitter may also cast a "Looks Fixed" vote
**Date:** 2026-06-14
**Supersedes:** PRD §4.4.3 and TRD §5.2 (which barred the submitter from counting as one of the 2 upvotes)

The person who uploads the "fixed" photo is allowed to also tap "Looks Fixed." So a resolution needs **the uploader + 1 other person (2 total votes)** to flip to Resolved.

**Why:** Reduces complexity for the early release. Self-upvoting is a normal, low-harm pattern (cf. Reddit). The PRD already rates resolution-gaming as *low likelihood*, and the public before/after photo is the safety net.

---

### D-001 — Light abuse prevention for v1
**Date:** 2026-06-14
**Clarifies:** PRD §5.5 (Moderation), TRD §6 (Rate Limiting)

For the early release we deliberately keep anti-abuse light:
- **One vote per person** is enforced per report (issue upvotes) and per resolution (resolution upvotes).
- A visitor is recognised using a **salted, one-way hash of their IP** — we never store the raw IP, so reports stay anonymous (honours PRD §5.4) while still preventing trivial double-voting.
- The existing per-IP-per-hour rate limits (TRD §6) handle flooding.
- No collusion detection, no submitter-blocking, no CAPTCHA in v1.

**Why:** Strong abuse rules add complexity and friction. We ship simple and revisit only if real abuse appears.
