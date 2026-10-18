// components/maintenance/useMaintenance.ts
// 维修域「数据 + 行为」层：记录加载 / 筛选统计 / 报修登记 / 进度更新 / 删除。
// 渲染一律不在此文件（见 MaintenanceView.tsx 与 MaintenanceModals.tsx）。
import React, { useState, useEffect } from 'react';
import {
  UserAccount, MaintenanceRecord, Asset, AssetType, AssetStatus, Supplier, UserRole, Warehouse as WarehouseRecord
} from '../../types';
import { useToast } from '../Toast';
import { useDialog } from '../ui/DialogContext';
import { logError } from '../../utils/logger';

export const FAULT_TYPES = [
  '硬件损坏 / 配件故障',
  '软件 / 操作系统异常',
  '无法开机 / 供电故障',
  '屏幕 / 外观破损',
  '网络 / 通信故障',
  '老化 / 性能严重下降',
  '其他故障'
];

// ---------- 数据获取：放模块级，避免撑大 hook 函数体（S138）----------
async function loadRecords(
  setRecords: React.Dispatch<React.SetStateAction<MaintenanceRecord[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
) {
    setLoading(true);
    try {
      const res = await fetch('/api/maintenance/records');
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (err) {
      logError('Failed to fetch maintenance records:', err);
    } finally {
      setLoading(false);
    }
}

async function loadAssets(setAssets: React.Dispatch<React.SetStateAction<Asset[]>>) {
    try {
      const res = await fetch('/api/assets');
      if (res.ok) {
        const data = await res.json();
        const mapped: Asset[] = data.map((item: Record<string, unknown>) => ({
          id: String(item.id ?? ''),
          no: String(item.asset_no ?? ''),
          name: String(item.name || item.brand_model || ''),
          type: String(item.type || '') as AssetType,
          brandModel: String(item.brand_model || ''),
          currentStatus: String(item.status || '') as AssetStatus,
          currentKeeperId: String(item.keeper ?? ''),
          departmentId: String(item.department ?? ''),
          remainingDays: 0,
          specification: String(item.specification || ''),
          serialNo: String(item.serial_no || ''),
          purchaseDate: String(item.purchase_date || ''),
          purchasePrice: Number(item.purchase_price || 0),
          supplierId: String(item.supplier || ''),
          warrantyPeriod: String(item.warranty_period || '3年'),
          currentLocationId: String(item.location || ''),
          warehouseLocation: String(item.warehouse_location || ''),
          qrCodeInfo: String(item.asset_no ?? ''),
        }));
        setAssets(mapped);
      }
    } catch (err) {
      logError('Failed to fetch assets for repair form:', err);
    }
}

async function loadSuppliers(setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>) {
    try {
      const res = await fetch('/api/suppliers');
      if (res.ok) {
        setSuppliers(await res.json());
      }
    } catch (err) {
      logError('Failed to fetch suppliers for maintenance:', err);
    }
}

async function loadFaultTypes(
  setDbFaultTypes: React.Dispatch<React.SetStateAction<string[]>>,
  setFaultType: React.Dispatch<React.SetStateAction<string>>,
) {
    try {
      const res = await fetch('/api/fault-types');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const enabled = data.filter((f: { enabled: number; name: string }) => f.enabled !== 0).map((f: { enabled: number; name: string }) => f.name);
          setDbFaultTypes(enabled);
          if (enabled.length > 0) {
            setFaultType(enabled[0]);
          }
        }
      }
    } catch (err) {
      logError('Failed to fetch fault types:', err);
    }
}

async function loadWarehouses(setWarehouses: React.Dispatch<React.SetStateAction<WarehouseRecord[]>>) {
    try {
      const res = await fetch('/api/warehouses');
      if (res.ok) {
        setWarehouses(await res.json());
      }
    } catch (err) {
      logError('Failed to fetch warehouses for maintenance:', err);
    }
}

