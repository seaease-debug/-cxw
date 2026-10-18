// lib/db.js
// 服务端共享：SQLite 连接实例。
// 注意：本文件位于 lib/ 下，数据库在项目根目录，因此路径必须用 '..' 回退一级。

import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '..', 'assets.db');

export let db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// ★ 第 3 批新增：供 /api/system/restore-full 重连数据库。
// 原实现在 server.js 内直接写 db = new sqlite3.Database(...)，
// 但拆分后 db 来自 import，import 绑定只读，赋值会抛 TypeError。
// 改为在声明它的本文件内重新赋值，其他模块靠 ESM live binding 自动看到新连接。
export function reopenDatabase(callback) {
  db = new sqlite3.Database(dbPath, callback);
  return db;
}

// ★ 第 3 批新增：以只读方式打开任意 SQLite 文件（用于校验上传的备份包）。
export function openReadonlyDatabase(filePath, callback) {
  return new sqlite3.Database(filePath, sqlite3.OPEN_READONLY, callback);
}

export { dbPath };
