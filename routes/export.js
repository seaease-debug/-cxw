// routes/export.js
// 导出域：操作日志 CSV / 资产台账 CSV / 流转历史 CSV / 新设备清单 CSV。
// 原 server.js 第 618-653、984-1143 行，逻辑零改动。
// 挂载：app.use('/api/export', exportRouter)

import express from 'express';
import { getBeijingDateString } from '../lib/time.js';
import { db } from '../lib/db.js';
import { fail } from '../lib/apiError.js';

const router = express.Router();

router.get('/system-logs', (req, res) => {
  const { type, startDate, endDate, search } = req.query;
  let query = "SELECT * FROM system_logs WHERE 1=1";
  const params = [];

  if (type && type !== 'ALL') {
    query += " AND action_type = ?";
    params.push(type);
  }
  if (startDate) {
    query += " AND created_at >= ?";
    params.push(`${startDate} 00:00:00`);
  }
  if (endDate) {
    query += " AND created_at <= ?";
    params.push(`${endDate} 23:59:59`);
  }
  if (search) {
    query += " AND (description LIKE ? OR operator LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  query += " ORDER BY created_at DESC";

  db.all(query, params, (err, rows) => {
    if (err) return fail(res, 'export.systemLogs', err, '导出系统日志失败');
    const BOM = "\uFEFF";
    const header = "时间,操作类型,操作描述,操作人\r\n";
    const content = rows.map(r => 
      `"${r.created_at}","${r.action_type}","${r.description}","${r.operator}"`
    ).join("\r\n");
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=system_logs.csv');
    res.send(BOM + header + content);
  });
});

// Export assets (inventory ledger)
router.get('/assets', (req, res) => {
  const keeper = req.query.keeper;
  const uploader = req.query.uploader;
  const status = req.query.status;
  const search = req.query.search ? String(req.query.search).trim() : '';

  let sql = "SELECT * FROM assets";
  let params = [];
  let conditions = [];

  if (uploader) {
    conditions.push("uploader = ?");
    params.push(uploader);
  } else if (keeper) {
    conditions.push("keeper = ?");
    params.push(keeper);
  }

  if (status && status !== 'ALL') {
    conditions.push("status = ?");
    params.push(status);
  }

  if (search) {
    const searchWildcard = `%${search}%`;
    conditions.push("(asset_no LIKE ? OR brand_model LIKE ? OR serial_no LIKE ? OR type LIKE ? OR keeper LIKE ? OR department LIKE ?)");
    params.push(searchWildcard, searchWildcard, searchWildcard, searchWildcard, searchWildcard, searchWildcard);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  sql += " ORDER BY created_at DESC";

  db.all(sql, params, (err, rows) => {
    if (err) return fail(res, 'export.assets', err, '导出资产清单失败');
    
    const BOM = "\uFEFF";
    let header = "";
    let content = "";
    let filenameBase = "科技信息中心资产台账_全部资产";

    const escapeCsv = (val) => {
      if (val === undefined || val === null) return '';
      let str = String(val).trim();
      if (str.startsWith('data:image/') || str.length > 500) {
        return '"[已保存照片]"';
      }
      if (str.startsWith('/api/uploads/') || str.startsWith('/uploads/')) {
        const parts = str.split('/');
        const filename = parts[parts.length - 1];
        return `"${filename}"`;
      }
      str = str.replace(/"/g, '""');
      return `"${str}"`;
    };

    if (status === '新设备在库') {
      header = "资产条码,序列号(S/N),MAC地址,资产类型,品牌型号,入库日期,采购价格,供货商,当前存放仓库,备注,质保期限,预计折旧年限(年),上传人,资产编号\r\n";
      content = rows.map(r => [
        r.asset_no, r.serial_no, r.mac_address, r.type, r.brand_model, r.purchase_date, r.purchase_price, r.supplier, r.warehouse_location, r.remarks, r.warranty_period, r.retirement_years, r.uploader, r.audit_code
      ].map(escapeCsv).join(",")).join("\r\n");
      filenameBase = "科技信息中心资产台账_新设备在库";
    } 
    else if (status === '服役中') {
      header = "资产条码,序列号(S/N),MAC地址,资产类型,品牌型号,出库日期,管理科室,保管人,具体放置位置,质保期限,备注,资产编号\r\n";
      content = rows.map(r => [
        r.asset_no, r.serial_no, r.mac_address, r.type, r.brand_model, r.outbound_date, r.department, r.keeper, r.location, r.warranty_period, r.remarks, r.audit_code
      ].map(escapeCsv).join(",")).join("\r\n");
      filenameBase = "科技信息中心资产台账_服役中";
    } 
    else if (status === '周转仓(待处理)' || status === '周转仓(待派发)' || status === '周转待处理') {
      header = "资产条码,序列号(S/N),MAC地址,资产类型,品牌型号,入库日期,当前存放仓库,原保管人,备注,资产编号\r\n";
      content = rows.map(r => [
        r.asset_no, r.serial_no, r.mac_address, r.type, r.brand_model, r.purchase_date, r.warehouse_location, r.keeper, r.remarks, r.audit_code
      ].map(escapeCsv).join(",")).join("\r\n");
      filenameBase = "科技信息中心资产台账_周转待处理";
    } 
    else if (status === '报废仓(待处置)' || status === '待报废') {
      header = "资产条码,序列号(S/N),资产类型,品牌型号,采购价格,入库日期,已服役年限,预计折旧年限(年),当前存放仓库,备注,资产编号\r\n";
      content = rows.map(r => {
        let serviceYears = "-";
        if (r.purchase_date) {
          const pDate = new Date(r.purchase_date);
          if (!isNaN(pDate.getTime())) {
            serviceYears = ((new Date() - pDate) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);
          }
        }
        return [
          r.asset_no, r.serial_no, r.type, r.brand_model, r.purchase_price, r.purchase_date, serviceYears, r.retirement_years, r.warehouse_location, r.remarks, r.audit_code
        ].map(escapeCsv).join(",");
      }).join("\r\n");
      filenameBase = "科技信息中心资产台账_待报废";
    } 
    else if (status === '已报废') {
      header = "资产条码,序列号(S/N),资产类型,品牌型号,采购价格,入库日期,报废核销日期,备注,资产编号\r\n";
      content = rows.map(r => [
        r.asset_no, r.serial_no, r.type, r.brand_model, r.purchase_price, r.purchase_date, r.outbound_date, r.remarks, r.audit_code
      ].map(escapeCsv).join(",")).join("\r\n");
      filenameBase = "科技信息中心资产台账_已报废";
    } 
    else {
      header = "资产条码,序列号(S/N),MAC地址,资产类型,品牌型号,入库日期,采购价格,管理科室,供货商,当前存放仓库,资产状态,保管人,具体放置位置,备注,修修正凭证,出库日期,质保期限,预计折旧年限(年),上传人,资产编号\r\n";
      content = rows.map(r => [
        r.asset_no, r.serial_no, r.mac_address, r.type, r.brand_model, r.purchase_date, r.purchase_price, r.department, r.supplier, r.warehouse_location, r.status, r.keeper, r.location, r.remarks, r.voucher_image, r.outbound_date, r.warranty_period, r.retirement_years, r.uploader, r.audit_code
      ].map(escapeCsv).join(",")).join("\r\n");
      filenameBase = "科技信息中心资产台账_全部资产";
    }

    const dateStr = getBeijingDateString();
    const filename = `${filenameBase}_${dateStr}.csv`;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}`);
    res.send(BOM + header + content);
  });
});

// Export flow / asset histories
router.get('/history', (req, res) => {
  db.all("SELECT h.*, a.asset_no, a.brand_model, u.real_name AS operator_real_name FROM asset_history h LEFT JOIN assets a ON h.asset_id = a.id LEFT JOIN accounts u ON h.operator = u.username ORDER BY h.created_at DESC", [], (err, rows) => {
    if (err) return fail(res, 'export.history', err, '导出操作履历失败');
    const BOM = "\uFEFF";
    const header = "操作时间,资产内部ID,资产条码,资产型号,变更类型,变更描述,操作人\r\n";
    const content = rows.map(r => {
      const op = r.operator_real_name || r.operator || '系统管理员';
      return `"${r.created_at}","${r.asset_id}","${r.asset_no || ''}","${r.brand_model || ''}","${r.action_type || ''}","${r.description || ''}","${op}"`;
    }).join("\r\n");
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=history_export_${getBeijingDateString()}.csv`);
    res.send(BOM + header + content);
  });
});

// Export New Assets
router.get('/new-assets', (req, res) => {
  const uploader = req.query.uploader;
  let sql = "SELECT * FROM assets WHERE status = '新设备在库'";
  let params = [];
  if (uploader) {
    sql += " AND uploader = ?";
    params.push(uploader);
  }
  sql += " ORDER BY created_at DESC";
  db.all(sql, params, (err, rows) => {
    if (err) return fail(res, 'export.newAssets', err, '导出新增资产失败');
    
    const BOM = "\uFEFF";
    const header = "资产条码,序列号,品牌型号,类型,采购日期,采购价格,供应商,仓库位置,备注,报废年限,资产编号\r\n";
    const content = rows.map(r => 
      `"${r.asset_no}","${r.serial_no}","${r.brand_model}","${r.type}","${r.purchase_date}",${r.purchase_price},"${r.supplier}","${r.warehouse_location}","${r.remarks}",${r.retirement_years || 8},"${r.audit_code || ''}"`
    ).join("\r\n");
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=new_assets_list.csv');
    res.send(BOM + header + content);
  });
});

export default router;
