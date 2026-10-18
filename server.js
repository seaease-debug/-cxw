
import express from 'express';
import 'dotenv/config';
import { db } from './lib/db.js';
import { authMiddleware, adminOnlyMiddleware } from './lib/auth.js';
import { createRateLimiter } from './lib/rate-limit.js';
import suppliersRouter from './routes/suppliers.js';
import warehousesRouter from './routes/warehouses.js';
import assetTypesRouter from './routes/assetTypes.js';
import locationsRouter from './routes/locations.js';
import faultTypesRouter from './routes/faultTypes.js';
import accountsRouter from './routes/accounts.js';
import assetsRouter from './routes/assets.js';
import authRouter from './routes/auth.js';
import systemRouter from './routes/system.js';
import exportRouter from './routes/export.js';
import maintenanceRouter from './routes/maintenance.js';
import { uploadsDir } from './lib/media.js';
import { initSchema } from './lib/schema.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration based on env variables
const envOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(item => item.trim()).filter(Boolean)
  : [];

const allowedOrigins = [...envOrigins];

// In development mode or if no origins are specified, default to local development origins
if (process.env.NODE_ENV !== 'production' || allowedOrigins.length === 0) {
  if (!allowedOrigins.includes('http://localhost:5173')) {
    allowedOrigins.push('http://localhost:5173');
  }
  if (!allowedOrigins.includes('http://localhost:3000')) {
    allowedOrigins.push('http://localhost:3000');
  }
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
// Increased limit to handle base64 images
app.use(bodyParser.json({ limit: '50mb' }));

// Map /api/uploads statically
app.use('/api/uploads', express.static(uploadsDir));

// ─── Production: serve built frontend ─────────────────────────
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

db.serialize(initSchema);

// Rate limiting
app.use('/api/login', createRateLimiter({ windowMs: 60000, max: 5, message: '登录尝试次数过多，请 1 分钟后再试' }));

// Auth
app.use('/api', authRouter);

app.use('/api', authMiddleware);
app.use('/api', adminOnlyMiddleware);

// ─── 字典域路由（已拆分至 routes/）─────────────────────────────────────
// 以下 5 个域各自独立成文件，行为与拆分前完全一致。
// 挂载位置必须在 app.use('/api', authMiddleware) 之后。
app.use('/api/suppliers', suppliersRouter);
app.use('/api/warehouses', warehousesRouter);
app.use('/api/asset-types', assetTypesRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/fault-types', faultTypesRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/system', systemRouter);
app.use('/api/export', exportRouter);
app.use('/api/maintenance', maintenanceRouter);



// ─── Production SPA fallback — serve index.html for all non-API routes ──
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  if (req.method !== 'GET') return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
