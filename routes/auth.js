// routes/auth.js
// 认证域：登录。原 server.js 第 539-581 行，逻辑零改动。
// 挂载：app.use('/api', authRouter)  必须在 authMiddleware 之前。

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../lib/db.js';
import { jwtSecret } from '../lib/auth.js';

const router = express.Router();

// Auth
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.trim() === '') {
    return res.status(401).json({ message: '用户名或密码不能为空' });
  }
  db.get("SELECT id, username, real_name as realName, department, role, password, avatar FROM accounts WHERE username = ?", 
    [username], (err, row) => {
      if (err) {
        console.error('登录查询失败:', err);
        return res.status(500).json({ error: '服务器内部错误' });
      }
      if (!row) {
        db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
          ['登录失败', `登录失败：用户名不存在（尝试用户名：${username}）`, username]);
        return res.status(401).json({ message: '用户名或密码错误' });
      }
      
      let isMatch = false;
      try {
        isMatch = bcrypt.compareSync(password, row.password);
      } catch {
        isMatch = false;
      }
      
      if (!isMatch) {
        db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
          ['登录失败', `登录失败：密码错误（用户名：${row.username}）`, row.realName]);
        return res.status(401).json({ message: '用户名或密码错误' });
      }
      
      // Log login
      db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
        ['登录', `用户 ${row.realName} (${row.username}) 登录系统`, row.realName]);
        
      const token = jwt.sign(
        { id: row.id, username: row.username, role: row.role },
        jwtSecret,
        { expiresIn: '24h' }
      );

      res.json({
        id: row.id,
        username: row.username,
        realName: row.realName,
        department: row.department,
        role: row.role,
        avatar: row.avatar,
        token: token
      });
    });
});

export default router;
