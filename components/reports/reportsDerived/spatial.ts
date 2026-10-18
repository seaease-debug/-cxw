// 由 .eng-audit/b1-4/gen-split-derived.mjs 生成 —— 勿手改。
import type { AssetItem, LocationItem } from '../types';
import { isAssetInRepair, isAssetInService, isAssetScrapPending } from '../types';

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeLocationAnalysis(a: {
  displayAssets: AssetItem[];
  resolvePrice: (asset?: AssetItem | null) => number;
  selectedLocation: string;
}) {
  const { displayAssets, resolvePrice, selectedLocation } = a;
  const locName = selectedLocation;
  const locAssets = displayAssets.filter(a => a.location === locName);
  const totalValue = locAssets.reduce((sum, a) => sum + resolvePrice(a), 0);
  const inServiceCount = locAssets.filter(isAssetInService).length;
  const inRepairCount = locAssets.filter(isAssetInRepair).length;
  const scrapPendingCount = locAssets.filter(isAssetScrapPending).length;
  const idleCount = Math.max(0, locAssets.length - inServiceCount - inRepairCount - scrapPendingCount);

  const keepers = Array.from(new Set(locAssets.map(a => a.keeper).filter(Boolean))).join(', ') || '未指定保管人';

  return {
    locName,
    locAssets,
    totalCount: locAssets.length,
    totalValue,
    inServiceCount,
    inRepairCount,
    idleCount,
    keepers
  };
}

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeFilteredLocations(a: {
  locationSearch: string;
  locations: LocationItem[];
}) {
  const { locationSearch, locations } = a;
  return locations.filter(l => l.name.includes(locationSearch.trim()));
}
