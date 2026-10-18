# EduAsset Pro 固定资产登记平台说明文档

本系统（**EduAsset Pro**）是专为学校（如宁波中学）**科技信息中心**定制设计的高校固定资产数字化管理系统。系统旨在实现学校固定资产从“入库登记、日常流转、盘点核验、维保监控、智能预警”到“退役报废”的全生命周期精细化管理。

---

## 一、 系统简介 (Overview)

EduAsset Pro 固定资产登记平台采用现代化的前后端分离（或全栈同构部署）架构，重点面向学校科技信息中心及各科室资产管理员，提供全面、高效、安全的资产登记与盘点追踪服务。

### 1.1 核心价值
- **全周期管理**：完整覆盖资产采购、分配、流转、变更、保修直至报废折旧的生命周期。
- **高时效追溯**：通过资产编号（Asset No）与资产变更履历（Asset History）的一对多关联，实现所有操作和状态流转的“源头可溯”。
- **精细化盘点**：结合各仓库核验码和状态快照，对实物与账面资产进行一键审计。
- **直观化数据**：提供包含资产总值、各分类占比、折旧年限分布和维保报警的多维度可视化仪表盘。

---

## 二、 运行逻辑 (Execution & Runtime Logic)

系统在技术实现与交互流程上遵循严密的层级结构和设计规范：

### 2.1 技术栈与架构
- **前端核心**：React 19 + Vite 6 + Tailwind CSS v4 + Lucide React 图标库。
- **后端服务**：Node.js + Express 5，集成 JWT 安全身份验证、SQLite3 轻量级关系数据库。
- **界面体验**：支持流畅的自适应暗色模式切换、Apple Vision Pro 磨砂毛玻璃风格的登录面板、支持拖拽与手动选择的双向文件上传系统、Toast 消息通知系统。

### 2.2 核心业务流程
1. **身份认证**：用户登录时输入账号、密码并提供图形验证码（Captcha）。系统通过 `bcrypt` 匹配密码哈希，并分发有效期内的 JWT Token。
2. **资产建档与编码自动生成**：管理员录入新资产时，系统会基于“资产类别前缀”、“采购日期数字”和“存储仓库映射代码”及随机扰动位，自动生成**全校唯一**的格式化资产编号。
3. **资产流转与状态机**：资产具备标准的状态过渡属性（服役中、闲置、报废、维修中等），每次状态变更会自动在 `asset_history` 表中追加一条审计记录。
4. **流转时间校准 (Trigger-based Local Time)**：系统底层的日志与变动履历时间，通过 SQLite 触发器（Triggers）在插入时自动将 UTC 的 `CURRENT_TIMESTAMP` 修正为北京时间（UTC+8）。
5. **资产盘点 (Audit Check)**：盘点模式下，管理员对每项资产扫码或手动核对后录入“核验码”，更新盘点状态。

---

## 三、 数据构成 (Data Schema)

系统基于 SQLite3 构建了高度规范化的关系型数据库，主要由以下核心数据表构成：

### 3.1 核心数据表结构

#### 1) `assets` (固定资产登记表)
记录固定资产的核心属性、资产现状及财务凭证信息。

