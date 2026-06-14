-- SAAF Mumbai — initial database schema
-- Companion doc: docs/BACKEND-SCHEMA.md
-- Run this in the Supabase SQL editor (or via the Supabase CLI) on a fresh project.
-- Security model: anon key = read-only public data; all writes go through API routes
-- using the service role key, which bypasses RLS.

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists postgis;
create extension if not exists "pgcrypto";   -- for gen_random_uuid()

-- ============================================================
-- Enums
-- ============================================================
create type tab_type as enum ('garbage', 'monsoon');
create type report_status as enum ('open', 'acknowledged', 'resolution_submitted', 'resolved');

-- ============================================================
-- Reference / geography tables
-- ============================================================
create table bmc_boundary (
  id   int primary key default 1,
  geom geography(MultiPolygon, 4326) not null,
  constraint single_row check (id = 1)
);

create table wards (
  id        uuid primary key default gen_random_uuid(),
  ward_code text unique not null,
  ward_name text not null,
  geom      geography(MultiPolygon, 4326) not null
);

create table mla_constituencies (
  id           uuid primary key default gen_random_uuid(),
  name         text,
  party        text,
  constituency text not null,
  x_handle     text,
  geom         geography(MultiPolygon, 4326) not null
);

create table mp_constituencies (
  id           uuid primary key default gen_random_uuid(),
  name         text,
  party        text,
  constituency text not null,
  x_handle     text,
  geom         geography(MultiPolygon, 4326) not null
);

create table neighbourhoods (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  ward_code text,
  geom      geography(MultiPolygon, 4326) not null
);

create index wards_geom_idx              on wards              using gist (geom);
create index mla_geom_idx                on mla_constituencies using gist (geom);
create index mp_geom_idx                 on mp_constituencies  using gist (geom);
create index neighbourhoods_geom_idx     on neighbourhoods     using gist (geom);

-- ============================================================
-- Core report tables
-- ============================================================
create table report_groups (
  id                   uuid primary key default gen_random_uuid(),
  tab                  tab_type not null,
  sub_issue            text,
  geom                 geography(Point, 4326) not null,
  lat                  double precision not null,
  lng                  double precision not null,
  ward_code            text references wards(ward_code),
  neighbourhood        text,
  mla_id               uuid references mla_constituencies(id),
  mp_id                uuid references mp_constituencies(id),
  status               report_status not null default 'open',
  reporter_count       int not null default 1,
  issue_upvote_count   int not null default 0,
  latest_photo_url     text not null,
  resolution_photo_url text,
  first_reported_at    timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  resolved_at          timestamptz
);

create index report_groups_geom_idx   on report_groups using gist (geom);
create index report_groups_tab_idx    on report_groups (tab);
create index report_groups_status_idx on report_groups (status);

-- Raw EXIF GPS, kept private (PRD 5.4). Separate table => never exposed by RLS.
create table report_exif (
  group_id uuid primary key references report_groups(id) on delete cascade,
  exif_lat double precision,
  exif_lng double precision
);

create table report_photos (
  id             uuid primary key default gen_random_uuid(),
  group_id       uuid not null references report_groups(id) on delete cascade,
  photo_url      text not null,
  submitted_at   timestamptz not null default now(),
  submitter_hash text
);
create index report_photos_group_idx on report_photos (group_id);

-- ============================================================
-- Resolution tables
-- ============================================================
create table resolution_submissions (
  id                       uuid primary key default gen_random_uuid(),
  group_id                 uuid not null references report_groups(id) on delete cascade,
  photo_url                text not null,
  submitted_at             timestamptz not null default now(),
  resolution_upvote_count  int not null default 0,
  reviewed                 boolean not null default false,
  submitter_hash           text
);
create index resolution_submissions_group_idx on resolution_submissions (group_id);

