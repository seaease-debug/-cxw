// routes/faultTypes.js
// 故障类型字典 —— 从 server.js 原样拆出，逻辑零改动。

import express from 'express';
import { db } from '../lib/db.js';
import { fail } from '../lib/apiError.js';

const router = express.Router();

// ─── Fault Types CRUD (故障类型) ──────────────────────────────────
router.get('/', (req, res) => {
  db.all("SELECT id, name, description, enabled FROM fault_types ORDER BY id ASC", (err, rows) => {
    if (err) return fail(res, 'faultTypes.list', err, '读取故障类型失败');
    res.json(rows.map(r => ({ ...r, enabled: Boolean(r.enabled) })));
  });
});

router.post('/', (req, res) => {
  const { name, description } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: '分类名称不能为空' });
  const cleanName = name.trim();
  const cleanDesc = (description || '').trim();

  db.run("INSERT INTO fault_types (name, description, enabled) VALUES (?, ?, 1)",
    [cleanName, cleanDesc],
    function(err) {
      if (err) {
        if (err.message && err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: '该故障类型已存在' });
        }
        return fail(res, 'faultTypes.create', err, '新增故障类型失败');
      }
      res.status(201).json({ id: this.lastID, name: cleanName, description: cleanDesc, enabled: true });
    });
});

router.put('/:id', (req, res) => {
  const { name, description, enabled } = req.body;
  const id = req.params.id;

  db.get("SELECT * FROM fault_types WHERE id = ?", [id], (err, row) => {
    if (!row) return res.status(404).json({ error: '未找到指定故障类型' });

    const oldName = row.name;
    const newName = name !== undefined ? name.trim() : row.name;
    const newDesc = description !== undefined ? description.trim() : row.description;
    const newEnabled = enabled !== undefined ? (enabled ? 1 : 0) : row.enabled;

    db.run("UPDATE fault_types SET name = ?, description = ?, enabled = ? WHERE id = ?",
      [newName, newDesc, newEnabled, id],
      function(updateErr) {
        if (updateErr) return fail(res, 'faultTypes.update', updateErr, '更新故障类型失败');
        
        // Cascade update fault_type in maintenance_records if name was modified
        if (oldName !== newName) {
          db.run("UPDATE maintenance_records SET fault_type = ? WHERE fault_type = ?", [newName, oldName], (cascadeErr) => {
            if (cascadeErr) console.error("Cascade update maintenance records fault_type failed:", cascadeErr);
          });
        }

        res.json({ message: '更新成功' });
      });
  });
});

router.delete('/:id', (req, res) => {
  db.run("DELETE FROM fault_types WHERE id = ?", [req.params.id], function(err) {
    if (err) return fail(res, 'faultTypes.remove', err, '删除故障类型失败');
    res.json({ message: '删除成功' });
  });
});

export default router;
