-- Neon 用：データは Vercel の /api（DATABASE_URL の所有ロール）からだけ読み書きする。
-- Neon Data API は使わないので、ほかのロールからは触れないようにしておく。
revoke all on app_users, ledger_settings, ledger_records from public;
