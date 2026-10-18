// components/assetDetail/CustodySection.tsx
// 左栏 · 当前保管状态：使用人 / 部门、物理位置、领用出库时间。
import React from "react";
import { ShieldCheck } from "lucide-react";

interface CustodySectionProps {
  displayDepartment: string;
  displayKeeper: string;
  displayLocation: string;
  outboundDate?: string;
}

export const CustodySection: React.FC<CustodySectionProps> = ({
  displayDepartment,
  displayKeeper,
  displayLocation,
  outboundDate,
}) => (
  <section>
    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
      <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
      <span>当前保管状态</span>
    </h3>

    <div className="space-y-3">
      {/* User Card */}
      <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center">
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            使用人 / 部门
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{displayDepartment}</p>
        </div>
        <div className="text-right">
          <p className="text-base font-bold text-slate-900 dark:text-slate-100">{displayKeeper}</p>
        </div>
      </div>

      {/* Location Card */}
      <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          物理位置
        </p>
        <p className="text-sm font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
          <span>📍</span>
          <span>{displayLocation}</span>
        </p>
      </div>

      {/* Time Card */}
      <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          领用 / 出库时间
        </p>
        <p className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
          {outboundDate || "在库存备"}
        </p>
      </div>
    </div>
  </section>
);
