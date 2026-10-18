// lib/media.js
// 服务端共享：uploads 目录 + base64 图片落盘工具。
// 从 server.js 原样搬出，逻辑零改动。
// 注意：本文件位于 lib/ 下，uploads 在项目根目录，因此路径必须用 '..' 回退一级。

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
export const uploadsDir = path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper to sanitize filename for models
export function sanitizeFilename(name) {
  if (!name) return 'default';
  return name.replace(/[\\/:*?"<>|\s]+/g, '_').trim();
}

// 允许落盘并被静态托管的图片类型（白名单）。
// 安全（CWE-434）：扩展名原先直接取自 data URI 的 MIME 子类型，
// 形如 `data:image/<任意 [A-Za-z+]+>` 都会被当成扩展名 —— 实测
// `data:image/html` 落盘为 .html（静态托管 MIME=text/html）、
// `data:image/svg` 落盘为 .svg（image/svg+xml），浏览器均可执行 → 存储型 XSS。
const ALLOWED_IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);

// 把 MIME 子类型规范化为白名单内的扩展名；不在白名单则返回 null（拒收）。
function normalizeImageExt(mimeSubtype) {
  const raw = String(mimeSubtype || '').toLowerCase();
  const canon = raw === 'jpeg' ? 'jpg' : raw;
  return ALLOWED_IMAGE_EXT.has(canon) ? canon : null;
}

// Helper to save model base64 image
export function saveBase64Image(base64Str, brandModel) {
  if (!base64Str) return null;
  if (base64Str.startsWith('/api/uploads/') || base64Str.startsWith('/uploads/')) return base64Str;

  const matches = base64Str.match(/^data:image\/([A-Za-z+]+);base64,(.+)$/);
  let ext = 'jpg';
  let data = base64Str;

  if (matches && matches.length === 3) {
    const parsedExt = normalizeImageExt(matches[1]);
    if (!parsedExt) return null; // 非白名单图片类型（如 svg / html）：拒绝落盘
    ext = parsedExt;
    data = matches[2];
  } else if (base64Str.length < 100) {
    return null; // Not a valid base64 image
  }

  try {
    const buffer = Buffer.from(data, 'base64');
    const filename = `${sanitizeFilename(brandModel)}.${ext}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);
    return `/api/uploads/${filename}`;
  } catch (e) {
    console.error("Failed to write model image to filesystem:", e);
    return null;
  }
}

// Helper to save voucher base64 image
export function saveBase64Voucher(base64Str) {
  if (!base64Str) return null;
  if (base64Str.startsWith('/api/uploads/') || base64Str.startsWith('/uploads/')) return base64Str;

  const matches = base64Str.match(/^data:image\/([A-Za-z+]+);base64,(.+)$/);
  let ext = 'jpg';
  let data = base64Str;

  if (matches && matches.length === 3) {
    const parsedExt = normalizeImageExt(matches[1]);
    if (!parsedExt) return null; // 非白名单图片类型（如 svg / html）：拒绝落盘
    ext = parsedExt;
    data = matches[2];
  } else if (base64Str.length < 100) {
    return null; // Not a valid base64 image
  }

  try {
    const buffer = Buffer.from(data, 'base64');
    const filename = `voucher_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);
    return `/api/uploads/${filename}`;
  } catch (e) {
    console.error("Failed to write voucher image to filesystem:", e);
    return null;
  }
}
