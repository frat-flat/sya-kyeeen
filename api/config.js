// GET /api/config … ブラウザが使う認証サービスと、その公開設定（秘密情報は返さない）
// missing は未設定の環境変数の名前だけを返す（値は返さない）。設定漏れの確認用。
import { send } from "../lib/http.js";
export default function (req, res){
  const provider = process.env.AUTH_PROVIDER || "neon";
  const missing = ["DATABASE_URL", "AUTH_PROVIDER", "AUTH_URL"].filter(k => !process.env[k]);
  send(res, 200, { authProvider: provider, authUrl: process.env.AUTH_URL || "", publicKey: process.env.AUTH_PUBLIC_KEY || "", missing });
}
