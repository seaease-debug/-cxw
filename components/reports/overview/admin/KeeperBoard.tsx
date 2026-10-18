// admin/KeeperBoard.tsx — 模块 1：Keeper 名下资产分布柱状图
//
// 三个内部子组件从原 renderKeeperChartModule 的函数体原样搬出（**仅改缩进**）：
//   KeeperIndicator  指标切换按钮组
//   KeeperChart      三分支 BarChart 容器
//   KeeperCards      快捷筛选卡片区
// props 用 Pick<OverviewApi, …> 且字段名与原文一致 ⇒ 搬走的 JSX 一个字都没改。
import { Trophy } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CustomDotTooltip } from '../../CustomDotTooltip';
import type { OverviewApi } from '../api';

/** 指标切换按钮组（按件数 / 按总估值 / 按服役率）。 */
const KeeperIndicator = ({ leaderboardSortBy, setLeaderboardSortBy }: Pick<OverviewApi, 'leaderboardSortBy' | 'setLeaderboardSortBy'>) => (
  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
    <span className="text-slate-400 px-2 font-medium">指标:</span>
    <button
      type="button"
      onClick={() => setLeaderboardSortBy('count')}
      className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium cursor-pointer outline-none focus:outline-none focus:ring-0 ${
        leaderboardSortBy === 'count'
          ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs font-bold'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
      }`}
    >
      按件数分布
    </button>
    <button
      type="button"
      onClick={() => setLeaderboardSortBy('value')}
      className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium cursor-pointer outline-none focus:outline-none focus:ring-0 ${
        leaderboardSortBy === 'value'
          ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs font-bold'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
      }`}
    >
      按总估值 (万元)
    </button>
    <button
      type="button"
      onClick={() => setLeaderboardSortBy('usage')}
      className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium cursor-pointer outline-none focus:outline-none focus:ring-0 ${
        leaderboardSortBy === 'usage'
          ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs font-bold'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
      }`}
    >
      按服役率 (%)
    </button>
  </div>
);

/** Recharts BarChart 图表容器（按指标三分支）。 */
const KeeperChart = ({ leaderboardSortBy, keeperLeaderboardData, chartTheme, reducedMotion }: Pick<OverviewApi, 'leaderboardSortBy' | 'keeperLeaderboardData' | 'chartTheme' | 'reducedMotion'>) => (
<ResponsiveContainer width="100%" height="100%">
  {leaderboardSortBy === 'count' ? (
    <BarChart
      data={keeperLeaderboardData.map(d => ({
        keeperName: d.keeperName,
        '服役中': d.serviceCount,
        '闲置待周转': Math.max(0, d.count - d.serviceCount - d.totalRiskCount),
        '风险关注数': d.totalRiskCount
      }))}
      margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} opacity={chartTheme.gridOpacity} vertical={false} />
      <XAxis dataKey="keeperName" stroke={chartTheme.axisColor} fontSize={11} tickLine={false} tick={{ fill: chartTheme.axisText, fontWeight: 600 }} />
      <YAxis stroke={chartTheme.axisColor} fontSize={11} tickLine={false} tick={{ fill: chartTheme.axisText }} />
      <Tooltip content={<CustomDotTooltip />} cursor={{ fill: chartTheme.cursorFill }} isAnimationActive={!reducedMotion} />
      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" iconSize={8} />
      <Bar dataKey="服役中" stackId="k" fill="#0d9488" barSize={38} maxBarSize={48} stroke="#fff" strokeWidth={1} />
      <Bar dataKey="闲置待周转" stackId="k" fill="#76C7CC" barSize={38} maxBarSize={48} stroke="#fff" strokeWidth={1} />
      <Bar dataKey="风险关注数" stackId="k" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={38} maxBarSize={48} stroke="#fff" strokeWidth={1} />
    </BarChart>
  ) : leaderboardSortBy === 'value' ? (
    <BarChart
      data={keeperLeaderboardData.map(d => ({
        keeperName: d.keeperName,
        '资产总估值(万元)': Number(d.totalValWan)
      }))}
      margin={{ top: 15, right: 15, left: -5, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} opacity={chartTheme.gridOpacity} vertical={false} />
      <XAxis dataKey="keeperName" stroke={chartTheme.axisColor} fontSize={11} tickLine={false} tick={{ fill: chartTheme.axisText, fontWeight: 600 }} />
      <YAxis stroke={chartTheme.axisColor} fontSize={11} tickLine={false} tick={{ fill: chartTheme.axisText }} />
      <Tooltip content={<CustomDotTooltip />} cursor={{ fill: chartTheme.cursorFill }} isAnimationActive={!reducedMotion} />
      <Bar dataKey="资产总估值(万元)" fill="#0d9488" radius={[6, 6, 0, 0]} barSize={38} maxBarSize={48} />
    </BarChart>
  ) : (
    <BarChart
      data={keeperLeaderboardData.map(d => ({
        keeperName: d.keeperName,
        '设备服役率(%)': d.usageRate
      }))}
      margin={{ top: 15, right: 15, left: -5, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} opacity={chartTheme.gridOpacity} vertical={false} />
      <XAxis dataKey="keeperName" stroke={chartTheme.axisColor} fontSize={11} tickLine={false} tick={{ fill: chartTheme.axisText, fontWeight: 600 }} />
      <YAxis stroke={chartTheme.axisColor} fontSize={11} tickLine={false} tick={{ fill: chartTheme.axisText }} domain={[0, 100]} />
      <Tooltip content={<CustomDotTooltip />} cursor={{ fill: chartTheme.cursorFill }} isAnimationActive={!reducedMotion} />
      <Bar dataKey="设备服役率(%)" fill="#0d9488" radius={[6, 6, 0, 0]} barSize={38} maxBarSize={48} />
    </BarChart>
  )}
</ResponsiveContainer>
);

/** 快捷点击切换 Keeper 视角的按钮卡片区。 */
const KeeperCards = ({ keeperLeaderboardData, selectedKeeperFilter, setSelectedKeeperFilter }: Pick<OverviewApi, 'keeperLeaderboardData' | 'selectedKeeperFilter' | 'setSelectedKeeperFilter'>) => (
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
  {keeperLeaderboardData.map((item) => {
    const isCurrentSelected = selectedKeeperFilter === item.keeperName;
    return (
      <button
        key={item.keeperName}
        type="button"
        onClick={() => setSelectedKeeperFilter(item.keeperName)}
        className={`p-3 rounded-xl text-left flex flex-col justify-between transition-colors cursor-pointer outline-none focus:outline-none focus:ring-0 ${
          isCurrentSelected
            ? 'bg-teal-50 dark:bg-teal-950/50 border border-teal-500 shadow-xs'
            : 'bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-teal-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {item.keeperName}
          </span>
          {isCurrentSelected && (
            <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
          )}
        </div>
        <div className="flex items-baseline justify-between mt-2 font-mono">
          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {item.count} <span className="text-xs font-normal text-slate-400">件</span>
          </span>
          <span className="text-xs text-teal-600 dark:text-teal-400 font-bold">
            {item.usageRateDisplay} 在用
          </span>
        </div>
      </button>
    );
  })}
