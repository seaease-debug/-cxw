// top/HealthCharts.tsx — 模块 B：同型号批次健康监控 + 全型号整体健康状态对比
//
// 自 OverviewTop.tsx 原样搬出（**零改动**）：本函数无债务（91 行 / 复杂度 2）。
import { Layers, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CustomDotTooltip } from '../../CustomDotTooltip';
import type { OverviewApi } from '../api';

/** 第一行 (1行2列并列)：1. 同型号批次健康监控  VS  2. 全型号整体健康状态对比 */
export const renderHealthRow = (a: OverviewApi) => {
  const { loading, selectedModel, setSelectedModel, allModels, modelBatchHealthData, allModelsHealthChartData, chartTheme, reducedMotion } = a;
  return (
    <>
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-80 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. 同型号批次健康占比堆叠图 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  同型号批次健康监控
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">选择型号透视各采购/部署批次的在用、闲置、维保与报废状态</p>
              </div>

              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-field text-xs text-slate-700 dark:text-slate-200 rounded-lg px-3 py-1.5 font-bold focus:outline-none focus:border-brand-light"
              >
                {allModels.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="h-64 w-full mt-4" role="img" aria-label="同型号批次健康监控柱状图">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelBatchHealthData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} opacity={chartTheme.gridOpacity} vertical={false} />
                  <XAxis dataKey="batch" stroke={chartTheme.axisColor} fontSize={11} tickLine={false} tick={{ fill: chartTheme.axisText }} />
                  <YAxis stroke={chartTheme.axisColor} fontSize={11} tickLine={false} tick={{ fill: chartTheme.axisText }} />
                  <Tooltip
                    content={<CustomDotTooltip />}
                    cursor={{ fill: chartTheme.cursorFill }}
                    isAnimationActive={!reducedMotion}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} iconType="circle" iconSize={8} />
                  <Bar dataKey="服役中" stackId="a" fill="#0d9488" maxBarSize={28} stroke="#fff" strokeWidth={1} />
                  <Bar dataKey="闲置" stackId="a" fill="#76C7CC" maxBarSize={28} stroke="#fff" strokeWidth={1} />
                  <Bar dataKey="维护中" stackId="a" fill="#f59e0b" maxBarSize={28} stroke="#fff" strokeWidth={1} />
                  <Bar dataKey="报废待审" stackId="a" fill="#e11d48" radius={[4, 4, 0, 0]} maxBarSize={28} stroke="#fff" strokeWidth={1} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. 全型号整体健康状态对比 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  全型号整体健康状态对比
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">全院所有设备型号的在用、闲置、在修及报废待审柱状分布图</p>
              </div>
            </div>

            <div className="h-64 w-full mt-4" role="img" aria-label="全型号整体健康状态对比柱状图">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={allModelsHealthChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} opacity={chartTheme.gridOpacity} vertical={false} />
                  <XAxis dataKey="model" stroke={chartTheme.axisColor} fontSize={11} tickLine={false} tick={{ fill: chartTheme.axisText }} />
                  <YAxis stroke={chartTheme.axisColor} fontSize={11} tickLine={false} tick={{ fill: chartTheme.axisText }} />
                  <Tooltip
                    content={<CustomDotTooltip />}
                    cursor={{ fill: chartTheme.cursorFill }}
                    isAnimationActive={!reducedMotion}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} iconType="circle" iconSize={8} />
                  <Bar dataKey="服役中" stackId="b" fill="#0d9488" maxBarSize={28} stroke="#fff" strokeWidth={1} />
                  <Bar dataKey="闲置" stackId="b" fill="#76C7CC" maxBarSize={28} stroke="#fff" strokeWidth={1} />
                  <Bar dataKey="维护中" stackId="b" fill="#f59e0b" maxBarSize={28} stroke="#fff" strokeWidth={1} />
                  <Bar dataKey="报废待审" stackId="b" fill="#e11d48" radius={[4, 4, 0, 0]} maxBarSize={28} stroke="#fff" strokeWidth={1} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
