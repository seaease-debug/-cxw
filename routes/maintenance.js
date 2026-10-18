// routes/maintenance.js
// 维修域：报修单的查询 / 提交 / 更新 / 删除。
// 原 server.js 第 1157-1322 行，逻辑零改动。
// 挂载：app.use('/api/maintenance', maintenanceRouter)

import express from 'express';
import { getBeijingTimeString, getBeijingDateStr8 } from '../lib/time.js';
import { db } from '../lib/db.js';
import { fail } from '../lib/apiError.js';

const router = express.Router();

// ─── Maintenance Records CRUD (维修管理) ──────────────────────────────
router.get('/records', (req, res) => {
  const { asset_id, status } = req.query;
  let sql = "SELECT * FROM maintenance_records";
  const params = [];
  const conditions = [];

  if (req.user && req.user.role === 'keeper') {
    conditions.push("(reporter_name = ? OR reporter_name = (SELECT real_name FROM accounts WHERE username = ?) OR asset_id IN (SELECT id FROM assets WHERE uploader = ? OR keeper = ? OR keeper = (SELECT real_name FROM accounts WHERE username = ?)))");
    params.push(req.user.username, req.user.username, req.user.username, req.user.username, req.user.username);
  } else if (req.user && req.user.role === 'user') {
    conditions.push("(reporter_name = ? OR reporter_name = (SELECT real_name FROM accounts WHERE username = ?) OR asset_id IN (SELECT id FROM assets WHERE keeper = ? OR keeper = (SELECT real_name FROM accounts WHERE username = ?)))");
    params.push(req.user.username, req.user.username, req.user.username, req.user.username);
  }

  if (asset_id) {
    conditions.push("asset_id = ?");
    params.push(asset_id);
  }
  if (status && status !== 'ALL') {
    conditions.push("repair_status = ?");
    params.push(status);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  sql += " ORDER BY id DESC";

  db.all(sql, params, (err, rows) => {
    if (err) return fail(res, 'maintenance.list', err, '读取维修记录失败');
    res.json(rows);
  });
});

router.post('/records', (req, res) => {
  const { asset_id, asset_no, asset_name, reporter_name, reporter_contact, fault_type, fault_description } = req.body;

  if (!asset_id || !reporter_name || !fault_description) {
    return res.status(400).json({ error: '请填完必填项（报修资产、报修人、故障描述）' });
  }

  const dateStr8 = getBeijingDateStr8();
  const randomSuffix = Math.floor(Math.random() * 9000 + 1000);
  const recordNo = `REP-${dateStr8}-${randomSuffix}`;
  const repairDate = getBeijingTimeString().split(' ')[0];

  const sql = `INSERT INTO maintenance_records (
    record_no, asset_id, asset_no, asset_name, reporter_name, reporter_contact,
    fault_type, fault_description, repair_status, cost, repair_date
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '待维修', 0, ?)`;

  const params = [
    recordNo, asset_id, asset_no || '', asset_name || '', reporter_name.trim(),
    reporter_contact || '', fault_type || '其他故障', fault_description.trim(), repairDate
  ];

  db.run(sql, params, function(err) {
    if (err) return fail(res, 'maintenance.create', err, '新增维修记录失败');

    const recordId = this.lastID;

    // Update asset status to '维修中'
    db.run("UPDATE assets SET status = '维修中' WHERE id = ? AND status != '已报废'", [asset_id]);

    // Insert asset history log
    const historyDesc = `提交设备故障报修 (单号: ${recordNo}, 故障类型: ${fault_type || '通用故障'}, 说明: ${fault_description.trim()})`;
    db.run("INSERT INTO asset_history (asset_id, action_type, description, operator) VALUES (?, ?, ?, ?)",
      [asset_id, '故障报修登记', historyDesc, reporter_name.trim()]);

    // System log
    db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
      ['设备故障报修', `新建报修单 ${recordNo} - 资产: ${asset_name} (${asset_no})`, reporter_name.trim()]);

    res.status(201).json({ message: '报修单提交成功', id: recordId, record_no: recordNo });
  });
});

