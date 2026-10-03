-- 台帳のデータ。標準 PostgreSQL だけで書く（Provider 固有の関数・スキーマは使わない）。
-- ledger_settings.data = { accounts, projects[] }（口座とプロジェクト一覧）
create table if not exists ledger_settings (
  user_id uuid primary key references app_users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 1行 = 1件の取引（record_key = 支払日_識別子、例 2026-10-03_k3x9a）または 1か月分（2026-10）
create table if not exists ledger_records (
  user_id uuid not null references app_users(id) on delete cascade,
  project_id text not null check (project_id ~ '^[A-Za-z0-9_-]{1,40}$'),
  record_key text not null check (record_key ~ '^\d{4}-\d{2}(-\d{2}_[a-z0-9]{1,16})?$'),
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, project_id, record_key)
);