/** 由记录 + 关联资产推导「更新弹窗」默认值（原 handleOpenUpdateModal 内的推导段，逐句搬运）。 */
function computeUpdateDefaults(
  rec: MaintenanceRecord,
  assets: Asset[],
  suppliers: Supplier[],
  warehouses: WarehouseRecord[],
) {
  const status = rec.repair_status === '待维修' ? '维修中' : (rec.repair_status || '维修中');
  const resultAction = rec.result_action || (rec.repair_status === '已完修' ? 'SITE_REPAIR_COMPLETE' : 'NONE');
  const linkedAsset = assets.find(a => a.id === rec.asset_id?.toString() || a.no === rec.asset_no);
  const matched = linkedAsset?.supplierId
    ? suppliers.find(s => s.id.toString() === linkedAsset.supplierId.toString() || s.name === linkedAsset.supplierId)
    : null;
  const assetSupplierName = matched ? matched.name : (linkedAsset?.supplierId || '');
  let vendor = assetSupplierName || rec.repair_vendor;
  if (!vendor && suppliers.length > 0) {
    vendor = suppliers[0].name;
  }
  const warehouse = rec.target_warehouse || linkedAsset?.warehouseLocation || (warehouses.length > 0 ? warehouses[0].name : '1楼小仓库');
  return { status, cost: rec.cost || 0, notes: rec.notes || '', resultAction, vendor: vendor ?? '', warehouse };
}

/** 顶部标签页计数。 */
function computeStats(records: MaintenanceRecord[]) {
  const totalCount = records.length;
  const pendingCount = records.filter(r => r.repair_status === '待维修').length;
  const inProgressCount = records.filter(r => r.repair_status === '维修中').length;
  const completedCount = records.filter(r => r.repair_status === '已完修').length;
  return { totalCount, pendingCount, inProgressCount, completedCount };
}

/** 状态 / 关键词 / 日期的组合筛选（谓词逐字保留）。 */
function filterRecords(
  records: MaintenanceRecord[],
  filterStatus: string,
  searchTerm: string,
  startDate: string,
  endDate: string,
) {
  return records.filter(r => {
    const matchesStatus = filterStatus === 'ALL' || r.repair_status === filterStatus;
    const s = searchTerm.toLowerCase().trim();
    const matchesSearch = !s || 
      r.record_no.toLowerCase().includes(s) ||
      r.asset_no.toLowerCase().includes(s) ||
      r.asset_name.toLowerCase().includes(s) ||
      r.reporter_name.toLowerCase().includes(s) ||
      (r.fault_description && r.fault_description.toLowerCase().includes(s));

    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && !!(
        (r.repair_date && r.repair_date.slice(0, 10) >= startDate) ||
        (r.finish_date && r.finish_date.slice(0, 10) >= startDate)
      );
    }
    if (endDate) {
      matchesDate = matchesDate && !!(
        (r.repair_date && r.repair_date.slice(0, 10) <= endDate) ||
        (r.finish_date && r.finish_date.slice(0, 10) <= endDate)
      );
    }

    return matchesStatus && matchesSearch && matchesDate;
  });
}

