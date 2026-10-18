// components/maintenance/modals/DetailRecordModal.tsx
// 弹窗 3：报修存底全明细（原 renderDetailModal）。
// 六处「取值 + 空值占位」的 `||` 链外提到 ./shared（纯函数，输出不变）。
import React from 'react';
import { Button } from '../../ui/Button';
import type { MaintenanceApi } from '../useMaintenance';
import {
  faultTypeText, finishDateClass, finishDateText,
  reporterContactText, resolveKeeperName, resolveRepairDate,
} from './shared';
import { DetailCostBlock, DetailExtrasBlock } from './DetailBlocks';

export type DetailRecordModalProps = Pick<
  MaintenanceApi,
  'showDetailModal' | 'setShowDetailModal' | 'assets'
>;

/** 弹窗 3：报修存底全明细。 */
export const DetailRecordModal: React.FC<DetailRecordModalProps> = ({
  showDetailModal, setShowDetailModal, assets,
}) => {
  if (!showDetailModal) return null;
  return (

    <div 
      className="fixed inset-0 bg-black/50 z-[var(--z-modal-overlay)] flex items-center justify-center p-4 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowDetailModal(null);
        }
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-150 cursor-default">
        <div className="p-6 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">{showDetailModal.record_no}</span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">报修存底全明细</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowDetailModal(null)} className="w-8 h-8 rounded-full p-0">✕</Button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="space-y-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 dark:text-slate-500 uppercase font-bold text-xs">关联装备</p>
            <p className="font-bold text-slate-900 dark:text-white text-sm">{showDetailModal.asset_name}</p>
            <p className="font-mono text-slate-500 dark:text-slate-400">{showDetailModal.asset_no}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-2">
              <div>
                <p className="text-slate-400 dark:text-slate-500 uppercase font-bold text-xs">报修人</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{showDetailModal.reporter_name}</p>
                <p className="text-slate-600 dark:text-slate-300 text-xs">{reporterContactText(showDetailModal.reporter_contact)}</p>
              </div>
              <div>
                <p className="text-slate-400 dark:text-slate-500 uppercase font-bold text-xs">保管人</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {resolveKeeperName(assets, showDetailModal.asset_id, showDetailModal.asset_no)}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-slate-400 dark:text-slate-500 uppercase font-bold text-xs">报修日期</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{resolveRepairDate(showDetailModal)}</p>
              </div>
              <div>
                <p className="text-slate-400 dark:text-slate-500 uppercase font-bold text-xs">完修日期</p>
                <p className={`font-semibold ${finishDateClass(showDetailModal.finish_date)}`}>
                {finishDateText(showDetailModal.finish_date)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1 pb-3 border-b border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 dark:text-slate-500 uppercase font-bold text-xs">故障描述与类型</p>
            <p className="font-semibold text-slate-800 dark:text-slate-200">[{faultTypeText(showDetailModal.fault_type)}]</p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">{showDetailModal.fault_description}</p>
          </div>

          <DetailCostBlock showDetailModal={showDetailModal} />
 
          <DetailExtrasBlock showDetailModal={showDetailModal} />

          <div className="pt-4 flex justify-end">
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowDetailModal(null)}
            >
              关闭明细
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
