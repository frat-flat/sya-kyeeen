// PUT    /api/records { project, key, data } … 記録を保存（同じキーなら上書き）
// DELETE /api/records?project=…&key=…        … 記録を1件削除
// DELETE /api/records?project=…               … プロジェクトの記録をすべて削除
import { handler } from "../lib/http.js";
import { saveRecord, deleteRecord, deleteProject } from "../lib/ledger.js";
export default handler({
  PUT: ({ userId, body }) => saveRecord(userId, body && body.project, body && body.key, body && body.data),
  DELETE: ({ userId, query }) => query.key ? deleteRecord(userId, query.project, query.key) : deleteProject(userId, query.project)
});
