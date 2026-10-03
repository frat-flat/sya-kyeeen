# シャッキーーン

取引ごとの台帳アプリ。`index.html`（画面と計算）＋ `api/`（Vercel Functions）＋ PostgreSQL。

## 構成と Provider の境界

| 場所 | 中身 | Provider 依存 |
|---|---|---|
| `index.html` | 画面・計算ロジック。データは `/api` だけを呼ぶ | なし |
| `api/`, `lib/ledger.js`, `lib/users.js` | 標準 SQL での読み書き。権限は `app_users.id` で絞る | なし（PostgreSQL 標準） |
| `lib/db.js` | `pg` で `DATABASE_URL` に接続 | なし（接続先だけ） |
| `lib/auth/neon.js`, `auth/neon.js` | Neon Auth の JWT 検証／ブラウザのログイン | Neon 固有（ここだけ） |
| `lib/auth/supabase.js`, `auth/supabase.js` | Supabase Auth 用（戻すとき用） | Supabase 固有（ここだけ） |
| `db/migrations/core` | テーブル定義 | なし |
| `db/migrations/neon`, `db/migrations/supabase` | Provider ごとのアクセス設定 | 各 Provider |

## 環境変数（Vercel）

| 名前 | 例 | 説明 |
|---|---|---|
| `DATABASE_URL` | `postgresql://…neon.tech/neondb?sslmode=require` | DB の接続文字列（秘密） |
| `AUTH_PROVIDER` | `neon` | `neon` または `supabase` |
| `AUTH_URL` | `https://ep-….neonauth….neon.tech/neondb/auth` | Neon Auth の URL（Supabase なら `https://<ref>.supabase.co/auth/v1`） |
| `AUTH_PUBLIC_KEY` | — | Supabase に戻すときの公開キーだけ。Neon では不要 |
| `AUTH_JWKS_URL` / `AUTH_ISSUER` / `AUTH_AUDIENCE` | — | 通常は不要（既定値を上書きしたいときだけ） |

## Migration

```sh
DATABASE_URL=... DB_PROVIDER=neon npm run migrate
```

Supabase へ戻すときは `DB_PROVIDER=supabase`、`AUTH_PROVIDER=supabase`、`AUTH_URL` を変えるだけで、画面・API・SQL はそのまま使える。
