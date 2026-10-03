// API の共通処理：ログイン確認 → アプリのユーザー ID を渡して処理し、JSON で返す。
import { verifyRequest } from "./auth/index.js";
import { appUser } from "./users.js";
export function handler(methods){
  return async (req, res) => {
    try {
      const fn = methods[req.method];
      if (!fn){ res.setHeader("Allow", Object.keys(methods).join(", ")); return send(res, 405, { error: "このメソッドは使えません" }); }
      const userId = await appUser(await verifyRequest(req));
      const body = req.method === "GET" || req.method === "DELETE" ? null : await readBody(req);
      send(res, 200, (await fn({ req, userId, body, query: queryOf(req) })) ?? { ok: true });
    } catch(e){
      const status = e.status || 500;
      if (status >= 500) console.error(e);
      send(res, status, { error: status >= 500 && !e.status ? "サーバーでエラーが起きました" : e.message });
    }
  };
}
export function send(res, status, obj){ res.statusCode = status; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.setHeader("Cache-Control", "no-store"); res.end(JSON.stringify(obj)); }
export function bad(msg){ return Object.assign(new Error(msg), { status: 400 }); }
function queryOf(req){ if (req.query) return req.query; return Object.fromEntries(new URL(req.url, "http://x").searchParams); }
async function readBody(req){
  if (req.body !== undefined) return typeof req.body === "string" ? JSON.parse(req.body || "null") : req.body;
  let raw = ""; for await (const c of req) raw += c; if (raw.length > 2e6) throw bad("データが大きすぎます");
  try { return raw ? JSON.parse(raw) : null; } catch(_){ throw bad("JSON の形式が正しくありません"); }
}
