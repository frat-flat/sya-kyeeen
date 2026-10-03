// PUT /api/settings { data } … 設定（口座・プロジェクト一覧）を保存
import { handler } from "../lib/http.js";
import { saveSettings } from "../lib/ledger.js";
export default handler({ PUT: ({ userId, body }) => saveSettings(userId, body && body.data) });