// Update maintenance record progress, cost, and finish status
router.put('/records/:id', (req, res) => {
  const { id } = req.params;
  const { repair_status, cost, repair_vendor, finish_date, notes, result_action, target_warehouse, operator } = req.body;

  db.get("SELECT * FROM maintenance_records WHERE id = ?", [id], (getErr, record) => {
    if (getErr) return fail(res, 'maintenance.updateRead', getErr, '读取维修记录失败');
    if (!record) return res.status(404).json({ error: '未找到指定报修单' });

    const updatedCost = parseFloat(cost) >= 0 ? parseFloat(cost) : record.cost;
    const updatedStatus = repair_status || record.repair_status;
    const updatedVendor = repair_vendor !== undefined ? repair_vendor : record.repair_vendor;
    const updatedFinishDate = finish_date || (updatedStatus === '已完修' || updatedStatus === '无法修复' ? getBeijingTimeString().split(' ')[0] : record.finish_date);
    const updatedNotes = notes !== undefined ? notes : record.notes;
    const updatedResultAction = result_action !== undefined ? result_action : record.result_action;
    const updatedTargetWh = target_warehouse !== undefined ? target_warehouse : (record.target_warehouse || '');

    const sql = `UPDATE maintenance_records SET 
      repair_status = ?, cost = ?, repair_vendor = ?, finish_date = ?, notes = ?, result_action = ?, target_warehouse = ?
      WHERE id = ?`;

    db.run(sql, [updatedStatus, updatedCost, updatedVendor, updatedFinishDate, updatedNotes, updatedResultAction, updatedTargetWh, id], function(err) {
      if (err) return fail(res, 'maintenance.update', err, '更新维修记录失败');

      const opName = operator || '设备管理员';
      let targetWhName = updatedTargetWh && updatedTargetWh.trim() ? updatedTargetWh.trim() : '1楼小仓库';
      // Clean warehouse name: strip parentheses like "(1FOF)"
      if (targetWhName.includes('(')) {
        targetWhName = targetWhName.split('(')[0].trim();
      }

      // Handle asset status and history updates based on result action or status
      if (updatedResultAction === 'SITE_REPAIR_COMPLETE') {
        // Site repair complete: restore status to '服役中', keep location, department, keeper intact
        db.run("UPDATE assets SET status = '服役中' WHERE id = ? OR asset_no = ?", [record.asset_id, record.asset_no]);

        const historyText = `现场完修恢复服役 (报修单: ${record.record_no}, 花费金额: ￥${updatedCost}, 服务商: ${updatedVendor || '现场维护'}, 结果: 现场修复成功，恢复【服役中】状态)`;
        db.run("INSERT INTO asset_history (asset_id, action_type, description, operator) VALUES (?, ?, ?, ?)",
          [record.asset_id, '现场完修恢复服役', historyText, opName]);

        db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
          ['现场完修服役', `资产 ${record.asset_name} 现场完修完成，恢复【服役中】状态 (费用: ￥${updatedCost})`, opName]);

      } else if (updatedResultAction === 'RETURN_TO_WAREHOUSE' || (updatedStatus === '已完修' && updatedResultAction !== 'SITE_REPAIR_COMPLETE')) {
        // Return to warehouse as '待周转' with selected warehouse
        db.run("UPDATE assets SET status = '待周转', keeper = '', location = ?, warehouse_location = ?, outbound_date = NULL WHERE id = ? OR asset_no = ?",
          [targetWhName, targetWhName, record.asset_id, record.asset_no]);

        const historyText = `完修归仓 (报修单: ${record.record_no}, 存放仓库: ${targetWhName}, 花费金额: ￥${updatedCost}, 服务商: ${updatedVendor || '自行/维保'}, 结果: 修复完成并收回周转仓备用，转为【待周转】状态)`;
        db.run("INSERT INTO asset_history (asset_id, action_type, description, operator) VALUES (?, ?, ?, ?)",
          [record.asset_id, '完修归仓', historyText, opName]);

        db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
          ['完修归仓', `资产 ${record.asset_name} 完修归仓至 [${targetWhName}] (费用: ￥${updatedCost}, 状态调整为【待周转】)`, opName]);

      } else if (updatedResultAction === 'SCRAP' || updatedStatus === '无法修复') {
        // Mark asset as scrap pending with selected warehouse
        db.run("UPDATE assets SET status = '待报废', keeper = '', location = ?, warehouse_location = ? WHERE id = ? OR asset_no = ?",
          [targetWhName, targetWhName, record.asset_id, record.asset_no]);

        const historyText = `故障报废 (报修单: ${record.record_no}, 存放仓库: ${targetWhName}, 处置结果: 损坏严重转入待报废仓)`;
        db.run("INSERT INTO asset_history (asset_id, action_type, description, operator) VALUES (?, ?, ?, ?)",
          [record.asset_id, '故障报废', historyText, opName]);

        db.run("INSERT INTO system_logs (action_type, description, operator) VALUES (?, ?, ?)",
          ['故障报废', `资产 ${record.asset_name} 判定故障报废，转入待报废仓 [${targetWhName}]`, opName]);
      } else {
        // Intermediate status update (e.g., '维修中')
        db.run("UPDATE assets SET status = '维修中' WHERE id = ?", [record.asset_id]);

        const historyText = `更新维修进度 (报修单: ${record.record_no}, 进度状态: ${updatedStatus}, 维保服务商: ${updatedVendor || '未指定'})`;
        db.run("INSERT INTO asset_history (asset_id, action_type, description, operator) VALUES (?, ?, ?, ?)",
          [record.asset_id, '维修进度更新', historyText, opName]);
      }

      res.json({ message: '维修记录更新成功' });
    });
  });
});

router.delete('/records/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM maintenance_records WHERE id = ?", [id], function(err) {
    if (err) return fail(res, 'maintenance.remove', err, '删除维修记录失败');
    res.json({ message: '报修记录删除成功' });
  });
});

export default router;
