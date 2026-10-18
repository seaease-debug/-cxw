import React from "react";
import { Asset } from "../../../types";
import { useToast } from "../../Toast";
import { getBeijingDateString } from "../warehouseUtils";
import { API_BASE } from "../../../services/api";
import type { WarehouseActionsCtx } from "./handlersCtx";
import {
  currentUsername,
  outboundDateError,
  readTrimmed,
  sendJson,
} from "./handlersCtx";
import type { WarehouseActionsState } from "./state";

/**
 * B4 拆分自 handlers.ts 的 `useWarehouseSubmitHandlers`（原 hook 体 197 行，收紧阈值超标）。
 * 四个提交动作各成一个模块级函数，hook 只做装配（约 20 行）。
 * ★ 副作用顺序原样保留：preventDefault → 置 isSubmitting → 建 FormData → 校验 →
 *   短路时（提示 + 复位 + return）→ 请求 → 提示 → 刷新 → 关弹窗。
 */

interface SubmitDeps {
  showToast: ReturnType<typeof useToast>["showToast"];
  handleBack: () => void;
  setIsSubmitting: WarehouseActionsState["setIsSubmitting"];
  setShowInboundModal: WarehouseActionsState["setShowInboundModal"];
  setEditingAsset: WarehouseActionsState["setEditingAsset"];
  setShowUpdateModal: WarehouseActionsState["setShowUpdateModal"];
  setUpdatingAsset: WarehouseActionsState["setUpdatingAsset"];
  setShowReturnModal: WarehouseActionsState["setShowReturnModal"];
  setReturningAsset: WarehouseActionsState["setReturningAsset"];
}

/** 入库表单前置校验：返回错误文案（null = 通过）。 */
function validateInboundForm(formData: FormData): string | null {
  const auditCodeInput = readTrimmed(formData, "auditCode");
  if (auditCodeInput && !/^\d{24}$/.test(auditCodeInput)) {
    return "「资产编号」必须是由24位纯数字组成！";
  }
  const purchaseDateInput = readTrimmed(formData, "purchaseDate");
  if (purchaseDateInput && purchaseDateInput > getBeijingDateString()) {
    return "入库/采购日期不能晚于今天！";
  }
  return null;
}

/** 新增走 POST /assets/inbound，编辑走 PUT /assets/:id。 */
function inboundTarget(editingAsset: Asset | null): { url: string; method: string } {
  if (editingAsset) return { url: `${API_BASE}/assets/${editingAsset.id}`, method: "PUT" };
  return { url: `${API_BASE}/assets/inbound`, method: "POST" };
}

/** 入库请求体（字段顺序与原实现逐字一致 —— 逻辑台记录请求体字符串）。 */
function buildInboundBody(
  payload: Record<string, unknown>,
  formData: FormData,
  ctx: WarehouseActionsCtx,
): Record<string, unknown> {
  const s = ctx.s;
  return {
    ...payload,
    schoolCode: s.schoolCode,
    warehouseLocation: s.warehouseLocation,
    warrantyPeriod: formData.get("warrantyPeriod"),
    uploader: currentUsername(ctx),
    uploaderRealName: ctx.userRealName,
    keeper: s.editingAsset ? payload.keeper : ctx.userRealName,
    assetImage: s.inboundAssetImage,
  };
}

async function submitInbound(
  ctx: WarehouseActionsCtx,
  deps: SubmitDeps,
  e: React.FormEvent,
): Promise<void> {
  e.preventDefault();
  const s = ctx.s;
  deps.setIsSubmitting(true);
  const formData = new FormData(e.target as HTMLFormElement);
  const payload = Object.fromEntries(formData.entries());

  const formError = validateInboundForm(formData);
  if (formError) {
    deps.showToast(formError, "error");
    deps.setIsSubmitting(false);
    return;
  }

  try {
    const target = inboundTarget(s.editingAsset);
    await sendJson(target.url, target.method, buildInboundBody(payload, formData, ctx));
    await ctx.fetchData();
    s.setShowInboundModal(false);
    s.setEditingAsset(null);
  } catch {
    deps.showToast("处理异常，请检查网络或后端服务", "error");
  } finally {
    deps.setIsSubmitting(false);
  }
}

