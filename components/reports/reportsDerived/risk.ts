// 由 .eng-audit/b1-4/gen-split-derived.mjs 生成 —— 勿手改。
import type { AssetItem, MaintenanceRecordItem, RiskFilterType, RiskModelStat, RiskSortBy } from '../types';
import { getAssetIdleDays, isAssetInRepair, isAssetInService, isAssetScrapPending } from '../types';

/** 单条风险项的形态（B1-4b2：由函数内联类型原样提取，字段未增未减） */
type RiskFilteredItem = {
  asset: AssetItem;
  riskType: 'idle180' | 'repair' | 'scrap';
  idleDays: number;
  maintRecord?: {
    record_no?: string;
    cost: number;
    reported_at?: string;
    repair_status?: string;
    repair_vendor?: string;
    reported_by?: string;
  };
};

/** 按型号聚合的风险分组形态（B1-4b2：同上） */
type ModelRiskGroup = {
  model: string;
  items: RiskFilteredItem[];
  totalValue: number;
  totalIdleDays: number;
  maxIdleDays: number;
  idleCount: number;
  repairCount: number;
  scrapCount: number;
  locationCountMap: Record<string, number>;
};

/**
 * riskType → 计数字段。
 * 原代码是 3 个并列 if，但 riskType 是单值联合，三者互斥 ⇒ 查表等价，且少 3 个分支。
 */
const RISK_COUNT_KEYS = { idle180: 'idleCount', repair: 'repairCount', scrap: 'scrapCount' } as const;

/** 型号名兜底：brand_model → name → 「未标识型号」。 */
function modelLabelOf(asset: AssetItem): string {
  return asset.brand_model || asset.name || '未标识型号';
}

/** 位置名兜底：warehouse_location → location → 「专职保管处」。 */
function locationLabelOf(asset: AssetItem): string {
  return asset.warehouse_location || asset.location || '专职保管处';
}

