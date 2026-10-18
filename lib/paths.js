// lib/paths.js
// 服务端共享：项目根目录常量。
// 用途：server.js 位于项目根，__dirname 即项目根；代码搬进 routes/ 或 lib/ 后
// __dirname 会退化成子目录，照抄 'assets.db' 之类相对名会在子目录里造出另一套文件
// （服务照常启动，数据写到错地方）。故统一从这里取根路径。
// 与 lib/db.js / lib/media.js 的 '..' 回退是同一个道理。

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.resolve(__dirname, '..');

