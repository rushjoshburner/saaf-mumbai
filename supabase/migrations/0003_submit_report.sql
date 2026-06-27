-- SAAF Mumbai — atomic report submission. Run in the Supabase SQL editor after 0002.
-- Builds the PostGIS point, applies the 30m grouping rule, and records the photo,
-- all in one transaction. Called only by the server (service role) from /api/report.

create or replace function submit_report(
  p_tab        tab_type,
  p_sub_issue  text,
  p_lat        double precision,
  p_lng        double precision,
  p_ward_code  text,
  p_mla_id     uuid,
  p_mp_id      uuid,
  p_photo_url  text,
  p_exif_lat   double precision default null,
  p_exif_lng   double precision default null
) returns uuid
language plpgsql
as $$
declare
  v_group_id uuid;
  v_pt geography := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;
begin
  -- Join an existing OPEN group within 30m in the same tab, if one exists.
  select id into v_group_id
  from report_groups
  where tab = p_tab
    and status <> 'resolved'
    and ST_DWithin(geom, v_pt, 30)
  order by ST_Distance(geom, v_pt)
  limit 1;

  if v_group_id is null then
    -- No nearby group: create a new pin.
    v_group_id := gen_random_uuid();
    insert into report_groups (
      id, tab, sub_issue, geom, lat, lng,
      ward_code, mla_id, mp_id, status, reporter_count, latest_photo_url
    ) values (
      v_group_id, p_tab, p_sub_issue, v_pt, p_lat, p_lng,
      p_ward_code, p_mla_id, p_mp_id, 'open', 1, p_photo_url
    );

    if p_exif_lat is not null and p_exif_lng is not null then
      insert into report_exif (group_id, exif_lat, exif_lng)
      values (v_group_id, p_exif_lat, p_exif_lng);
    end if;
  else
    -- Existing group: another reporter, newest photo becomes the displayed one.
    update report_groups
    set reporter_count = reporter_count + 1,
        latest_photo_url = p_photo_url,
        updated_at = now()
    where id = v_group_id;
  end if;

  -- Always record the individual photo in the group's history.
  insert into report_photos (group_id, photo_url) values (v_group_id, p_photo_url);

  return v_group_id;
end;
$$;

-- Server-only: the route calls this with the service role.
revoke execute on function submit_report(
  tab_type, text, double precision, double precision, text, uuid, uuid, text, double precision, double precision
) from anon, authenticated;
