// routes/assets.js
// 资产管理 —— 从 server.js 原样拆出，逻辑零改动。

import express from 'express';
import { db } from '../lib/db.js';
import { getBeijingTimeString, getBeijingDateString } from '../lib/time.js';
import { generateAssetID } from '../lib/assetId.js';
import { saveBase64Image, saveBase64Voucher } from '../lib/media.js';
import { fail } from '../lib/apiError.js';

const router = express.Router();

router.get('/', (req, res) => {
  const keeper = req.query.keeper;
  const uploader = req.query.uploader;
  let sql = "SELECT * FROM assets";
  let params = [];
  let conditions = [];

  if (req.user && req.user.role === 'keeper') {
    conditions.push("(uploader = ? OR keeper = ? OR keeper = (SELECT real_name FROM accounts WHERE username = ?))");
    params.push(req.user.username, req.user.username, req.user.username);
  } else if (req.user && req.user.role === 'user') {
    conditions.push("(keeper = ? OR keeper = (SELECT real_name FROM accounts WHERE username = ?))");
    params.push(req.user.username, req.user.username);
  } else {
    if (uploader) {
      conditions.push("uploader = ?");
      params.push(uploader);
    } else if (keeper) {
      conditions.push("keeper = ?");
      params.push(keeper);
    }
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }
  sql += " ORDER BY created_at DESC";

  db.all(sql, params, (err, rows) => {
    if (err) return fail(res, 'assets.list', err, '读取资产列表失败');
    res.json(rows);
  });
});

router.get('/by-no/:asset_no', (req, res) => {
  const sql = "SELECT * FROM assets WHERE asset_no = ?";
  db.get(sql, [req.params.asset_no], (err, row) => {
    if (err) return fail(res, 'assets.byNo', err, '按资产编号查询失败');
    if (!row) return res.status(404).json({ error: "未找到资产" });
    res.json(row);
  });
});

router.get('/model-photo/:brand_model', (req, res) => {
  const sql = "SELECT asset_image FROM assets WHERE brand_model = ? AND asset_image IS NOT NULL AND asset_image != '' LIMIT 1";
  db.get(sql, [req.params.brand_model], (err, row) => {
    if (err) return fail(res, 'assets.modelPhoto', err, '读取型号照片失败');
    res.json({ asset_image: row ? row.asset_image : null });
  });
});

