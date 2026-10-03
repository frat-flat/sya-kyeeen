// 認証の境界。どの認証サービスでも「JWT を検証して { provider, authUserId, email, emailVerified } を返す」だけにする。
// 使う認証サービスは環境変数 AUTH_PROVIDER（neon / supabase）で選ぶ。サービスごとの違いは各ファイルに閉じ込める。
import { createRemoteJWKSet, jwtVerify } from "jose";
import neon from "./neon.js";
import supabase from "./supabase.js";
const PROVIDERS = { neon, supabase };

export function authProvider(){
  const name = process.env.AUTH_PROVIDER || "neon";
  const p = PROVIDERS[name];
  if (!p) throw Object.assign(new Error(`AUTH_PROVIDER「${name}」には対応していません`), { status: 500 });
  return p;
}
let jwks, jwksUrl;
export async function verifyRequest(req){
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) throw Object.assign(new Error("ログインしてください"), { status: 401 });
  const p = authProvider(), cfg = p.serverConfig(process.env);
  if (jwksUrl !== cfg.jwksUrl){ jwks = createRemoteJWKSet(new URL(cfg.jwksUrl)); jwksUrl = cfg.jwksUrl; }
  try {
    const { payload } = await jwtVerify(token, jwks, { issuer: cfg.issuer, audience: cfg.audience || undefined });
    return p.identity(payload);
  } catch(e){ throw Object.assign(new Error("ログインの有効期限が切れました。もう一度ログインしてください"), { status: 401 }); }
}
