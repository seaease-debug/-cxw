// admin/RiskDonut.tsx — 模块 2 左半：环形图与中心数字 + 三行风险图例
//
// 三行图例原本是逐字重复的三块 JSX（仅配色/判据/文案不同）⇒ 参数化为 RiskLegendRow。
// RiskLegendRow 的骨架由原文第 274–294 行切片而来，只在「配色 / 判据 / 数字 / 文案」
// 四处做了定点替换；渲染顺序与原文一致（idle180 → repair → scrap）。
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CHART_SEMANTIC } from '../../chartPalette';
import { calcPercentStr } from '../../types';
import type { OverviewApi } from '../api';

// 环图三段的色序（闲置180 → 维保 → 报废待审），与下方 data 顺序逐项对应。
// 抽成一条常量：原写法把同一组色值在 data 与 Cell 里各写一遍，改一处必错一处。
const RISK_COLORS = [CHART_SEMANTIC.maintenance, CHART_SEMANTIC.inService, CHART_SEMANTIC.scrapped];

/** 风险图例行（颜色圆点 + 名称 + 件数 + 占比），点击切换风险筛选类型。 */
const RiskLegendRow = ({ label, count, total, dotClass, activeClass, active, onClick }: {
  label: string;
  count: number;
  total: number;
  dotClass: string;
  activeClass: string;
  active: boolean;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer border ${
      active
        ? activeClass
        : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
    }`}
  >
    <div className="flex items-center gap-2.5">
      <span className={`w-3 h-3 rounded-full ${dotClass} inline-block shrink-0 shadow-xs`} />
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{label}</span>
    </div>
    <div className="text-right font-mono">
      <span className="text-xs font-bold text-slate-900 dark:text-white">
        {count}件
      </span>
      <span className="text-[11px] text-slate-400 ml-1.5">
        ({calcPercentStr(count, total)}%)
      </span>
    </div>
  </div>
);

/** 环形图与中心数字 */
export const renderRiskDonut = (a: OverviewApi) => {
  const { riskInspectionAnalysis, riskFilterType, setRiskFilterType, displayAssets, reducedMotion } = a;
  return (
    <div className="lg:col-span-1 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row lg:flex-col items-center justify-around gap-6">
      <div className="relative w-52 h-52 flex items-center justify-center shrink-0" role="img" aria-label="存量与风险关注状态分布饼图">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[
                { name: '长期闲置(>180天)', value: riskInspectionAnalysis.longIdleList.length, color: RISK_COLORS[0] },
                { name: '故障与维保中', value: riskInspectionAnalysis.repairList.length, color: RISK_COLORS[1] },
                { name: '待报废审批', value: riskInspectionAnalysis.scrapPendingList.length, color: RISK_COLORS[2] }
              ]}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={86}
              paddingAngle={3}
              dataKey="value"
              stroke="#fff"
              strokeWidth={2}
              isAnimationActive={!reducedMotion}
            >
              {RISK_COLORS.map((color, index) => (
                <Cell key={`risk-cell-${index}`} fill={color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-xs text-slate-400 font-medium">风险关注总计</span>
          <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
            {riskInspectionAnalysis.totalRiskCount}
          </span>
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mt-0.5">
            {displayAssets.length > 0
              ? ((riskInspectionAnalysis.totalRiskCount / displayAssets.length) * 100).toFixed(1)
              : '0.0'}% 占比
          </span>
        </div>
      </div>

      {/* 侧边带颜色小圆点图例与状态数字 */}
      <div className="w-full space-y-3">
        <RiskLegendRow label="长期闲置 (&gt;180天)" count={riskInspectionAnalysis.longIdleList.length} total={riskInspectionAnalysis.totalRiskCount} dotClass="bg-amber-500" activeClass="bg-amber-100/80 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700" active={riskFilterType === 'idle180'} onClick={() => setRiskFilterType('idle180')} />

        <RiskLegendRow label="故障与维保中" count={riskInspectionAnalysis.repairList.length} total={riskInspectionAnalysis.totalRiskCount} dotClass="bg-teal-600" activeClass="bg-teal-100/80 dark:bg-teal-950/50 border-teal-300 dark:border-teal-700" active={riskFilterType === 'repair'} onClick={() => setRiskFilterType('repair')} />

        <RiskLegendRow label="待报废审批" count={riskInspectionAnalysis.scrapPendingList.length} total={riskInspectionAnalysis.totalRiskCount} dotClass="bg-rose-600" activeClass="bg-rose-100/80 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700" active={riskFilterType === 'scrap'} onClick={() => setRiskFilterType('scrap')} />
      </div>
    </div>
  );
};
