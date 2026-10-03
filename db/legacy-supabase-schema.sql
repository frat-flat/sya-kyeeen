-- 返済・補填台帳のテーブル。各行はログインした本人だけが読み書きできる。
-- ledger_settings.data に口座とプロジェクト一覧（誰の・何の返済か）を持ち、ledger_months はプロジェクトごとの月次記録。
create table if not exists public.ledger_settings (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.ledger_months (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id text not null default 'main' check (project_id ~ '^[A-Za-z0-9_-]{1,40}$'),
  month text not null check (month ~ '^\d{4}-\d{2}(-\d{2}_[a-z0-9]{1,16})?$'), -- 月（2026-10）または取引（2026-10-03_k3x9a）
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, project_id, month)
);

alter table public.ledger_settings enable row level security;
alter table public.ledger_months enable row level security;

create policy "own settings select" on public.ledger_settings for select to authenticated using (user_id = (select auth.uid()));
create policy "own settings insert" on public.ledger_settings for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own settings update" on public.ledger_settings for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own settings delete" on public.ledger_settings for delete to authenticated using (user_id = (select auth.uid()));

create policy "own months select" on public.ledger_months for select to authenticated using (user_id = (select auth.uid()));
create policy "own months insert" on public.ledger_months for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own months update" on public.ledger_months for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own months delete" on public.ledger_months for delete to authenticated using (user_id = (select auth.uid()));

revoke all on public.ledger_settings, public.ledger_months from anon;
grant select, insert, update, delete on public.ledger_settings, public.ledger_months to authenticated;
