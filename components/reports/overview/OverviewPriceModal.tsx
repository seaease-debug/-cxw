import React from 'react';
import { Coins, AlertCircle, CheckCircle2 } from 'lucide-react';

// 报表总览·补录基准价格弹窗。
import type { OverviewApi } from './api';

/** 补录基准价格弹窗 */
export const renderPriceModal = (a: OverviewApi) => {
  const { allModels, setIsPriceModalOpen, selectedFixModel, setSelectedFixModel, inputFixPrice, setInputFixPrice, isFixingPrice, priceFixStatus, zeroPriceModels, handleFixModelPrice } = a;
  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4" role="dialog" aria-modal="true" aria-labelledby="modal-price-title">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h4 id="modal-price-title" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            补录设备型号基准单价
          </h4>
          <button
            type="button"
            onClick={() => setIsPriceModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg p-1 cursor-pointer"
            aria-label="关闭弹窗"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleFixModelPrice} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              选择或确认设备型号
            </label>
            <select
              value={selectedFixModel}
              onChange={e => setSelectedFixModel(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-field rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-teal-500"
            >
              {zeroPriceModels.map(m => (
                <option key={m.assetName} value={m.assetName}>
                  {m.assetName} (在管 {m.count} 件 / 价值 0万)
                </option>
              ))}
              {allModels.filter(m => !zeroPriceModels.some(zm => zm.assetName === m)).map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              基准采购单价 (元)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">¥</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="例如: 4500"
                value={inputFixPrice}
                onChange={e => setInputFixPrice(e.target.value)}
                className="w-full text-xs pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-field rounded-lg text-slate-900 dark:text-white focus:outline-teal-500"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              将自动批量更新数据库中该型号所有单价为空或0的固定资产记录，并在全系统报表（KPI、保管人分布、仓库估值）中即时联动生效。
            </p>
          </div>

          {priceFixStatus && (
            <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
              priceFixStatus.includes('成功')
                ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}>
              {priceFixStatus.includes('成功') ? <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span>{priceFixStatus}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsPriceModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isFixingPrice}
              className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isFixingPrice ? '正在批量同步...' : '确认批量补录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};