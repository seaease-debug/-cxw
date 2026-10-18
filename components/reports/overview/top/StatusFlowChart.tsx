// top/StatusFlowChart.tsx — 模块 C：资产状态流转与变更动态监控（面积图）
//
// 自 OverviewTop.tsx 原样搬出（**零改动**）。
import { ArrowRightLeft } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CustomDotTooltip } from '../../CustomDotTooltip';
import type { OverviewApi } from '../api';

/** 第二行 (单独立一行)：3. 资产状态流转与变更动态监控 */
export const renderStatusFlowRow = (a: OverviewApi) => {
  const { selectedStatusYear, setSelectedStatusYear, availableYears, assetStatusTransferData, chartTheme, reducedMotion } = a;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            资产状态流转与变更动态监控
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">当资产发生领用服役、闲置归还、报修或报废变更时的月度趋势</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">统计年份:</span>
          <select
            value={selectedStatusYear}
            onChange={(e) => setSelectedStatusYear(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-field text-xs text-slate-700 dark:text-slate-200 rounded-lg px-3 py-1.5 font-bold focus:outline-none focus:border-brand-light"
          >
            {availableYears.map(y => (
              <option key={y} value={y}>{y}年度</option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-68 w-full mt-2" role="img" aria-label="资产状态流转与变更动态监控面积图">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={assetStatusTransferData} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="gradService" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="gradIdle" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#76C7CC" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#76C7CC" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="gradRepair" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="gradScrap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e11d48" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#e11d48" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} opacity={chartTheme.gridOpacity} vertical={false} />
            <XAxis dataKey="month" stroke={chartTheme.axisColor} fontSize={11} tickLine={false} tick={{ fill: chartTheme.axisText }} />
            <YAxis stroke={chartTheme.axisColor} fontSize={11} tickLine={false} tick={{ fill: chartTheme.axisText }} />
            <Tooltip
              content={<CustomDotTooltip />}
              cursor={{ stroke: chartTheme.axisColor, strokeWidth: 1, strokeDasharray: '3 3' }}
              isAnimationActive={!reducedMotion}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} iconType="circle" iconSize={8} />
            <Area type="monotone" dataKey="闲置入库" stroke="#76C7CC" strokeWidth={2} fill="url(#gradIdle)" dot={{ r: 3, strokeWidth: 1.5, fill: '#fff' }} activeDot={{ r: 5, strokeWidth: 2 }} />
            <Area type="monotone" dataKey="领用服役" stroke="#0d9488" strokeWidth={2} fill="url(#gradService)" dot={{ r: 3, strokeWidth: 1.5, fill: '#fff' }} activeDot={{ r: 5, strokeWidth: 2 }} />
            <Area type="monotone" dataKey="报修维护" stroke="#f59e0b" strokeWidth={2} fill="url(#gradRepair)" dot={{ r: 3, strokeWidth: 1.5, fill: '#fff' }} activeDot={{ r: 5, strokeWidth: 2 }} />
            <Area type="monotone" dataKey="申请报废" stroke="#e11d48" strokeWidth={2} fill="url(#gradScrap)" dot={{ r: 3, strokeWidth: 1.5, fill: '#fff' }} activeDot={{ r: 5, strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
