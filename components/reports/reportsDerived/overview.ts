// 由 .eng-audit/b1-4/gen-split-derived.mjs 生成 —— 勿手改。
import type { AccountItem, AssetItem, KeeperViewMode, LeaderboardSortBy, MaintenanceRecordItem } from '../types';
import { getAssetIdleDays, isAssetInRepair, isAssetInService, isAssetScrapPending } from '../types';
import { buildKeeperIdSet, keeperIn } from './keepers';

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeKpiStats(a: {
  displayAssets: AssetItem[];
  resolvePrice: (asset?: AssetItem | null) => number;
}) {
  const { displayAssets, resolvePrice } = a;
  const totalCount = displayAssets.length;
  const totalValue = displayAssets.reduce((sum, a) => sum + resolvePrice(a), 0);
  const inServiceCount = displayAssets.filter(isAssetInService).length;
  const inRepairCount = displayAssets.filter(isAssetInRepair).length;
  const scrapPendingCount = displayAssets.filter(isAssetScrapPending).length;
  const idleCount = Math.max(0, totalCount - inServiceCount - inRepairCount - scrapPendingCount);
  const usageRate = totalCount > 0 ? Math.round((inServiceCount / totalCount) * 100) : 0;

  const today = new Date();
  let warrantyAlertCount = 0;
  let usefulLifeAlertCount = 0;

  displayAssets.forEach(a => {
    if (a.warranty_expire) {
      const exp = new Date(a.warranty_expire);
      const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 90) warrantyAlertCount++;
    }
    const pDate = a.purchase_date ? new Date(a.purchase_date) : today;
    const years = (today.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (years >= (a.useful_life_years || 5)) {
      usefulLifeAlertCount++;
    }
  });

  return {
    totalCount,
    totalValue,
    inServiceCount,
    inRepairCount,
    scrapPendingCount,
    idleCount,
    usageRate,
    warrantyAlertCount,
    usefulLifeAlertCount
  };
}

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeKeeperLeaderboardData(a: {
  accountsList: AccountItem[];
  allKeepersList: string[];
  assets: AssetItem[];
  leaderboardSortBy: LeaderboardSortBy;
  resolvePrice: (asset?: AssetItem | null) => number;
}) {
  const { accountsList, allKeepersList, assets, leaderboardSortBy, resolvePrice } = a;
  if (!allKeepersList || allKeepersList.length === 0) return [];

  const list = allKeepersList.map(keeperName => {
    const validIds = buildKeeperIdSet(accountsList, keeperName);

    const keeperAssets = assets.filter((x) => keeperIn(x, validIds));

    const count = keeperAssets.length;
    const totalVal = keeperAssets.reduce((sum, a) => sum + resolvePrice(a), 0);
    const serviceCount = keeperAssets.filter(isAssetInService).length;
    const rawRate = count > 0 ? (serviceCount / count) * 100 : 0;
    const usageRate = Number(rawRate.toFixed(1));
    const usageRateDisplay = formatUsageRate(rawRate);

    const repairCount = keeperAssets.filter(isAssetInRepair).length;
    const scrapCount = keeperAssets.filter(isAssetScrapPending).length;
    const longIdleCount = keeperAssets.filter(a => getAssetIdleDays(a) >= 180).length;
    const totalRiskCount = repairCount + scrapCount + longIdleCount;

    const typeCounts: Record<string, number> = {};
    keeperAssets.forEach(a => {
      const type = a.type || '其他设备';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    const topTypes = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([t, c]) => `${t} (${c})`)
      .join('、');

    return {
      keeperName,
      count,
      totalVal,
      totalValWan: (totalVal / 10000).toFixed(2),
      serviceCount,
      usageRate,
      usageRateDisplay,
      repairCount,
      scrapCount,
      longIdleCount,
      totalRiskCount,
      topTypes: topTypes || '暂无数据'
    };
  });

  return list.sort((a, b) => {
    if (leaderboardSortBy === 'value') return b.totalVal - a.totalVal;
    if (leaderboardSortBy === 'usage') return b.usageRate - a.usageRate;
    if (leaderboardSortBy === 'risk') return b.totalRiskCount - a.totalRiskCount;
    return b.count - a.count;
  });
}

/** 使用率显示：0 显示 0%，不足 1% 保留一位小数，其余取整。 */
function formatUsageRate(rawRate: number): string {
  if (rawRate === 0) return '0%';
  if (rawRate < 1) return `${rawRate.toFixed(1)}%`;
  return `${Math.round(rawRate)}%`;
}

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeKeeperAssetStats(a: {
  displayAssets: AssetItem[];
  resolvePrice: (asset?: AssetItem | null) => number;
}) {
  const { displayAssets, resolvePrice } = a;
  const map: Record<string, { assetName: string; count: number; totalValue: number; keepers: Set<string> }> = {};
  const invalidKeepers = new Set([
    'user', 'user1', 'admin', 'administrator', 'system',
    '系统管理员', '管理员', '普通用户', '超级管理员', '测试账号',
    '未指定保管人', '未分配', '无', '系统用户'
  ]);

  displayAssets.forEach(a => {
    const k = (a.keeper || '').trim();
    if (k && !invalidKeepers.has(k.toLowerCase()) && k !== '未指定保管人') {
      const assetKey = a.name || '未命名设备';
      if (!map[assetKey]) {
        map[assetKey] = {
          assetName: assetKey,
          count: 0,
          totalValue: 0,
          keepers: new Set()
        };
      }
      map[assetKey].count += 1;
      map[assetKey].totalValue += resolvePrice(a);
      map[assetKey].keepers.add(k);
    }
  });

  const sortedList = Object.values(map)
    .sort((a, b) => b.count - a.count)
    .map(item => ({
      assetName: item.assetName,
      count: item.count,
      totalValueWan: Number((item.totalValue / 10000).toFixed(2)),
      keeperCount: item.keepers.size
    }));

  return {
    all: sortedList,
    top5: sortedList.slice(0, 5),
    totalAssignedAssetsCount: sortedList.length
  };
}

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeDisplayedKeeperChartData(a: {
  keeperAssetStats: ReturnType<typeof computeKeeperAssetStats>;
  keeperViewMode: KeeperViewMode;
}) {
  const { keeperAssetStats, keeperViewMode } = a;
  return keeperViewMode === 'top5' ? keeperAssetStats.top5 : keeperAssetStats.all;
}

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeAvailableYears(a: {
  displayAssets: AssetItem[];
}) {
  const { displayAssets } = a;
  const yearsSet = new Set<string>();
  displayAssets.forEach(a => {
    if (a.purchase_date) {
      const y = new Date(a.purchase_date).getFullYear();
      if (!isNaN(y) && y > 2000) yearsSet.add(String(y));
    }
  });
  ['2026', '2025', '2024', '2023'].forEach(y => yearsSet.add(y));
  return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
}

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeAssetStatusTransferData(a: {
  displayAssets: AssetItem[];
  maintenance: MaintenanceRecordItem[];
  selectedStatusYear: string;
}) {
  const { displayAssets, maintenance, selectedStatusYear } = a;
  const allMonths = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  let maxMonth = 12;
  const selectedY = Number(selectedStatusYear);
  if (!isNaN(selectedY) && selectedY === currentYear) {
    maxMonth = currentMonth;
  }

  const activeMonths = allMonths.slice(0, maxMonth);
  const displayAssetIds = new Set(displayAssets.map(a => a.id));

  return activeMonths.map((month, idx) => {
    const targetMonthNum = idx + 1;

    const repairRecords = maintenance.filter(m => {
      if (!m.reported_at) return false;
      if (m.asset_id && !displayAssetIds.has(String(m.asset_id))) return false;
      const d = new Date(m.reported_at);
      if (isNaN(d.getTime())) return false;
      const matchYear = String(d.getFullYear()) === selectedStatusYear;
      const matchMonth = (d.getMonth() + 1) === targetMonthNum;
      return matchYear && matchMonth;
    });

    const serviceAssets = displayAssets.filter(a => {
      const dateStr = a.outbound_date || a.purchase_date;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;
      const matchYear = String(d.getFullYear()) === selectedStatusYear;
      const matchMonth = (d.getMonth() + 1) === targetMonthNum;
      return matchYear && matchMonth && isAssetInService(a);
    });

    const idleAssets = displayAssets.filter(a => {
      if (!a.purchase_date) return false;
      const d = new Date(a.purchase_date);
      if (isNaN(d.getTime())) return false;
      const matchYear = String(d.getFullYear()) === selectedStatusYear;
      const matchMonth = (d.getMonth() + 1) === targetMonthNum;
      return matchYear && matchMonth && !isAssetInService(a) && !isAssetInRepair(a) && !isAssetScrapPending(a);
    });

    const scrapAssets = displayAssets.filter(a => {
      const dateStr = a.purchase_date;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;
      const matchYear = String(d.getFullYear()) === selectedStatusYear;
      const matchMonth = (d.getMonth() + 1) === targetMonthNum;
      return matchYear && matchMonth && isAssetScrapPending(a);
    });

    return {
      month,
      领用服役: serviceAssets.length,
      闲置入库: idleAssets.length,
      报修维护: repairRecords.length,
      申请报废: scrapAssets.length
    };
  });
}
