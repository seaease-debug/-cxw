import React from "react";
import { Asset, AssetStatus } from "../../../types";
import { useToast } from "../../Toast";
import { getBeijingDateString } from "../warehouseUtils";
import { API_BASE } from "../../../services/api";
import type { BatchProcessAction, WarehouseActionsCtx } from "./handlersCtx";
import {
  currentUsername,
  isBatchOutboundEligible,
  isBatchReturnEligible,
  matchesProcessAction,
  pickTargets,
  readTrimmed,
  sendJson,
} from "./handlersCtx";
import type { WarehouseActionsState } from "./state";

/**
 * B4 拆分自 handlers.ts 的 `useWarehouseBatchHandlers`（原 hook 体 189 行，收紧阈值超标）。
 * 三个批量动作各成一个模块级函数；「按状态筛资产」「批量出库日期校验」两条内联块提成纯函数。
 * ★ 副作用顺序原样保留：先校验（短路时只提示不回滚 isSubmitting），再置 isSubmitting，后发请求。
 */

interface BatchDeps {
  showToast: ReturnType<typeof useToast>["showToast"];
  setIsSubmitting: WarehouseActionsState["setIsSubmitting"];
  setShowBatchOutboundModal: WarehouseActionsState["setShowBatchOutboundModal"];
  setKeeperInput: WarehouseActionsState["setKeeperInput"];
  setShowBatchReturnModal: WarehouseActionsState["setShowBatchReturnModal"];
  setReturnImage: WarehouseActionsState["setReturnImage"];
  setShowBatchProcessModal: WarehouseActionsState["setShowBatchProcessModal"];
}

/**
 * 批量出库的日期校验（原内联在 handleBatchOutboundSubmit 里的两段 if）：
 * 逐资产检查入库日期，命中即把【型号】写进文案。
 */
function batchOutboundDateError(
  outboundDateInput: string,
  targetAssetIds: string[],
  realAssets: Asset[],
): string | null {
  const targetAssets = realAssets.filter((a) => targetAssetIds.includes(a.id));
  const invalidAsset = targetAssets.find(
    (a) => a.purchaseDate && outboundDateInput < a.purchaseDate,
  );
  if (outboundDateInput) {
    if (outboundDateInput > getBeijingDateString()) {
      return "出库登记日期不能晚于今天！";
    }
    if (invalidAsset) {
      return `出库日期（${outboundDateInput}）不能早于资产【${invalidAsset.brandModel || invalidAsset.name}】的入库日期（${invalidAsset.purchaseDate}）！`;
    }
  }
  return null;
}

async function submitBatchOutbound(
  ctx: WarehouseActionsCtx,
  deps: BatchDeps,
  e: React.FormEvent,
): Promise<void> {
  e.preventDefault();
  const s = ctx.s;
  const ids = ctx.selectedBatchAssetIds;
  if (ids.length === 0) return;

  const targetAssetIds = pickTargets(ctx.realAssets, ids, isBatchOutboundEligible);
  if (targetAssetIds.length === 0) {
    deps.showToast("没有满足在库或周转状态的可出库资产", "warning");
    return;
  }

  const formData = new FormData(e.target as HTMLFormElement);
  const payload = Object.fromEntries(formData.entries());

  const dateErr = batchOutboundDateError(
    readTrimmed(formData, "outboundDate"),
    targetAssetIds,
    ctx.realAssets,
  );
  if (dateErr) {
    deps.showToast(dateErr, "error");
    return;
  }

  deps.setIsSubmitting(true);
  try {
    await Promise.all(
      targetAssetIds.map((assetId) =>
        sendJson(`${API_BASE}/assets/outbound`, "POST", {
          ...payload,
          assetId,
          outbound_id: s.outboundId,
          voucherImage: s.outboundImage,
        }),
      ),
    );
    deps.showToast(
      `批量出库已成功办理！共 ${targetAssetIds.length} 件资产已安全发放。`,
      "success",
    );
    ctx.setSelectedBatchAssetIds([]);
    s.setShowBatchOutboundModal(false);
    s.setOutboundImage(null);
    deps.setKeeperInput("");
    await ctx.fetchData();
  } catch {
    deps.showToast("批量出库在执行时发生异常", "error");
  } finally {
    deps.setIsSubmitting(false);
  }
}

