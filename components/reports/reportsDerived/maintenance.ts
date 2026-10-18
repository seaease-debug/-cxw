// 由 .eng-audit/b1-4/gen-split-derived.mjs 生成 —— 勿手改。
import type { AssetItem, MaintenanceRecordItem } from '../types';
import { getAssetCurrentLocation } from '../types';
import type { User } from '../../../types';

/** 按 id / asset_no 在资产表中定位某条维修记录对应的资产（B1-4b2 提取，判据与原内联式逐字一致）。 */
function findAssetForRecord(assets: AssetItem[], rec: MaintenanceRecordItem) {
  return assets.find(a => (a.id && a.id === rec.asset_id) || (a.asset_no && a.asset_no === rec.asset_no));
}

/** 故障型号名 —— 无匹配资产时兜底「未知设备型号」。 */
function faultModelNameOf(found: AssetItem | undefined, rec: MaintenanceRecordItem): string {
  return found ? (found.brand_model || found.name) : (rec.asset_name || '未知设备型号');
}

/** 时间线型号名 —— 与上面不同：无匹配资产时**直接取 rec.asset_name，不做兜底**（保持原行为）。 */
function timelineModelNameOf(found: AssetItem | undefined, rec: MaintenanceRecordItem) {
  return found ? (found.brand_model || found.name) : rec.asset_name;
}

/** 时间线日期：reported_at → repair_date → created_at，取前 10 位；全空为「未记录时间」。 */
function timelineDateOf(rec: MaintenanceRecordItem): string {
  const raw = rec.reported_at
    || (rec as unknown as Record<string, unknown>).repair_date
    || (rec as unknown as Record<string, unknown>).created_at
    || '';
  return raw ? String(raw).slice(0, 10) : '未记录时间';
}

/** 时间线备注：notes → fault_description，去空白后兜底「暂无维修备注」。 */
function timelineNotesOf(rec: MaintenanceRecordItem): string {
  return (rec.notes || rec.fault_description || '').trim() || '暂无维修备注';
}

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeScopedMaintenance(a: {
  currentUserDisplayName: string;
  displayAssets: AssetItem[];
  isAdmin: boolean;
  maintenance: MaintenanceRecordItem[];
  user: User | null;
}) {
  const { currentUserDisplayName, displayAssets, isAdmin, maintenance, user } = a;
  const displayAssetIdSet = new Set(displayAssets.map(a => a.id));
  const displayAssetNoSet = new Set(displayAssets.map(a => a.asset_no).filter(Boolean));
  const username = user?.username || '';

  return maintenance.filter(rec => {
    if (rec.asset_id && displayAssetIdSet.has(String(rec.asset_id))) return true;
    if (rec.asset_no && displayAssetNoSet.has(rec.asset_no)) return true;

    if (!isAdmin) {
      if (rec.reporter_name === currentUserDisplayName || (username && rec.reporter_name === username)) {
        return true;
      }
    }

    return false;
  });
}

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeTopFaultModels(a: {
  assets: AssetItem[];
  scopedMaintenance: ReturnType<typeof computeScopedMaintenance>;
}) {
  const { assets, scopedMaintenance } = a;
  const modelFaultCounts: { [model: string]: { count: number; cost: number } } = {};

  scopedMaintenance.forEach(rec => {
    const found = findAssetForRecord(assets, rec);
    const modelName = faultModelNameOf(found, rec);

    if (!modelFaultCounts[modelName]) {
      modelFaultCounts[modelName] = { count: 0, cost: 0 };
    }
    modelFaultCounts[modelName].count += 1;
    modelFaultCounts[modelName].cost += (rec.cost || 0);
  });

  return Object.entries(modelFaultCounts)
    .map(([model, data]) => ({
      model,
      count: data.count,
      cost: data.cost
    }))
    .sort((a, b) => b.count - a.count || b.cost - a.cost)
    .slice(0, 5);
}

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeActiveMaintenanceRecords(a: {
  assets: AssetItem[];
  scopedMaintenance: ReturnType<typeof computeScopedMaintenance>;
  selectedFaultModel: string | null;
}) {
  const { assets, scopedMaintenance, selectedFaultModel } = a;
  if (!selectedFaultModel) return scopedMaintenance;
  return scopedMaintenance.filter(rec => {
    const found = findAssetForRecord(assets, rec);
    return faultModelNameOf(found, rec) === selectedFaultModel;
  });
}

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeSelectedModelDetail(a: {
  activeMaintenanceRecords: ReturnType<typeof computeActiveMaintenanceRecords>;
  assets: AssetItem[];
}) {
  const { activeMaintenanceRecords, assets } = a;
  const totalCount = activeMaintenanceRecords.length;
  const totalCost = activeMaintenanceRecords.reduce((sum, r) => sum + (r.cost || 0), 0);

  const faultTypeMap: { [type: string]: number } = {};
  activeMaintenanceRecords.forEach(rec => {
    const rawType = (rec.fault_type || '').trim() || '其他故障';
    faultTypeMap[rawType] = (faultTypeMap[rawType] || 0) + 1;
  });
  const faultTypeData = Object.entries(faultTypeMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const locationMap: { [loc: string]: { count: number; cost: number } } = {};
  activeMaintenanceRecords.forEach(rec => {
    const found = findAssetForRecord(assets, rec);
    const locName = getAssetCurrentLocation(found, '常用教学办公场所');
    if (!locationMap[locName]) {
      locationMap[locName] = { count: 0, cost: 0 };
    }
    locationMap[locName].count += 1;
    locationMap[locName].cost += (rec.cost || 0);
  });
  const locationData = Object.entries(locationMap)
    .map(([name, d]) => ({ name, value: d.count, cost: d.cost }))
    .sort((a, b) => b.value - a.value);

  const timelineData = activeMaintenanceRecords.map(rec => {
    const found = findAssetForRecord(assets, rec);
    return {
      id: rec.id,
      date: timelineDateOf(rec),
      recordNo: rec.record_no,
      notes: timelineNotesOf(rec),
      assetName: rec.asset_name,
      modelName: timelineModelNameOf(found, rec),
      location: getAssetCurrentLocation(found, '专职保管处'),
      faultType: rec.fault_type || '其他故障',
      reporter: rec.reporter_name || '工作人员',
      cost: rec.cost || 0
    };
  }).sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));

  return {
    totalCount,
    totalCost,
    faultTypeData,
    locationData,
    timelineData
  };
}
