import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Asset, AssetStatus, Warehouse as WarehouseRecord } from "../../../types";
import { CustomSelect } from "../../CustomSelect";
import { Button } from "../../ui/Button";
import { AutoFilterNotice } from "./return/AutoFilterNotice";
import { BatchReturnActions } from "./return/BatchReturnActions";
import { ReturnAssetSummary } from "./return/ReturnAssetSummary";
import { ReturnImageUploader } from "./return/ReturnImageUploader";
import { ReturnModalHeader } from "./return/ReturnModalHeader";
import { ReturnStatusOption } from "./return/ReturnStatusOption";
import {
  DOT_SIZE_BATCH,
  DOT_SIZE_SINGLE,
  buildWarehouseOptions,
  makeImageUploadHandler,
  pickReturnableAssets,
} from "./return/shared";

/**
 * 退库弹窗（单个 + 批量）。
 *
 * B2h 拆分：原 503 行单文件里，两块**近乎逐字重复**的 JSX（状态评估卡 ×4 处、
 * 上传区 ×2 处）与两处内联分支（仓库选项三元、读图 handler）已移入 `./return/`。
 * 本文件**保留 2 个导出名与全部 props 契约** ⇒ `WarehouseModals.tsx` 零改动。
 *
 * ★ 两个弹窗的**既有差异**（圆点尺寸、上传区配色、文案）一律按参数传入，
 *   **不在这里统一** —— 见 `./return/shared.ts` 顶部说明。
 */

export interface SingleReturnModalProps {
  isOpen: boolean;
  returningAsset: Asset | null;
  returnWarehouse: string;
  returnStatus: AssetStatus;
  returnImage: string | null;
  warehouseList: WarehouseRecord[];
  returnFileInputRef: React.RefObject<HTMLInputElement | null>;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  setReturnWarehouse: (wh: string) => void;
  setReturnStatus: (status: AssetStatus) => void;
  handleReturnImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SingleReturnModal: React.FC<SingleReturnModalProps> = ({
  isOpen,
  returningAsset,
  returnWarehouse,
  returnStatus,
  returnImage,
  warehouseList,
  returnFileInputRef,
  isSubmitting,
  onClose,
  onSubmit,
  setReturnWarehouse,
  setReturnStatus,
  handleReturnImageUpload,
}) => {
  if (!isOpen || !returningAsset) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-modal-overlay)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden z-[var(--z-modal)]"
      >
        <ReturnModalHeader
          containerClass="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-5 md:p-6 flex justify-between items-center shrink-0"
          titleClass="text-xl font-bold text-slate-900 dark:text-slate-100"
          title="资产退库办理"
          subtitle="ASSET RETURN PROCESS"
          onClose={onClose}
        />

        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5 md:space-y-6">
          <ReturnAssetSummary asset={returningAsset} />

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
              存放仓库 <Check size={12} className="inline-block mr-1" />
            </label>
            <CustomSelect
              value={returnWarehouse}
              onChange={setReturnWarehouse}
              options={buildWarehouseOptions(warehouseList)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-3">
              退库后状态评估 <Check size={12} className="inline-block mr-1" />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <ReturnStatusOption
                selected={returnStatus === AssetStatus.RECYCLED_PENDING}
                onSelect={() => setReturnStatus(AssetStatus.RECYCLED_PENDING)}
                tone="emerald"
                dotSize={DOT_SIZE_SINGLE}
                title="完好 / 闲置"
                description="设备功能正常，外观无明显破损，退回周转仓后可直接再次派发。"
              />
              <ReturnStatusOption
                selected={returnStatus === AssetStatus.SCRAP_PENDING}
                onSelect={() => setReturnStatus(AssetStatus.SCRAP_PENDING)}
                tone="rose"
                dotSize={DOT_SIZE_SINGLE}
                title="损坏 / 待报废"
                description="设备已损坏或达到报废标准，退回后进入待报废状态等待处置。"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
              交接单/退库确认函 (可选)
            </label>
            <ReturnImageUploader
              image={returnImage}
              inputRef={returnFileInputRef}
              onFileSelect={handleReturnImageUpload}
              tone="teal"
              emptyText="上传照片凭证"
              filledText="点击更换图片"
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full bg-amber-600 hover:bg-amber-500"
          >
            {isSubmitting ? "处理中..." : "确认退库"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export interface BatchReturnModalProps {
  isOpen: boolean;
  realAssets: Asset[];
  selectedBatchAssetIds: string[];
  returnStatus: AssetStatus;
  returnImage: string | null;
  warehouseList: WarehouseRecord[];
  batchReturnFileInputRef: React.RefObject<HTMLInputElement | null>;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  setReturnStatus: (status: AssetStatus) => void;
  setReturnImage: (img: string | null) => void;
}

export const BatchReturnModal: React.FC<BatchReturnModalProps> = ({
  isOpen,
  realAssets,
  selectedBatchAssetIds,
  returnStatus,
  returnImage,
  warehouseList,
  batchReturnFileInputRef,
  isSubmitting,
  onClose,
  onSubmit,
  setReturnStatus,
  setReturnImage,
}) => {
  if (!isOpen) return null;

  const returnValid = pickReturnableAssets(realAssets, selectedBatchAssetIds);
  const handleReturnImageUpload = makeImageUploadHandler(setReturnImage);

  return (
    <div className="fixed inset-0 z-[var(--z-modal-overlay)] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <ReturnModalHeader
          containerClass="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex justify-between items-center"
          titleClass="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"
          title={
            <>
              <span>↩️ 批量设备回收/退库</span>
              <span className="bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {returnValid.length}台
              </span>
            </>
          }
          subtitle="BATCH RETURN PROCESS"
          onClose={onClose}
        />

        <AutoFilterNotice
          totalSelected={selectedBatchAssetIds.length}
          validCount={returnValid.length}
        />

        <form className="p-8 space-y-6" onSubmit={onSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
              存放目的仓库 <Check size={12} className="inline-block mr-1" />
            </label>
            <CustomSelect
              name="returnWarehouse"
              options={buildWarehouseOptions(warehouseList)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-3">
              回收后状态评估 <Check size={12} className="inline-block mr-1" />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <ReturnStatusOption
                selected={returnStatus === AssetStatus.RECYCLED_PENDING}
                onSelect={() => setReturnStatus(AssetStatus.RECYCLED_PENDING)}
                tone="emerald"
                dotSize={DOT_SIZE_BATCH}
                radioName="returnStatus"
                radioValue={AssetStatus.RECYCLED_PENDING}
                title="完好 / 闲置周转"
                description="设备功能正常，直接退架至周转可用区以供后派。"
              />
              <ReturnStatusOption
                selected={returnStatus === AssetStatus.SCRAP_PENDING}
                onSelect={() => setReturnStatus(AssetStatus.SCRAP_PENDING)}
                tone="rose"
                dotSize={DOT_SIZE_BATCH}
                radioName="returnStatus"
                radioValue={AssetStatus.SCRAP_PENDING}
                title="损坏 / 待报废"
                description="设备出现故障或老化严重，待办理集中报废销账。"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
              交接签字确认函凭证 (可选)
            </label>
            <ReturnImageUploader
              image={returnImage}
              inputRef={batchReturnFileInputRef}
              onFileSelect={handleReturnImageUpload}
              tone="amber"
              emptyText="上传设备交接单 / 退库合影签字照片"
              filledText="已选择交接凭证，点击更换图片"
            />
          </div>

          <BatchReturnActions isSubmitting={isSubmitting} onClose={onClose} />
        </form>
      </div>
    </div>
  );
};