| 字段名 | 类型 | 约束说明 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | 数据库自增主键 |
| `asset_no` | TEXT | UNIQUE | **资产编号** (唯一，例：`NB-20260218-1FSM2j3b`) |
| `serial_no` | TEXT | - | 设备出厂序列号 (S/N) |
| `name` | TEXT | - | 资产名称 |
| `type` | TEXT | - | 资产类别 (关联自资产类别表) |
| `brand_model`| TEXT | - | 品牌及规格型号 |
| `purchase_date`| TEXT | - | 采购日期 (格式统一为 YYYY-MM-DD) |
| `purchase_price`| REAL | - | 采购单价 (元) |
| `department` | TEXT | - | 使用/归属部门 |
| `supplier` | TEXT | - | 供应商名称 |
| `warehouse_location`| TEXT| - | 所属一级仓库 (例：`1楼小仓库`) |
| `mac_address` | TEXT | - | 网卡 MAC 地址 (用于 IT 网络资产快速检索) |
| `status` | TEXT | - | 资产当前状态 (服役中 / 闲置 / 报废 / 维修中) |
| `keeper` | TEXT | - | 设备保管人 / 负责人 |
| `location` | TEXT | - | 物理存放的具体位置 (如: 实验楼302室) |
| `voucher_image`| TEXT | - | 凭证/发票/合同照片存储路径 (Base64 / 磁盘路径) |
| `asset_image` | TEXT | - | 资产实物照片存储路径 |
| `outbound_date`| TEXT | - | 出库日期 |
| `warranty_period`| TEXT| - | 保修期限 |
| `retirement_years`| INTEGER| DEFAULT 8 | 折旧退役年限 (默认 8 年) |
| `uploader` | TEXT | - | 登记/录入人账号 (关联 `accounts.username`) |
| `audit_code` | TEXT | - | 盘点核验码 |
| `remarks` | TEXT | - | 备注补充说明 |
| `created_at` | DATETIME| DEFAULT CURRENT_TIMESTAMP| 创建时间 |

#### 2) `accounts` (用户与管理员账户表)
记录系统的操作账户及对应的角色权限。

| 字段名 | 类型 | 约束说明 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY | 账户主键 |
| `username` | TEXT | UNIQUE | 用户登录名 |
| `real_name` | TEXT | NOT NULL | 用户真实姓名 |
| `department` | TEXT | NOT NULL | 所属部门 (如：科技信息中心) |
| `role` | TEXT | DEFAULT 'user' | 系统角色 (`admin` 拥有全部权限，`user` 为普通教师/录入员) |
| `password` | TEXT | NOT NULL | 加密存储的密码哈希 (`bcrypt` 单向加密) |
| `avatar` | TEXT | - | 关联的预置头像标识 (如 `avatar_10`) |

#### 3) `suppliers` (供应商与服务商表)
记录固定资产对应的售后维护和维保供货商。

| 字段名 | 类型 | 约束说明 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY | 主键 |
| `name` | TEXT | NOT NULL | 供应商/公司名称 |
| `contact_person`| TEXT | - | 联系人姓名 |
| `phone` | TEXT | - | 业务联系电话 |
| `maintenance_phone`| TEXT | - | 售后/报修应急电话 |
| `remarks` | TEXT | - | 资质与备注信息 |

#### 4) `warehouses` (仓库及存放中心表)
记录固定资产存放的物理一级库区。

| 字段名 | 类型 | 约束说明 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY | 库区主键 |
| `name` | TEXT | UNIQUE NOT NULL | 仓库名称 (如：1楼小仓库、3楼中心机房等) |
| `code` | TEXT | UNIQUE NOT NULL | 仓库映射代号 (4位大写，如 `1FSM`, `1FOF`, `4FBG`, `3FCR`) |
| `location_desc`| TEXT | - | 详细地理位置及路线描述 |

#### 5) `asset_types` (资产分类与前缀代码表)
用于维护全校固定资产分类以及自动生成编号所需的前缀规范。

| 字段名 | 类型 | 约束说明 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY | 分类主键 |
| `name` | TEXT | UNIQUE NOT NULL | 分类名称 (如：笔记本电脑, 投影仪, 交换机) |
| `code_prefix`| TEXT | UNIQUE NOT NULL | 对应的前缀字母缩写 (如：`NB`, `PROJ`, `SWITCH`) |
| `sort_order` | INTEGER | DEFAULT 0 | 后端列表展示排序权重 |

#### 6) `system_logs` (系统运行与操作审计日志表)
审计系统的安全访问和数据异常波动。

