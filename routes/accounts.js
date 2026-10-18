// routes/accounts.js
// 账号管理 —— 从 server.js 原样拆出，逻辑零改动。

import express from 'express';
import { db } from '../lib/db.js';
import bcrypt from 'bcryptjs';
import { fail } from '../lib/apiError.js';

const router = express.Router();

router.get('/', (req, res) => {
  db.all("SELECT id, username, real_name as realName, department, role, avatar FROM accounts ORDER BY id DESC", [], (err, rows) => {
    if (err) return fail(res, 'accounts.list', err, '读取账号列表失败');
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { username, realName, department, role, password, avatar } = req.body;
  if (!username || username.trim() === '') {
    return res.status(400).json({ error: '用户名不能为空' });
  }
  if (!password || password.trim() === '') {
    return res.status(400).json({ error: '密码不能为空' });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run("INSERT INTO accounts (username, real_name, department, role, password, avatar) VALUES (?, ?, ?, ?, ?, ?)", 
    [username, realName, department, role || 'user', hashedPassword, avatar || 'avatar_1'], function(err) {
    if (err) return res.status(500).json({ error: '用户名可能已存在或输入有误' });
    res.json({ message: '账号创建成功', id: this.lastID });
  });
});

router.post('/bulk', (req, res) => {
  const { users, strategy } = req.body;
  if (!Array.isArray(users)) {
    return res.status(400).json({ error: '无效的数据格式' });
  }
  
  for (const u of users) {
    if (!u.username || u.username.trim() === '') {
      return res.status(400).json({ error: '批量导入中包含空白用户名的记录' });
    }
    if (!u.password || u.password.trim() === '') {
      return res.status(400).json({ error: `用户 ${u.username || '未知'} 的密码不能为空` });
    }
  }

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    users.forEach(u => {
      const hashedPassword = bcrypt.hashSync(u.password, 10);
      if (strategy === 'overwrite') {
        db.run(`INSERT INTO accounts (username, real_name, department, role, password) 
                VALUES (?, ?, ?, ?, ?) 
                ON CONFLICT(username) DO UPDATE SET 
                real_name=excluded.real_name, 
                department=excluded.department, 
                role=excluded.role, 
                password=excluded.password`, 
          [u.username, u.realName, u.department, u.role || 'user', hashedPassword]);
      } else {
        db.run("INSERT OR IGNORE INTO accounts (username, real_name, department, role, password) VALUES (?, ?, ?, ?, ?)", 
          [u.username, u.realName, u.department, u.role || 'user', hashedPassword]);
      }
    });
    db.run("COMMIT", (err) => {
      if (err) return fail(res, 'accounts.bulk', err, '批量导入账号失败');
      res.json({ message: '批量操作完成' });
    });
  });
});

router.delete('/:id', (req, res) => {
  db.run("DELETE FROM accounts WHERE id = ? AND username != 'admin'", [req.params.id], function(err) {
    if (err) return fail(res, 'accounts.remove', err, '移除账号失败');
    res.json({ message: '账号已移除' });
  });
});

router.patch('/:id/password', (req, res) => {
  const { password } = req.body;
  if (!password || password.trim() === '') {
    return res.status(400).json({ error: '密码不能为空' });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run("UPDATE accounts SET password = ? WHERE id = ?", [hashedPassword, req.params.id], function(err) {
    if (err) return fail(res, 'accounts.resetPassword', err, '重置密码失败');
    res.json({ message: '密码已重置' });
  });
});

router.put('/:id/password', (req, res) => {
  const { password } = req.body;
  if (!password || password.trim() === '') {
    return res.status(400).json({ error: '密码不能为空' });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run("UPDATE accounts SET password = ? WHERE id = ?", [hashedPassword, req.params.id], function(err) {
    if (err) return fail(res, 'accounts.resetPasswordPut', err, '重置密码失败');
    res.json({ message: '密码已重置' });
  });
});

router.patch('/:id/role', (req, res) => {
  const { role } = req.body;
  if (!['admin', 'keeper', 'user'].includes(role)) {
    return res.status(400).json({ error: '无效的权限类型' });
  }
  db.get("SELECT username FROM accounts WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return fail(res, 'accounts.roleRead', err, '读取账号信息失败');
    if (!row) return res.status(404).json({ error: '账号不存在' });
    if (row.username === 'admin') {
      return res.status(400).json({ error: '无法修改内置管理员账号的权限' });
    }
    
    db.run("UPDATE accounts SET role = ? WHERE id = ?", [role, req.params.id], function(updateErr) {
      if (updateErr) return fail(res, 'accounts.roleWrite', updateErr, '修改权限失败');
      
      // Log
      db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
        ['修改权限', `修改了账号 ${row.username} 的系统权限为 ${role === 'admin' ? '系统管理员' : role === 'keeper' ? '仓库管理员' : '普通用户'}`, '系统管理员']);
        
      res.json({ message: '权限更新成功' });
    });
  });
});

router.put('/:id', (req, res) => {
  const { realName, department, role, avatar } = req.body;
  db.get("SELECT username, real_name FROM accounts WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return fail(res, 'accounts.updateRead', err, '读取账号信息失败');
    if (!row) return res.status(404).json({ error: '账号不存在' });
    
    const oldRealName = row.real_name;
    const cleanRealName = realName ? realName.trim() : oldRealName;
    const targetRole = row.username === 'admin' ? 'admin' : (role || 'user');
    
    db.run("UPDATE accounts SET real_name = ?, department = ?, role = ?, avatar = ? WHERE id = ?",
      [cleanRealName, department, targetRole, avatar || 'avatar_1', req.params.id], function(updateErr) {
        if (updateErr) return fail(res, 'accounts.updateWrite', updateErr, '更新账号资料失败');
        
        if (oldRealName && oldRealName !== cleanRealName) {
          db.run("UPDATE assets SET keeper = ? WHERE keeper = ?", [cleanRealName, oldRealName]);
          db.run("UPDATE maintenance_records SET reporter_name = ? WHERE reporter_name = ?", [cleanRealName, oldRealName]);
        }

        db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
          ['修改账号', `修改了账号 ${row.username} 的资料（姓名: ${cleanRealName}, 学科: ${department}）`, '系统管理员']);
          
        res.json({ message: '账号资料更新成功' });
      });
  });
});

export default router;
