// components/maintenance/modals/CostVendorField.tsx
// 「维修服务商 / 人员」输入 + 装备关联建议下拉（原 renderCostVendor）。
//
// ★ props 直接 `Pick<MaintenanceApi, …>` —— 字段名与 useMaintenance 返回值完全一致，
//   所以搬过来的 JSX **一个字都不用改**（只把解构从函数体挪到参数位），
//   等价性因此肉眼可查。
// ★ 原先两处 IIFE 各自重算一遍「关联服务商名」，此处只算一次（纯函数，输出不变）。
import React from 'react';
import { Input } from '../../ui/Input';
import type { MaintenanceApi } from '../useMaintenance';
import { buildVendorOptions, filterVendorOptions, resolveSupplierName } from './shared';

export type CostVendorFieldProps = Pick<
  MaintenanceApi,
  | 'selectedRecord'
  | 'assets'
  | 'suppliers'
  | 'updateVendor'
  | 'setUpdateVendor'
  | 'showVendorSuggestions'
  | 'setShowVendorSuggestions'
>;

/** 维修服务商输入 + 装备关联建议下拉。 */
export const CostVendorField: React.FC<CostVendorFieldProps> = ({
  selectedRecord, assets, suppliers,
  updateVendor, setUpdateVendor, showVendorSuggestions, setShowVendorSuggestions,
}) => {
  if (!selectedRecord) return null;
  const supplierName = resolveSupplierName(assets, suppliers, selectedRecord.asset_id, selectedRecord.asset_no);
  const filtered = filterVendorOptions(buildVendorOptions(suppliers, supplierName), updateVendor);
  return (

    <div className="relative">
      <div className="flex justify-between items-center h-5 mb-1">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">维修服务商 / 人员</label>
        {supplierName ? (
          <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold bg-teal-50 dark:bg-teal-950/30 px-1.5 py-0.5 rounded border border-teal-200/50 dark:border-teal-900/30 truncate max-w-[130px]" title={`装备关联: ${supplierName}`}>
            装备关联: {supplierName}
          </span>
        ) : null}
      </div>
      <Input
        type="text"
        value={updateVendor}
        onChange={(e) => {
          setUpdateVendor(e.target.value);
          setShowVendorSuggestions(true);
        }}
        onFocus={() => setShowVendorSuggestions(true)}
        onBlur={() => setTimeout(() => setShowVendorSuggestions(false), 200)}
        className="w-full transition-all"
        placeholder="可输入或点击下拉选择..."
        autoComplete="off"
      />
      {showVendorSuggestions && (
        <div className="absolute z-[var(--z-dropdown)] left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400 dark:text-slate-500 italic">
              自由输入："{updateVendor}"
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={idx}
                className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50 last:border-0 text-xs transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setUpdateVendor(item.name);
                  setShowVendorSuggestions(false);
                }}
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {item.name}
                </span>
                {item.isLinked ? (
                  <span className="text-xs text-teal-600 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/40 px-1.5 py-0.5 rounded shrink-0 ml-2">
                    装备关联
                  </span>
                ) : item.info ? (
                  <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 ml-2">
                    {item.info}
                  </span>
                ) : null}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