-- One "Looks Fixed" vote per person per resolution (D-001, D-002).
create table resolution_upvotes (
  id            uuid primary key default gen_random_uuid(),
  resolution_id uuid not null references resolution_submissions(id) on delete cascade,
  voter_hash    text not null,
  created_at    timestamptz not null default now(),
  unique (resolution_id, voter_hash)
);

-- ============================================================
-- System tables
-- ============================================================
create table moderator_queue (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid references report_groups(id) on delete cascade,
  reason     text not null,
  created_at timestamptz not null default now(),
  reviewed   boolean not null default false
);

create table weekly_report_cards (
  id                    uuid primary key default gen_random_uuid(),
  week_start            timestamptz not null,
  week_end              timestamptz not null,
  total_filed           int not null default 0,
  total_resolved        int not null default 0,
  top_wards             jsonb,
  top_sub_issues        jsonb,
  surge_events          jsonb,
  longest_open_group_id uuid references report_groups(id),
  created_at            timestamptz not null default now()
);

-- ============================================================
-- PostGIS functions (called via supabase.rpc())
-- ============================================================

-- Hard geo-fence gate: is this point inside the BMC boundary?
create or replace function is_within_bmc(lat double precision, lng double precision)
returns boolean
language sql stable
as $$
  select exists (
    select 1 from bmc_boundary
    where ST_Covers(geom, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography)
  );
$$;

-- 30m grouping: find an existing OPEN group within radius in the same tab.
create or replace function find_nearby_group(
  lat double precision,
  lng double precision,
  p_tab tab_type,
  radius_metres double precision
)
returns uuid
language sql stable
as $$
  select id
  from report_groups
  where tab = p_tab
    and status <> 'resolved'
    and ST_DWithin(
      geom,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_metres
    )
  order by ST_Distance(geom, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography)
  limit 1;
$$;

-- Reverse geocode a point into ward / neighbourhood / MLA / MP.
create or replace function reverse_geocode(lat double precision, lng double precision)
returns table (ward_code text, neighbourhood text, mla_id uuid, mp_id uuid)
language sql stable
as $$
  with pt as (
    select ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography as g
  )
  select
    (select w.ward_code from wards w, pt where ST_Covers(w.geom, pt.g) limit 1),
    (select n.name      from neighbourhoods n, pt where ST_Covers(n.geom, pt.g) limit 1),
    (select m.id        from mla_constituencies m, pt where ST_Covers(m.geom, pt.g) limit 1),
    (select p.id        from mp_constituencies p, pt where ST_Covers(p.geom, pt.g) limit 1);
$$;

-- ============================================================
-- Row Level Security
-- Enable on every table. Public (anon) gets SELECT only on public data.
-- Writes happen via the service role, which bypasses RLS entirely.
-- Tables with NO policy below are invisible to anon (service role only).
-- ============================================================
alter table bmc_boundary           enable row level security;
alter table wards                  enable row level security;
alter table mla_constituencies     enable row level security;
alter table mp_constituencies      enable row level security;
alter table neighbourhoods         enable row level security;
alter table report_groups          enable row level security;
alter table report_exif            enable row level security;  -- no policy => private
alter table report_photos          enable row level security;
alter table resolution_submissions enable row level security;
alter table resolution_upvotes     enable row level security;  -- no policy => private
alter table moderator_queue        enable row level security;  -- no policy => private
alter table weekly_report_cards    enable row level security;

-- Public read policies
create policy public_read on bmc_boundary           for select using (true);
create policy public_read on wards                  for select using (true);
create policy public_read on mla_constituencies     for select using (true);
create policy public_read on mp_constituencies      for select using (true);
create policy public_read on neighbourhoods         for select using (true);
create policy public_read on report_groups          for select using (true);
create policy public_read on report_photos          for select using (true);
create policy public_read on resolution_submissions for select using (true);
create policy public_read on weekly_report_cards    for select using (true);

-- Note: report_exif, resolution_upvotes, and moderator_queue have RLS enabled
-- but NO policy, so the anon key cannot read or write them at all. Only the
-- service role (used in server-side API routes) can touch them.
