// ブラウザ側の認証アダプタ（Neon Auth）。アプリ本体はここの関数だけを使い、Neon の SDK を直接触らない。
import { createAuthClient, SupabaseAuthAdapter } from "./vendor/neon-auth-0.5.0-beta.js";
export function create(cfg){
  const c = createAuthClient(cfg.authUrl, { adapter: SupabaseAuthAdapter() });
  const toSession = s => s && s.user ? { userId: String(s.user.id), email: s.user.email || "", token: s.access_token || "" } : null;
  const err = e => e ? (e.message || String(e)) : "";
  return {
    onChange(cb){ c.onAuthStateChange((_ev, s)=>cb(toSession(s))); },
    async getSession(){ const { data } = await c.getSession(); return toSession(data && data.session); },
    async getToken(){ const { data } = await c.getSession(); return (data && data.session && data.session.access_token) || ""; },
    async signIn(email, password){ const { error } = await c.signInWithPassword({ email, password }); return err(error); },
    async signUp(email, password){ const { data, error } = await c.signUp({ email, password, options:{ emailRedirectTo: location.origin + location.pathname } }); return { error: err(error), needsConfirm: !error && !(data && data.session) }; },
    async signOut(){ await c.signOut(); }
  };
}