/** 取（必要时新建）型号分组 —— 与原 `if (!map[model]) { map[model] = {...} }` 等价。 */
function ensureModelGroup(map: Record<string, ModelRiskGroup>, model: string): ModelRiskGroup {
  const existing = map[model];
  if (existing) return existing;
  const created: ModelRiskGroup = {
    model,
    items: [],
    totalValue: 0,
    totalIdleDays: 0,
    maxIdleDays: 0,
    idleCount: 0,
    repairCount: 0,
    scrapCount: 0,
    locationCountMap: {}
  };
  map[model] = created;
  return created;
}

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeRiskInspectionAnalysis(a: {
  displayAssets: AssetItem[];
  maintenance: MaintenanceRecordItem[];
  resolvePrice: (asset?: AssetItem | null) => number;
  riskFilterType: RiskFilterType;
  riskSortBy: RiskSortBy;
}) {
  const { displayAssets, maintenance, resolvePrice, riskFilterType, riskSortBy } = a;
  const longIdleList: AssetItem[] = [];
  const repairList: AssetItem[] = [];
  const scrapPendingList: AssetItem[] = [];

  displayAssets.forEach(a => {
    if (isAssetInRepair(a)) {
      repairList.push(a);
    } else if (isAssetScrapPending(a)) {
      scrapPendingList.push(a);
    } else if (getAssetIdleDays(a) >= 180) {
      longIdleList.push(a);
    }
  });

  const filteredList: RiskFilteredItem[] = [];

  if (riskFilterType === 'all' || riskFilterType === 'idle180') {
    longIdleList.forEach(a => filteredList.push({ asset: a, riskType: 'idle180', idleDays: getAssetIdleDays(a) }));
  }
  if (riskFilterType === 'all' || riskFilterType === 'repair') {
    repairList.forEach(a => {
      const maint = maintenance.find(m =>
        m.asset_id === a.id ||
        (m.asset_no && m.asset_no === a.asset_no) ||
        m.asset_name === a.name
      );
      filteredList.push({
        asset: a,
        riskType: 'repair',
        idleDays: 0,
        maintRecord: maint ? {
          record_no: maint.record_no,
          cost: Number(maint.cost || 0),
          reported_at: maint.reported_at,
          repair_status: maint.repair_status,
          repair_vendor: maint.repair_vendor,
          reported_by: maint.reporter_name
        } : undefined
      });
    });
  }
  if (riskFilterType === 'all' || riskFilterType === 'scrap') {
    scrapPendingList.forEach(a => filteredList.push({ asset: a, riskType: 'scrap', idleDays: 0 }));
  }

  const modelGroupMap: Record<string, ModelRiskGroup> = {};

  filteredList.forEach(item => {
    const g = ensureModelGroup(modelGroupMap, modelLabelOf(item.asset));
    g.items.push(item);
    g.totalValue += resolvePrice(item.asset);
    g.totalIdleDays += item.idleDays;
    if (item.idleDays > g.maxIdleDays) g.maxIdleDays = item.idleDays;
    g[RISK_COUNT_KEYS[item.riskType]] += 1;
    const loc = locationLabelOf(item.asset);
    g.locationCountMap[loc] = (g.locationCountMap[loc] || 0) + 1;
  });

  const modelStats: RiskModelStat[] = Object.values(modelGroupMap).map(g => {
    let topLoc = '各处分散';
    let maxLocCount = 0;
    Object.entries(g.locationCountMap).forEach(([loc, cnt]) => {
      if (cnt > maxLocCount) {
        maxLocCount = cnt;
        topLoc = loc;
      }
    });
    return {
      model: g.model,
      count: g.items.length,
      totalValue: g.totalValue,
      avgIdleDays: g.items.length > 0 ? Math.round(g.totalIdleDays / g.items.length) : 0,
      maxIdleDays: g.maxIdleDays,
      idleCount: g.idleCount,
      repairCount: g.repairCount,
      scrapCount: g.scrapCount,
      topLocation: topLoc,
      items: g.items
    };
  });

  modelStats.sort((a, b) => {
    if (riskSortBy === 'value') return b.totalValue - a.totalValue;
    if (riskSortBy === 'avgIdle') return b.avgIdleDays - a.avgIdleDays;
    return b.count - a.count;
  });

  const topRiskModels = modelStats.slice(0, 5).map(m => ({ model: m.model, count: m.count }));

  return {
    longIdleList,
    repairList,
    scrapPendingList,
    totalRiskCount: longIdleList.length + repairList.length + scrapPendingList.length,
    filteredList,
    topRiskModels,
    modelStats
  };
}

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeModelBatchHealthData(a: {
  displayAssets: AssetItem[];
  selectedModel: string;
}) {
  const { displayAssets, selectedModel } = a;
  const targetAssets = displayAssets.filter(a =>
    (a.brand_model && a.brand_model === selectedModel) ||
    (a.name && a.name === selectedModel) ||
    (a.brand_model && selectedModel && a.brand_model.includes(selectedModel)) ||
    (a.name && selectedModel && a.name.includes(selectedModel))
  );

  const yearGroups: { [key: string]: { 服役中: number; 闲置: number; 维护中: number; 报废待审: number } } = {};

  targetAssets.forEach(a => {
    let batchKey = '常规采购批次';
    if (a.purchase_date) {
      const match = String(a.purchase_date).match(/^(\d{4})[-/](\d{1,2})/);
      if (match) {
        const y = match[1];
        const m = match[2].padStart(2, '0');
        batchKey = `${y}年${m}月采购批次`;
      } else {
        batchKey = `${a.purchase_date}批次`;
      }
    } else if (a.location || a.warehouse_location) {
      batchKey = `${a.location || a.warehouse_location}批次`;
    }

    if (!yearGroups[batchKey]) {
      yearGroups[batchKey] = { 服役中: 0, 闲置: 0, 维护中: 0, 报废待审: 0 };
    }

    if (isAssetInService(a)) yearGroups[batchKey].服役中 += 1;
    else if (isAssetInRepair(a)) yearGroups[batchKey].维护中 += 1;
    else if (isAssetScrapPending(a)) yearGroups[batchKey].报废待审 += 1;
    else yearGroups[batchKey].闲置 += 1;
  });

  const result = Object.entries(yearGroups).map(([batch, counts]) => ({
    batch,
    ...counts
  }));

  if (result.length === 0) {
    return [{ batch: '暂无批次数据', 服役中: 0, 闲置: 0, 维护中: 0, 报废待审: 0 }];
  }

  return result;
}

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeAllModelsHealthOverview(a: {
  displayAssets: AssetItem[];
}) {
  const { displayAssets } = a;
  const modelMap: Record<string, {
    modelName: string;
    total: number;
    inService: number;
    idle: number;
    inRepair: number;
    scrapPending: number;
    avgYears: number;
  }> = {};

  const today = new Date();

  displayAssets.forEach(a => {
    const model = a.brand_model || '其他通用设备';
    if (!modelMap[model]) {
      modelMap[model] = {
        modelName: model,
        total: 0,
        inService: 0,
        idle: 0,
        inRepair: 0,
        scrapPending: 0,
        avgYears: 0
      };
    }

    modelMap[model].total += 1;
    if (isAssetInService(a)) modelMap[model].inService += 1;
    else if (isAssetInRepair(a)) modelMap[model].inRepair += 1;
    else if (isAssetScrapPending(a)) modelMap[model].scrapPending += 1;
    else modelMap[model].idle += 1;

    const pDate = a.purchase_date ? new Date(a.purchase_date) : today;
    const years = (today.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    modelMap[model].avgYears += Math.max(0, years);
  });

  return Object.values(modelMap).map(m => ({
    ...m,
    avgYears: m.total > 0 ? Number((m.avgYears / m.total).toFixed(1)) : 0
  })).sort((a, b) => b.total - a.total);
}

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeAllModelsHealthChartData(a: {
  allModelsHealthOverview: ReturnType<typeof computeAllModelsHealthOverview>;
}) {
  const { allModelsHealthOverview } = a;
  return allModelsHealthOverview.map(item => ({
    model: item.modelName.length > 10 ? item.modelName.slice(0, 8) + '...' : item.modelName,
    fullModelName: item.modelName,
    '服役中': item.inService,
    '闲置': item.idle,
    '维护中': item.inRepair,
    '报废待审': item.scrapPending,
    total: item.total,
    avgYears: item.avgYears
  }));
}
