-- Backing data for username/password auth: the actual Supabase-auth email behind
-- a username (real, if the user gave one; otherwise a synthesized address), so
-- sign-in can resolve "username -> email" via the service-role client without
-- needing a public profiles read policy.
alter table profiles add column login_email text;
