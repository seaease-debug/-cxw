// components/maintenance/modals/WarehousePicker.tsx
// 完修 / 报废后的仓库选择（原 renderWarehousePicker）。
// 三处重复判据外提到 ./shared：显示开关 / 报废文案 / 下拉选项。
import React from 'react';
import { CustomSelect } from '../../CustomSelect';
import type { MaintenanceApi } from '../useMaintenance';
import { isScrapDisposition, shouldAskWarehouse, warehouseOptions } from './shared';

export type WarehousePickerProps = Pick<
  MaintenanceApi,
  'updateResultAction' | 'updateStatus' | 'targetWarehouse' | 'setTargetWarehouse' | 'warehouses'
>;

/** 完修 / 报废后的仓库选择（含「报废 or 归还」文案切换）。 */
export const WarehousePicker: React.FC<WarehousePickerProps> = ({
  updateResultAction, updateStatus, targetWarehouse, setTargetWarehouse, warehouses,
}) => {
  if (!shouldAskWarehouse(updateResultAction, updateStatus)) return null;
  const scrap = isScrapDisposition(updateResultAction, updateStatus);
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
        {scrap ? '报废存放仓库' : '归还入库目标仓库'}{' '}
        <span className="text-rose-500 font-bold ml-0.5">*</span>
      </label>
      <CustomSelect
        value={targetWarehouse}
        onChange={setTargetWarehouse}
        options={warehouseOptions(warehouses)}
        size="sm"
        className="bg-slate-50 dark:bg-slate-800"
      />
      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
        {scrap
          ? '选择设备判定报废后存放的仓位点位'
          : '选择设备修复完毕重新归仓后存放的周转仓位'}
      </p>
    </div>
  );
};
