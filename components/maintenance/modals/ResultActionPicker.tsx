// components/maintenance/modals/ResultActionPicker.tsx
// 完修 / 评估后的资产流转结果三选一（原 renderResultActions）。
// 整块原样搬运，无分支改动。
import React from 'react';
import { Wrench, CheckCircle2, XCircle } from 'lucide-react';
import type { MaintenanceApi } from '../useMaintenance';

export type ResultActionPickerProps = Pick<
  MaintenanceApi,
  'updateResultAction' | 'setUpdateResultAction' | 'setUpdateStatus'
>;

/** 完修 / 评估后的资产流转结果三选一。 */
export const ResultActionPicker: React.FC<ResultActionPickerProps> = ({
  updateResultAction, setUpdateResultAction, setUpdateStatus,
}) => (
    <div>
      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">完修/评估后的资产流转结果</label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => {
            setUpdateResultAction('SITE_REPAIR_COMPLETE');
            setUpdateStatus('已完修');
          }}
          className={`p-3 rounded-xl text-left flex flex-col justify-between transition-colors border cursor-pointer outline-none focus:outline-none focus:ring-0 ${
            updateResultAction === 'SITE_REPAIR_COMPLETE'
              ? 'border-teal-500 bg-teal-50/80 dark:bg-teal-950/40 text-teal-950 dark:text-teal-200 font-bold shadow-xs ring-1 ring-teal-500/30'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Wrench size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="text-xs font-bold whitespace-nowrap">现场/原位完修</span>
          </div>
          <p className="text-xs font-normal text-slate-500 dark:text-slate-400 leading-snug">现场修好或原路送回，不回仓库，保留原使用人和地点</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setUpdateResultAction('RETURN_TO_WAREHOUSE');
            setUpdateStatus('已完修');
          }}
          className={`p-3 rounded-xl text-left flex flex-col justify-between transition-colors border cursor-pointer outline-none focus:outline-none focus:ring-0 ${
            updateResultAction === 'RETURN_TO_WAREHOUSE'
              ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-bold shadow-xs ring-1 ring-emerald-500/30'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-bold whitespace-nowrap">完修归仓</span>
          </div>
          <p className="text-xs font-normal text-slate-500 dark:text-slate-400 leading-snug">修复完成并收回周转仓，解除占用等待重新调配</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setUpdateResultAction('SCRAP');
            setUpdateStatus('无法修复');
          }}
          className={`p-3 rounded-xl text-left flex flex-col justify-between transition-colors border cursor-pointer outline-none focus:outline-none focus:ring-0 ${
            updateResultAction === 'SCRAP'
              ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 font-bold shadow-xs ring-1 ring-rose-500/30'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <XCircle size={14} className="text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="text-xs font-bold whitespace-nowrap">故障报废</span>
          </div>
          <p className="text-xs font-normal text-slate-500 dark:text-slate-400 leading-snug">损坏严重无法修复，转入待报废仓等待处置</p>
        </button>
      </div>
    </div>
);
