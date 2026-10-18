// admin/RiskMatrix.tsx — 型号风险聚合进度排行矩阵
//
// 原 renderRiskMatrix 的复杂度 13 全部来自 map 回调里内联的三元与 `&&` 条件渲染。
// 这里把回调体切成三个独立函数（每个单独计分）：
//   RankBadge     排名徽标（idx === 0/1/2 三元）
//   RiskBar       风险构成进度条 + 图例（6 处 `x > 0 &&`）
//   RiskModelCard 单张型号卡片
// 点击副作用从内联 onClick 提为 onSelect 回调（行为对拍逐条核对）。
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import type { OverviewApi } from '../api';

type ModelStat = OverviewApi['riskInspectionAnalysis']['modelStats'][number];

/** 排名徽标（前三名渐次高亮）。 */
const RankBadge = ({ idx }: { idx: number }) => (
  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
    idx === 0
      ? 'bg-amber-500 text-white'
      : idx === 1
      ? 'bg-amber-400 text-slate-900'
      : idx === 2
      ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200'
      : 'bg-slate-100 text-slate-600 dark:bg-slate-700/80 dark:text-slate-300'
  }`}>
    {idx + 1}
  </span>
);

/** 风险构成比例进度条 + 图例。 */
const RiskBar = ({ item, percentOfRisk }: { item: ModelStat; percentOfRisk: number }) => (
  <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/60">
    <div className="flex items-center justify-between text-xs mb-1.5">
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
        {item.idleCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            闲置 {item.idleCount}
          </span>
        )}
        {item.repairCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
            在修 {item.repairCount}
          </span>
        )}
        {item.scrapCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            待报废 {item.scrapCount}
          </span>
        )}
      </div>
      <span className="font-mono font-medium text-slate-400 dark:text-slate-500 text-xs">
        占全校风险资产 {percentOfRisk}%
      </span>
    </div>

    <div className="w-full bg-slate-100 dark:bg-slate-700/60 h-1.5 rounded-full overflow-hidden flex">
      {item.idleCount > 0 && (
        <div
          className="bg-amber-500 h-full transition-all"
          style={{ width: `${(item.idleCount / item.count) * 100}%` }}
          title={`长期闲置: ${item.idleCount}台`}
        />
      )}
      {item.repairCount > 0 && (
        <div
          className="bg-teal-600 h-full transition-all"
          style={{ width: `${(item.repairCount / item.count) * 100}%` }}
          title={`故障维保: ${item.repairCount}台`}
        />
      )}
      {item.scrapCount > 0 && (
        <div
          className="bg-rose-600 h-full transition-all"
          style={{ width: `${(item.scrapCount / item.count) * 100}%` }}
          title={`待报废: ${item.scrapCount}台`}
        />
      )}
    </div>
  </div>
);

/** 单张型号风险卡片。 */
const RiskModelCard = ({ item, idx, totalRiskCount, onSelect }: { item: ModelStat; idx: number; totalRiskCount: number; onSelect: (model: string) => void }) => {
  const percentOfRisk = Math.min(100, Math.round((item.count / totalRiskCount) * 100));
  return (
    <div
      onClick={() => onSelect(item.model)}
      className="group p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:border-teal-500 hover:bg-slate-50/50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <RankBadge idx={idx} />
          <div className="min-w-0">
            <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors" title={item.model}>
              {item.model}
            </h5>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              <span>主要存放: <strong className="text-slate-700 dark:text-slate-200 font-medium">{item.topLocation}</strong></span>
              <span>·</span>
              <span>平均闲置: <strong className="text-amber-700 dark:text-amber-300 font-semibold">{item.avgIdleDays} 天</strong></span>
              {item.maxIdleDays > item.avgIdleDays && (
                <span className="text-xs text-slate-400 font-mono">(最长 {item.maxIdleDays}天)</span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="flex items-baseline justify-end gap-1 font-mono">
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              {item.count}
            </span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">台</span>
          </div>
          <div className="text-xs font-mono font-semibold text-teal-700 dark:text-teal-300 mt-0.5">
            ¥{item.totalValue >= 10000 ? `${(item.totalValue / 10000).toFixed(1)}万` : item.totalValue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 中部：风险构成比例进度条 */}
      <RiskBar item={item} percentOfRisk={percentOfRisk} />

      {/* 底部悬停操作引导提示 */}
      <div className="flex items-center justify-between mt-2 pt-1 text-xs text-teal-600 dark:text-teal-400 font-medium group-hover:translate-x-0.5 transition-transform">
        <span className="text-slate-400 dark:text-slate-500 text-xs">
          批次资产穿透诊断
        </span>
        <span className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-300 font-semibold">
          查看 {item.count} 台设备明细 <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};

/** 型号风险聚合进度排行矩阵 */
export const renderRiskMatrix = (a: OverviewApi) => {
  const { riskInspectionAnalysis, setSelectedRiskModel, setRiskModalSearch, setRiskModalPage } = a;
  const totalRiskCount = riskInspectionAnalysis.totalRiskCount || 1;
  const handleSelectRiskModel = (model: string) => {
    setSelectedRiskModel(model);
    setRiskModalSearch('');
    setRiskModalPage(1);
  };
  return (
    <div className="space-y-2.5">
      {riskInspectionAnalysis.modelStats.length > 0 ? (
        riskInspectionAnalysis.modelStats.map((item, idx) => (
          <RiskModelCard key={item.model} item={item} idx={idx} totalRiskCount={totalRiskCount} onSelect={handleSelectRiskModel} />
        ))
      ) : (
        <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <CheckCircle2 className="w-8 h-8 text-teal-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">🎉 状态良好！当前筛选下无风险设备</p>
        </div>
      )}
    </div>
  );
};
