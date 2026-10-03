// 使い方：DATABASE_URL=... DB_PROVIDER=neon node db/migrate.mjs
// core/ を番号順に流したあと、DB_PROVIDER のフォルダ（neon / supabase）を流す。適用済みは schema_migrations に記録。
import fs from "node:fs"; import path from "node:path"; import pg from "pg";
const dir = path.dirname(new URL(import.meta.url).pathname) + "/migrations";
const provider = process.env.DB_PROVIDER || "neon";
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query("create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())");
const done = new Set((await client.query("select name from schema_migrations")).rows.map(r=>r.name));
for (const folder of ["core", provider]){
  for (const f of fs.readdirSync(path.join(dir, folder)).filter(f=>f.endsWith(".sql")).sort()){
    const name = `${folder}/${f}`; if (done.has(name)) continue;
    await client.query("begin");
    try { await client.query(fs.readFileSync(path.join(dir, folder, f), "utf8")); await client.query("insert into schema_migrations(name) values($1)", [name]); await client.query("commit"); console.log("applied", name); }
    catch(e){ await client.query("rollback"); console.error("failed", name, e.message); process.exit(1); }
  }
}
await client.end();
