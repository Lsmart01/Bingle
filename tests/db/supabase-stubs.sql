-- The parts of a Supabase database that Bink's migrations rely on, recreated
-- for tests run in PGlite (an in-memory Postgres). Not used on Supabase itself,
-- which already has all of this.

create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;

grant usage on schema public to anon, authenticated, service_role;

-- Supabase gives these roles full table and function privileges in public by
-- default; RLS policies and explicit revokes are what restrict them.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

create schema auth;
grant usage on schema auth to anon, authenticated, service_role;

create table auth.users (
  instance_id        uuid,
  id                 uuid primary key,
  aud                text,
  role               text,
  email              text unique,
  encrypted_password text,
  email_confirmed_at timestamptz,
  raw_app_meta_data  jsonb,
  raw_user_meta_data jsonb,
  confirmation_token text,
  recovery_token     text,
  email_change_token_new text,
  email_change       text,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- Same as Supabase: the user id comes from the request's JWT claims.
create function auth.uid() returns uuid language sql stable as $$
  select nullif(
    coalesce(current_setting('request.jwt.claim.sub', true),
             (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')),
    '')::uuid;
$$;

create function auth.role() returns text language sql stable as $$
  select coalesce(current_setting('request.jwt.claim.role', true),
                  (current_setting('request.jwt.claims', true)::jsonb ->> 'role'));
$$;

grant execute on function auth.uid(), auth.role() to anon, authenticated, service_role;
