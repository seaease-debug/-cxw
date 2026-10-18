// admin/RiskTopModels.tsx — 风险焦点型号集中度提示条（自原文件原样搬出）
import { AlertTriangle } from 'lucide-react';
import type { OverviewApi } from '../api';

/** 风险焦点资产（长期闲置 / 故障在修 / 待报废）提示条。 */
export const renderRiskTopModels = (a: OverviewApi) => {
  const { riskInspectionAnalysis } = a;
  return (
    <>
      {riskInspectionAnalysis.topRiskModels.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 font-bold">
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              主要风险型号集中度
            </span>
            <span className="text-xs font-mono font-normal opacity-90 text-amber-800 dark:text-amber-300">前5大型号占比</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {riskInspectionAnalysis.topRiskModels.map(({ model, count }) => (
              <span
                key={model}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700/60 text-xs text-slate-700 dark:text-slate-200 shadow-sm"
              >
                <span className="font-medium truncate max-w-[130px]" title={model}>{model}</span>
                <span className="font-bold font-mono text-amber-600 dark:text-amber-400">{count}件</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
