// routes/system.js
// 系统域：操作日志 / 数据库备份 / 全量备份 / 全量恢复。
// 原 server.js 第 587-660 行 与 第 768-982 行，逻辑零改动。
// 挂载：app.use('/api/system', systemRouter)

import express from 'express';
import fs from 'fs';
import path from 'path';
import {
  getBeijingTimeString,
  getBeijingDateString
} from '../lib/time.js';
import {
  db,
  dbPath,
  reopenDatabase,
  openReadonlyDatabase
} from '../lib/db.js';
import { uploadsDir } from '../lib/media.js';
import {
  collectDirectoryEntries,
  streamPackTarGz,
  unpackTarGz
} from '../lib/tar.js';
import { ROOT_DIR } from '../lib/paths.js';
import { fail } from '../lib/apiError.js';

const router = express.Router();

// System Logs
router.get('/logs', (req, res) => {
  const { type, startDate, endDate, search } = req.query;
  let query = "SELECT * FROM system_logs WHERE 1=1";
  const params = [];

  if (type && type !== 'ALL') {
    query += " AND action_type = ?";
    params.push(type);
  }
  if (startDate) {
    query += " AND created_at >= ?";
    params.push(`${startDate} 00:00:00`);
  }
  if (endDate) {
    query += " AND created_at <= ?";
    params.push(`${endDate} 23:59:59`);
  }
  if (search) {
    query += " AND (description LIKE ? OR operator LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  query += " ORDER BY created_at DESC LIMIT 500";

  db.all(query, params, (err, rows) => {
    if (err) return fail(res, 'system.logs', err, '读取系统日志失败');
    res.json(rows);
  });
});

// Database Backup (Lightweight SQLite DB only)
router.get('/backup', (req, res) => {
  const file = path.join(ROOT_DIR, 'assets.db');
  const date = getBeijingDateString();
  res.download(file, `assets_backup_${date}.db`);
});

// Full System Backup (SQLite DB + uploads directory + metadata)
router.get('/backup-full', async (req, res) => {
  const tempBackupDir = path.join(ROOT_DIR, '.temp_backup');
  const tempArchiveName = `eduasset_full_backup_${Date.now()}.tar.gz`;
  const tempArchivePath = path.join(tempBackupDir, tempArchiveName);
  const readmePath = path.join(tempBackupDir, 'README_RESTORE.txt');
  const manifestPath = path.join(tempBackupDir, 'backup_manifest.json');

  try {
    const date = getBeijingDateString();

    // Ensure safe project-level temporary directory exists
    if (!fs.existsSync(tempBackupDir)) {
      fs.mkdirSync(tempBackupDir, { recursive: true });
    }

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate restore guide
    const readmeContent = `=======================================================
 EduAsset Pro 固定资产管理平台 — 全量系统备份与恢复指南
=======================================================
备份生成时间: ${getBeijingTimeString()}
包含内容:
 1. assets.db           (系统完整 SQLite 数据库，含资产卡片、台账、维保、日志、账户)
 2. uploads/            (系统全部实物照片、领用出库单附件、设备维保与报废单据凭证)
 3. backup_manifest.json (备份元数据清单)

【恢复方法 1：在线一键导入（最推荐）】
在任何已部署的 EduAsset Pro 网页端中，以管理员身份登录：
 1. 点击左侧导航栏「系统管理」->「系统全局参数」->「数据维护」；
 2. 在「全量数据恢复 / 导入」中上传此 .tar.gz 压缩包；
 3. 系统会自动校验完整性并在当前系统自动留存安全快照后，一键无缝还原。

【恢复方法 2：新服务器离线解压覆盖】
若在新物理机或云服务器上直接部署：
 1. 将项目部署包安装好并停止服务 (node server.js 处于停止状态)；
 2. 将本压缩包放置在项目根目录下；
 3. 执行解压命令: tar -zxf <文件名>.tar.gz (或使用 7-Zip / WinRAR 解压)；
 4. 确认根目录下存在解压出的 assets.db 和 uploads/ 文件夹；
 5. 执行 npm start 启动服务，即可完整保留所有资产图片和台账数据。
`;
    fs.writeFileSync(readmePath, readmeContent, 'utf8');

    // Count images and assets
    const uploadsCount = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).length : 0;
    const manifest = {
      version: '2.5.0',
      backupTime: getBeijingTimeString(),
      type: 'full_archive',
      includes: ['assets.db', 'uploads', 'README_RESTORE.txt'],
      uploadsFileCount: uploadsCount
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

    // Prepare entries for pure Node.js streaming pack
    const entries = [
      { name: 'assets.db', absPath: path.join(ROOT_DIR, 'assets.db'), isDir: false },
      { name: 'README_RESTORE.txt', absPath: readmePath, isDir: false },
      { name: 'backup_manifest.json', absPath: manifestPath, isDir: false },
      { name: 'uploads/', isDir: true },
      ...collectDirectoryEntries(uploadsDir, 'uploads')
    ];

    // Stream pack to .tar.gz
    await streamPackTarGz(entries, tempArchivePath);

    // Audit log
    db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
      ['全量备份', `导出全量系统备份包（含数据库及 ${uploadsCount} 个图片附件）`, '系统管理员']);

    const downloadFileName = `eduasset_full_backup_${date}.tar.gz`;
    res.download(tempArchivePath, downloadFileName, () => {
      // Clean up temporary files
      try {
        if (fs.existsSync(tempArchivePath)) fs.unlinkSync(tempArchivePath);
        if (fs.existsSync(readmePath)) fs.unlinkSync(readmePath);
        if (fs.existsSync(manifestPath)) fs.unlinkSync(manifestPath);
      } catch (cleanErr) {
        console.warn('Clean temp backup files error:', cleanErr.message);
      }
    });
  } catch (error) {
    console.error('Full backup error:', error);
    try {
      if (fs.existsSync(tempArchivePath)) fs.unlinkSync(tempArchivePath);
      if (fs.existsSync(readmePath)) fs.unlinkSync(readmePath);
      if (fs.existsSync(manifestPath)) fs.unlinkSync(manifestPath);
    } catch {}
    fail(res, 'system.backupFull', error, '全量备份打包失败');
  }
});

