// components/maintenance/modals/DetailBlocks.tsx
// 存底明细的两个块：维保服务商 + 维修开销 / 归还仓库 + 完修说明。
// （原 renderDetailCost + renderDetailExtras，两块均整块搬运。）
import React from 'react';
import { formatPrice } from '../../../utils/format';
import type { MaintenanceApi } from '../useMaintenance';
import { costOf, repairVendorText } from './shared';

export type DetailBlockProps = Pick<MaintenanceApi, 'showDetailModal'>;

/** 存底明细：维保服务商 + 维修开销。 */
export const DetailCostBlock: React.FC<DetailBlockProps> = ({ showDetailModal }) => {
  if (!showDetailModal) return null;
  return (

    <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
      <div>
        <p className="text-slate-400 dark:text-slate-500 uppercase font-bold text-xs">维保服务商</p>
        <p className="font-semibold text-slate-800 dark:text-slate-200">{repairVendorText(showDetailModal.repair_vendor)}</p>
      </div>
      <div>
        <p className="text-slate-400 dark:text-slate-500 uppercase font-bold text-xs">维修开销费用</p>
        <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">{formatPrice(costOf(showDetailModal))}</p>
      </div>
    </div>
  );
};

/** 存底明细的两个可选块：归还/存放仓库、完修说明。 */
export const DetailExtrasBlock: React.FC<DetailBlockProps> = ({ showDetailModal }) => {
  if (!showDetailModal) return null;
  return (
    <>

      {showDetailModal.target_warehouse && (
        <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
          <p className="text-slate-400 dark:text-slate-500 uppercase font-bold text-xs">归还/存放仓库</p>
          <p className="font-semibold text-slate-800 dark:text-slate-200">{showDetailModal.target_warehouse}</p>
        </div>
      )}

      {showDetailModal.notes && (
        <div>
          <p className="text-slate-400 dark:text-slate-500 uppercase font-bold text-xs mb-1">完修说明与跟进</p>
          <p className="text-slate-600 dark:text-slate-300 bg-teal-50/50 dark:bg-teal-950/20 p-2.5 rounded-xl border border-teal-100 dark:border-teal-900/30">{showDetailModal.notes}</p>
        </div>
      )}
    </>
  );
};
