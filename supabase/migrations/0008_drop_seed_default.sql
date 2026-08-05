-- Removes the admin-account-gated "starter layout" mechanism. New users
-- without a personal default now just fall back to the bundled example
-- layout client-side (see features/keyboard/KeyboardContext.tsx).

drop index if exists layouts_single_seed_default_idx;
alter table layouts drop column if exists is_seed_default;
