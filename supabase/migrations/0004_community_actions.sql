-- SAAF Mumbai — community actions (upvotes + resolutions). Run after 0003.
-- All functions are service-role only (called from API routes).

-- "I See This Too" — bump the issue upvote count. Returns the new count
-- (null if the group does not exist). Dedup is client-side (localStorage) +
-- the per-IP rate limit; no table, by design (DECISIONS.md D-001).
create or replace function increment_issue_upvote(p_group_id uuid)
returns int
language plpgsql
as $$
declare v int;
begin
  update report_groups
  set issue_upvote_count = issue_upvote_count + 1
  where id = p_group_id
  returning issue_upvote_count into v;
  return v;
end;
$$;

-- "Looks Fixed" — record one resolution upvote per person, then auto-resolve at 2.
-- Returns: 'duplicate' | 'not_found' | 'counted' | 'resolved'.
create or replace function cast_resolution_upvote(p_resolution_id uuid, p_voter_hash text)
returns text
language plpgsql
as $$
declare
  v_group uuid;
  v_count int;
begin
  begin
    insert into resolution_upvotes (resolution_id, voter_hash)
    values (p_resolution_id, p_voter_hash);
  exception when unique_violation then
    return 'duplicate';   -- one vote per person
  end;

  update resolution_submissions
  set resolution_upvote_count = resolution_upvote_count + 1
  where id = p_resolution_id
  returning group_id, resolution_upvote_count into v_group, v_count;

  if v_group is null then
    return 'not_found';
  end if;

  -- 2 confirmations (the submitter may be one of them, D-002) => resolved.
  if v_count >= 2 then
    update report_groups
    set status = 'resolved', resolved_at = now()
    where id = v_group and status <> 'resolved';
    return 'resolved';
  end if;

  return 'counted';
end;
$$;

-- Submit a "this is fixed" photo. Replaces any pending resolution (resets the
-- 72h window). Returns the new resolution id, or null if the group is missing
-- or already resolved.
create or replace function submit_resolution(
  p_group_id uuid,
  p_photo_url text,
  p_submitter_hash text
) returns uuid
language plpgsql
as $$
declare
  v_status report_status;
  v_res_id uuid;
begin
  select status into v_status from report_groups where id = p_group_id;
  if v_status is null or v_status = 'resolved' then
    return null;
  end if;

  insert into resolution_submissions (group_id, photo_url, submitter_hash)
  values (p_group_id, p_photo_url, p_submitter_hash)
  returning id into v_res_id;

  update report_groups
  set status = 'resolution_submitted',
      resolution_photo_url = p_photo_url,
      updated_at = now()
  where id = p_group_id;

  return v_res_id;
end;
$$;

revoke execute on function increment_issue_upvote(uuid) from anon, authenticated;
revoke execute on function cast_resolution_upvote(uuid, text) from anon, authenticated;
revoke execute on function submit_resolution(uuid, text, text) from anon, authenticated;
