// GET /api/config … ブラウザが使う認証サービスと、その公開設定（秘密情報は返さない）
import { send } from "../lib/http.js";
export default function (req, res){
  const provider = process.env.AUTH_PROVIDER || "neon";
  send(res, 200, { authProvider: provider, authUrl: process.env.AUTH_URL || "", publicKey: process.env.AUTH_PUBLIC_KEY || "" });
}