// Full System Restore (Stream upload .tar.gz and unpack)
router.post('/restore-full', (req, res) => {
  const tempBackupDir = path.join(ROOT_DIR, '.temp_backup');
  const tempArchive = path.join(tempBackupDir, `restore_${Date.now()}.tar.gz`);
  const unpackDir = path.join(tempBackupDir, `unpack_${Date.now()}`);

  if (!fs.existsSync(tempBackupDir)) {
    fs.mkdirSync(tempBackupDir, { recursive: true });
  }

  const writeStream = fs.createWriteStream(tempArchive);
  req.pipe(writeStream);

  writeStream.on('finish', async () => {
    try {
      if (!fs.existsSync(tempArchive) || fs.statSync(tempArchive).size === 0) {
        return res.status(400).json({ error: '上传的备份文件为空或传输中断' });
      }

      // Create isolated unpacking directory
      fs.mkdirSync(unpackDir, { recursive: true });

      // Pure Node.js unpack archive
      try {
        unpackTarGz(tempArchive, unpackDir);
      } catch (tarErr) {
        console.error('[system.restoreFull.tar]', tarErr);
        return res.status(400).json({ error: '备份压缩包解压失败，请确认文件为标准的 .tar.gz 全量备份包' });
      }

      // Check database presence
      const unpackedDbPath = path.join(unpackDir, 'assets.db');
      if (!fs.existsSync(unpackedDbPath)) {
        return res.status(400).json({ error: '备份包校验未通过：未找到 assets.db 数据库核心文件' });
      }

      // Validate SQLite database integrity
      await new Promise((resolve, reject) => {
        const testDb = openReadonlyDatabase(unpackedDbPath, (err) => {
          if (err) return reject(new Error('无法读取解压的数据库文件，文件可能已损坏'));
          testDb.get("SELECT name FROM sqlite_master WHERE type='table' AND name='assets'", (checkErr, row) => {
            testDb.close();
            if (checkErr || !row) {
              return reject(new Error('数据校验失败：数据库中缺少 assets 资产主表'));
            }
            resolve(true);
          });
        });
      });

      // Step 1: Create automatic safety snapshot of current database
      const preBackupPath = path.join(ROOT_DIR, 'assets.db.pre_restore_bak');
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, preBackupPath);
      }

      // Step 2: Gracefully close current database connection to release locks
      await new Promise((resolve) => {
        db.close((closeErr) => {
          if (closeErr) console.warn('Warn closing db before restore:', closeErr.message);
          resolve(true);
        });
      });

      // Step 3: Replace database file
      fs.copyFileSync(unpackedDbPath, dbPath);

      // Step 4: Restore uploads directory
      const unpackedUploads = path.join(unpackDir, 'uploads');
      let restoredImagesCount = 0;
      if (fs.existsSync(unpackedUploads)) {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        fs.cpSync(unpackedUploads, uploadsDir, { recursive: true });
        try {
          restoredImagesCount = fs.readdirSync(uploadsDir).length;
        } catch {}
      }

      // Step 5: Reconnect to restored database
      reopenDatabase((reopenErr) => {
        if (reopenErr) {
          console.error('Reopening database failed after restore:', reopenErr.message);
        } else {
          console.log('Database successfully reconnected after full restore.');
          db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
            ['全量恢复', `系统全量还原成功，已同步恢复数据库与 ${restoredImagesCount} 个图片附件`, '系统管理员']);
        }
      });

      // Step 6: Clean up temp files
      try {
        if (fs.existsSync(unpackDir)) fs.rmSync(unpackDir, { recursive: true, force: true });
        if (fs.existsSync(tempArchive)) fs.unlinkSync(tempArchive);
      } catch (cleanErr) {
        console.warn('Clean restore temp error:', cleanErr.message);
      }

      return res.json({
        success: true,
        message: `系统全量还原成功！已恢复数据库并同步覆盖恢复 ${restoredImagesCount} 个图片附件文件。`,
        restoredImagesCount
      });

    } catch (err) {
      console.error('Restore processing error:', err);
      try {
        if (fs.existsSync(unpackDir)) fs.rmSync(unpackDir, { recursive: true, force: true });
        if (fs.existsSync(tempArchive)) fs.unlinkSync(tempArchive);
      } catch {}
      return fail(res, 'system.restoreFull', err, '系统全量还原失败');
    }
  });

  writeStream.on('error', (err) => {
    console.error('Upload stream error:', err);
    fail(res, 'system.restoreUpload', err, '文件上传接收失败，请确认文件大小与网络状况');
  });
});

export default router;
