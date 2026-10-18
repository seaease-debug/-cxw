// components/assetDetail/api.ts
// AssetDetail 用到的所有后端接口（只做 URL + 取数，错误与状态流转留在调用方）。
// ★ 两个 accounts 取数口径**不同**（原实现如此），故分开两个函数，不可合并：
//   · fetchAccountsOrEmpty —— 带 res.ok 守卫，失败回落到空数组；
//   · fetchAccounts —— 直接 res.json()，把失败交给调用方的 catch。
import { AssetHistory, Supplier } from "../../types";
import type { AccountLite, FaultTypeLite } from "./shared";

export const fetchSuppliers = (): Promise<Supplier[]> =>
  fetch("/api/suppliers").then((res) => (res.ok ? res.json() : []));

export const fetchAccountsOrEmpty = (): Promise<AccountLite[]> =>
  fetch("/api/accounts").then((res) => (res.ok ? res.json() : []));

export const fetchAccounts = (): Promise<AccountLite[]> =>
  fetch("/api/accounts").then((res) => res.json());

export const fetchFaultTypes = (): Promise<FaultTypeLite[]> =>
  fetch("/api/fault-types").then((res) => res.json());

export const fetchAssetHistory = (assetId: string): Promise<AssetHistory[]> =>
  fetch(`/api/assets/${assetId}/history`).then((res) => res.json());

export const fetchModelPhoto = (modelName: string): Promise<{ asset_image?: string }> =>
  fetch(`/api/assets/model-photo/${encodeURIComponent(modelName)}`).then((res) => res.json());

export const postMaintenanceRecord = (body: Record<string, unknown>): Promise<Response> =>
  fetch("/api/maintenance/records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
