-- Supabase へ戻すとき用：/api 経由の構成なら、ブラウザ用ロール（anon / authenticated）からは触れないようにするだけでよい。
-- （auth.uid() を使う RLS は不要。権限は /api で app_users.id に絞っている）
revoke all on app_users, ledger_settings, ledger_records from anon, authenticated;
alter table app_users enable row level security;
alter table ledger_settings enable row level security;
alter table ledger_records enable row level security;
