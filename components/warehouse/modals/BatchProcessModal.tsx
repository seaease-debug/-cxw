import React from "react";
import { X } from "lucide-react";
import { Asset, AssetStatus } from "../../../types";
import { Button } from "../../ui/Button";
import { IconButton } from "../../ui/IconButton";

export interface BatchProcessModalProps {
  isOpen: boolean;
  batchActionType: "scrap" | "scrap_confirm" | "restock" | null;
  isSingleProcess: boolean;
  realAssets: Asset[];
  selectedBatchAssetIds: string[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (actionType: "scrap" | "scrap_confirm" | "restock") => void;
}

export const BatchProcessModal: React.FC<BatchProcessModalProps> = ({
  isOpen,
  batchActionType,
  isSingleProcess,
  realAssets,
  selectedBatchAssetIds,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  if (!isOpen || !batchActionType) return null;

  const isScrap = batchActionType === "scrap";
  const isScrapConfirm = batchActionType === "scrap_confirm";
  const isRestock = batchActionType === "restock";

  const targetAssets = realAssets.filter((a) => {
    if (!selectedBatchAssetIds.includes(a.id)) return false;
    if (isScrap) {
      return (
        a.currentStatus === AssetStatus.NEW_IN_WAREHOUSE ||
        a.currentStatus === AssetStatus.RECYCLED_PENDING
      );
    } else if (isScrapConfirm) {
      return a.currentStatus === AssetStatus.SCRAP_PENDING;
    } else if (isRestock) {
      return (
        a.currentStatus === AssetStatus.SCRAP_PENDING ||
        a.currentStatus === AssetStatus.RECYCLED_PENDING
      );
    }
    return false;
  });

  let title = "";
  let description = "";
  let btnText = "";
  let btnClass = "";

  if (isScrap) {
    title = isSingleProcess ? "申请报废" : "批量申请报废";
    description = isSingleProcess
      ? `将对该设备发起报废申请。设备状态将被变更为「待报废」，存放地点保持不变。`
      : `将对选定的 ${targetAssets.length} 台设备发起报废申请。设备状态将被变更为「待报废」，存放地点保持不变。`;
    btnText = isSingleProcess ? "确认申请报废" : "确认批量申请报废";
    btnClass = "bg-rose-600 hover:bg-rose-500 shadow-rose-500/10";
  } else if (isScrapConfirm) {
    title = isSingleProcess ? "确认报废" : "批量确认报废";
    description = isSingleProcess
      ? `⚠️ 极为关键操作！将对该设备进行正式审核并执行彻底报废。资产状态变更为「已报废」。此操作无法恢复！`
      : `⚠️ 极为关键操作！将对选定的 ${targetAssets.length} 台设备正式审核并执行彻底报废。资产状态变更为「已报废」。此操作无法恢复！`;
    btnText = "不可撤销：确认报废销账";
    btnClass = "bg-rose-800 hover:bg-rose-700 shadow-red-900/10";
  } else if (isRestock) {
    title = isSingleProcess ? "重新入库" : "批量重新入库";
    description = isSingleProcess
      ? `将该设备重新作为周转资源入库。状态设置为「周转仓(待派发)」，位置设置为「周转仓-可用区」。`
      : `将选定的 ${targetAssets.length} 台设备重新作为周转资源入库。状态设置为「周转仓(待派发)」，位置设置为「周转仓-可用区」。`;
    btnText = isSingleProcess ? "确认重新入库" : "确认批量重新入库";
    btnClass = "bg-teal-600 hover:bg-teal-500 shadow-teal-500/10";
  }

  return (
    <div className="fixed inset-0 z-[var(--z-modal-overlay)] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold uppercase tracking-wider">
              BATCH DISPOSAL MANAGEMENT
            </p>
          </div>
          <IconButton
            icon={<X size={18} />}
            label="关闭"
            onClick={onClose}
            size="md"
          />
        </div>

        <div className="p-8 space-y-6">
          {targetAssets.length === 1 ? (
            <div className="bg-slate-50 dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
              <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">
                操作对象设备
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {targetAssets[0]?.brandModel} ({targetAssets[0]?.no})
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                物理位置:{" "}
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {targetAssets[0]?.warehouseLocation || "未设定"}
                </span>{" "}
                | 当前状态:{" "}
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {targetAssets[0]?.currentStatus}
                </span>
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
              <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">
                操作对象规模
              </span>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-200">
                符合条件共计 {targetAssets.length} 件固定资产设备
              </p>
            </div>
          )}

          {targetAssets.length < selectedBatchAssetIds.length && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 p-4 rounded-xl text-xs font-semibold leading-relaxed select-none">
              ⚙️ <strong>自动过滤提示：</strong>已选中{" "}
              {selectedBatchAssetIds.length} 项，但只有{" "}
              <strong>{targetAssets.length} 项</strong>
              符合本流程的初始状态要求，其余不符状态将被忽略。
            </div>
          )}

          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
            {description}
          </p>

          <div className="flex space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              className="flex-1"
            >
              返回
            </Button>
            <Button
              variant={isScrapConfirm || isScrap ? "danger" : "primary"}
              size="md"
              onClick={() => {
                if (batchActionType) {
                  onSubmit(batchActionType);
                }
              }}
              disabled={isSubmitting}
              className={`flex-[2] ${btnClass}`}
            >
              <span>{isSubmitting ? "正在执行..." : btnText}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
