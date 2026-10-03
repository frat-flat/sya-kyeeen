// 台帳データの読み書き（標準 SQL）。権限は常に user_id = ログイン中のアプリユーザー で絞る。
import { db } from "./db.js";
import { bad } from "./http.js";
const PID = /^[A-Za-z0-9_-]{1,40}$/, KEY = /^\d{4}-\d{2}(-\d{2}_[a-z0-9]{1,16})?$/;
export function checkRecord(project, key){ if (!PID.test(project || "")) throw bad("プロジェクト ID が正しくありません"); if (!KEY.test(key || "")) throw bad("記録のキーが正しくありません"); }
export async function loadState(userId){
  const [s, r] = await Promise.all([
    db().query("select data from ledger_settings where user_id = $1", [userId]),
    db().query("select project_id, record_key, data from ledger_records where user_id = $1", [userId])]);
  return { settings: s.rows[0] ? s.rows[0].data : null, records: r.rows.map(x=>({ project: x.project_id, key: x.record_key, data: x.data })) };
}
export async function saveSettings(userId, data){
  if (!data || typeof data !== "object") throw bad("設定の形式が正しくありません");
  await db().query(`insert into ledger_settings (user_id, data, updated_at) values ($1, $2, now())
    on conflict (user_id) do update set data = excluded.data, updated_at = now()`, [userId, data]);
}
export async function saveRecord(userId, project, key, data){
  checkRecord(project, key);
  if (!data || typeof data !== "object") throw bad("記録の形式が正しくありません");
  await db().query(`insert into ledger_records (user_id, project_id, record_key, data, updated_at) values ($1, $2, $3, $4, now())
    on conflict (user_id, project_id, record_key) do update set data = excluded.data, updated_at = now()`, [userId, project, key, data]);
}
export async function deleteRecord(userId, project, key){
  checkRecord(project, key);
  await db().query("delete from ledger_records where user_id = $1 and project_id = $2 and record_key = $3", [userId, project, key]);
}
export async function deleteProject(userId, project){
  if (!PID.test(project || "")) throw bad("プロジェクト ID が正しくありません");
  await db().query("delete from ledger_records where user_id = $1 and project_id = $2", [userId, project]);
}
export async function importAll(userId, settings, records){
  const c = await db().connect();
  try {
    await c.query("begin");
    if (settings) await c.query(`insert into ledger_settings (user_id, data) values ($1, $2) on conflict (user_id) do update set data = excluded.data, updated_at = now()`, [userId, settings]);
    for (const r of records || []){ checkRecord(r.project, r.key);
      await c.query(`insert into ledger_records (user_id, project_id, record_key, data) values ($1, $2, $3, $4)
        on conflict (user_id, project_id, record_key) do update set data = excluded.data, updated_at = now()`, [userId, r.project, r.key, r.data]); }
    await c.query("commit");
  } catch(e){ await c.query("rollback"); throw e; } finally { c.release(); }
}
