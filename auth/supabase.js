// ブラウザ側の認証アダプタ（Supabase Auth）。Supabase へ戻すときは AUTH_PROVIDER=supabase にするだけで、こちらが使われる。
function loadScript(src){ return new Promise((ok, ng)=>{ const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = ng; document.head.appendChild(s); }); }
export async function create(cfg){
  if (!window.supabase) await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js");
  const base = cfg.authUrl.replace(/\/auth\/v1\/?$/, "");
  const c = window.supabase.createClient(base, cfg.publicKey);
  const toSession = s => s && s.user ? { userId: String(s.user.id), email: s.user.email || "", token: s.access_token || "" } : null;
  const err = e => e ? (e.message || String(e)) : "";
  return {
    onChange(cb){ c.auth.onAuthStateChange((_ev, s)=>setTimeout(()=>cb(toSession(s)), 0)); },
    async getSession(){ const { data } = await c.auth.getSession(); return toSession(data && data.session); },
    async getToken(){ const { data } = await c.auth.getSession(); return (data && data.session && data.session.access_token) || ""; },
    async signIn(email, password){ const { error } = await c.auth.signInWithPassword({ email, password }); return err(error); },
    async signUp(email, password){ const { data, error } = await c.auth.signUp({ email, password, options:{ emailRedirectTo: location.origin + location.pathname } }); return { error: err(error), needsConfirm: !error && !(data && data.session) }; },
    async signOut(){ await c.auth.signOut(); }
  };
}
