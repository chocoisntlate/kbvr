-- Diagrams, layouts, saves ("Saved", never "favorites"), and per-user default layout.
-- Content (`data`) is validated app-side against DiagramSchema/LayoutSchema before writes;
-- this migration only wraps that content with ownership, visibility, and search metadata.

create extension if not exists pg_trgm;

create table diagrams (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  owner_display_name text,
  data jsonb not null,
  name text generated always as (data ->> 'name') stored,
  description text generated always as (data ->> 'description') stored,
  is_public boolean not null default true,
  forked_from_id uuid references diagrams (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table layouts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  owner_display_name text,
  data jsonb not null,
  name text generated always as (data ->> 'name') stored,
  description text generated always as (data ->> 'description') stored,
  is_public boolean not null default true,
  forked_from_id uuid references layouts (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table saved_diagrams (
  user_id uuid not null references auth.users (id) on delete cascade,
  diagram_id uuid not null references diagrams (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, diagram_id)
);

create table saved_layouts (
  user_id uuid not null references auth.users (id) on delete cascade,
  layout_id uuid not null references layouts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, layout_id)
);

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  default_layout_id uuid references layouts (id) on delete set null,
  created_at timestamptz not null default now()
);

create index diagrams_name_trgm_idx on diagrams using gin (name gin_trgm_ops);
create index diagrams_description_trgm_idx on diagrams using gin (description gin_trgm_ops);
create index layouts_name_trgm_idx on layouts using gin (name gin_trgm_ops);
create index layouts_description_trgm_idx on layouts using gin (description gin_trgm_ops);

create index diagrams_owner_id_idx on diagrams (owner_id);
create index layouts_owner_id_idx on layouts (owner_id);
create index saved_diagrams_diagram_id_idx on saved_diagrams (diagram_id);
create index saved_layouts_layout_id_idx on saved_layouts (layout_id);

alter table diagrams enable row level security;
alter table layouts enable row level security;
alter table saved_diagrams enable row level security;
alter table saved_layouts enable row level security;
alter table profiles enable row level security;

create policy "Public or own diagrams are visible" on diagrams
  for select using (is_public or owner_id = auth.uid());
create policy "Users insert their own diagrams" on diagrams
  for insert with check (owner_id = auth.uid());
create policy "Users update their own diagrams" on diagrams
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Users delete their own diagrams" on diagrams
  for delete using (owner_id = auth.uid());

create policy "Public or own layouts are visible" on layouts
  for select using (is_public or owner_id = auth.uid());
create policy "Users insert their own layouts" on layouts
  for insert with check (owner_id = auth.uid());
create policy "Users update their own layouts" on layouts
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Users delete their own layouts" on layouts
  for delete using (owner_id = auth.uid());

create policy "Users manage their own saved diagrams" on saved_diagrams
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users manage their own saved layouts" on saved_layouts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users manage their own profile" on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());
