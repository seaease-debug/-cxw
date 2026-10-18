// routes/warehouses.js
// 仓库字典 —— 从 server.js 原样拆出，逻辑零改动。

import express from 'express';
import { db } from '../lib/db.js';
import { fail } from '../lib/apiError.js';

const router = express.Router();

// ─── Warehouses ──────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  db.all("SELECT * FROM warehouses ORDER BY name ASC", [], (err, rows) => {
    if (err) return fail(res, 'warehouses.list', err, '读取仓库列表失败');
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { name, code, location_desc } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: '仓库名称和仓库编码不能为空' });
  }
  const upperCode = code.toUpperCase().trim();
  db.run("INSERT INTO warehouses (name, code, location_desc) VALUES (?, ?, ?)", 
    [name, upperCode, location_desc], function(err) {
      if (err) {
        return res.status(500).json({ error: '该仓库名称或编码已存在，请换一个名称或编码' });
      }
      res.json({ id: this.lastID, name, code: upperCode, location_desc });
    });
});

router.put('/:id', (req, res) => {
  const { name, code, location_desc } = req.body;
  const upperCode = code.toUpperCase().trim();
  const id = req.params.id;

  db.get("SELECT name FROM warehouses WHERE id = ?", [id], (err, row) => {
    if (!row) return res.status(404).json({ error: '未找到指定仓库位置' });
    const oldName = row.name;

    db.run("UPDATE warehouses SET name = ?, code = ?, location_desc = ? WHERE id = ?",
      [name, upperCode, location_desc, id], function(err) {
        if (err) return res.status(500).json({ error: '更新仓库失败，可能命名或编码产生冲突' });
        
        // Cascade rename to existing assets
        if (oldName !== name) {
          db.run("UPDATE assets SET warehouse_location = ? WHERE warehouse_location = ?", [name, oldName], (cascadeErr) => {
            if (cascadeErr) console.error("Cascade update for rename warehouse failed:", cascadeErr);
          });
        }
        res.json({ message: '仓库更新修改成功' });
      });
  });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.get("SELECT name FROM warehouses WHERE id = ?", [id], (err, row) => {
    if (!row) return res.status(404).json({ error: '未找到指定仓库' });
    const whName = row.name;

    // Check if assets are currently stored in this warehouse
    db.get("SELECT COUNT(*) AS count FROM assets WHERE warehouse_location = ?", [whName], (checkErr, checkRow) => {
      if (checkErr) return fail(res, 'warehouses.removeCheck', checkErr, '校验仓库占用情况失败');
      if (checkRow && checkRow.count > 0) {
        return res.status(400).json({
          error: `仓库「${whName}」下仍有 ${checkRow.count} 件资产在库，因删除库房名会对已有资产记录产生影响，请先在「仓库管理」中将这些资产批量转移到其他仓库，然后才能删除此仓库。`
        });
      }

      // Safe to delete if empty
      db.run("DELETE FROM warehouses WHERE id = ?", [id], function(delErr) {
        if (delErr) return fail(res, 'warehouses.remove', delErr, '删除仓库失败');
        res.json({ message: '仓库删除成功' });
      });
    });
  });
});

export default router;
