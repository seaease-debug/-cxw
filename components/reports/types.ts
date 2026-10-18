import { User, Asset } from '../../types';

export type AssetItem = Asset;

export interface MaintenanceRecordItem {
  id: string | number;
  record_no?: string;
  asset_id?: string | number;
  asset_no?: string;
  asset_name?: string;
  fault_type?: string;
  fault_description?: string;
  notes?: string;
  cost?: number;
  reporter_name?: string;
  repair_vendor?: string;
  reported_at?: string;
  repair_status?: string;
  created_at?: string;
}

export interface LocationItem {
  id: string | number;
  name: string;
}

export interface SystemWarehouseItem {
  id: string | number;
  name: string;
  code?: string;
}

export interface AccountItem {
  id: string | number;
  username: string;
  realName?: string;
  real_name?: string;
  role?: string;
}

export interface ReportsProps {
  user: User | null;
  onSelectAsset?: (asset: AssetItem) => void;
  onNavigateToWarehouse?: () => void;
  onNavigateToMaintenance?: () => void;
}

export type LeaderboardSortBy = 'count' | 'value' | 'usage' | 'risk';
export type RiskFilterType = 'all' | 'idle180' | 'repair' | 'scrap';
export type RiskSortBy = 'count' | 'value' | 'avgIdle';
export type KeeperViewMode = 'top5' | 'all';
export type AlertFilter = 'all' | 'warranty_expired' | 'warranty_expiring' | 'useful_expired' | 'useful_expiring';

export interface ChartTheme {
  axisColor: string;
  axisText: string;
  gridColor: string;
  gridOpacity: number;
  cursorFill: string;
}

export interface RiskFilteredItem {
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
}

export interface RiskModelStat {
  model: string;
  count: number;
  totalValue: number;
  avgIdleDays: number;
  maxIdleDays: number;
  idleCount: number;
  repairCount: number;
  scrapCount: number;
  topLocation: string;
  items: RiskFilteredItem[];
}

// ==================== 纯工具计算函数 ====================

export const calcPercentStr = (numerator: number, denominator: number): string => {
  if (!denominator || denominator <= 0) return '0.0';
  const val = (numerator / denominator) * 100;
  return val % 1 === 0 ? val.toFixed(0) : val.toFixed(1);
};

export const getAssetCurrentLocation = (a?: AssetItem, defaultFallback = '未指定地点'): string => {
  if (!a) return defaultFallback;
  return a.location || a.warehouse_location || defaultFallback;
};

export const isAssetInRepair = (a: AssetItem): boolean => {
  const s = (a.status || a.currentStatus || '').trim();
  return s === '维护中' || s === '在修' || s.includes('修') || s.includes('维护');
};

export const isAssetScrapPending = (a: AssetItem): boolean => {
  const s = (a.status || a.currentStatus || '').trim();
  return s === '待报废' || s === '已报废' || s.includes('报废') || s.includes('报废待审');
};

export const isAssetInService = (a: AssetItem): boolean => {
  const s = (a.status || a.currentStatus || '').trim();
  return s === '服役中' || s === '在用' || s === '在役';
};

export const getAssetIdleDays = (a: AssetItem): number => {
  if (isAssetInService(a) || isAssetInRepair(a) || isAssetScrapPending(a)) {
    return 0;
  }
  const todayMs = new Date().getTime();
  const parseDateToMs = (str?: string) => {
    if (!str) return null;
    const t = new Date(str).getTime();
    return isNaN(t) ? null : t;
  };

  let refTime = parseDateToMs(a.outbound_date || a.outboundDate);
  if (refTime === null) {
    refTime = parseDateToMs(a.inbound_date) ?? parseDateToMs(a.purchase_date || a.purchaseDate) ?? parseDateToMs(a.created_at);
  }
  if (refTime === null) {
    return 0;
  }
  const diffDays = Math.floor((todayMs - refTime) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const getAssetPrice = (a?: AssetItem | null): number => {
  if (!a) return 0;
  return Number(a.purchase_price ?? a.purchasePrice ?? a.price ?? 0);
};

// ==================== 兜底数据常量（真实空数组，杜绝幽灵假数据） ====================

export const FALLBACK_ASSETS: AssetItem[] = [];
export const FALLBACK_MAINTENANCE: MaintenanceRecordItem[] = [];
export const FALLBACK_WAREHOUSES: SystemWarehouseItem[] = [];
export const FALLBACK_LOCATIONS: LocationItem[] = [];
