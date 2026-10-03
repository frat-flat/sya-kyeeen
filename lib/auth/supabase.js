// Supabase Auth（非対称鍵の JWT）。Supabase へ戻すときは AUTH_PROVIDER=supabase と AUTH_URL=https://<ref>.supabase.co/auth/v1 にする。
export default {
  name: "supabase",
  serverConfig(env){
    const url = env.AUTH_URL;
    if (!url) throw Object.assign(new Error("AUTH_URL が設定されていません"), { status: 500 });
    const base = url.replace(/\/$/, "");
    return { jwksUrl: env.AUTH_JWKS_URL || `${base}/.well-known/jwks.json`, issuer: env.AUTH_ISSUER || base, audience: env.AUTH_AUDIENCE || "authenticated" };
  },
  identity(p){ return { provider: "supabase", authUserId: String(p.sub), email: p.email || null, emailVerified: !!p.email_confirmed_at || p.email_verified === true || !!(p.user_metadata && p.user_metadata.email_verified) }; }
};
