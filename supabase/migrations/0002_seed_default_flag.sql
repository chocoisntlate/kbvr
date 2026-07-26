-- Marks the single canonical starter layout that new users are auto-seeded
-- with (see scripts/seedDefaults.ts and ensureDefaultLayoutSeeded()).

alter table layouts add column is_seed_default boolean not null default false;

create unique index layouts_single_seed_default_idx
  on layouts (is_seed_default) where is_seed_default;
