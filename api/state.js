// GET /api/state … ログイン中のユーザーの設定と全記録
import { handler } from "../lib/http.js";
import { loadState } from "../lib/ledger.js";
export default handler({ GET: ({ userId }) => loadState(userId) });
