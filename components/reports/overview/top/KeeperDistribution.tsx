// top/KeeperDistribution.tsx — 模块 D：保管领用资产数量与价值分布
//
// 原 renderKeeperDistributionRow（153 行 / 复杂度 6）切成：
//   renderKeeperHeaderRow        标题 + 补录按钮 + 视图切换（复杂度 4）
//   renderKeeperZeroPriceBanner  零单价提示条（复杂度 1）
//   KeeperChartTooltip           原内联 content 渲染器（提为模块级组件）
//   resolveKeeperTooltipData     提示数据解包（把三重 `!x || …` 拆开各自计分）
// 两处逐字相同的「打开补录弹窗」4 语句合并到 openPriceFixModal。
// 图表本体（ResponsiveContainer + BarChart + 轴/图例/柱）保持原位、逐字不动。
import { UserCheck, Coins, AlertCircle } from 'lucide-react';
import { CHART_SEMANTIC } from '../../chartPalette';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { OverviewApi } from '../api';

type PriceFixCtx = Pick<OverviewApi, 'zeroPriceModels' | 'setSelectedFixModel' | 'setInputFixPrice' | 'setPriceFixStatus' | 'setIsPriceModalOpen'>;

/** 打开「补录型号单价」弹窗（原两处逐字相同的 4 语句回调，合并到一处）。 */
const openPriceFixModal = (c: PriceFixCtx) => {
  c.setSelectedFixModel(c.zeroPriceModels[0].assetName);
  c.setInputFixPrice('');
  c.setPriceFixStatus(null);
  c.setIsPriceModalOpen(true);
};

/** 提示数据解包：payload 为空 / 首个元素缺失时返回 null（判据拆开以各自计分）。 */
const resolveKeeperTooltipData = (payload: any) => {
  if (!payload || !payload.length) return null;
  const first = payload[0];
  return first ? first.payload : null;
};

/** 图表悬浮提示（自原内联 content 渲染器原样搬出）。 */
const KeeperChartTooltip = ({ active, payload, label }: any) => {
  if (!active) return null;
  const currentData = resolveKeeperTooltipData(payload);
  if (!currentData) return null;

  return (
    <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3.5 py-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 text-xs min-w-[200px] pointer-events-none">
      <div className="text-slate-800 dark:text-slate-100 text-xs font-medium mb-2 truncate max-w-[190px]" title={label}>
        {label}
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: CHART_SEMANTIC.maintenance }}></span>
            估算总价值 (万元)
          </span>
          <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">
            {currentData.totalValueWan}
          </span>
        </div>
        <div className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: CHART_SEMANTIC.inService }}></span>
            保管领用数量 (件)
          </span>
          <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">
            {currentData.count}
          </span>
        </div>
      </div>
    </div>
  );
};

/** 标题行：标题 + 零单价补录按钮 + 视图切换（Top5 / 全部）。 */
export const renderKeeperHeaderRow = (a: OverviewApi) => {
  const { keeperViewMode, setKeeperViewMode, keeperAssetStats, zeroPriceModels, setSelectedFixModel, setInputFixPrice, setPriceFixStatus, setIsPriceModalOpen } = a;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          保管人管辖资产数量与价值分布
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">统计已被保管领用的各类固定资产数量排行榜及估算总价值</p>
      </div>

      <div className="flex items-center gap-2">
        {zeroPriceModels.length > 0 && (
          <button
            type="button"
            onClick={() => openPriceFixModal({ zeroPriceModels, setSelectedFixModel, setInputFixPrice, setPriceFixStatus, setIsPriceModalOpen })}
            className="px-3 py-1.5 text-xs font-semibold bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700/80 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            aria-label="补录设备基准单价"
          >
            <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>补录型号单价</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </button>
        )}

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setKeeperViewMode('top5')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium cursor-pointer outline-none focus:outline-none focus:ring-0 ${
              keeperViewMode === 'top5'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
            }`}
          >
            Top 5 领用设备
          </button>
          <button
            type="button"
            onClick={() => setKeeperViewMode('all')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium cursor-pointer outline-none focus:outline-none focus:ring-0 ${
              keeperViewMode === 'all'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
            }`}
          >
            全部在管设备 ({keeperAssetStats.totalAssignedAssetsCount}种)
          </button>
        </div>
      </div>
    </div>
  );
};

/** 零单价提示条（检测到采购价格缺失时提示补录）。 */
export const renderKeeperZeroPriceBanner = (a: OverviewApi) => {
  const { zeroPriceModels, setSelectedFixModel, setInputFixPrice, setPriceFixStatus, setIsPriceModalOpen } = a;
  return (
    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start sm:items-center gap-2.5 text-xs text-amber-800 dark:text-amber-200 font-medium">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
        <span>
          检测到型号「<strong className="font-semibold text-amber-900 dark:text-amber-100">{zeroPriceModels[0].assetName}</strong>」（共 {zeroPriceModels[0].count} 件）录入时采购价格缺失，导致估算总价值显示为 0万。
        </span>
      </div>
      <button
        type="button"
        onClick={() => openPriceFixModal({ zeroPriceModels, setSelectedFixModel, setInputFixPrice, setPriceFixStatus, setIsPriceModalOpen })}
        className="px-3.5 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs flex items-center justify-center gap-1.5"
        aria-label="一键按型号补录基准单价"
      >
        <Coins className="w-3.5 h-3.5" />
        一键补录型号单价
      </button>
    </div>
  );
};

/** 第三行：4. 保管领用资产分布 */
export const renderKeeperDistributionRow = (a: OverviewApi) => {
  const { keeperChartPos, setKeeperChartPos, displayedKeeperChartData, chartTheme, reducedMotion, zeroPriceModels } = a;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all">
      {renderKeeperHeaderRow(a)}

      {zeroPriceModels.length > 0 && (
        renderKeeperZeroPriceBanner(a)
      )}

      <div className="h-72 w-full mt-2 relative" role="img" aria-label="保管领用资产数量与价值分布柱状图">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={displayedKeeperChartData}
            margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
            barGap={6}
            barCategoryGap="15%"
            onMouseMove={(state: any) => {
              if (state && state.chartX != null && state.chartY != null) {
                setKeeperChartPos({ x: state.chartX + 15, y: Math.max(state.chartY - 20, 10) });
              }
            }}
            onMouseLeave={() => setKeeperChartPos(null)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} opacity={chartTheme.gridOpacity} vertical={false} />
            <XAxis
              dataKey="assetName"
              stroke={chartTheme.axisColor}
              fontSize={11}
              interval={0}
              tickLine={false}
              tick={{ fontSize: 11, fill: chartTheme.axisText }}
              height={40}
              tickFormatter={(val: string) => (val && val.length > 12 ? `${val.slice(0, 10)}...` : val)}
            />
            <YAxis stroke={chartTheme.axisColor} fontSize={11} tickLine={false} tick={{ fill: chartTheme.axisText }} />
            <Tooltip
              cursor={{ fill: chartTheme.cursorFill }}
              position={keeperChartPos || undefined}
              isAnimationActive={!reducedMotion}
              wrapperStyle={{ pointerEvents: 'none', zIndex: 100 }}
              content={<KeeperChartTooltip />}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} iconType="square" iconSize={9} />
            <Bar dataKey="totalValueWan" name="估算总价值 (万元)" fill={CHART_SEMANTIC.maintenance} radius={[4, 4, 0, 0]} barSize={36} />
            <Bar dataKey="count" name="保管领用数量 (件)" fill={CHART_SEMANTIC.inService} radius={[4, 4, 0, 0]} barSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
