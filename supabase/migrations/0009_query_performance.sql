-- Read-path performance. Three independent changes, none of which alter what
-- any caller is allowed to see:
--   a) RLS policies rewritten so auth.uid() is evaluated once per query
--      instead of once per row, and split so each branch can use an index.
--   b) Indexes matching the query shapes in features/posts/queries.ts.
--   c) public_display_names(), replacing a two-table scan deduped in JS.

/* ---------- a) RLS ---------- */

-- Bare auth.uid() is STABLE, not IMMUTABLE, so Postgres re-evaluates it for
-- every candidate row. Wrapping it in a scalar subquery makes it an InitPlan
-- evaluated exactly once. Splitting the old
-- `is_public or owner_id = auth.uid()` SELECT policy into two permissive
-- policies is equivalent (permissive policies OR together) but lets the
-- planner choose an index per branch instead of being stuck with the OR.

drop policy "Public or own diagrams are visible" on diagrams;
create policy "Public diagrams are visible" on diagrams
  for select to anon, authenticated using (is_public);
create policy "Own diagrams are visible" on diagrams
  for select to authenticated using (owner_id = (select auth.uid()));

drop policy "Users insert their own diagrams" on diagrams;
create policy "Users insert their own diagrams" on diagrams
  for insert to authenticated with check (owner_id = (select auth.uid()));

drop policy "Users update their own diagrams" on diagrams;
create policy "Users update their own diagrams" on diagrams
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy "Users delete their own diagrams" on diagrams;
create policy "Users delete their own diagrams" on diagrams
  for delete to authenticated using (owner_id = (select auth.uid()));

drop policy "Public or own layouts are visible" on layouts;
create policy "Public layouts are visible" on layouts
  for select to anon, authenticated using (is_public);
create policy "Own layouts are visible" on layouts
  for select to authenticated using (owner_id = (select auth.uid()));

drop policy "Users insert their own layouts" on layouts;
create policy "Users insert their own layouts" on layouts
  for insert to authenticated with check (owner_id = (select auth.uid()));

drop policy "Users update their own layouts" on layouts;
create policy "Users update their own layouts" on layouts
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy "Users delete their own layouts" on layouts;
create policy "Users delete their own layouts" on layouts
  for delete to authenticated using (owner_id = (select auth.uid()));

-- `to authenticated` on the remaining tables so the predicate is not even
-- considered for anonymous requests; they have no rows here by definition.

drop policy "Users manage their own saved diagrams" on saved_diagrams;
create policy "Users manage their own saved diagrams" on saved_diagrams
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy "Users manage their own saved layouts" on saved_layouts;
create policy "Users manage their own saved layouts" on saved_layouts
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy "Users manage their own profile" on profiles;
create policy "Users manage their own profile" on profiles
  for all to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

/* ---------- b) Indexes ---------- */

-- Browse (searchPosts) and the public profile page both run
-- `where is_public order by created_at desc limit 21`. A partial index
-- ordered the same way serves the filter and the sort together.
create index diagrams_public_created_at_idx
  on diagrams (created_at desc) where is_public;
create index layouts_public_created_at_idx
  on layouts (created_at desc) where is_public;

-- Library and account: `where owner_id = $1 order by updated_at desc`.
-- These supersede the owner_id-only indexes from 0001, which are now just a
-- redundant prefix.
create index diagrams_owner_updated_at_idx
  on diagrams (owner_id, updated_at desc);
create index layouts_owner_updated_at_idx
  on layouts (owner_id, updated_at desc);
drop index diagrams_owner_id_idx;
drop index layouts_owner_id_idx;

-- Unindexed foreign keys: `on delete set null` makes every delete of a post
-- (or layout) scan the whole referencing table looking for children.
create index diagrams_forked_from_id_idx on diagrams (forked_from_id);
create index layouts_forked_from_id_idx on layouts (forked_from_id);
create index profiles_default_layout_id_idx on profiles (default_layout_id);

-- profiles_display_name_lower_idx (0003) is a btree on lower(display_name);
-- a bare ILIKE cannot use an expression index, so these lookups seq-scan
-- today. Keep that index for its uniqueness constraint and add trgm indexes
-- for the reads.
create index profiles_display_name_trgm_idx
  on profiles using gin (display_name gin_trgm_ops);
create index profiles_login_email_trgm_idx
  on profiles using gin (login_email gin_trgm_ops);
create index diagrams_owner_display_name_trgm_idx
  on diagrams using gin (owner_display_name gin_trgm_ops);
create index layouts_owner_display_name_trgm_idx
  on layouts using gin (owner_display_name gin_trgm_ops);

/* ---------- c) public_display_names() ---------- */

-- Feeds app/sitemap.ts, which previously transferred every public row from
-- both tables and deduped them in JS on each request.
create function public_display_names() returns setof text
  language sql
  stable
  security invoker
  set search_path = public
as $$
  select owner_display_name from diagrams
    where is_public and owner_display_name is not null
  union
  select owner_display_name from layouts
    where is_public and owner_display_name is not null;
$$;
