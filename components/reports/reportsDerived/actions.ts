// 由 .eng-audit/b1-4/gen-split-derived.mjs 生成 —— 勿手改。
import type { Dispatch, SetStateAction } from 'react';
import type { AccountItem, AssetItem, LocationItem, MaintenanceRecordItem, SystemWarehouseItem } from '../types';
import { getAssetPrice } from '../types';
import { logError } from '../../../utils/logger';

/**
 * 把一次 fetch 的响应写进 state（B1-4b2 提取，判定与原内联 if 块逐条一致）。
 * 仅在 res 有效且 ok 时解析 JSON，非数组一律回落为 []；
 * clearOnFail 为真时「响应无效」也算失败并清空 —— 对应原先「带 else」的那 4 个块。
 */
async function applyArrayResponse<T>(
  res: Response | null,
  set: Dispatch<SetStateAction<T[]>>,
  clearOnFail: boolean
): Promise<void> {
  if (res && res.ok) {
    const data = await res.json();
    set(Array.isArray(data) ? data : []);
    return;
  }
  if (clearOnFail) set([]);
}

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function makeFetchData(a: {
  setAccountsList: Dispatch<SetStateAction<AccountItem[]>>;
  setAssets: Dispatch<SetStateAction<AssetItem[]>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setLocations: Dispatch<SetStateAction<LocationItem[]>>;
  setMaintenance: Dispatch<SetStateAction<MaintenanceRecordItem[]>>;
  setSystemWarehouses: Dispatch<SetStateAction<SystemWarehouseItem[]>>;
}) {
  const { setAccountsList, setAssets, setLoading, setLocations, setMaintenance, setSystemWarehouses } = a;
  return async () => {
    setLoading(true);
    try {
      const [assetsRes, maintRes, locRes, whRes, accRes] = await Promise.all([
        fetch('/api/assets').catch(err => { logError('fetch /api/assets error:', err); return null; }),
        fetch('/api/maintenance').catch(err => { logError('fetch /api/maintenance error:', err); return null; }),
        fetch('/api/locations').catch(err => { logError('fetch /api/locations error:', err); return null; }),
        fetch('/api/warehouses').catch(err => { logError('fetch /api/warehouses error:', err); return null; }),
        fetch('/api/accounts').catch(err => { logError('fetch /api/accounts error:', err); return null; })
      ]);

      // 写入顺序与原先 5 个并列 if 块完全一致（逐个 await，串行）。
      // accounts 沿用原逻辑：响应无效时**不清空**（第 5 块原就没有 else）。
      await applyArrayResponse(assetsRes, setAssets, true);
      await applyArrayResponse(maintRes, setMaintenance, true);
      await applyArrayResponse(locRes, setLocations, true);
      await applyArrayResponse(whRes, setSystemWarehouses, true);
      await applyArrayResponse(accRes, setAccountsList, false);
    } catch (err) {
      logError('Reports fetchData exception:', err);
      setAssets([]);
      setMaintenance([]);
      setLocations([]);
      setSystemWarehouses([]);
    } finally {
      setLoading(false);
    }
  };
}

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function makeResolvePrice(a: {
  modelPriceMap: Map<string, number>;
}) {
  const { modelPriceMap } = a;
  return (a?: AssetItem | null): number => {
    if (!a) return 0;
    const directPrice = getAssetPrice(a);
    if (directPrice > 0) return directPrice;
    const m = (a.brand_model || a.brandModel || a.name || '').trim();
    if (m && modelPriceMap.has(m)) {
      return modelPriceMap.get(m)!;
    }
    return 0;
  };
}

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function makeUpdateModelPrice(a: {
  fetchData: ReturnType<typeof makeFetchData>;
}) {
  const { fetchData } = a;
  return async (brandModel: string, price: number) => {
    try {
      const res = await fetch('/api/assets/batch-update-model-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandModel, price })
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
    } catch (err) {
      logError('updateModelPrice error:', err);
    }
    return false;
  };
}
