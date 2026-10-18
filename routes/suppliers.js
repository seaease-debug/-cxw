// routes/suppliers.js
// 供应商管理 —— 从 server.js 原样拆出，逻辑零改动。

import express from 'express';
import { db } from '../lib/db.js';
import { fail } from '../lib/apiError.js';

const router = express.Router();

// Suppliers
router.get('/', (req, res) => {
  db.all("SELECT * FROM suppliers ORDER BY name ASC", [], (err, rows) => {
    if (err) return fail(res, 'suppliers.list', err, '读取供应商列表失败');
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { name, contact_person, phone, maintenance_phone, remarks } = req.body;
  db.run("INSERT INTO suppliers (name, contact_person, phone, maintenance_phone, remarks) VALUES (?, ?, ?, ?, ?)", 
    [name, contact_person, phone, maintenance_phone, remarks], function(err) {
    if (err) return fail(res, 'suppliers.create', err, '新增供应商失败');
    res.json({ message: '供应商添加成功', id: this.lastID });
  });
});

router.put('/:id', (req, res) => {
  const { name, contact_person, phone, maintenance_phone, remarks } = req.body;
  const id = req.params.id;

  db.get("SELECT name FROM suppliers WHERE id = ?", [id], (err, row) => {
    if (!row) return res.status(404).json({ error: '未找到指定供应商' });
    const oldName = row.name;
    const cleanName = name ? name.trim() : oldName;

    db.run("UPDATE suppliers SET name = ?, contact_person = ?, phone = ?, maintenance_phone = ?, remarks = ? WHERE id = ?",
      [cleanName, contact_person, phone, maintenance_phone, remarks, id], function(updateErr) {
      if (updateErr) return fail(res, 'suppliers.update', updateErr, '更新供应商失败');

      if (oldName && oldName !== cleanName) {
        db.run("UPDATE assets SET supplier = ? WHERE supplier = ?", [cleanName, oldName]);
        db.run("UPDATE maintenance_records SET repair_vendor = ? WHERE repair_vendor = ?", [cleanName, oldName]);
      }

      res.json({ message: '供应商更新成功' });
    });
  });
});

router.delete('/:id', (req, res) => {
  db.run("DELETE FROM suppliers WHERE id = ?", [req.params.id], function(err) {
    if (err) return fail(res, 'suppliers.remove', err, '删除供应商失败');
    res.json({ message: '供应商删除成功' });
  });
});

export default router;
