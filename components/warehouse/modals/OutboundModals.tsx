import React from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { Asset, UserAccount } from "../../../types";
import { CustomSelect } from "../../CustomSelect";
import { Button } from "../../ui/Button";
import { IconButton } from "../../ui/IconButton";
import { Input } from "../../ui/Input";
import { getBeijingDateString } from "../warehouseUtils";
import {
  CONTROLLED_TAG_BATCH,
  CONTROLLED_TAG_SINGLE,
  FixedLocation,
  isOutboundEligible,
} from "./outbound/shared";
import { KeeperField } from "./outbound/KeeperField";
import { LocationField } from "./outbound/LocationField";
import { SingleVoucherUpload } from "./outbound/SingleVoucherUpload";
import { BatchVoucherUpload } from "./outbound/BatchVoucherUpload";

export interface SingleOutboundModalProps {
  isOpen: boolean;
  selectedAsset: Asset | null;
  selectedDept: string;
  dynamicDepts: string[];
  keeperInput: string;
  showKeeperSuggestions: boolean;
  singleOutLocationInput: string;
  showSingleOutLocationSuggestions: boolean;
  fixedLocations: FixedLocation[];
  accountList: UserAccount[];
  outboundImage: string | null;
  outboundFileInputRef: React.RefObject<HTMLInputElement | null>;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  setSelectedDept: (dept: string) => void;
  setKeeperInput: (input: string) => void;
  setShowKeeperSuggestions: (show: boolean) => void;
  setSingleOutLocationInput: (input: string) => void;
  setShowSingleOutLocationSuggestions: (show: boolean) => void;
  setOutboundImage: (image: string | null) => void;
  setPreviewImage: (image: string | null) => void;
  handleOutboundImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SingleOutboundModal: React.FC<SingleOutboundModalProps> = ({
  isOpen,
  selectedAsset,
  selectedDept,
  dynamicDepts,
  keeperInput,
  showKeeperSuggestions,
  singleOutLocationInput,
  showSingleOutLocationSuggestions,
  fixedLocations,
  accountList,
  outboundImage,
  outboundFileInputRef,
  isSubmitting,
  onClose,
  onSubmit,
  setSelectedDept,
  setKeeperInput,
  setShowKeeperSuggestions,
  setSingleOutLocationInput,
  setShowSingleOutLocationSuggestions,
  setOutboundImage,
  setPreviewImage,
  handleOutboundImageUpload,
}) => {
  if (!isOpen || !selectedAsset) return null;

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
        className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] z-[var(--z-modal)] flex flex-col overflow-hidden"
      >
        <div className="p-5 md:p-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
              新设备出库
            </h3>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
              OUTBOUND SESSION
            </p>
          </div>
          <IconButton
            icon={<X size={18} />}
            label="关闭"
            onClick={onClose}
            size="md"
          />
        </div>

        <form className="flex-1 flex flex-col overflow-hidden" onSubmit={onSubmit}>
          <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5 md:space-y-6">
            <div className="bg-teal-50/50 dark:bg-teal-950/30 p-4 rounded-xl border border-teal-100 dark:border-teal-900/30 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-teal-900 dark:text-teal-200 text-sm mb-1">
                  已选定出库资产
                </h4>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="font-semibold text-teal-800 dark:text-teal-300">
                    {selectedAsset.brandModel}
                  </span>
                  <span className="text-teal-300">|</span>
                  <span className="text-teal-600 dark:text-teal-400 font-mono">
                    {selectedAsset.serialNo}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-xs font-semibold text-teal-400 uppercase">
                  当前位置
                </span>
                <span className="font-semibold text-sm text-teal-900 dark:text-teal-200">
                  {selectedAsset.warehouseLocation}
                </span>
              </div>
              <input type="hidden" name="assetId" value={selectedAsset.id} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-2">
                  领用部门 <Check size={12} className="inline-block mr-1" />
                </label>
                <CustomSelect
                  name="department"
                  value={selectedDept}
                  onChange={setSelectedDept}
                  options={dynamicDepts.map((d) => ({ value: d, label: d }))}
                />
              </div>
              <KeeperField
                accountList={accountList}
                dept={selectedDept}
                value={keeperInput}
                showSuggestions={showKeeperSuggestions}
                onValue={setKeeperInput}
                onDept={setSelectedDept}
                onShowSuggestions={setShowKeeperSuggestions}
              />
              <LocationField
                name="location"
                label="新物理位置"
                value={singleOutLocationInput}
                showSuggestions={showSingleOutLocationSuggestions}
                fixedLocations={fixedLocations}
                onValue={setSingleOutLocationInput}
                onShowSuggestions={setShowSingleOutLocationSuggestions}
                tagClassName={CONTROLLED_TAG_SINGLE}
              />
              <Input
                name="outboundDate"
                type="date"
                label="出库时间"
                defaultValue={getBeijingDateString()}
                required
              />
            </div>

