-- Unique, user-chosen display name. Nullable so existing profile rows
-- aren't broken by this migration — the app-level DisplayNameGate is what
-- actually enforces "every account picks one," on next sign-in.

alter table profiles add column display_name text
  check (char_length(display_name) between 1 and 30);

create unique index profiles_display_name_lower_idx
  on profiles (lower(display_name));