</div>
);

/** 模块 1: Keeper 名下资产分布柱状图 */
export const renderKeeperChartModule = (a: OverviewApi) => {
  const { leaderboardSortBy, setLeaderboardSortBy, keeperLeaderboardData, selectedKeeperFilter, setSelectedKeeperFilter, chartTheme, reducedMotion } = a;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-4.5 h-4.5 text-amber-500" />
            Keeper 名下资产持有与分布图表
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            直观透视全校各专职 Keeper 名下管辖资产件数、资产原值、服役率及风险分布
          </p>
        </div>

        {/* 切换图表统计指标 */}
        <KeeperIndicator leaderboardSortBy={leaderboardSortBy} setLeaderboardSortBy={setLeaderboardSortBy} />
      </div>

      {/* Recharts BarChart 图表容器 */}
      <div className="h-72 w-full pt-2" role="img" aria-label="保管人资产排行柱状图">
        <KeeperChart leaderboardSortBy={leaderboardSortBy} keeperLeaderboardData={keeperLeaderboardData} chartTheme={chartTheme} reducedMotion={reducedMotion} />
      </div>

      {/* 快捷点击切换 Keeper 视角的按钮卡片区 */}
      <KeeperCards keeperLeaderboardData={keeperLeaderboardData} selectedKeeperFilter={selectedKeeperFilter} setSelectedKeeperFilter={setSelectedKeeperFilter} />
    </div>
  );
};
