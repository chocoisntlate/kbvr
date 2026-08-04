-- Public save counts (visible on browse cards), independent of any one
-- row's own jsonb `data` — derived from saved_diagrams/saved_layouts, so it
-- can't be a `generated always as` column like shortcut_count/row_count/
-- key_count (0006_post_list_counts.sql), which only read the same row.
-- save_count reflects the CURRENT number of savers (decrements on unsave),
-- not a lifetime/cumulative counter.

alter table diagrams add column save_count integer not null default 0;
alter table layouts add column save_count integer not null default 0;

update diagrams d
  set save_count = (
    select count(*) from saved_diagrams s where s.diagram_id = d.id
  );

update layouts l
  set save_count = (
    select count(*) from saved_layouts s where s.layout_id = l.id
  );

-- security definer: a save/unsave is performed by the saver, not the
-- post's owner, so the trigger must update diagrams/layouts rows the
-- caller doesn't own (RLS on those tables only allows
-- owner_id = auth.uid() updates, see 0001_posts_schema.sql). Running as
-- the function's owning role bypasses that, which is what's needed here.
create function sync_diagram_save_count() returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update diagrams set save_count = save_count + 1 where id = new.diagram_id;
  elsif tg_op = 'DELETE' then
    update diagrams set save_count = save_count - 1 where id = old.diagram_id;
  elsif tg_op = 'UPDATE' and new.diagram_id <> old.diagram_id then
    update diagrams set save_count = save_count - 1 where id = old.diagram_id;
    update diagrams set save_count = save_count + 1 where id = new.diagram_id;
  end if;
  return null;
end;
$$;

create trigger saved_diagrams_sync_count
  after insert or update or delete on saved_diagrams
  for each row execute function sync_diagram_save_count();

create function sync_layout_save_count() returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update layouts set save_count = save_count + 1 where id = new.layout_id;
  elsif tg_op = 'DELETE' then
    update layouts set save_count = save_count - 1 where id = old.layout_id;
  elsif tg_op = 'UPDATE' and new.layout_id <> old.layout_id then
    update layouts set save_count = save_count - 1 where id = old.layout_id;
    update layouts set save_count = save_count + 1 where id = new.layout_id;
  end if;
  return null;
end;
$$;

create trigger saved_layouts_sync_count
  after insert or update or delete on saved_layouts
  for each row execute function sync_layout_save_count();
