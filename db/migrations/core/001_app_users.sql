-- アプリのユーザー。認証サービス（Neon Auth / Supabase Auth など）の ID とは分けて持つ。
-- データはすべて app_users.id に紐づけるので、認証サービスを替えても ID は変わらない。
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  auth_provider text not null,            -- 'neon' / 'supabase' など
  auth_user_id text not null,             -- 認証サービス側のユーザー ID（JWT の sub）
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (auth_provider, auth_user_id)
);
create index if not exists app_users_email_idx on app_users (lower(email));
