// lib/apiError.js
// A12：错误回显脱敏。
//
// 病灶：`routes/*.js` 里 63 处把**原始错误串**直接塞进响应体 ——
//   `json({ error: err.message })` 与 `json({ error: '…：' + err.message })`。
// SQLite / 文件系统的原始 message 会带上表名、列名、约束名、绝对路径，
// 前端又用 `err.error || '兜底'` 原样弹给用户 ⇒ 既泄露内部结构，对用户也毫无可操作性。
//
// 修法（**修数据源，不是修症状**）：真实错误只写**服务端日志**（带 tag 便于定位），
// 响应体只给对外文案。前端那一层 `err.error || '兜底'` 的向后兼容读法保持不变 ——
// 它现在拿到的是安全文案，兜底反而不再被触发，属于预期。
//
// 注意：本模块只做输出脱敏，不改变 HTTP 状态码，接口契约（`{ error: string }`）不变。

/**
 * 5xx 统一出口：记真实错误到服务端日志，返回对外安全文案。
 *
 * @param {import('express').Response} res
 * @param {string} tag  日志定位标签，形如 `assets.inbound`
 * @param {unknown} err 原始错误（只在服务端打印，绝不进响应体）
 * @param {string} message 对外文案
 */
export function fail(res, tag, err, message) {
  console.error(`[${tag}]`, err);
  return res.status(500).json({ error: message });
}
