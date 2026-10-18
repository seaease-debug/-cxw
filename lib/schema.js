// lib/schema.js
// 服务端共享：SQLite 建表、列迁移与数据修复。
// 函数体来自 server.js 第 62-536 行（db.serialize 回调内部），缩进与内容零改动。
// 2026-10-03：原单函数 424 行（SonarSource S138 阈值 200）拆为 4 个子函数，
// 由文件末尾的入口函数按原顺序调用；外层包裹层与调用时机均未变。

import { db } from './db.js';
import bcrypt from 'bcryptjs';
import { getBeijingTimeString } from './time.js';

function createCoreTables() {

  // 1. Ensure Table Exists
  db.run(`
    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_no TEXT UNIQUE,
      serial_no TEXT,
      name TEXT,
      type TEXT,
      brand_model TEXT,
      purchase_date TEXT,
      purchase_price REAL,
      department TEXT,
      supplier TEXT,
      warehouse_location TEXT,
      mac_address TEXT,
      status TEXT,
      keeper TEXT,
      location TEXT,
      remarks TEXT,
      voucher_image TEXT,
      outbound_date TEXT,
      warranty_period TEXT,
      retirement_years INTEGER DEFAULT 8,
      uploader TEXT,
      audit_code TEXT,
      asset_image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // System Logs Table
  db.run(`
    CREATE TABLE IF NOT EXISTS system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action_type TEXT,
      description TEXT,
      operator TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // History Table
  db.run(`
    CREATE TABLE IF NOT EXISTS asset_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id INTEGER,
      action_type TEXT,
      description TEXT,
      operator TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Fault Types Table (故障类型设置)
  db.run(`
    CREATE TABLE IF NOT EXISTS fault_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      enabled INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, () => {
    // Seed default fault types if empty
    db.get("SELECT COUNT(*) as count FROM fault_types", (err, row) => {
      if (row && row.count === 0) {
        const defaults = [
          ['硬件故障', '部件老化、部件物理损坏或机械故障'],
          ['软件故障', '系统崩溃、应用报错或密码异常'],
          ['供电故障', '电源线断裂、充电头故障或电源板烧毁'],
          ['通信故障', '端口无信号、网线损坏或网卡故障'],
          ['其他故障', '难以判别分类的其他问题']
        ];
        const stmt = db.prepare("INSERT INTO fault_types (name, description, enabled) VALUES (?, ?, 1)");
        defaults.forEach(d => stmt.run(d[0], d[1]));
        stmt.finalize();
      }
    });
  });

  // Maintenance Records Table
  db.run(`
    CREATE TABLE IF NOT EXISTS maintenance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_no TEXT UNIQUE,
      asset_id INTEGER NOT NULL,
      asset_no TEXT NOT NULL,
      asset_name TEXT NOT NULL,
      reporter_name TEXT NOT NULL,
      reporter_contact TEXT,
      fault_type TEXT,
      fault_description TEXT,
      repair_status TEXT DEFAULT '待维修',
      cost REAL DEFAULT 0,
      repair_vendor TEXT,
      repair_date TEXT,
      finish_date TEXT,
      notes TEXT,
      result_action TEXT,
      target_warehouse TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, () => {
    // Alignment calibration for existing maintenance records with old default fault names
    db.run("UPDATE maintenance_records SET fault_type = '硬件故障' WHERE fault_type = '硬件损坏 / 配件故障' OR fault_type = '屏幕 / 外观破损'");
    db.run("UPDATE maintenance_records SET fault_type = '软件故障' WHERE fault_type = '软件 / 操作系统异常'");
    db.run("UPDATE maintenance_records SET fault_type = '供电故障' WHERE fault_type = '无法开机 / 供电故障'");
    db.run("UPDATE maintenance_records SET fault_type = '通信故障' WHERE fault_type = '网络 / 通信故障'");
    // Auto-fix any asset with '闲置' status back to standard '待周转'
    db.run("UPDATE assets SET status = '待周转' WHERE status = '闲置'");
  });

  // Triggers to update default created_at from UTC to Beijing Time (UTC+8)
  db.run(`
    CREATE TRIGGER IF NOT EXISTS trg_system_logs_bj
    AFTER INSERT ON system_logs
    FOR EACH ROW
    WHEN NEW.created_at = CURRENT_TIMESTAMP OR NEW.created_at IS NULL
    BEGIN
        UPDATE system_logs
        SET created_at = datetime('now', '+8 hours')
        WHERE id = NEW.id;
    END;
  `);

  db.run(`
    CREATE TRIGGER IF NOT EXISTS trg_asset_history_bj
    AFTER INSERT ON asset_history
    FOR EACH ROW
    WHEN NEW.created_at = CURRENT_TIMESTAMP OR NEW.created_at IS NULL
    BEGIN
        UPDATE asset_history
        SET created_at = datetime('now', '+8 hours')
        WHERE id = NEW.id;
    END;
  `);

  db.run(`
    CREATE TRIGGER IF NOT EXISTS trg_maintenance_records_bj
    AFTER INSERT ON maintenance_records
    FOR EACH ROW
    WHEN NEW.created_at = CURRENT_TIMESTAMP OR NEW.created_at IS NULL
    BEGIN
        UPDATE maintenance_records
        SET created_at = datetime('now', '+8 hours')
        WHERE id = NEW.id;
    END;
  `);
}

// ── 2. 资产表列迁移（表结构检查 + 补列）───────────────────────
function migrateAssetColumns() {

  // 2. Migration Check: Add voucher_image if missing
  db.all("PRAGMA table_info(assets)", (err, columns) => {
    if (err) {
      console.error("Failed to check table schema:", err);
      return;
    }
    const hasVoucher = columns.some(c => c.name === 'voucher_image');
    if (!hasVoucher) {
      console.log("⚠️ Schema Migration: Adding 'voucher_image' column to assets table...");
      db.run("ALTER TABLE assets ADD COLUMN voucher_image TEXT", (alterErr) => {
        if (alterErr) console.error("Migration Failed:", alterErr);
        else console.log("✅ Schema Migration Success: 'voucher_image' added.");
      });
    }

    const hasOutboundDate = columns.some(c => c.name === 'outbound_date');
    if (!hasOutboundDate) {
      console.log("⚠️ Schema Migration: Adding 'outbound_date' column to assets table...");
      db.run("ALTER TABLE assets ADD COLUMN outbound_date TEXT", (alterErr) => {
        if (alterErr) console.error("Migration Failed:", alterErr);
        else console.log("✅ Schema Migration Success: 'outbound_date' added.");
      });
    }

    const hasWarranty = columns.some(c => c.name === 'warranty_period');
    if (!hasWarranty) {
      console.log("⚠️ Schema Migration: Adding 'warranty_period' column to assets table...");
      db.run("ALTER TABLE assets ADD COLUMN warranty_period TEXT", (alterErr) => {
        if (alterErr) console.error("Migration Failed:", alterErr);
        else console.log("✅ Schema Migration Success: 'warranty_period' added.");
      });
    }

    const hasRetirement = columns.some(c => c.name === 'retirement_years');
    if (!hasRetirement) {
      console.log("⚠️ Schema Migration: Adding 'retirement_years' column to assets table...");
      db.run("ALTER TABLE assets ADD COLUMN retirement_years INTEGER DEFAULT 8", (alterErr) => {
        if (alterErr) console.error("Migration Failed:", alterErr);
        else console.log("✅ Schema Migration Success: 'retirement_years' added.");
      });
    }

    const hasUploader = columns.some(c => c.name === 'uploader');
    if (!hasUploader) {
      console.log("⚠️ Schema Migration: Adding 'uploader' column to assets table...");
      db.run("ALTER TABLE assets ADD COLUMN uploader TEXT", (alterErr) => {
        if (alterErr) console.error("Migration Failed:", alterErr);
        else {
          console.log("✅ Schema Migration Success: 'uploader' added.");
          db.run("UPDATE assets SET uploader = 'admin' WHERE uploader IS NULL OR uploader = ''", (updErr) => {
            if (!updErr) console.log("✅ Populated empty uploader values with admin.");
          });
        }
      });
    } else {
      // Safely ensure all existing null or empty uploader values, or values that are not valid account usernames, are set to 'admin'
      db.run("UPDATE assets SET uploader = 'admin' WHERE uploader IS NULL OR uploader = '' OR uploader NOT IN (SELECT username FROM accounts)");
    }

    const hasAuditCode = columns.some(c => c.name === 'audit_code');
    if (!hasAuditCode) {
      console.log("⚠️ Schema Migration: Adding 'audit_code' column to assets table...");
      db.run("ALTER TABLE assets ADD COLUMN audit_code TEXT", (alterErr) => {
        if (alterErr) console.error("Migration Failed:", alterErr);
        else console.log("✅ Schema Migration Success: 'audit_code' added.");
      });
    }

    const hasAssetImage = columns.some(c => c.name === 'asset_image');
    if (!hasAssetImage) {
      console.log("⚠️ Schema Migration: Adding 'asset_image' column to assets table...");
      db.run("ALTER TABLE assets ADD COLUMN asset_image TEXT", (alterErr) => {
        if (alterErr) console.error("Migration Failed:", alterErr);
        else console.log("✅ Schema Migration Success: 'asset_image' added.");
      });
    }

    db.all("PRAGMA table_info(maintenance_records)", (err, mrCols) => {
      if (!err && mrCols) {
        const hasTargetWh = mrCols.some(c => c.name === 'target_warehouse');
        if (!hasTargetWh) {
          console.log("⚠️ Schema Migration: Adding 'target_warehouse' column to maintenance_records table...");
          db.run("ALTER TABLE maintenance_records ADD COLUMN target_warehouse TEXT");
        }
      }
    });
  });
}

// ── 3. 数据迁移与修复（状态值 / 地点 / 中文日期 / 历史回填）──
function migrateLegacyData() {

  // 3. Data Migration: Update terminology '在用' -> '服役中', 旧周转仓 -> '待周转', 旧报废仓 -> '待报废'
  db.run("UPDATE assets SET status = '服役中' WHERE status = '在用'", function(err) {
    if(!err && this.changes > 0) {
      console.log(`✅ Data Migration: Updated ${this.changes} records from '在用' to '服役中'`);
    }
  });

  db.run("UPDATE assets SET status = '待周转' WHERE status IN ('周转仓(待处理)', '周转仓(待派发)', '待处理(周转)', '待处理', '周转仓')", function(err) {
    if(!err && this.changes > 0) {
      console.log(`✅ Data Migration: Updated ${this.changes} records to '待周转'`);
    }
  });

  db.run("UPDATE assets SET status = '待报废' WHERE status IN ('报废仓(待处置)', '待处置', '报废仓', '报废审核中')", function(err) {
    if(!err && this.changes > 0) {
      console.log(`✅ Data Migration: Updated ${this.changes} records to '待报废'`);
    }
  });

  // Clean legacy warehouse_location values
  db.run("UPDATE assets SET warehouse_location = '1楼小仓库' WHERE warehouse_location IN ('主仓库', '报废仓', '周转仓')", function(err) {
    if(!err && this.changes > 0) {
      console.log(`✅ Data Cleanup: Fixed ${this.changes} legacy warehouse locations`);
    }
  });

  db.run("UPDATE assets SET location = '自行保管' WHERE location IN ('主仓库', '报废仓', '周转仓')", function(err) {
    if(!err && this.changes > 0) {
      console.log(`✅ Data Cleanup: Fixed ${this.changes} legacy asset locations`);
    }
  });

  // 4. Data Repair: Automatically fix Chinese date formats (e.g., 2024年11月1日 -> 2024-11-01)
  db.all("SELECT id, purchase_date FROM assets WHERE purchase_date LIKE '%年%月%日%'", (err, rows) => {
    if (err) {
      console.error("Data repair scan failed:", err);
      return;
    }
    if (rows && rows.length > 0) {
      console.log(`🔍 Found ${rows.length} assets with Chinese date format. Starting automatic repair...`);
      db.serialize(() => {
        const updateStmt = db.prepare("UPDATE assets SET purchase_date = ? WHERE id = ?");
        rows.forEach(row => {
          const dateStr = row.purchase_date;
          const match = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
          if (match) {
            const year = match[1];
            const month = match[2].padStart(2, '0');
            const day = match[3].padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            updateStmt.run([formattedDate, row.id]);
          }
        });
        updateStmt.finalize();
        console.log("✅ Automatic data repair completed.");
      });
    }

    // 5. Data Migration: Automatically create a real '初始入库登记' history log for all assets if they don't have one
    db.all("SELECT id, asset_no, brand_model, purchase_date, uploader FROM assets", [], (migErr, migRows) => {
      if (!migErr && migRows) {
        migRows.forEach(row => {
          db.get("SELECT COUNT(*) AS count FROM asset_history WHERE asset_id = ? AND action_type = '初始入库登记'", [row.id], (histErr, histRow) => {
            if (!histErr && histRow && histRow.count === 0) {
              let logDate = getBeijingTimeString(); // fallback
              if (row.purchase_date) {
                const cleanDate = row.purchase_date.replace(/年|月/g, '-').replace(/日/g, '').trim();
                if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
                  logDate = `${cleanDate} 08:00:00`;
                }
              }
              db.run("INSERT INTO asset_history (asset_id, action_type, description, operator, created_at) VALUES (?, ?, ?, ?, ?)", [
                row.id,
                '初始入库登记',
                `资产入库登记 (编号: ${row.asset_no})`,
                row.uploader || 'admin',
                logDate
              ]);
            }
          });
        });
      }
    });
  });
}

// ── 4. 辅助表（账户 / 供应商 / 仓库 / 资产类型 / 固定位置）────
function createAuxTables() {

  // Unified Accounts Table
  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      real_name TEXT NOT NULL,
      department TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      password TEXT NOT NULL,
      avatar TEXT
    )
  `, () => {
    // Check & Migrate 'avatar' column if missing before any insert/update
    db.all("PRAGMA table_info(accounts)", (err, columns) => {
      if (!err && columns) {
        const hasAvatar = columns.some(c => c.name === 'avatar');
        const setupAdminAndDefaults = () => {
          // Default Admin Initialization
          const defaultAdminHash = bcrypt.hashSync('nbzx1898', 10);
          db.run("INSERT OR IGNORE INTO accounts (username, real_name, department, role, password, avatar) VALUES (?, ?, ?, ?, ?, ?)", 
            ['admin', '系统管理员', '科技信息中心', 'admin', defaultAdminHash, 'avatar_10'], (insertErr) => {
              if (insertErr) {
                console.error("Admin initialization failed:", insertErr);
              } else {
                // Perform a safe backfill for empty values
                db.run("UPDATE accounts SET avatar = 'avatar_10' WHERE username = 'admin' AND (avatar IS NULL OR avatar = '')");
                db.run("UPDATE accounts SET avatar = 'avatar_1' WHERE avatar IS NULL OR avatar = ''");
              }
            }
          );
        };

        if (!hasAvatar) {
          console.log("⚠️ Schema Migration: Adding 'avatar' column to accounts table...");
          db.run("ALTER TABLE accounts ADD COLUMN avatar TEXT", (alterErr) => {
            if (alterErr) {
              console.error("Migration 'avatar' Failure:", alterErr);
            } else {
              console.log("✅ Schema Migration Success: 'avatar' added.");
            }
            setupAdminAndDefaults();
          });
        } else {
          setupAdminAndDefaults();
        }
      }
    });
  });

  // Suppliers Table
  db.run(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT,
      maintenance_phone TEXT,
      remarks TEXT
    )
  `);

  // Warehouses Table
  db.run(`
    CREATE TABLE IF NOT EXISTS warehouses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      code TEXT UNIQUE NOT NULL,
      location_desc TEXT
    )
  `, () => {
    // Populate default warehouses
    const defaults = [
      ['1楼小仓库', '1FSM', '1楼小仓库'],
      ['1楼办公室仓库', '1FOF', '1楼办公室仓库'],
      ['4楼大仓库', '4FBG', '教学楼四楼'],
      ['3楼中心机房', '3FCR', '核心机房']
    ];
    defaults.forEach(([name, code, desc]) => {
      db.run("INSERT OR IGNORE INTO warehouses (name, code, location_desc) VALUES (?, ?, ?)", [name, code, desc]);
    });
  });

  // Asset Types Table
  db.run(`
    CREATE TABLE IF NOT EXISTS asset_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      code_prefix TEXT UNIQUE NOT NULL,
      sort_order INTEGER DEFAULT 0
    )
  `, () => {
    db.get("SELECT COUNT(*) as count FROM asset_types", (err, row) => {
      if (!err && row && row.count === 0) {
        console.log("Seeding default asset types...");
        const defaultAssetTypes = [
          ['笔记本电脑', 'NB', 1],
          ['台式电脑', 'PC', 2],
          ['显示器', 'MON', 3],
          ['投影仪', 'PROJ', 4],
          ['打印机', 'PRT', 5],
          ['扫描仪', 'SCAN', 6],
          ['交换机', 'SWITCH', 7],
          ['路由器', 'ROUTER', 8],
          ['服务器', 'SRV', 9],
          ['多媒体中控', 'MC', 10],
          ['音响设备', 'AUDIO', 11],
          ['摄像头', 'CAM', 12],
          ['一体机', 'AIO', 13],
          ['平板电脑', 'TAB', 14],
          ['数码相机', 'DC', 15],
          ['UPS电源', 'UPS', 16],
          ['机柜', 'CAB', 17],
          ['空调', 'AC', 18]
        ];
        const stmt = db.prepare("INSERT OR IGNORE INTO asset_types (name, code_prefix, sort_order) VALUES (?, ?, ?)");
        defaultAssetTypes.forEach(([name, prefix, sort]) => {
          stmt.run([name, prefix, sort]);
        });
        stmt.finalize();
      }
    });
  });

  // Locations Table (固定物理位置字典)
  db.run(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, () => {
    db.get("SELECT COUNT(*) as count FROM locations", (err, row) => {
      if (!err && row && row.count === 0) {
        console.log("Seeding default fixed locations...");
        const defaultLocations = [
          ['多功能教室', '教学楼一楼综合多媒体教学场所'],
          ['微格教室', '教师技能实训与录播教室'],
          ['电子阅览室', '图书馆二楼电子阅览区'],
          ['行政楼301会议室', '行政楼三楼中型会议室'],
          ['体育馆控制室', '体育馆声光电集中控制室'],
          ['中心机房', '科技信息中心核心服务器与网络机房'],
          ['302实验室', '科技楼三楼计算机实验室']
        ];
        const stmt = db.prepare("INSERT OR IGNORE INTO locations (name, description) VALUES (?, ?)");
        defaultLocations.forEach(([name, desc]) => {
          stmt.run([name, desc]);
        });
        stmt.finalize();
      }
    });
  });
}

// ── 入口：保持 server.js 里的原调用方式不变 ──────────────────
export function initSchema() {
  createCoreTables();
  migrateAssetColumns();
  migrateLegacyData();
  createAuxTables();
}

