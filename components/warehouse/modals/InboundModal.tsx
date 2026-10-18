import React from "react";
import { motion } from "framer-motion";
import { X, Check, Camera } from "lucide-react";
import {
  Asset,
  AssetType,
  WAREHOUSE_CODES,
  Supplier,
  Warehouse as WarehouseRecord,
  AssetTypeItem,
} from "../../../types";
import { CustomSelect } from "../../CustomSelect";
import { Button } from "../../ui/Button";
import { IconButton } from "../../ui/IconButton";
import { Input } from "../../ui/Input";

export interface InboundModalProps {
  isOpen: boolean;
  editingAsset: Asset | null;
  inboundType: string;
  inboundAssetImage: string | null;
  inboundDate: string;
  warehouseLocation: string;
  schoolCode: string;
  assetTypes: AssetTypeItem[];
  suppliers: Supplier[];
  warehouseList: WarehouseRecord[];
  inboundAssetImageRef: React.RefObject<HTMLInputElement | null>;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  setInboundType: (type: string) => void;
  setSchoolCode: (code: string) => void;
  setInboundDate: (date: string) => void;
  setWarehouseLocation: (location: string) => void;
  setInboundAssetImage: (img: string | null) => void;
}

export const InboundModal: React.FC<InboundModalProps> = ({
  isOpen,
  editingAsset,
  inboundType,
  inboundAssetImage,
  inboundDate,
  warehouseLocation,
  schoolCode,
  assetTypes,
  suppliers,
  warehouseList,
  inboundAssetImageRef,
  isSubmitting,
  onClose,
  onSubmit,
  setInboundType,
  setSchoolCode,
  setInboundDate,
  setWarehouseLocation,
  setInboundAssetImage,
}) => {
  if (!isOpen) return null;

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
        className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden z-[var(--z-modal)]"
      >
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-5 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {editingAsset ? "编辑资产信息" : "新设备入库登记"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-bold uppercase tracking-wider">
              {editingAsset ? "EDIT ASSET" : "INBOUND REGISTRATION"}
            </p>
          </div>
          <IconButton
            icon={<X size={18} />}
            label="关闭"
            onClick={onClose}
            size="md"
          />
        </div>

        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
                资产类型 <Check size={12} className="inline-block mr-1" />
              </label>
              <CustomSelect
                name="type"
                value={inboundType}
                onChange={setInboundType}
                options={
                  assetTypes.length > 0
                    ? assetTypes.map((t) => ({ value: t.name, label: t.name }))
                    : Object.values(AssetType).map((t) => ({ value: t, label: t }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
                所属校区 (生成编号用) <Check size={12} className="inline-block mr-1" />
              </label>
              <CustomSelect
                name="schoolCode"
                value={schoolCode}
                onChange={setSchoolCode}
                disabled={!!editingAsset}
                options={[
                  { value: "NB", label: "本部 (NB)" },
                  { value: "XN", label: "兴宁 (XN)" },
                ]}
              />
            </div>
            <Input
              label="品牌与型号"
              name="brandModel"
              defaultValue={editingAsset?.brandModel}
              placeholder="例如: Dell OptiPlex 7090"
              required
            />
            <Input
              label="序列号 (S/N)"
              name="serialNo"
              defaultValue={editingAsset?.serialNo}
              className="font-mono"
              placeholder="厂家序列号"
              required
            />
            <Input
              label="MAC 地址"
              name="macAddress"
              defaultValue={editingAsset?.macAddress}
              className="font-mono"
              placeholder="00:00:00:00:00:00"
            />
            <Input
              label="入库日期"
              name="purchaseDate"
              type="date"
              value={inboundDate}
              onChange={(e) => setInboundDate(e.target.value)}
              required
            />
            <Input
              label="采购单价 (元)"
              name="purchasePrice"
              type="number"
              defaultValue={editingAsset?.purchasePrice}
              required
            />
            <Input
              label="维保期限"
              name="warrantyPeriod"
              defaultValue={editingAsset?.warrantyPeriod || "3年"}
              placeholder="例如: 3年, 12个月"
            />
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
                报废年限 (年) <Check size={12} className="inline-block mr-1" />
              </label>
              <CustomSelect
                name="retirementYears"
                defaultValue={editingAsset?.retirementYears || 8}
                options={[3, 5, 8, 10, 12, 15].map((y) => ({ value: y, label: `${y}年` }))}
              />
            </div>
            <Input
              label="资产编号"
              name="auditCode"
              defaultValue={editingAsset?.auditCode}
              pattern="^\d{24}$"
              title="资产编号必须是由24位数字组成"
              maxLength={24}
              className="font-mono"
              placeholder="选填, 24位审计平台资产编号"
            />
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
                  供应商
                </label>
                <CustomSelect
                  name="supplier"
                  defaultValue={editingAsset?.supplierId}
                  options={[
                    { value: "", label: "-- 请选择供应商 --" },
                    ...suppliers.map((s) => ({ value: s.name, label: s.name })),
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
                  初始仓库位置 <Check size={12} className="inline-block mr-1" />
                </label>
                <CustomSelect
                  name="warehouseLocation"
                  value={warehouseLocation}
                  onChange={setWarehouseLocation}
                  options={
                    warehouseList.length > 0
                      ? warehouseList.map((w) => ({ value: w.name, label: w.name }))
                      : Object.keys(WAREHOUSE_CODES).map((w) => ({ value: w, label: w }))
                  }
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <Input
                as="textarea"
                label="备注说明"
                name="remarks"
                defaultValue={editingAsset?.remarks}
                className="h-16 resize-none text-xs"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
                设备实物照片 (可选)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  ref={inboundAssetImageRef}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setInboundAssetImage(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => inboundAssetImageRef.current?.click()}
                  className="flex items-center space-x-1.5"
                >
                  <Camera size={14} />
                  <span>选择照片 / 拍照</span>
                </Button>
                {inboundAssetImage && (
                  <div className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img
                      src={inboundAssetImage}
                      alt="设备照片"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => setInboundAssetImage(null)}
                      className="absolute inset-0 rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      删除
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
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
              {isSubmitting
                ? "正在提交..."
                : editingAsset
                  ? "保存变更"
                  : "确认入库"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