            <SingleVoucherUpload
              image={outboundImage}
              fileInputRef={outboundFileInputRef}
              onClear={() => setOutboundImage(null)}
              onPreview={setPreviewImage}
              onFile={handleOutboundImageUpload}
            />
          </div>

          <div className="flex space-x-4 p-5 md:p-6 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              className="flex-[3] bg-teal-600 hover:bg-teal-500 text-white"
            >
              {isSubmitting ? "提交中..." : "确认出库"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export interface BatchOutboundModalProps {
  isOpen: boolean;
  realAssets: Asset[];
  selectedBatchAssetIds: string[];
  selectedDept: string;
  dynamicDepts: string[];
  keeperInput: string;
  showKeeperSuggestions: boolean;
  batchOutLocationInput: string;
  showBatchOutLocationSuggestions: boolean;
  fixedLocations: FixedLocation[];
  accountList: UserAccount[];
  outboundImage: string | null;
  batchOutboundFileInputRef: React.RefObject<HTMLInputElement | null>;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  setSelectedDept: (dept: string) => void;
  setKeeperInput: (input: string) => void;
  setShowKeeperSuggestions: (show: boolean) => void;
  setBatchOutLocationInput: (input: string) => void;
  setShowBatchOutLocationSuggestions: (show: boolean) => void;
  setOutboundImage: (image: string | null) => void;
}

export const BatchOutboundModal: React.FC<BatchOutboundModalProps> = ({
  isOpen,
  realAssets,
  selectedBatchAssetIds,
  selectedDept,
  dynamicDepts,
  keeperInput,
  showKeeperSuggestions,
  batchOutLocationInput,
  showBatchOutLocationSuggestions,
  fixedLocations,
  accountList,
  outboundImage,
  batchOutboundFileInputRef,
  isSubmitting,
  onClose,
  onSubmit,
  setSelectedDept,
  setKeeperInput,
  setShowKeeperSuggestions,
  setBatchOutLocationInput,
  setShowBatchOutLocationSuggestions,
  setOutboundImage,
}) => {
  if (!isOpen) return null;

  const outboundValid = realAssets.filter(
    (a) => selectedBatchAssetIds.includes(a.id) && isOutboundEligible(a.currentStatus),
  );

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
        className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] z-[var(--z-modal)] flex flex-col overflow-hidden"
      >
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>🚀 批量设备办理出库</span>
              <span className="bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {outboundValid.length}台
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold uppercase tracking-wider">
              BATCH OUTBOUND PROCESS
            </p>
          </div>
          <IconButton
            icon={<X size={18} />}
            label="关闭"
            onClick={onClose}
            size="md"
          />
        </div>

        <form className="flex-1 flex flex-col overflow-hidden" onSubmit={onSubmit}>
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {outboundValid.length < selectedBatchAssetIds.length && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 p-4 rounded-xl text-xs font-semibold select-none leading-relaxed mb-6">
                ⚙️ <strong>自动过滤提示：</strong>已选中的{" "}
                {selectedBatchAssetIds.length}{" "}
                台设备中包含非空闲/已出库的项目。为了保持账目安全，将仅对其中的{" "}
                <strong>{outboundValid.length} 台</strong>
                符合条件的在库周转设备执行批量发放。
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                  领用部门 <Check size={12} className="inline-block mr-1" />
                </label>
                <CustomSelect
                  name="department"
                  value={selectedDept}
                  onChange={setSelectedDept}
                  options={dynamicDepts.map((d) => ({ value: d, label: d }))}
                />
              </div>
              <KeeperField
                accountList={accountList}
                dept={selectedDept}
                value={keeperInput}
                showSuggestions={showKeeperSuggestions}
                onValue={setKeeperInput}
                onDept={setSelectedDept}
                onShowSuggestions={setShowKeeperSuggestions}
                panelSans
                keyMode="index"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LocationField
                name="location"
                label="发放后物理地点"
                value={batchOutLocationInput}
                showSuggestions={showBatchOutLocationSuggestions}
                fixedLocations={fixedLocations}
                onValue={setBatchOutLocationInput}
                onShowSuggestions={setShowBatchOutLocationSuggestions}
                tagClassName={CONTROLLED_TAG_BATCH}
              />
              <Input
                name="outboundDate"
                type="date"
                label="领用出库时间"
                required
                defaultValue={getBeijingDateString()}
              />
            </div>

            <BatchVoucherUpload
              image={outboundImage}
              fileInputRef={batchOutboundFileInputRef}
              onImage={setOutboundImage}
            />
          </div>

          <div className="flex space-x-3 p-8 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 shrink-0">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              className="flex-[2] bg-teal-600 hover:bg-teal-500 text-white"
            >
              <span>{isSubmitting ? "批量出库中..." : "确认批量出库发放"}</span>
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
