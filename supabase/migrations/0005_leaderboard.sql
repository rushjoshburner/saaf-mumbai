-- SAAF Mumbai — leaderboard aggregation. Run after 0004.
-- Ranks jurisdictions by count of OPEN report groups, tie-broken by total issue
-- upvotes (PRD §4.7.3). LEFT JOINs so every jurisdiction appears, even with 0.
-- Read-only over public data, so these stay callable by the anon role.

create or replace function leaderboard_mla()
returns table (
  id uuid, name text, party text, constituency text, x_handle text,
  open_count bigint, issue_upvotes bigint, oldest_open timestamptz
)
language sql stable
as $$
  select m.id, m.name, m.party, m.constituency, m.x_handle,
         count(g.id) as open_count,
         coalesce(sum(g.issue_upvote_count), 0) as issue_upvotes,
         min(g.first_reported_at) as oldest_open
  from mla_constituencies m
  left join report_groups g on g.mla_id = m.id and g.status <> 'resolved'
  group by m.id
  order by open_count desc, issue_upvotes desc;
$$;

create or replace function leaderboard_mp()
returns table (
  id uuid, name text, party text, constituency text, x_handle text,
  open_count bigint, issue_upvotes bigint, oldest_open timestamptz
)
language sql stable
as $$
  select p.id, p.name, p.party, p.constituency, p.x_handle,
         count(g.id) as open_count,
         coalesce(sum(g.issue_upvote_count), 0) as issue_upvotes,
         min(g.first_reported_at) as oldest_open
  from mp_constituencies p
  left join report_groups g on g.mp_id = p.id and g.status <> 'resolved'
  group by p.id
  order by open_count desc, issue_upvotes desc;
$$;

create or replace function leaderboard_ward()
returns table (
  ward_code text, ward_name text,
  open_count bigint, issue_upvotes bigint, oldest_open timestamptz
)
language sql stable
as $$
  select w.ward_code, w.ward_name,
         count(g.id) as open_count,
         coalesce(sum(g.issue_upvote_count), 0) as issue_upvotes,
         min(g.first_reported_at) as oldest_open
  from wards w
  left join report_groups g on g.ward_code = w.ward_code and g.status <> 'resolved'
  group by w.ward_code, w.ward_name
  order by open_count desc, issue_upvotes desc;
$$;