async function submitBatchReturn(
  ctx: WarehouseActionsCtx,
  deps: BatchDeps,
  e: React.FormEvent,
): Promise<void> {
  e.preventDefault();
  const s = ctx.s;
  const ids = ctx.selectedBatchAssetIds;
  if (ids.length === 0) return;

  const targetAssetIds = pickTargets(ctx.realAssets, ids, isBatchReturnEligible);
  if (targetAssetIds.length === 0) {
    deps.showToast("没有处于领用服役中的可退库资产", "warning");
    return;
  }

  const formData = new FormData(e.target as HTMLFormElement);
  const returnWh = formData.get("returnWarehouse") as string;
  const returnSt = formData.get("returnStatus") as AssetStatus;

  deps.setIsSubmitting(true);
  try {
    await Promise.all(
      targetAssetIds.map((assetId) =>
        sendJson(`${API_BASE}/assets/return`, "POST", {
          assetId,
          warehouseLocation: returnWh,
          returnStatus: returnSt,
          voucherImage: s.returnImage,
          operatorRealName: ctx.userRealName,
        }),
      ),
    );
    deps.showToast(
      `批量退库已全部入架！共完成 ${targetAssetIds.length} 件资产退库确认。`,
      "success",
    );
    ctx.setSelectedBatchAssetIds([]);
    s.setShowBatchReturnModal(false);
    deps.setReturnImage(null);
    await ctx.fetchData();
  } catch {
    deps.showToast("批量退库异常", "error");
  } finally {
    deps.setIsSubmitting(false);
  }
}

async function submitBatchProcess(
  ctx: WarehouseActionsCtx,
  deps: BatchDeps,
  action: BatchProcessAction,
): Promise<void> {
  const s = ctx.s;
  const ids = ctx.selectedBatchAssetIds;
  if (ids.length === 0) return;

  const targetAssetIds = pickTargets(ctx.realAssets, ids, (a) =>
    matchesProcessAction(a, action),
  );
  if (targetAssetIds.length === 0) {
    deps.showToast("选中的资产状态不匹配该批量处理动作", "warning");
    return;
  }

  deps.setIsSubmitting(true);
  try {
    await Promise.all(
      targetAssetIds.map((assetId) =>
        sendJson(`${API_BASE}/assets/recycle-process`, "POST", {
          assetId,
          action,
          operator: currentUsername(ctx),
        }),
      ),
    );
    deps.showToast(`批量处置完成！成功处理 ${targetAssetIds.length} 件相关资产。`, "success");
    ctx.setSelectedBatchAssetIds([]);
    s.setShowBatchProcessModal(false);
    await ctx.fetchData();
  } catch {
    deps.showToast("批量处置异常", "error");
  } finally {
    deps.setIsSubmitting(false);
  }
}

/** 批量出库 / 批量退库 / 批量处置。 */
export function useWarehouseBatchHandlers(ctx: WarehouseActionsCtx) {
  const { s } = ctx;
  const { showToast } = useToast();

  const deps: BatchDeps = {
    showToast,
    setIsSubmitting: s.setIsSubmitting,
    setShowBatchOutboundModal: s.setShowBatchOutboundModal,
    setKeeperInput: s.setKeeperInput,
    setShowBatchReturnModal: s.setShowBatchReturnModal,
    setReturnImage: s.setReturnImage,
    setShowBatchProcessModal: s.setShowBatchProcessModal,
  };

  return {
    handleBatchOutboundSubmit: (e: React.FormEvent) => submitBatchOutbound(ctx, deps, e),
    handleBatchReturnSubmit: (e: React.FormEvent) => submitBatchReturn(ctx, deps, e),
    handleBatchProcessSubmit: (action: BatchProcessAction) =>
      submitBatchProcess(ctx, deps, action),
  };
}