async function submitLocationUpdate(
  ctx: WarehouseActionsCtx,
  deps: SubmitDeps,
  e: React.FormEvent,
): Promise<void> {
  e.preventDefault();
  const s = ctx.s;
  if (!s.updatingAsset) return;
  deps.setIsSubmitting(true);
  const formData = new FormData(e.target as HTMLFormElement);

  const dateErr = outboundDateError(
    readTrimmed(formData, "outboundDate"),
    s.updatingAsset.purchaseDate || "",
    "资产入库日期",
  );
  if (dateErr) {
    deps.showToast(dateErr, "error");
    deps.setIsSubmitting(false);
    return;
  }

  try {
    const response = await sendJson(
      `${API_BASE}/assets/${s.updatingAsset.id}/location`,
      "PATCH",
      {
        department: formData.get("department"),
        keeper: formData.get("keeper"),
        location: formData.get("location"),
        remarks: formData.get("remarks"),
        outboundDate: formData.get("outboundDate"),
        voucherImage: formData.get("voucherImage"),
      },
    );
    const result = await response.json();
    deps.showToast(result.message, "success");
    await ctx.fetchData();
    s.setShowUpdateModal(false);
    s.setUpdatingAsset(null);
  } catch {
    deps.showToast("变更与信息修正失败，请检查数据格式", "error");
  } finally {
    deps.setIsSubmitting(false);
  }
}

async function submitOutbound(
  ctx: WarehouseActionsCtx,
  deps: SubmitDeps,
  e: React.FormEvent,
): Promise<void> {
  e.preventDefault();
  const s = ctx.s;
  deps.setIsSubmitting(true);
  const formData = new FormData(e.target as HTMLFormElement);
  const payload = Object.fromEntries(formData.entries());

  const dateErr = outboundDateError(
    readTrimmed(formData, "outboundDate"),
    s.selectedAssetForOut?.purchaseDate || "",
    "设备入库日期",
  );
  if (dateErr) {
    deps.showToast(dateErr, "error");
    deps.setIsSubmitting(false);
    return;
  }

  try {
    const response = await sendJson(`${API_BASE}/assets/outbound`, "POST", {
      ...payload,
      outbound_id: s.outboundId,
      voucherImage: s.outboundImage,
      operator: currentUsername(ctx),
    });
    const result = await response.json();
    deps.showToast(`操作成功: ${result.message}`, "success");
    await ctx.fetchData();
    deps.handleBack();
  } catch {
    deps.showToast("处理异常", "error");
  } finally {
    deps.setIsSubmitting(false);
  }
}

async function submitReturn(ctx: WarehouseActionsCtx, deps: SubmitDeps): Promise<void> {
  const s = ctx.s;
  if (!s.returningAsset) return;
  deps.setIsSubmitting(true);
  try {
    const response = await sendJson(`${API_BASE}/assets/return`, "POST", {
      assetId: s.returningAsset.id,
      warehouseLocation: s.returnWarehouse,
      returnStatus: s.returnStatus,
      voucherImage: s.returnImage,
      operatorRealName: ctx.userRealName,
      operator: currentUsername(ctx),
    });
    const result = await response.json();
    deps.showToast(result.message, "success");
    await ctx.fetchData();
    s.setShowReturnModal(false);
    s.setReturningAsset(null);
  } catch {
    deps.showToast("退库失败", "error");
  } finally {
    deps.setIsSubmitting(false);
  }
}

/** 入库 / 位置变更 / 出库 / 退库 提交。 */
export function useWarehouseSubmitHandlers(
  ctx: WarehouseActionsCtx,
  handleBack: () => void,
) {
  const { s } = ctx;
  const { showToast } = useToast();

  const deps: SubmitDeps = {
    showToast,
    handleBack,
    setIsSubmitting: s.setIsSubmitting,
    setShowInboundModal: s.setShowInboundModal,
    setEditingAsset: s.setEditingAsset,
    setShowUpdateModal: s.setShowUpdateModal,
    setUpdatingAsset: s.setUpdatingAsset,
    setShowReturnModal: s.setShowReturnModal,
    setReturningAsset: s.setReturningAsset,
  };

  return {
    handleInboundSubmit: (e: React.FormEvent) => submitInbound(ctx, deps, e),
    handleUpdateLocationSubmit: (e: React.FormEvent) => submitLocationUpdate(ctx, deps, e),
    handleOutboundSubmit: (e: React.FormEvent) => submitOutbound(ctx, deps, e),
    handleReturnSubmit: () => submitReturn(ctx, deps),
  };
}
