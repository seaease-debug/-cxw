// 由 .eng-audit/b1-4/gen-split-derived.mjs 生成 —— 勿手改。
// （B1-4b3：把 displayAssets.filter 里那个复杂度 40 的内联谓词拆成 9 个独立规则函数。
//   规则集合、判定顺序、短路语义、trim 行为、大小写处理全部逐条保持不变。）
import type { AssetItem, SystemWarehouseItem } from '../types';
import type { User } from '../../../types';

/** 仓库引用（effectiveWarehouses 的元素形态） */
type WarehouseRef = { id: string | number; name: string; code?: string };
/** 一次判定里反复用到的、已 trim 的取值快照 */
type Trimmed = { whLoc: string; loc: string; status: string; whName: string; whCode: string };

/** 规则 1：周转库 —— 仓库名或编码含「周转」，且资产的状态/地点/库位任一含「周转」 */
function isTransferWarehouse(a: AssetItem, wh: WarehouseRef, x: Trimmed): boolean {
  const whIsTransfer = x.whName.includes('周转') || x.whCode.includes('周转');
  const assetIsTransfer = x.status.includes('周转') || x.loc.includes('周转') || x.whLoc.includes('周转');
  return whIsTransfer && assetIsTransfer;
}

/** 规则 2：维修库 —— 仓库名含「维修」或「维保」，且资产状态/地点含「维修」或「维保」 */
function isRepairWarehouse(a: AssetItem, wh: WarehouseRef, x: Trimmed): boolean {
  const whIsRepair = x.whName.includes('维修') || x.whName.includes('维保');
  const assetIsRepair = x.status.includes('维修') || x.status.includes('维护') || x.loc.includes('维修') || x.loc.includes('维保');
  return whIsRepair && assetIsRepair;
}

/** 规则 3：库位名与仓库名相同，或与仓库编码（忽略大小写）相同 */
function matchesByExactLocation(a: AssetItem, wh: WarehouseRef, x: Trimmed): boolean {
  return Boolean(x.whLoc && (x.whLoc === x.whName || (x.whCode && x.whLoc.toLowerCase() === x.whCode.toLowerCase())));
}

/** 规则 4：按仓库主键匹配 */
function matchesByWarehouseId(a: AssetItem, wh: WarehouseRef, _x: Trimmed): boolean {
  return Boolean(a.warehouse_id && String(a.warehouse_id) === String(wh.id));
}

/** 规则 5：按仓库编码匹配（忽略大小写） */
function matchesByWarehouseCode(a: AssetItem, wh: WarehouseRef, x: Trimmed): boolean {
  return Boolean(a.warehouse_code && x.whCode && a.warehouse_code.toLowerCase() === x.whCode.toLowerCase());
}

/** 规则 6：库位名与仓库名互相包含 */
function matchesByLocationContainsName(a: AssetItem, wh: WarehouseRef, x: Trimmed): boolean {
  return Boolean(x.whLoc && x.whName && (x.whLoc.includes(x.whName) || x.whName.includes(x.whLoc)));
}

/** 规则 7：库位名包含仓库编码（忽略大小写） */
function matchesByLocationContainsCode(a: AssetItem, wh: WarehouseRef, x: Trimmed): boolean {
  return Boolean(x.whLoc && x.whCode && x.whLoc.toLowerCase().includes(x.whCode.toLowerCase()));
}

/** 规则 8：资产地点与仓库名互相包含 */
function matchesByLocationFieldContainsName(a: AssetItem, wh: WarehouseRef, x: Trimmed): boolean {
  return Boolean(x.loc && x.whName && (x.loc.includes(x.whName) || x.whName.includes(x.loc)));
}

/** 规则 9：资产地点包含仓库编码（忽略大小写） */
function matchesByLocationFieldContainsCode(a: AssetItem, wh: WarehouseRef, x: Trimmed): boolean {
  return Boolean(x.loc && x.whCode && x.loc.toLowerCase().includes(x.whCode.toLowerCase()));
}

