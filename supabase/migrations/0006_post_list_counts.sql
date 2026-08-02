-- Generated columns for browse/library list cards, so listing queries can
-- select these instead of the full `data` jsonb (see name/description in
-- 0001_posts_schema.sql for the same pattern).

alter table diagrams
  add column shortcut_count integer generated always as (
    jsonb_array_length(data -> 'shortcuts')
  ) stored;

alter table layouts
  add column row_count integer generated always as (
    jsonb_array_length(data -> 'rows')
  ) stored;

alter table layouts
  add column key_count integer generated always as (
    jsonb_array_length(
      jsonb_path_query_array(data, '$.rows[*][*] ? (@.id != null)')
    )
  ) stored;
