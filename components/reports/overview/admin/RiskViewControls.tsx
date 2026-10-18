// admin/RiskViewControls.tsx — 风险视图控制与排序（自原文件原样搬出）
import type { OverviewApi } from '../api';

/** 当前视图控制与排序 */
export const renderRiskViewControls = (a: OverviewApi) => {
  const { riskInspectionAnalysis, setRiskFilterType, riskSortBy, setRiskSortBy } = a;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
      <div>
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <span>高风险型号聚合透视</span>
          <span className="font-mono text-teal-600 dark:text-teal-400 font-semibold">
            ({riskInspectionAnalysis.modelStats.length} 款型号 · 共 {riskInspectionAnalysis.filteredList.length} 件)
          </span>
        </span>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
          按设备型号聚合统计积压体量，点击卡片即可下钻查看该型号全部单台明细
        </p>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setRiskSortBy('count')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium cursor-pointer outline-none focus:outline-none focus:ring-0 ${
              riskSortBy === 'count'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
            }`}
          >
            按积压数量
          </button>
          <button
            type="button"
            onClick={() => setRiskSortBy('value')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium cursor-pointer outline-none focus:outline-none focus:ring-0 ${
              riskSortBy === 'value'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
            }`}
          >
            按沉淀金额
          </button>
          <button
            type="button"
            onClick={() => setRiskSortBy('avgIdle')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium cursor-pointer outline-none focus:outline-none focus:ring-0 ${
              riskSortBy === 'avgIdle'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
            }`}
          >
            按闲置时长
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setRiskFilterType('all');
            setRiskSortBy('count');
          }}
          className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold cursor-pointer px-2 py-1 outline-none"
        >
          重置
        </button>
      </div>
    </div>
  );
};
