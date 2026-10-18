// routes/locations.js
// 固定物理位置字典 —— 从 server.js 原样拆出，逻辑零改动。

import express from 'express';
import { db } from '../lib/db.js';
import { fail } from '../lib/apiError.js';

const router = express.Router();

// ─── Locations CRUD (固定物理位置字典) ──────────────────────────────────
router.get('/', (req, res) => {
  db.all("SELECT id, name, description, created_at FROM locations ORDER BY id ASC", (err, rows) => {
    if (err) return fail(res, 'locations.list', err, '读取位置列表失败');
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { name, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: '位置名称不能为空' });
  }
  const cleanName = name.trim();
  const cleanDesc = (description || '').trim();

  db.run("INSERT INTO locations (name, description) VALUES (?, ?)",
    [cleanName, cleanDesc],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: '该固定位置名称已存在，请勿重复添加' });
        }
        return fail(res, 'locations.create', err, '新增位置失败');
      }
      
      db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
        ['新增固定位置', `新增固定物理位置：${cleanName}`, '系统管理员']);
        
      res.status(201).json({ id: this.lastID, name: cleanName, description: cleanDesc });
    });
});

router.put('/:id', (req, res) => {
  const { name, description } = req.body;
  const id = req.params.id;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: '位置名称不能为空' });
  }
  const cleanName = name.trim();
  const cleanDesc = (description || '').trim();

  db.get("SELECT name FROM locations WHERE id = ?", [id], (err, row) => {
    if (!row) return res.status(404).json({ error: '未找到指定位置项' });
    const oldName = row.name;

    db.run("UPDATE locations SET name = ?, description = ? WHERE id = ?",
      [cleanName, cleanDesc, id], function(updateErr) {
        if (updateErr) {
          if (updateErr.message.includes('UNIQUE')) {
            return res.status(400).json({ error: '该固定位置名称已存在' });
          }
          return fail(res, 'locations.update', updateErr, '更新位置失败');
        }
        
        // Cascade rename to existing assets if renamed
        if (oldName !== cleanName) {
          db.run("UPDATE assets SET location = ? WHERE location = ?", [cleanName, oldName], (cascadeErr) => {
            if (cascadeErr) console.error("Cascade update for rename location failed:", cascadeErr);
          });
        }

        db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
          ['修改固定位置', `修改固定物理位置：${oldName} -> ${cleanName}`, '系统管理员']);
          
        res.json({ message: '位置修改成功' });
      });
  });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.get("SELECT name FROM locations WHERE id = ?", [id], (err, row) => {
    if (err) return fail(res, 'locations.removeRead', err, '读取位置信息失败');
    if (!row) return res.status(404).json({ error: '未找到指定位置项' });
    const locName = row.name;

    db.run("DELETE FROM locations WHERE id = ?", [id], function(delErr) {
      if (delErr) return fail(res, 'locations.remove', delErr, '删除位置失败');
      
      db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
        ['删除固定位置', `删除了固定物理位置：${locName}`, '系统管理员']);
        
      res.json({ message: '位置删除成功' });
    });
  });
});

export default router;
