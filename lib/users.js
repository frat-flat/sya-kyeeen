// 認証サービスの ID → アプリのユーザー（app_users.id）へ変換する。
// 初めて見る ID なら作る。別の認証サービスから移ってきた人は、確認済みメールアドレスが一致する場合だけ引き継ぐ。
import { db } from "./db.js";
export async function appUser(identity){
  const q = db();
  const found = await q.query("select id from app_users where auth_provider = $1 and auth_user_id = $2", [identity.provider, identity.authUserId]);
  if (found.rows[0]) return found.rows[0].id;
  if (identity.email && identity.emailVerified){
    const moved = await q.query(
      `update app_users set auth_provider = $1, auth_user_id = $2, updated_at = now()
        where id = (select id from app_users where lower(email) = lower($3) and auth_provider <> $1 order by created_at limit 1)
        returning id`, [identity.provider, identity.authUserId, identity.email]);
    if (moved.rows[0]) return moved.rows[0].id;
  }
  const made = await q.query(
    `insert into app_users (auth_provider, auth_user_id, email) values ($1, $2, $3)
     on conflict (auth_provider, auth_user_id) do update set email = excluded.email returning id`,
    [identity.provider, identity.authUserId, identity.email]);
  return made.rows[0].id;
}
