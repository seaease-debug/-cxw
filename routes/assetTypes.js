// routes/assetTypes.js
// 资产分类字典 —— 从 server.js 原样拆出，逻辑零改动。

import express from 'express';
import { db } from '../lib/db.js';
import { fail } from '../lib/apiError.js';

const router = express.Router();

// ─── Asset Types CRUD ───────────────────────────────────────────────────
router.get('/', (req, res) => {
  db.all("SELECT id, name, code_prefix, sort_order FROM asset_types ORDER BY sort_order ASC, name ASC", (err, rows) => {
    if (err) return fail(res, 'assetTypes.list', err, '读取资产类型失败');
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { name, codePrefix, sortOrder } = req.body;
  if (!name || !codePrefix) {
    return res.status(400).json({ error: '设备类型名称和前缀不能为空' });
  }
  const cleanName = name.trim();
  const cleanPrefix = codePrefix.toUpperCase().trim();
  const targetSortOrder = parseInt(sortOrder, 10) || 0;

  const finalInsert = () => {
    db.run("INSERT INTO asset_types (name, code_prefix, sort_order) VALUES (?, ?, ?)",
      [cleanName, cleanPrefix, targetSortOrder],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: '该类型名称或编号前缀已存在' });
          }
          return fail(res, 'assetTypes.create', err, '新增资产类型失败');
        }
        
        // Log
        db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
          ['添加资产类型', `添加了新资产类型 ${cleanName} (前缀: ${cleanPrefix}, 排序: ${targetSortOrder})`, '系统管理员']);
          
        res.status(201).json({ id: this.lastID, name: cleanName, code_prefix: cleanPrefix, sort_order: targetSortOrder });
      });
  };

  if (targetSortOrder > 0) {
    db.run("UPDATE asset_types SET sort_order = sort_order + 1 WHERE sort_order >= ?", [targetSortOrder], (shiftErr) => {
      if (shiftErr) console.error("Shift sort order failed on insert:", shiftErr);
      finalInsert();
    });
  } else {
    finalInsert();
  }
});

router.put('/:id', (req, res) => {
  const { name, codePrefix, sortOrder } = req.body;
  const id = req.params.id;
  if (!name || !codePrefix) {
    return res.status(400).json({ error: '设备类型名称和前缀不能为空' });
  }
  const cleanName = name.trim();
  const cleanPrefix = codePrefix.toUpperCase().trim();
  const targetSortOrder = parseInt(sortOrder, 10) || 0;

  db.get("SELECT name FROM asset_types WHERE id = ?", [id], (err, row) => {
    if (!row) return res.status(404).json({ error: '未找到指定资产类型' });
    const oldName = row.name;

    const performUpdate = () => {
      db.run("UPDATE asset_types SET name = ?, code_prefix = ?, sort_order = ? WHERE id = ?",
        [cleanName, cleanPrefix, targetSortOrder, id], function(updateErr) {
          if (updateErr) {
            if (updateErr.message.includes('UNIQUE')) {
              return res.status(400).json({ error: '该类型名称或编号前缀已存在' });
            }
            return fail(res, 'assetTypes.update', updateErr, '更新资产类型失败');
          }
          
          // Cascades rename to existing assets if renamed
          if (oldName !== cleanName) {
            db.run("UPDATE assets SET type = ? WHERE type = ?", [cleanName, oldName], (cascadeErr) => {
              if (cascadeErr) console.error("Cascade update for rename asset type failed:", cascadeErr);
            });
          }

          // Log
          db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
            ['修改资产类型', `修改了资产类型 ${oldName} 为 ${cleanName} (前缀: ${cleanPrefix}, 排序: ${targetSortOrder})`, '系统管理员']);
            
          res.json({ message: '分类更新修改成功' });
        });
    };

    if (targetSortOrder > 0) {
      db.run("UPDATE asset_types SET sort_order = sort_order + 1 WHERE sort_order >= ? AND id != ?", [targetSortOrder, id], (shiftErr) => {
        if (shiftErr) console.error("Shift sort order failed on update:", shiftErr);
        performUpdate();
      });
    } else {
      performUpdate();
    }
  });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.get("SELECT name FROM asset_types WHERE id = ?", [id], (err, row) => {
    if (err) return fail(res, 'assetTypes.removeRead', err, '读取资产类型失败');
    if (!row) return res.status(404).json({ error: '未找到指定分类类型' });
    const typeName = row.name;

    // Check if there are assets configured with this type
    db.get("SELECT COUNT(*) AS count FROM assets WHERE type = ?", [typeName], (checkErr, checkRow) => {
      if (checkErr) return fail(res, 'assetTypes.removeCheck', checkErr, '校验资产类型占用情况失败');
      if (checkRow && checkRow.count > 0) {
        return res.status(400).json({
          error: `分类类型「${typeName}」下仍有 ${checkRow.count} 件资产处于在库/服役状态，为保护账账相符，不可直接删除。请先在「仓库管理」中将这些资产调整为其他类型。`
        });
      }

      // Safe to delete if zero assets
      db.run("DELETE FROM asset_types WHERE id = ?", [id], function(delErr) {
        if (delErr) return fail(res, 'assetTypes.remove', delErr, '删除资产类型失败');
        
        // Log
        db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
          ['删除资产类型', `删除了分类类型 ${typeName}`, '系统管理员']);
          
        res.json({ message: '分类删除成功' });
      });
    });
  });
});

export default router;