/** 维修域：状态 + 行为。渲染层从这里取数。 */
export function useMaintenance(user: UserAccount) {
  const { showToast } = useToast();
  const { confirm } = useDialog();

  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<MaintenanceRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);

  // New Fault Report Form state
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [reporterName, setReporterName] = useState<string>(user.realName || '');
  const [reporterContact, setReporterContact] = useState<string>(user.department || '');
  const [faultType, setFaultType] = useState<string>(FAULT_TYPES[0]);
  const [dbFaultTypes, setDbFaultTypes] = useState<string[]>([]);
  const [faultDesc, setFaultDesc] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Update Record Form state
  const [updateStatus, setUpdateStatus] = useState<string>('维修中');
  const [updateCost, setUpdateCost] = useState<number>(0);
  const [updateVendor, setUpdateVendor] = useState<string>('');
  const [showVendorSuggestions, setShowVendorSuggestions] = useState(false);
  const [updateNotes, setUpdateNotes] = useState<string>('');
  const [updateResultAction, setUpdateResultAction] = useState<string>('NONE');
  const [warehouses, setWarehouses] = useState<WarehouseRecord[]>([]);
  const [targetWarehouse, setTargetWarehouse] = useState<string>('');
  // 同名包装：handler 里的 fetchRecords()/fetchAssets() 调用一字不改
  const fetchRecords = () => loadRecords(setRecords, setLoading);
  const fetchAssets = () => loadAssets(setAssets);

  useEffect(() => {
    fetchRecords();
    fetchAssets();
    loadSuppliers(setSuppliers);
    loadFaultTypes(setDbFaultTypes, setFaultType);
    loadWarehouses(setWarehouses);
  }, []);
  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) {
      showToast('请选择报修装备', 'error');
      return;
    }
    if (!reporterName.trim() || !faultDesc.trim()) {
      showToast('请填写报修人和故障描述', 'error');
      return;
    }

    const targetAsset = assets.find(a => a.id === selectedAssetId);
    if (!targetAsset) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/maintenance/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_id: targetAsset.id,
          asset_no: targetAsset.no,
          asset_name: `${targetAsset.brandModel} (${targetAsset.name})`,
          reporter_name: reporterName,
          reporter_contact: reporterContact,
          fault_type: faultType,
          fault_description: faultDesc
        })
      });

      if (res.ok) {
        showToast('故障报修登记成功！设备已标记为【维修中】', 'success');
        setShowCreateModal(false);
        setFaultDesc('');
        setSelectedAssetId('');
        fetchRecords();
        fetchAssets();
      } else {
        const errData = await res.json();
        showToast(errData.error || '提交报修失败', 'error');
      }
    } catch {
      showToast('网络请求失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  const handleOpenUpdateModal = (rec: MaintenanceRecord) => {
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.KEEPER) {
      return;
    }
    setSelectedRecord(rec);
    const d = computeUpdateDefaults(rec, assets, suppliers, warehouses);
    setUpdateStatus(d.status);
    setUpdateCost(d.cost);
    setUpdateNotes(d.notes);
    setUpdateResultAction(d.resultAction);
    setUpdateVendor(d.vendor);
    setTargetWarehouse(d.warehouse);
    setShowUpdateModal(true);
  };

  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/maintenance/records/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repair_status: updateStatus,
          cost: updateCost,
          repair_vendor: updateVendor,
          notes: updateNotes,
          result_action: updateResultAction,
          target_warehouse: targetWarehouse,
          operator: user.realName || user.username
        })
      });

      if (res.ok) {
        let msg = '维修进度更新成功！';
        if (updateResultAction === 'SITE_REPAIR_COMPLETE') {
          msg = `现场完修处理成功！资产已恢复【服役中】状态，并保留在原位置继续使用。`;
        } else if (updateResultAction === 'RETURN_TO_WAREHOUSE') {
          msg = `完修登记成功！资产已存入【${targetWarehouse || '周转仓'}】并进入【闲置】状态。`;
        } else if (updateResultAction === 'SCRAP' || updateStatus === '无法修复') {
          msg = `报修评估完成！资产已存入【${targetWarehouse || '报废仓'}】并转入【待报废】仓。`;
        }
        showToast(msg, 'success');
        setShowUpdateModal(false);
        setSelectedRecord(null);
        fetchRecords();
        fetchAssets();
      } else {
        showToast('更新失败', 'error');
      }
    } catch {
      showToast('网络通信异常', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  const handleDeleteRecord = async (id: number) => {
    const isConfirmed = await confirm({
      title: '删除报修记录',
      message: '确认删除此条报修记录？删除后不可恢复。',
      type: 'danger',
      confirmText: '确认删除',
      cancelText: '取消'
    });
    if (!isConfirmed) return;
    try {
      const res = await fetch(`/api/maintenance/records/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('记录已删除', 'info');
        fetchRecords();
      }
    } catch {
      showToast('删除失败', 'error');
    }
  };

  const stats = computeStats(records);
  const filteredRecords = filterRecords(records, filterStatus, searchTerm, startDate, endDate);

  return {
    user, showToast,
    records, assets, suppliers, loading,
    filterStatus, setFilterStatus, searchTerm, setSearchTerm, startDate, setStartDate, endDate, setEndDate,
    showCreateModal, setShowCreateModal, showUpdateModal, setShowUpdateModal,
    showDetailModal, setShowDetailModal, selectedRecord, setSelectedRecord,
    selectedAssetId, setSelectedAssetId, reporterName, setReporterName,
    reporterContact, setReporterContact, faultType, setFaultType, dbFaultTypes,
    faultDesc, setFaultDesc, submitting,
    updateStatus, setUpdateStatus, updateCost, setUpdateCost,
    updateVendor, setUpdateVendor, showVendorSuggestions, setShowVendorSuggestions,
    updateNotes, setUpdateNotes, updateResultAction, setUpdateResultAction,
    warehouses, targetWarehouse, setTargetWarehouse,
    ...stats, filteredRecords,
    handleCreateReport, handleOpenUpdateModal, handleUpdateRecord, handleDeleteRecord,
    fetchRecords, fetchAssets,
  };
}

/** hook 返回值类型，供两个渲染文件复用。 */
export type MaintenanceApi = ReturnType<typeof useMaintenance>;
