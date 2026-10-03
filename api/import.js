// POST /api/import { settings, records[] } … この端末に保存していたデータをまとめて取り込む
import { handler } from "../lib/http.js";
import { importAll } from "../lib/ledger.js";
export default handler({ POST: ({ userId, body }) => importAll(userId, body && body.settings, body && body.records) });
