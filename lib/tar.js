// lib/tar.js
// 服务端共享：零外部依赖的 tar.gz 打包 / 解包工具。
// 从 server.js 原样搬出；解包侧已加目录穿越防护（防路径逃逸）。
// 仅被 routes/system.js 的全量备份与全量恢复端点使用。

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// --- Cross-platform In-Memory / Streaming Tar.gz Helpers (Zero external CLI dependencies) ---
function createTarHeader(name, size, isDir = false) {
  const buf = Buffer.alloc(512);
  const cleanName = name.replace(/\\/g, '/').replace(/^\/+/, '');
  buf.write(cleanName, 0, 100, 'utf8');
  buf.write('0000777\0', 100, 8);
  buf.write('0000000\0', 108, 8);
  buf.write('0000000\0', 116, 8);
  buf.write(size.toString(8).padStart(11, '0') + ' ', 124, 12);
  const mtime = Math.floor(Date.now() / 1000).toString(8).padStart(11, '0') + ' ';
  buf.write(mtime, 136, 12);
  buf.write('        ', 148, 8);
  buf.write(isDir ? '5' : '0', 156, 1);
  buf.write('ustar\0', 257, 6);
  buf.write('00', 263, 2);
  
  let sum = 0;
  for (let i = 0; i < 512; i++) sum += buf[i];
  buf.write(sum.toString(8).padStart(6, '0') + '\0 ', 148, 8);
  return buf;
}

function collectDirectoryEntries(dirPath, relativePrefix = '') {
  const entries = [];
  if (!fs.existsSync(dirPath)) return entries;
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    const relName = relativePrefix ? (relativePrefix + '/' + item.name) : item.name;
    if (item.isDirectory()) {
      entries.push({ name: relName + '/', absPath: fullPath, isDir: true });
      entries.push(...collectDirectoryEntries(fullPath, relName));
    } else if (item.isFile()) {
      entries.push({ name: relName, absPath: fullPath, isDir: false });
    }
  }
  return entries;
}

function streamPackTarGz(entries, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      const gzip = zlib.createGzip({ level: 6 });
      const outStream = fs.createWriteStream(outputPath);

      gzip.pipe(outStream);
      outStream.on('finish', () => resolve(true));
      outStream.on('error', reject);
      gzip.on('error', reject);

      for (const entry of entries) {
        if (!entry.isDir && !fs.existsSync(entry.absPath)) continue;
        if (entry.isDir) {
          gzip.write(createTarHeader(entry.name.endsWith('/') ? entry.name : entry.name + '/', 0, true));
        } else {
          const stat = fs.statSync(entry.absPath);
          gzip.write(createTarHeader(entry.name, stat.size, false));
          const fileData = fs.readFileSync(entry.absPath);
          gzip.write(fileData);
          const remainder = stat.size % 512;
          if (remainder > 0) {
            gzip.write(Buffer.alloc(512 - remainder));
          }
        }
      }

      // Tar archive ends with two 512-byte zero blocks
      gzip.write(Buffer.alloc(1024));
      gzip.end();
    } catch (e) {
      reject(e);
    }
  });
}

function unpackTarGz(archivePath, targetDir) {
  const gzBuf = fs.readFileSync(archivePath);
  const tarBuf = zlib.gunzipSync(gzBuf);
  let offset = 0;
  while (offset + 512 <= tarBuf.length) {
    const header = tarBuf.subarray(offset, offset + 512);
    offset += 512;
    if (header.every(b => b === 0)) break;
    
    let name = header.toString('utf8', 0, 100).replace(/\0/g, '').trim();
    if (!name) break;
    
    const sizeStr = header.toString('utf8', 124, 136).replace(/\0/g, '').trim();
    const size = parseInt(sizeStr, 8) || 0;
    const typeFlag = String.fromCharCode(header[156]);
    const isDir = typeFlag === '5' || name.endsWith('/');
    
    // 安全校验：拒绝目录穿越（Zip Slip，CWE-22）
    const resolvedTarget = path.resolve(targetDir);
    const destPath = path.resolve(resolvedTarget, name);
    const relPath = path.relative(resolvedTarget, destPath);
    if (relPath.startsWith('..') || path.isAbsolute(relPath)) {
      throw new Error('归档条目路径越界，已中止解包');
    }
    if (isDir) {
      fs.mkdirSync(destPath, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      const fileData = tarBuf.subarray(offset, offset + size);
      fs.writeFileSync(destPath, fileData);
    }
    
    const remainder = size % 512;
    offset += size + (remainder > 0 ? 512 - remainder : 0);
  }
}

export { collectDirectoryEntries, streamPackTarGz, unpackTarGz };
