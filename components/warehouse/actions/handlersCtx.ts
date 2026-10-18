import React from "react";
import { Asset, AssetStatus, UserAccount } from "../../../types";
import {
  getBeijingDateString,
  isRecycledPendingStatus,
  isScrapPendingStatus,
} from "../warehouseUtils";
import type { WarehouseActionsState } from "./state";

/**
 * B4 拆分：本文件承载「各 handler 子 hook 共享的上下文」与**被多处重复的纯逻辑**。
 * 拆出来的都是**零副作用**的东西 —— 有副作用的一律留在原 handler 里按原顺序执行，
 * 以保证逻辑台的副作用轨迹逐条不变。
 */
export interface WarehouseActionsCtx {
  s: WarehouseActionsState;
  user: UserAccount;
  userRealName: string;
  realAssets: Asset[];
  fetchData: () => Promise<void>;
  selectedBatchAssetIds: string[];
  setSelectedBatchAssetIds: React.Dispatch<React.SetStateAction<string[]>>;
}

/** 批量处置动作（原内联联合类型，抽出来给「动作 → 状态判定表」当键）。 */
export type BatchProcessAction = "restock" | "scrap" | "scrap_confirm";

/**
 * 出库/退库日期校验（原 3 处逐字重复的 if 链，B2 合并为 1 处）。
 * 返回错误文案（null = 通过）。调用方负责 showToast / 复位 isSubmitting / return。
 */
export function outboundDateError(
  dateInput: string,
  assetInboundDate: string,
  noun: string,
): string | null {
  if (!dateInput) return null;
  const todayStr = getBeijingDateString();
  if (dateInput > todayStr) return "出库登记日期不能晚于今天！";
  if (assetInboundDate && dateInput < assetInboundDate) {
    return `出库日期（${dateInput}）不能早于${noun}（${assetInboundDate}）！`;
  }
  return null;
}

/**
 * 读取表单字段并 trim（原 4 处重复的 `((fd.get(k) as string) || "").trim()`）。
 * 语义与原写法逐字等价：取第一个**真值**字段，再整体 trim。
 */
export function readTrimmed(formData: FormData, ...keys: string[]): string {
  for (const k of keys) {
    const v = formData.get(k) as string;
    if (v) return v.trim();
  }
  return "";
}

/** 当前操作人账号名（原 6 处重复的 `user?.username || "admin"`）。 */
export function currentUsername(ctx: WarehouseActionsCtx): string {
  return ctx.user?.username || "admin";
}

/** 统一的 JSON 请求（原 7 处重复的 fetch + Content-Type + JSON.stringify）。 */
export function sendJson(url: string, method: string, body: unknown): Promise<Response> {
  return fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** 批量出库的资产资格：在库 或 待周转。 */
export function isBatchOutboundEligible(a: Asset): boolean {
  return (
    a.currentStatus === AssetStatus.NEW_IN_WAREHOUSE ||
    isRecycledPendingStatus(a.currentStatus)
  );
}

/** 批量退库的资产资格：服役中。 */
export function isBatchReturnEligible(a: Asset): boolean {
  return a.currentStatus === AssetStatus.IN_USE;
}

/**
 * 批量处置「动作 → 资格判定」表。
 * ★ 用查表而非 if-else 链：原 `handleBatchProcessSubmit` 的三段 if/else if 合计贡献 7 点复杂度，
 *   查表后主函数只余 1 点（未命中动作回退 false）。
 */
const PROCESS_ELIGIBILITY: Record<BatchProcessAction, (a: Asset) => boolean> = {
  scrap: (a) =>
    a.currentStatus === AssetStatus.NEW_IN_WAREHOUSE ||
    isRecycledPendingStatus(a.currentStatus),
  scrap_confirm: (a) => isScrapPendingStatus(a.currentStatus),
  restock: (a) =>
    isScrapPendingStatus(a.currentStatus) ||
    isRecycledPendingStatus(a.currentStatus),
};

const NEVER_ELIGIBLE = (): boolean => false;

export function matchesProcessAction(a: Asset, action: BatchProcessAction): boolean {
  return (PROCESS_ELIGIBILITY[action] || NEVER_ELIGIBLE)(a);
}

/**
 * 按「选中 id 列表 + 资格判定」筛出可处理资产 id（原 3 处重复的 filter+find 内联块）。
 * 返回的是 **id 列表**，顺序与入参一致。
 */
export function pickTargets(
  assets: Asset[],
  ids: string[],
  isEligible: (a: Asset) => boolean,
): string[] {
  return ids.filter((id) => {
    const a = assets.find((x) => x.id === id);
    return !!a && isEligible(a);
  });
}