- `id`: 主键
- `action_type`: 动作类型 (如: “用户登录”, “添加资产”, “供应商变更”)
- `description`: 详细动作及变更前后的关键快照
- `operator`: 操作人 (Real Name + Username)
- `created_at`: 北京时间

#### 7) `asset_history` (资产变动生命履历表)
独立追踪每项固定资产的历史变迁状态。

- `id`: 主键
- `asset_id`: 关联 `assets.id` (外键逻辑级联)
- `action_type`: 变更类别 (例: “初始入库登记”, “调拨流转”, “报废折旧”, “状态变更”)
- `description`: 具体说明
- `operator`: 执行该流转的经办人账户名
- `created_at`: 经办时间

---

## 四、 条件约束与核心规则 (Business Constraints & Rules)

为了确保固定资产账目的严密性，系统在业务层引入了以下严苛的限制性约束：

### 4.1 资产编码唯一性与拼装规则
- **格式公式**：
  $$\text{AssetID} = \text{SchoolCode/Prefix} - \text{PurchaseDatePart} - \text{WarehouseCode} + \text{RandomString(4)}$$
  *例*：`NB-20260720-1FSMab12`
  - `NB`：对应资产分类的前缀编码（笔记本电脑）。
  - `20260720`：采购日期。如果入库时无指定采购日期，系统强制以当前北京时间日期拼装。
  - `1FSM`：对应入库一级仓库代号映射表（`1楼小仓库` $\rightarrow$ `1FSM`）。
  - `ab12`：系统内置的 62 进制 4 位混淆防撞码，防止并发入库时编号冲突。
- **不可撤销约束**：资产一旦审核入库分配了 `asset_no`，该资产编号在生命周期内**绝对禁止被修改**，确保审计链路的一致性。

### 4.2 角色权限边界约束 (Role-Based Access Control)
- **内置安全管理员**：系统包含唯一的初始化内置管理员 `admin`（真实姓名：“系统管理员”，隶属“科技信息中心”，初始密码 `nbzx1898`）。
- **硬性禁止删除**：`admin` 账号在数据库中设置了保护屏障，**任何情况下均不允许被执行 DELETE 物理或逻辑删除**，防止系统陷入无权限管理状态。
- **权限边界区分**：
  - `admin` (系统管理员)：具有供应商管理、全库资产增删改查、用户账户添加/修改/禁用、查看系统全局审计日志的超级权限。
  - `user` (普通资产保管人)：可查看自身所属部门资产、进行资产日常登记、盘点核验，但**不具备删除资产、编辑供应商、管理账户、清空历史日志**的任何权限。

### 4.3 数据变动与级联安全约束
- **无痕数据禁止物理删除**：为了应对严格的学校资产审计，资产的变动历史（`asset_history`）和系统运行日志（`system_logs`）**不提供物理删除接口**。系统对流转信息的清理实行最严格控制。
- **关联数据清理控制**：已被资产表引用的“供应商”和“所属仓库”信息，在删除时前端和后端会进行强校验。如果对应分类/供应商下仍有服役资产，系统将拒绝执行删除操作，提示进行资产调拨或分类重新指定。

### 4.4 品牌设计红线限制 (Design Presets)
- **品牌主视觉**：采用高对比度极简学术墨绿，品牌色硬性规定为 **`oklch(0.50 0.10 200)`（矿物墨绿）**，确保系统给学校科技教师呈现庄重、沉稳的技术氛围。
- **图标标准**：全系统图标由 `lucide-react` 统一驱动并配套 `aria-label` 无障碍标签，严禁使用 emoji 作为 UI 功能按钮。
- **暗色模式切换**：通过 `Layout.tsx` 管理状态，将 `.dark` 类挂载于 `<html>` 根元素，底层全面支持基于标准 CSS 变量覆盖机制的暗白无感转换，并利用 `localStorage` 自动持久化保存用户主题偏好。

---

*EduAsset Pro 固定资产登记平台 — 为科技信息中心打造的专业级资产数字化引擎*
