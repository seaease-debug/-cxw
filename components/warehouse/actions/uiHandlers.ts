import React from "react";
import { Asset, AssetStatus } from "../../../types";
import { useToast } from "../../Toast";
import { useDialog } from "../../ui/DialogContext";
import { API_BASE } from "../../../services/api";
import type { BatchProcessAction, WarehouseActionsCtx } from "./handlersCtx";
import { currentUsername } from "./handlersCtx";
import type { WarehouseActionsState } from "./state";

/**
 * B4 拆分自 handlers.ts 的 `useWarehouseUiHandlers`（原 hook 体 107 行，收紧阈值超标）。
 * 界面开关 / 图片读取 / 删除 等轻量 handler —— 每个动作提到模块级，hook 只做装配。
 * ★ 两处「图片上传」原为逐字重复的两个函数，合并为 `makeImageUploadHandler`（唯一差异是目标 setter）。
 */

interface UiSetters {
  setSelectedAssetForOut: WarehouseActionsState["setSelectedAssetForOut"];
  setOutboundImage: WarehouseActionsState["setOutboundImage"];
  setShowInboundModal: WarehouseActionsState["setShowInboundModal"];
  setEditingAsset: WarehouseActionsState["setEditingAsset"];
  setReturningAsset: WarehouseActionsState["setReturningAsset"];
  setReturnWarehouse: WarehouseActionsState["setReturnWarehouse"];
  setReturnStatus: WarehouseActionsState["setReturnStatus"];
  setReturnImage: WarehouseActionsState["setReturnImage"];
  setShowReturnModal: WarehouseActionsState["setShowReturnModal"];
  setShowBatchProcessModal: WarehouseActionsState["setShowBatchProcessModal"];
  setBatchActionType: WarehouseActionsState["setBatchActionType"];
  setIsSingleProcess: WarehouseActionsState["setIsSingleProcess"];
  setUpdatingAsset: WarehouseActionsState["setUpdatingAsset"];
  setShowUpdateModal: WarehouseActionsState["setShowUpdateModal"];
}

/** 删除资产的确认弹窗参数（提到模块级：原实现每次调用重建同一个常量对象）。 */
const DELETE_CONFIRM = {
  title: "删除资产记录",
  message: "确定要删除这条资产记录吗？删除后无法恢复。",
  type: "danger" as const,
  confirmText: "确认删除",
  cancelText: "取消",
};

/** 返回上级：优先收起单件出库，其次收起入库弹窗。 */
function backFlow(
  selectedAssetForOut: Asset | null,
  showInboundModal: boolean,
  setters: UiSetters,
): void {
  if (selectedAssetForOut) {
    setters.setSelectedAssetForOut(null);
    setters.setOutboundImage(null);
  } else if (showInboundModal) {
    setters.setShowInboundModal(false);
    setters.setEditingAsset(null);
  }
}

/** 把「单件资产」当作只含一个 id 的批量处置来打开弹窗。 */
function startSingleProcess(
  ctx: WarehouseActionsCtx,
  assetId: string,
  action: BatchProcessAction,
  setters: UiSetters,
): void {
  setters.setIsSingleProcess(true);
  ctx.setSelectedBatchAssetIds([assetId]);
  setters.setBatchActionType(action);
  setters.setShowBatchProcessModal(true);
}

/** 图片凭证上传（出库 / 退库共用，唯一差异是写入哪个 setter）。 */
function makeImageUploadHandler(setImage: (v: string | null) => void) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
}

/** 发起单件退库：置资产 + 还原三个默认值 + 开弹窗。 */
function initiateReturnFlow(asset: Asset, setters: UiSetters): void {
  setters.setReturningAsset(asset);
  setters.setReturnWarehouse("1楼小仓库");
  setters.setReturnStatus(AssetStatus.RECYCLED_PENDING);
  setters.setReturnImage(null);
  setters.setShowReturnModal(true);
}

/** 删除资产（先确认，再 DELETE，最后刷新）。 */
async function deleteAsset(
  ctx: WarehouseActionsCtx,
  id: string,
  showToast: ReturnType<typeof useToast>["showToast"],
  confirm: ReturnType<typeof useDialog>["confirm"],
): Promise<void> {
  const isConfirmed = await confirm(DELETE_CONFIRM);
  if (!isConfirmed) return;
  try {
    await fetch(
      `${API_BASE}/assets/${id}?operator=${encodeURIComponent(currentUsername(ctx))}`,
      { method: "DELETE" },
    );
    ctx.fetchData();
  } catch {
    showToast("删除失败", "error");
  }
}

/** 界面开关 / 图片读取 / 删除 等轻量 handler。 */
export function useWarehouseUiHandlers(ctx: WarehouseActionsCtx) {
  const { s } = ctx;
  const { showToast } = useToast();
  const { confirm } = useDialog();

  const setters: UiSetters = {
    setSelectedAssetForOut: s.setSelectedAssetForOut,
    setOutboundImage: s.setOutboundImage,
    setShowInboundModal: s.setShowInboundModal,
    setEditingAsset: s.setEditingAsset,
    setReturningAsset: s.setReturningAsset,
    setReturnWarehouse: s.setReturnWarehouse,
    setReturnStatus: s.setReturnStatus,
    setReturnImage: s.setReturnImage,
    setShowReturnModal: s.setShowReturnModal,
    setShowBatchProcessModal: s.setShowBatchProcessModal,
    setBatchActionType: s.setBatchActionType,
    setIsSingleProcess: s.setIsSingleProcess,
    setUpdatingAsset: s.setUpdatingAsset,
    setShowUpdateModal: s.setShowUpdateModal,
  };

  return {
    handleBack: () => backFlow(s.selectedAssetForOut, s.showInboundModal, setters),
    handleRecycleProcess: (assetId: string, action: BatchProcessAction) =>
      startSingleProcess(ctx, assetId, action, setters),
    handleOutboundImageUpload: makeImageUploadHandler(s.setOutboundImage),
    handleReturnImageUpload: makeImageUploadHandler(s.setReturnImage),
    initiateReturn: (asset: Asset) => initiateReturnFlow(asset, setters),
    handleDelete: (id: string) => deleteAsset(ctx, id, showToast, confirm),
    openEditModal: (asset: Asset) => {
      s.setEditingAsset(asset);
      s.setShowInboundModal(true);
    },
    openUpdateModal: (asset: Asset) => {
      s.setUpdatingAsset(asset);
      s.setShowUpdateModal(true);
    },
  };
}
