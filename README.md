# EduAsset Pro 固定资产登记平台

> **改代码前先读 [`AI-RULES.md`](./AI-RULES.md)。**
> 本仓库已完成大文件拆分（5 个超千行文件全部归零），新代码不得让文件重新膨胀。

学校科技信息中心固定资产全生命周期管理系统。支持资产入库、出库、退库、报废、报表统计、系统日志追溯。

## 快速开始

### 环境要求

- **Node.js** >= 18

### 安装 & 启动

```bash
# 1. 克隆代码
git clone <repo-url> eduasset-pro
cd eduasset-pro

# 2. 安装依赖
npm install

# 3. 配置环境变量（可选）
#    编辑 .env 文件，默认端口无需修改即可使用

# 4. 构建前端 + 启动服务
npm start
```

访问 **http://localhost:2000** 进入系统。

默认管理员账号：`admin` / `nbzx1898`

### 开发模式

```bash
npm run dev
```

前端开发服务器在 `http://localhost:2000`，API 后端在 `http://localhost:2001`（Vite 自动代理 /api 请求）。

## 技术栈

| 层 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 6 |
| 样式 | Tailwind CSS v4 |
| 图标 | lucide-react |
| 后端 | Express 5 |
| 数据库 | SQLite3 |
| 图表 | Recharts |

## 项目结构

```
eduasset-pro/
├── components/        # React 组件
│   ├── Admin.tsx          # 系统管理
│   ├── Dashboard.tsx      # 工作台
│   ├── Layout.tsx         # 布局框架
│   ├── Login.tsx          # 登录页
│   ├── Warehouse.tsx      # 仓库管理（主模块）
│   ├── WarehouseUpdateModal.tsx  # 资产更新弹窗
│   ├── Reports.tsx        # 统计报表
│   ├── Suppliers.tsx      # 供应商管理
│   ├── SystemLogs.tsx     # 系统日志
│   ├── Toast.tsx          # Toast 通知系统
│   └── ...                # 其他管理模块
├── server.js          # Express 后端（API + 静态文件服务）
├── App.tsx            # 应用根组件
├── index.tsx          # 入口文件
├── index.html         # HTML 模板
├── index.css          # 全局样式 + Tailwind 主题
├── vite.config.ts     # Vite 配置
├── .env               # 环境变量
└── package.json
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `2000` | 后端 API 端口（唯一入口，同时托管 `dist/` 产物） |
| `VITE_PORT` | `3000` | 前端开发服务器端口（仅 `npm run dev` 使用） |
| `CORS_ORIGINS` | — | 允许跨域的来源，逗号分隔 |
