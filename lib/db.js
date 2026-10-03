// DB 接続。標準 PostgreSQL（pg）だけを使う。接続先は DATABASE_URL で切り替える（Neon / Supabase どちらでも同じコード）。
import pg from "pg";
let pool;
export function db(){
  if (!pool){
    if (!process.env.DATABASE_URL) throw Object.assign(new Error("DATABASE_URL が設定されていません"), { status: 500 });
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  }
  return pool;
}
