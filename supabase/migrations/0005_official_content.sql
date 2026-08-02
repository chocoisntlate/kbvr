-- Marks posts published by the official account (see OFFICIAL_ACCOUNT_EMAIL /
-- isOfficialAccount in features/posts/actions.ts). Only ever set server-side
-- after checking the caller's identity, never accepted as client input.
alter table diagrams add column is_official boolean not null default false;
alter table layouts add column is_official boolean not null default false;
