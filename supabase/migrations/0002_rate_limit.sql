-- SAAF Mumbai — rate limiting in Postgres (replaces Vercel KV; see DECISIONS.md D-005)
-- Run this in the Supabase SQL editor after 0001.

-- One row per request, keyed by action + salted IP hash.
create table rate_limit_hits (
  id         bigserial primary key,
  action     text not null,          -- 'report' | 'resolve' | 'upvote'
  ident      text not null,          -- salted IP hash (never the raw IP)
  created_at timestamptz not null default now()
);
create index rate_limit_hits_lookup_idx on rate_limit_hits (action, ident, created_at);

-- Private: only the service role (server-side API routes) touches this.
alter table rate_limit_hits enable row level security;  -- no policy => no anon access

-- Atomically check + record a hit. Returns true if allowed, false if over limit.
create or replace function check_rate_limit(
  p_action text,
  p_ident text,
  p_limit int,
  p_window_seconds int
) returns boolean
language plpgsql
as $$
declare
  recent int;
begin
  select count(*) into recent
  from rate_limit_hits
  where action = p_action
    and ident = p_ident
    and created_at > now() - make_interval(secs => p_window_seconds);

  if recent >= p_limit then
    return false;  -- over the limit, block
  end if;

  insert into rate_limit_hits (action, ident) values (p_action, p_ident);
  return true;     -- allowed
end;
$$;

-- Only the server (service role) may call this; keep anon out.
revoke execute on function check_rate_limit(text, text, int, int) from anon, authenticated;

-- Housekeeping: drop rows older than a day so the table stays small.
-- (Call from the weekly cron, or run manually.)
create or replace function prune_rate_limit_hits()
returns void
language sql
as $$
  delete from rate_limit_hits where created_at < now() - interval '1 day';
$$;
