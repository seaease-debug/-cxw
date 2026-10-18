// components/mobileScanner/api.ts
// B1-5：把原 MobileScanner.tsx 里散落的 fetch 调用收拢成模块级函数。
// ★ 目的不是「好看」，是把 `refreshData` 的复杂度 36 与 4/5 层嵌套拆开 ——
//   每个网络步骤独立成函数后，各自的 `if` 不再累加到同一个函数上。
import { Asset, AssetHistory, Supplier, UserAccount } from '../../types';
import { RawDbAsset } from './types';
import { mapRawAsset } from './helpers';

const jsonOrThrow = async (res: Response, message: string) => {
  if (!res.ok) throw new Error(message);
  return res.json();
};

// —— 读接口 ——

/** 游客可用的「按资产编号精确取一台」；HTTP 非 2xx 时抛「资产不存在」 */
export const fetchAssetByNo = async (no: string): Promise<RawDbAsset> => {
  const res = await fetch(`/api/assets/by-no/${encodeURIComponent(no)}`);
  return jsonOrThrow(res, '资产不存在');
};

/**
 * 启动时按编号预取（扫码直达场景）。
 * ★ 与 fetchAssetByNo 的区别是**语义**：这里非 2xx 要静默返回 null ——
 *   原实现是 `if (res.ok) {...}`，取不到就什么都不做、不记日志。
 *   若复用会抛错的版本，启动时会凭空多出一条错误日志。
 */
export const loadInitialAssetByNo = async (no: string): Promise<RawDbAsset | null> => {
  const res = await fetch(`/api/assets/by-no/${encodeURIComponent(no)}`);
  if (!res.ok) return null;
  return res.json();
};

/** 全量资产；失败返回 null（调用方保持原状态不变） */
export const loadAssets = async (): Promise<Asset[] | null> => {
  const res = await fetch('/api/assets');
  if (!res.ok) return null;
  const data = await res.json();
  return (data as RawDbAsset[]).map((item) => mapRawAsset(item, true));
};

/** 供应商列表；失败返回空数组（与原实现一致：失败即清空） */
export const loadSuppliers = async (): Promise<Supplier[]> => {
  const res = await fetch('/api/suppliers');
  if (!res.ok) return [];
  return res.json();
};

/** 账号列表；失败返回 null（调用方保持原状态不变） */
export const loadAccounts = async (): Promise<UserAccount[] | null> => {
  const res = await fetch('/api/accounts');
  if (!res.ok) return null;
  return res.json();
};

/** 启用的故障类型；无可用项时返回 null（与原实现「length>0 才写入」一致） */
export const loadFaultTypes = async (): Promise<string[] | null> => {
  const res = await fetch('/api/fault-types');
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data)) return null;
  const enabled = data
    .filter((f: { enabled: number; name: string }) => f.enabled !== 0)
    .map((f: { name: string }) => f.name);
  return enabled.length > 0 ? enabled : null;
};

export const loadAssetHistory = async (assetId: string): Promise<AssetHistory[] | null> => {
  const res = await fetch(`/api/assets/${assetId}/history`);
  if (!res.ok) return null;
  return res.json();
};

export const loadModelPhoto = async (name: string): Promise<{ asset_image?: string }> => {
  const res = await fetch(`/api/assets/model-photo/${encodeURIComponent(name)}`);
  return res.json();
};

// —— 写接口 ——

export interface OutboundPayload {
  assetId: string;
  department: string;
  keeper: string;
  location: string;
  outboundDate: string;
  voucherImage: string | null;
}

export const postOutbound = async (p: OutboundPayload): Promise<boolean> => {
  const res = await fetch('/api/assets/outbound', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      assetId: p.assetId,
      department: p.department,
      keeper: p.keeper,
      location: p.location,
      outboundDate: p.outboundDate,
      voucherImage: p.voucherImage
    })
  });
  return res.ok;
};

export interface ReturnPayload {
  assetId: string;
  warehouseLocation: string;
  returnStatus: string;
  voucherImage: string | null;
}

export const postReturn = async (p: ReturnPayload): Promise<boolean> => {
  const res = await fetch('/api/assets/return', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      assetId: p.assetId,
      warehouseLocation: p.warehouseLocation,
      returnStatus: p.returnStatus,
      voucherImage: p.voucherImage
    })
  });
  return res.ok;
};

export const patchLocation = async (assetId: string, location: string, remarks: string): Promise<boolean> => {
  const res = await fetch(`/api/assets/${assetId}/location`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location, remarks })
  });
  return res.ok;
};

export interface RepairPayload {
  assetId: string;
  assetNo: string;
  assetName: string;
  reporterName: string;
  reporterContact: string;
  faultType: string;
  faultDescription: string;
}

export const postRepair = async (p: RepairPayload): Promise<boolean> => {
  const res = await fetch('/api/maintenance/records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      asset_id: p.assetId,
      asset_no: p.assetNo,
      asset_name: p.assetName,
      reporter_name: p.reporterName,
      reporter_contact: p.reporterContact,
      fault_type: p.faultType,
      fault_description: p.faultDescription
    })
  });
  return res.ok;
};

export const postRecycleProcess = async (assetId: string, action: 'scrap' | 'scrap_confirm'): Promise<boolean> => {
  const res = await fetch('/api/assets/recycle-process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assetId, action })
  });
  return res.ok;
};

/** 内联登录；成功返回用户对象，账号密码错返回 null，网络/解析失败返回 undefined */
export const postLogin = async (username: string, password: string): Promise<unknown | null | undefined> => {
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) return null;
    // 必须 await：否则 json() 的 reject 会逃出 try，与原实现的 catch 语义不符
    return await res.json();
  } catch {
    return undefined;
  }
};

/** 出库单号后缀（4 位） */
export const randomOutboundSuffix = (): number => Math.floor(Math.random() * 9000 + 1000);
