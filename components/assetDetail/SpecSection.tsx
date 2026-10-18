// components/assetDetail/SpecSection.tsx
// 右栏 · 设备指纹档案：类型、序列号、规格型号、采购价格、入库时间、报废年限、供应商与维保。
import React from "react";
import { Fingerprint } from "lucide-react";
import { Asset } from "../../types";
import { formatPrice } from "../../utils/format";

interface SpecSectionProps {
  asset: Asset;
  isLoggedIn: boolean;
  totalRetirementYears: number;
  displaySupplierName: string | null;
}

export const SpecSection: React.FC<SpecSectionProps> = ({
  asset,
  isLoggedIn,
  totalRetirementYears,
  displaySupplierName,
}) => (
  <section>
    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
      <Fingerprint className="w-4 h-4 text-teal-600 dark:text-teal-400" />
      <span>设备指纹档案</span>
    </h3>

    <div className="grid grid-cols-2 gap-y-4 gap-x-6 p-5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
      <div>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-0.5">资产类型</p>
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          {asset.type || "易耗品"}
        </p>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-0.5">序列号 (S/N)</p>
        <p className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
          {asset.serialNo || "无"}
        </p>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-0.5">规格型号</p>
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          {asset.specification || asset.brandModel || "标准件"}
        </p>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-0.5">采购价格</p>
        <p className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
          {isLoggedIn ? formatPrice(asset.purchasePrice) : "*** (仅登录可见)"}
        </p>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-0.5">
          入库 / 采购时间
        </p>
        <p className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
          {asset.purchaseDate || "未记录"}
        </p>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-0.5">报废年限</p>
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          {totalRetirementYears} 年
        </p>
      </div>
      <div className="col-span-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-0.5">
          供应商 & 维保
        </p>
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          {displaySupplierName
            ? `${displaySupplierName} (保修: ${asset.warrantyPeriod || "3年"})`
            : "校内自购 / 未关联外部供应商"}
        </p>
      </div>
    </div>
  </section>
);
