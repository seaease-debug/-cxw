// lib/auth.js
// 服务端共享：JWT 密钥与鉴权中间件。
// 从 server.js 原样搬出，逻辑零改动。
// 注意：本文件只需 import jwt 与 crypto；下文的 `path` 是 req.path 的局部变量，不是 path 模块。

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (process.env.NODE_ENV === 'production') {
    console.error('致命错误：生产环境必须设置 JWT_SECRET 环境变量，已中止启动。');
    process.exit(1);
  }
  console.warn('警告：未设置 JWT_SECRET，已生成随机开发密钥（进程重启后旧登录态失效）。');
  jwtSecret = crypto.randomBytes(32).toString('hex');
}

export const authMiddleware = (req, res, next) => {
  const path = req.path;
  const originalUrl = req.originalUrl || '';

  // Exclude login and visitor scan endpoints to avoid breaking existing guest scanning features
  if (path === '/login' || originalUrl === '/api/login') {
    return next();
  }

  const isByNo = path.startsWith('/assets/by-no/') || originalUrl.startsWith('/api/assets/by-no/');
  const isModelPhoto = path.startsWith('/assets/model-photo/') || originalUrl.startsWith('/api/assets/model-photo/');
  const isHistory = (path.startsWith('/assets/') && path.endsWith('/history')) ||
                    (originalUrl.startsWith('/api/assets/') && originalUrl.endsWith('/history'));
  const isMaintenanceReport = (path === '/maintenance/reports' || originalUrl === '/api/maintenance/reports' ||
                              ((path === '/maintenance/records' || originalUrl === '/api/maintenance/records') && req.method === 'POST'));

  if (isByNo || isModelPhoto || isHistory || isMaintenanceReport) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未授权，请提供有效的凭证' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // Contains id, username, role
    next();
  } catch {
    return res.status(401).json({ message: '登录已过期或无效，请重新登录' });
  }
};

export const adminOnlyMiddleware = (req, res, next) => {
  const method = req.method;
  const path = req.path;
  const originalUrl = req.originalUrl || '';

  const isAccountsWrite = (path.startsWith('/accounts') || originalUrl.startsWith('/api/accounts')) && method !== 'GET';
  const isSuppliersWrite = (path.startsWith('/suppliers') || originalUrl.startsWith('/api/suppliers')) && method !== 'GET';
  const isSystem = path.startsWith('/system') || originalUrl.startsWith('/api/system');

  if (isAccountsWrite || isSuppliersWrite || isSystem) {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: '权限不足，仅管理员可执行此操作' });
    }
  }
  next();
};

export { jwtSecret };