router.post('/inbound', (req, res) => {
  const data = req.body;
  
  const schoolCode = data.schoolCode || 'NB';
  db.get("SELECT code FROM warehouses WHERE name = ?", [data.warehouseLocation], (err, whRow) => {
    const whCode = whRow ? whRow.code : data.warehouseLocation;
    const assetNo = generateAssetID(schoolCode, data.purchaseDate, whCode);

    let finalAssetImage = data.assetImage || null;
    if (finalAssetImage && finalAssetImage.startsWith('data:image/')) {
      finalAssetImage = saveBase64Image(finalAssetImage, data.brandModel);
    }

    const queryAndInsert = () => {
      const sql = `INSERT INTO assets (
        asset_no, serial_no, name, type, brand_model, purchase_date, 
        purchase_price, department, supplier, warehouse_location, 
        mac_address, status, keeper, location, remarks, warranty_period,
        retirement_years, uploader, audit_code, asset_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const params = [
        assetNo, data.serialNo, data.name || data.brandModel, data.type, data.brandModel, 
        data.purchaseDate, data.purchasePrice, '科技信息中心', data.supplier, 
        data.warehouseLocation, data.macAddress, '新设备在库', 
        data.keeper || data.uploaderRealName || '设备管理员', '主仓库', data.remarks, data.warrantyPeriod || '3年',
        data.retirementYears || 8, data.uploader || 'admin', data.auditCode || "", finalAssetImage
      ];
      db.run(sql, params, function(err) {
        if (err) return fail(res, 'assets.inbound', err, '资产入库失败');
        
        const assetId = this.lastID;

        // Propagate newly uploaded model image to other assets of the same model
        if (data.assetImage && data.assetImage.startsWith('data:image/') && finalAssetImage) {
          db.run("UPDATE assets SET asset_image = ? WHERE brand_model = ?", [finalAssetImage, data.brandModel]);
        }

        // Log System
        db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
          ['资产入库', `新增资产: ${data.brandModel} (${assetNo})`, data.uploader || 'admin']);

        // Log History
        let logDate = getBeijingTimeString(); // default to now
        if (data.purchaseDate) {
          const cleanDate = data.purchaseDate.replace(/年|月/g, '-').replace(/日/g, '').trim();
          if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
            logDate = `${cleanDate} 08:00:00`;
          }
        }
        const historySql = `INSERT INTO asset_history (asset_id, action_type, description, operator, created_at) VALUES (?, ?, ?, ?, ?)`;
        db.run(historySql, [assetId, '初始入库登记', `资产入库登记 (编号: ${assetNo})`, data.uploader || 'admin', logDate]);

        res.json({ message: '入库成功', id: assetId, assetNo });
      });
    };

    if (!finalAssetImage && data.brandModel) {
      db.get("SELECT asset_image FROM assets WHERE brand_model = ? AND asset_image IS NOT NULL AND asset_image != '' LIMIT 1", [data.brandModel], (err, row) => {
        if (!err && row && row.asset_image) {
          finalAssetImage = row.asset_image;
        }
        queryAndInsert();
      });
    } else {
      queryAndInsert();
    }
  });
});

// Update Asset Details (Full Update)
router.put('/:id', (req, res) => {
  const { serialNo, macAddress, type, brandModel, purchaseDate, purchasePrice, supplier, warehouseLocation, remarks, warrantyPeriod, retirementYears, auditCode, assetImage, uploader, operator } = req.body;
  
  let finalAssetImage = assetImage !== undefined ? assetImage : null;
  if (finalAssetImage && finalAssetImage.startsWith('data:image/')) {
    finalAssetImage = saveBase64Image(finalAssetImage, brandModel);
  }

  const runUpdate = () => {
    const sql = `UPDATE assets SET 
      serial_no = ?, mac_address = ?, type = ?, brand_model = ?, 
      name = ?, purchase_date = ?, purchase_price = ?, supplier = ?, 
      warehouse_location = ?, remarks = ?, warranty_period = ?,
      retirement_years = ?, audit_code = ?, asset_image = ?
      WHERE id = ?`;
      
    db.run(sql, [
      serialNo, macAddress, type, brandModel, 
      brandModel,
      purchaseDate, purchasePrice, supplier, 
      warehouseLocation, remarks, warrantyPeriod, retirementYears || 8, auditCode || "", finalAssetImage, req.params.id
    ], function(err) {
      if (err) return fail(res, 'assets.update', err, '更新资产失败');

      // Propagate newly uploaded model image to other assets of the same model
      if (assetImage && assetImage.startsWith('data:image/') && finalAssetImage) {
        db.run("UPDATE assets SET asset_image = ? WHERE brand_model = ?", [finalAssetImage, brandModel]);
      }

      const op = uploader || operator || 'admin';

      // Log System
      db.get("SELECT asset_no, brand_model FROM assets WHERE id = ?", [req.params.id], (err, asset) => {
        if (asset) {
          db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
            ['信息变更', `修改资产信息: ${asset.brand_model} (${asset.asset_no})`, op]);
        }
      });

      // Log History
      db.run(`INSERT INTO asset_history (asset_id, action_type, description, operator) VALUES (?, ?, ?, ?)`, [req.params.id, '信息变更', '资产详细信息更新', op]);

      res.json({ message: '资产信息更新成功' });
    });
  };

  if (!finalAssetImage && brandModel) {
    db.get("SELECT asset_image FROM assets WHERE brand_model = ? AND asset_image IS NOT NULL AND asset_image != '' LIMIT 1", [brandModel], (err, row) => {
      if (!err && row && row.asset_image) {
        finalAssetImage = row.asset_image;
      }
      runUpdate();
    });
  } else {
    runUpdate();
  }
});

// Lightweight Update: Asset Image (photo replacement)
router.patch('/:id/image', (req, res) => {
  const { assetImage, uploader, operator } = req.body;
  
  db.get("SELECT brand_model FROM assets WHERE id = ?", [req.params.id], (err, row) => {
    // A12：拆成两段 —— `err` 走统一脱敏出口（原来直出 SQLite 原文）；`!row` 保持原有对外文案。
    if (err) return fail(res, 'assets.imageRead', err, '读取资产信息失败');
    if (!row) return res.status(500).json({ error: 'Asset not found' });
    const brandModel = row.brand_model;
    
    let savedPath = null;
    if (assetImage) {
      savedPath = saveBase64Image(assetImage, brandModel);
    }
    
    // Update all assets of this model
    const sql = `UPDATE assets SET asset_image = ? WHERE brand_model = ?`;
    db.run(sql, [savedPath, brandModel], function(updateErr) {
      if (updateErr) return fail(res, 'assets.image', updateErr, '保存资产图片失败');
      
      // Safety update for the specific asset
      db.run("UPDATE assets SET asset_image = ? WHERE id = ?", [savedPath, req.params.id]);

      const op = uploader || operator || 'admin';

      db.get("SELECT asset_no, brand_model FROM assets WHERE id = ?", [req.params.id], (err, asset) => {
        if (asset) {
          db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
            ['图片变更', `更新资产图片: ${asset.brand_model} (${asset.asset_no})`, op]);
            
          db.run("INSERT INTO asset_history (asset_id, action_type, description, operator) VALUES (?, ?, ?, ?)",
            [req.params.id, '图片变更', '设备实物照片更新', op]);
        }
      });

      res.json({ message: '资产图片更新成功', asset_image: savedPath });
    });
  });
});

// Lightweight Update: Location & Remarks & full outbound correction (For In-Service assets)
router.patch('/:id/location', (req, res) => {
  const { department, keeper, location, remarks, voucherImage, outboundDate, operator } = req.body;
  
  db.get("SELECT * FROM assets WHERE id = ?", [req.params.id], (err, asset) => {
    if (err || !asset) {
      return res.status(404).json({ error: "Asset not found" });
    }
    
    const fields = [];
    const values = [];
    
    if (department !== undefined) { fields.push('department = ?'); values.push(department); }
    if (keeper !== undefined) { fields.push('keeper = ?'); values.push(keeper); }
    if (location !== undefined) { fields.push('location = ?'); values.push(location); }
    if (remarks !== undefined) { fields.push('remarks = ?'); values.push(remarks); }
    if (voucherImage !== undefined) { 
      const savedVoucherPath = saveBase64Voucher(voucherImage);
      fields.push('voucher_image = ?'); 
      values.push(savedVoucherPath); 
    }
    if (outboundDate !== undefined) { fields.push('outbound_date = ?'); values.push(outboundDate); }
    
    if (fields.length === 0) {
      return res.json({ message: '基本信息未变动' });
    }
    
    values.push(req.params.id);
    const sql = `UPDATE assets SET ${fields.join(', ')} WHERE id = ?`;
    
    db.run(sql, values, function(dbErr) {
      if (dbErr) return fail(res, 'assets.location', dbErr, '变更存放位置失败');
      
      const op = operator || 'admin';
      
      // Log System Log and Asset History
      db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
        ['领用修正', `修正出库登记数据: ${asset.brand_model || asset.name} (${asset.asset_no})`, op]);
         
      db.run("INSERT INTO asset_history (asset_id, action_type, description, operator) VALUES (?, ?, ?, ?)",
        [req.params.id, '信息修正', `更正出库领用登记错误。更新字段: ${fields.map(f => f.split(' ')[0]).join(', ')}`, op]);
        
      res.json({ message: '领用登记信息已修正更新' });
    });
  });
});

router.post('/bulk', (req, res) => {
  const { assets, schoolCode, uploader, uploaderRealName } = req.body;
  const effectiveSchoolCode = schoolCode || 'NB';
  
  db.all("SELECT name, code FROM warehouses", [], (whErr, whRows) => {
    if (whErr) return fail(res, 'assets.bulk.warehouse', whErr, '批量导入：校验仓库信息失败');
    
    db.all("SELECT name FROM suppliers", [], (supErr, supRows) => {
      if (supErr) return fail(res, 'assets.bulk.supplier', supErr, '批量导入：校验供应商失败');
      
      db.all("SELECT name FROM asset_types", [], (typeErr, typeRows) => {
        if (typeErr) return fail(res, 'assets.bulk.assetType', typeErr, '批量导入：校验资产类型失败');
        
        const whNames = new Set((whRows || []).map(r => (r.name || '').trim()));
        const supNames = new Set((supRows || []).map(r => (r.name || '').trim()));
        const typeNames = new Set((typeRows || []).map(r => (r.name || '').trim()));
        
        const whMap = {};
        if (whRows) {
          whRows.forEach(r => {
            whMap[r.name] = r.code;
          });
        }
        
        // Comprehensive data validation
        const errors = [];
        assets.forEach((item, index) => {
          if (!item.serial_no && !item.brand_model) return; // Skip empty rows
          const rowNum = index + 2; // CSV Header is Row 1
          
          if (item.supplier && !supNames.has(item.supplier.trim())) {
            errors.push(`第 ${rowNum} 行：合作服务商「${item.supplier}」在系统中不存在。请先在‘服务商档案’中录入该商家。`);
          }
          if (item.warehouse_location && !whNames.has(item.warehouse_location.trim())) {
            errors.push(`第 ${rowNum} 行：仓库位置「${item.warehouse_location}」在系统中不存在。请先在‘仓库管理’中添加该仓库。`);
          }
          if (item.type && !typeNames.has(item.type.trim())) {
            errors.push(`第 ${rowNum} 行：资产类型「${item.type}」在系统中不存在。请先在‘资产类型管理’中创建该类型。`);
          }
        });
        
        if (errors.length > 0) {
          return res.status(400).json({ success: false, errors });
        }

        db.serialize(() => {
          db.run("BEGIN TRANSACTION");
          const stmt = db.prepare(`INSERT INTO assets (
            asset_no, serial_no, name, type, brand_model, purchase_date, 
            purchase_price, department, supplier, warehouse_location, 
            mac_address, status, keeper, location, remarks, warranty_period,
            retirement_years, uploader, audit_code, asset_image
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(asset_no) DO UPDATE SET
            serial_no = excluded.serial_no,
            name = excluded.name,
            type = excluded.type,
            brand_model = excluded.brand_model,
            purchase_date = excluded.purchase_date,
            purchase_price = excluded.purchase_price,
            department = excluded.department,
            supplier = excluded.supplier,
            warehouse_location = excluded.warehouse_location,
            mac_address = excluded.mac_address,
            remarks = excluded.remarks,
            warranty_period = excluded.warranty_period,
            retirement_years = excluded.retirement_years,
            uploader = excluded.uploader,
            audit_code = excluded.audit_code,
            asset_image = COALESCE(excluded.asset_image, assets.asset_image)
          `);

          assets.forEach(item => {
            if (!item.serial_no && !item.brand_model) return; // Skip empty rows
            const whCode = whMap[item.warehouse_location] || item.warehouse_location;
            const assetNo = generateAssetID(item.school_code || effectiveSchoolCode, item.purchase_date, whCode);
            stmt.run([
              assetNo,
              item.serial_no,
              item.brand_model, 
              item.type,
              item.brand_model,
              item.purchase_date,
              item.purchase_price,
              '科技信息中心',
              item.supplier,
              item.warehouse_location,
              item.mac_address,
              '新设备在库',
              uploaderRealName || '设备管理员',
              '主仓库',
              item.remarks,
              item.warranty_period,
              item.retirement_years || 8,
              uploader || 'admin',
              item.audit_code || "",
              item.asset_image || null
            ]);
          });

          stmt.finalize();
          db.run("COMMIT", (err) => {
            if (err) return fail(res, 'assets.bulk', err, '批量导入资产失败');
            
            // Post-import step: update any empty asset_images with existing model asset_images to share
            db.run(`
              UPDATE assets 
              SET asset_image = (
                SELECT a2.asset_image 
                FROM assets a2 
                WHERE a2.brand_model = assets.brand_model 
                  AND a2.asset_image IS NOT NULL 
                  AND a2.asset_image != '' 
                LIMIT 1
              )
              WHERE asset_image IS NULL OR asset_image = ''
            `);

            // Post-import step: 同型号资产基准价格自动继承与关联（若新导入设备单价为空或0，从同型号其他记录继承有效单价）
            db.run(`
              UPDATE assets 
              SET purchase_price = (
                SELECT a2.purchase_price 
                FROM assets a2 
                WHERE a2.brand_model = assets.brand_model 
                  AND a2.purchase_price IS NOT NULL 
                  AND a2.purchase_price > 0 
                LIMIT 1
              )
              WHERE (purchase_price IS NULL OR purchase_price = 0 OR purchase_price = '')
                AND brand_model IN (
                  SELECT a3.brand_model 
                  FROM assets a3 
                  WHERE a3.purchase_price > 0
                )
            `);

            // Log
            db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
              ['批量导入', `批量导入资产共 ${assets.length} 条`, uploader || 'admin']);

            // Insert initial inbound logs for these assets if they don't have any
            const assetNos = assets.map(item => {
              if (!item.serial_no && !item.brand_model) return null;
              const whCode = whMap[item.warehouse_location] || item.warehouse_location;
              return generateAssetID(item.school_code || effectiveSchoolCode, item.purchase_date, whCode);
            }).filter(no => no !== null);

            if (assetNos.length > 0) {
              const placeholders = assetNos.map(() => '?').join(',');
              db.all(`SELECT id, asset_no, brand_model, purchase_date FROM assets WHERE asset_no IN (${placeholders})`, assetNos, (selErr, rows) => {
                if (!selErr && rows) {
                  rows.forEach(row => {
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
                          uploader || 'admin',
                          logDate
                        ]);
                      }
                    });
                  });
                }
              });
            }
              
            res.json({ message: `批量入库成功 (共${assets.length}条)` });
          });
        });
      });
    });
  });
});

router.post('/batch-update-model-price', (req, res) => {
  const { brandModel, price } = req.body;
  const numPrice = Number(price);

  // 若未指定型号，支持全局同步已存在的同型号价格
  if (!brandModel) {
    db.run(`
      UPDATE assets 
      SET purchase_price = (
        SELECT a2.purchase_price 
        FROM assets a2 
        WHERE a2.brand_model = assets.brand_model 
          AND a2.purchase_price IS NOT NULL 
          AND a2.purchase_price > 0 
        LIMIT 1
      )
      WHERE (purchase_price IS NULL OR purchase_price = 0 OR purchase_price = '')
        AND brand_model IN (
          SELECT a3.brand_model 
          FROM assets a3 
          WHERE a3.purchase_price > 0
        )
    `, function(err) {
      if (err) return fail(res, 'assets.modelPrice.read', err, '读取型号价格失败');
      return res.json({ success: true, updatedCount: this.changes, message: `已根据同型号基准单价自动同步更新 ${this.changes} 条资产。` });
    });
    return;
  }

  if (isNaN(numPrice) || numPrice <= 0) {
    return res.status(400).json({ error: '请提供有效的采购单价（必须大于0）' });
  }

  const sql = `
    UPDATE assets 
    SET purchase_price = ? 
    WHERE (brand_model = ? OR name = ?) 
      AND (purchase_price IS NULL OR purchase_price = 0 OR purchase_price = '')
  `;
  db.run(sql, [numPrice, brandModel, brandModel], function(err) {
    if (err) return fail(res, 'assets.modelPrice.write', err, '批量更新型号价格失败');
    const changes = this.changes;

    const operator = (req.user && (req.user.realName || req.user.username)) || '系统管理员';
    db.run(
      "INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
      ['价值补录', `补录型号「${brandModel}」基准单价为 ¥${numPrice}，更新资产 ${changes} 条`, operator]
    );

    res.json({
      success: true,
      updatedCount: changes,
      message: `成功为型号「${brandModel}」补录基准单价，已更新 ${changes} 台设备。`
    });
  });
});

// Outbound Endpoint - Update status to '服役中' and set outbound_date
router.post('/outbound', (req, res) => {
  const { assetId, department, keeper, location, voucherImage, outboundDate, operator } = req.body;
  const today = outboundDate || getBeijingDateString();
  const currentTime = getBeijingTimeString().split(' ')[1];
  const historyCreatedAt = outboundDate ? `${outboundDate} ${currentTime}` : getBeijingTimeString();
  const savedVoucherPath = saveBase64Voucher(voucherImage);
  const sql = `UPDATE assets SET 
    status = '服役中',
    department = ?,
    keeper = ?,
    location = ?,
    warehouse_location = NULL,
    voucher_image = ?,
    outbound_date = ?
    WHERE id = ?`;
  db.run(sql, [department, keeper, location, savedVoucherPath, today, assetId], function(err) {
    if (err) return fail(res, 'assets.outbound', err, '资产出库失败');

    const op = operator || 'admin';

    // Log System
    db.get("SELECT asset_no, brand_model FROM assets WHERE id = ?", [assetId], (err, asset) => {
      if (asset) {
        db.run("INSERT INTO system_logs (action_type, description, operator, created_at) VALUES (?, ?, ?, ?)",
          ['资产出库', `资产 ${asset.brand_model} (${asset.asset_no}) 出库至 ${department}`, op, historyCreatedAt]);
      }
    });

    // Log History
    const historySql = `INSERT INTO asset_history (asset_id, action_type, description, operator, created_at) VALUES (?, ?, ?, ?, ?)`;
    db.run(historySql, [assetId, '领用出库', `领用人: ${keeper}, 位置: ${location}`, op, historyCreatedAt]);

    res.json({ message: '出库成功', id: this.changes });
  });
});

// Return Asset to Warehouse Endpoint (Now moves to Pending/Turnover)
router.post('/return', (req, res) => {
  const { assetId, warehouseLocation, returnStatus, voucherImage, operatorRealName, operator } = req.body;
  
  // Normalize status and determine physical location description
  const finalStatus = returnStatus === '报废仓(待处置)' ? '待报废' : returnStatus;
  const locationDesc = finalStatus === '待报废' ? '周转仓-待检测区' : '周转仓';
  const savedVoucherPath = saveBase64Voucher(voucherImage);

  const sql = `UPDATE assets SET 
    status = ?,
    department = '科技信息中心',
    keeper = ?,
    location = ?,
    warehouse_location = ?,
    voucher_image = ?,
    outbound_date = NULL
    WHERE id = ?`;
    
  db.run(sql, [finalStatus, operatorRealName || '库管员', locationDesc, warehouseLocation, savedVoucherPath, assetId], function(err) {
    if (err) return fail(res, 'assets.return', err, '资产退库失败');

    const op = operator || 'admin';

    // Log System
    db.get("SELECT asset_no, brand_model FROM assets WHERE id = ?", [assetId], (err, asset) => {
      if (asset) {
        db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
          ['资产退库', `资产 ${asset.brand_model} (${asset.asset_no}) 退库至 ${warehouseLocation}`, op]);
      }
    });

    // Log History
    const historySql = `INSERT INTO asset_history (asset_id, action_type, description, operator) VALUES (?, ?, ?, ?)`;
    db.run(historySql, [assetId, '资产退库', `退库状态: ${finalStatus}, 存放: ${warehouseLocation}`, op]);

    res.json({ message: '资产已退库并更新状态', id: this.changes });
  });
});

// Process Pending Assets (Restock or Scrap)
router.post('/recycle-process', (req, res) => {
  const { assetId, action, operator } = req.body; // action: 'restock' | 'scrap' | 'scrap_confirm'
  let newStatus = '';
  let sql = '';
  let params = [];
  
  if (action === 'restock') {
    newStatus = '待周转';
    sql = `UPDATE assets SET status = ?, warehouse_location = '周转仓-可用区', location = '周转仓-可用区' WHERE id = ?`;
    params = [newStatus, assetId];
  } else if (action === 'scrap') {
    newStatus = '待报废';
    sql = `UPDATE assets SET status = ? WHERE id = ?`;
    params = [newStatus, assetId];
  } else if (action === 'scrap_confirm') {
    newStatus = '已报废';
    sql = `UPDATE assets SET status = ? WHERE id = ?`;
    params = [newStatus, assetId];
  } else {
    return res.status(400).json({ error: 'Invalid action' });
  }

  db.run(sql, params, function(err) {
    if (err) return fail(res, 'assets.recycleProcess', err, '资产处置失败');

    const op = operator || 'admin';

    // Log System
    let actionDesc = '资产处置';
    if (action === 'restock') actionDesc = '重新入库';
    else if (action === 'scrap') actionDesc = '申请报废';
    else if (action === 'scrap_confirm') actionDesc = '确认报废';

    db.get("SELECT asset_no, brand_model FROM assets WHERE id = ?", [assetId], (err, asset) => {
      if (asset) {
        db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
          ['资产处置', `${actionDesc}: ${asset.brand_model} (${asset.asset_no})`, op]);
      }
    });

    // Log History
    const historySql = `INSERT INTO asset_history (asset_id, action_type, description, operator) VALUES (?, ?, ?, ?)`;
    db.run(historySql, [assetId, '资产处置', `处置动作: ${actionDesc}`, op]);

    res.json({ message: `资产处理完成: ${newStatus}`, id: this.changes });
  });
});

router.delete('/:id', (req, res) => {
  const op = req.query.operator || 'admin';
  db.get("SELECT asset_no, brand_model FROM assets WHERE id = ?", [req.params.id], (err, asset) => {
    if (asset) {
      db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
        ['删除资产', `删除资产: ${asset.brand_model} (${asset.asset_no})`, op]);
    }
    db.run(`DELETE FROM assets WHERE id = ?`, [req.params.id], function(err) {
      if (err) return fail(res, 'assets.remove', err, '删除资产失败');
      res.json({ message: '资产已移除' });
    });
  });
});

router.get('/:id/history', (req, res) => {
  const sql = `
    SELECT h.*, a.real_name AS operator_real_name 
    FROM asset_history h
    LEFT JOIN accounts a ON h.operator = a.username
    WHERE h.asset_id = ?
    ORDER BY h.created_at DESC
  `;
  db.all(sql, [req.params.id], (err, rows) => {
    if (err) return fail(res, 'assets.history', err, '读取资产履历失败');
    const mappedRows = rows.map(r => ({
      ...r,
      operator: r.operator_real_name || r.operator || '系统管理员'
    }));
    res.json(mappedRows);
  });
});

export default router;
