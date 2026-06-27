-- SAAF Mumbai — weekly cron support functions. Run after 0005.
-- Called only by the cron route (service role).

-- Build and store the weekly report card for the last 7 days (PRD §4.10).
create or replace function generate_weekly_report_card()
returns uuid
language plpgsql
as $$
declare
  v_start timestamptz := now() - interval '7 days';
  v_filed int;
  v_resolved int;
  v_top_wards jsonb;
  v_top_issues jsonb;
  v_longest uuid;
  v_id uuid;
begin
  select count(*) into v_filed from report_groups where first_reported_at >= v_start;
  select count(*) into v_resolved from report_groups where resolved_at >= v_start;

  select coalesce(jsonb_agg(t), '[]'::jsonb) into v_top_wards from (
    select ward_code, count(*) as count
    from report_groups
    where status <> 'resolved' and ward_code is not null
    group by ward_code order by count desc limit 3
  ) t;

  select coalesce(jsonb_agg(t), '[]'::jsonb) into v_top_issues from (
    select sub_issue, count(*) as count
    from report_groups
    where sub_issue is not null
    group by sub_issue order by count desc limit 3
  ) t;

  select id into v_longest
  from report_groups
  where status <> 'resolved'
  order by first_reported_at asc limit 1;

  insert into weekly_report_cards (
    week_start, week_end, total_filed, total_resolved,
    top_wards, top_sub_issues, surge_events, longest_open_group_id
  ) values (
    v_start, now(), v_filed, v_resolved,
    v_top_wards, v_top_issues, '[]'::jsonb, v_longest
  ) returning id into v_id;

  return v_id;
end;
$$;

-- Flag resolutions that timed out (>72h, <2 upvotes) for moderator review.
create or replace function flag_stale_resolutions()
returns int
language plpgsql
as $$
declare v_count int;
begin
  insert into moderator_queue (group_id, reason)
  select group_id, 'resolution_timeout'
  from resolution_submissions
  where reviewed = false
    and resolution_upvote_count < 2
    and submitted_at < now() - interval '72 hours';

  update resolution_submissions set reviewed = true
  where reviewed = false
    and resolution_upvote_count < 2
    and submitted_at < now() - interval '72 hours';
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute on function generate_weekly_report_card() from anon, authenticated;
revoke execute on function flag_stale_resolutions() from anon, authenticated;
