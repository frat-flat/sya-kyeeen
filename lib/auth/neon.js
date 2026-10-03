// Neon Auth（Better Auth ベース）。AUTH_URL は Neon コンソールに表示される Auth の URL（…/neondb/auth）。
export default {
  name: "neon",
  serverConfig(env){
    const url = env.AUTH_URL;
    if (!url) throw Object.assign(new Error("AUTH_URL が設定されていません"), { status: 500 });
    return { jwksUrl: env.AUTH_JWKS_URL || `${url.replace(/\/$/, "")}/.well-known/jwks.json`, issuer: env.AUTH_ISSUER || new URL(url).origin, audience: env.AUTH_AUDIENCE };
  },
  identity(p){ return { provider: "neon", authUserId: String(p.sub), email: p.email || null, emailVerified: p.email_verified === true || p.emailVerified === true }; }
};