// 判定顺序 = 原 if 链自上而下的顺序；.some 本身短路由，与原「命中即 return true」一致。
const WAREHOUSE_RULES: Array<(a: AssetItem, wh: WarehouseRef, x: Trimmed) => boolean> = [
  isTransferWarehouse,
  isRepairWarehouse,
  matchesByExactLocation,
  matchesByWarehouseId,
  matchesByWarehouseCode,
  matchesByLocationContainsName,
  matchesByLocationContainsCode,
  matchesByLocationFieldContainsName,
  matchesByLocationFieldContainsCode
];

function matchesWarehouse(asset: AssetItem, wh: WarehouseRef): boolean {
  const x: Trimmed = {
    whLoc: (asset.warehouse_location || '').trim(),
    loc: (asset.location || '').trim(),
    status: (asset.status || '').trim(),
    whName: (wh.name || '').trim(),
    whCode: (wh.code || '').trim()
  };
  return WAREHOUSE_RULES.some((rule) => rule(asset, wh, x));
}

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeWarehousesData(a: {
  currentUserDisplayName: string;
  displayAssets: AssetItem[];
  resolvePrice: (asset?: AssetItem | null) => number;
  systemWarehouses: SystemWarehouseItem[];
  user: User | null;
}) {
  const { currentUserDisplayName, displayAssets, resolvePrice, systemWarehouses, user } = a;
  let effectiveWarehouses: Array<{ id: string | number; name: string; code?: string }> = [];

  if (systemWarehouses && systemWarehouses.length > 0) {
    effectiveWarehouses = systemWarehouses.map(w => ({
      id: w.id,
      name: w.name,
      code: w.code
    }));
  } else {
    const locNamesSet = new Set<string>();
    displayAssets.forEach(a => {
      if (a.warehouse_location) locNamesSet.add(a.warehouse_location.trim());
      if (a.location) locNamesSet.add(a.location.trim());
      if (a.status && (a.status.includes('周转') || a.status.includes('维修') || a.status.includes('维护'))) {
        locNamesSet.add(a.status.includes('周转') ? '周转库' : '维修库');
      }
    });
    const locNames = Array.from(locNamesSet).filter(Boolean);
    effectiveWarehouses = locNames.map((loc, index) => ({
      id: `wh-auto-${index}`,
      name: loc,
      code: `WH${index + 1}`
    }));
  }

  return effectiveWarehouses.map((wh) => {
    const whAssets = displayAssets.filter((a) => matchesWarehouse(a, wh));

    const count = whAssets.length;
    const rawTotalValue = whAssets.reduce((sum, a) => sum + resolvePrice(a), 0);
    const totalValueWan = (rawTotalValue / 10000).toFixed(1);

    const keeperMap: Record<string, number> = {};
    whAssets.forEach(a => {
      if (a.keeper && a.keeper !== '未指定保管人') {
        keeperMap[a.keeper] = (keeperMap[a.keeper] || 0) + 1;
      }
    });
    const sortedKeepers = Object.entries(keeperMap).sort((a, b) => b[1] - a[1]);
    const mainKeeper = sortedKeepers.length > 0 ? sortedKeepers[0][0] : (user?.username || currentUserDisplayName || 'admin');

    const modelCounts: Record<string, number> = {};
    whAssets.forEach(a => {
      const m = a.brand_model || a.name || '通用配置设备';
      modelCounts[m] = (modelCounts[m] || 0) + 1;
    });

    const topModels = Object.entries(modelCounts)
      .map(([model, c]) => ({
        model,
        count: c,
        percentage: count > 0 ? Math.round((c / count) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const maxValDeviceAsset = [...whAssets].sort((a, b) => resolvePrice(b) - resolvePrice(a))[0];
    const maxValDevice = maxValDeviceAsset ? {
      name: maxValDeviceAsset.name || maxValDeviceAsset.brand_model || '高价值在库设备',
      price: resolvePrice(maxValDeviceAsset)
    } : {
      name: '暂无在库设备',
      price: 0
    };

    return {
      id: wh.id,
      name: wh.name,
      code: wh.code,
      keeper: mainKeeper,
      count,
      totalValueWan,
      topModels,
      maxValDevice
    };
  });
}
