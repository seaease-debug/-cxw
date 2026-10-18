import React from 'react';
import {
  Wrench,
  X,
  Trophy,
  AlertCircle,
  MapPin,
  CalendarClock
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { Button } from '../ui';
import { CustomDotTooltip } from './CustomDotTooltip';
import { useReportsData } from './useReportsData';

interface ReportsMaintenanceProps {
  data: ReturnType<typeof useReportsData>;
}

export const ReportsMaintenance: React.FC<ReportsMaintenanceProps> = ({ data }) => {
  const {
    topFaultModels,
    selectedFaultModel,
    setSelectedFaultModel,
    selectedModelDetail,
    chartTheme,
    reducedMotion
  } = data;

  return (
    <section className="space-y-6">
      {/* 页头标语 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            高频故障设备与维保多维诊断看板
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            点击左侧高频故障型号，右侧看板将自动穿透展示该型号的维修频次、累计金额、故障类型、涉及地点与历史报修时间线
          </p>
        </div>
        {selectedFaultModel && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setSelectedFaultModel(null)}
            aria-label="重置设备型号筛选"
            className="shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            重置选择 (查看全部)
          </Button>
        )}
      </div>

      {/* 左右 Master-Detail 主从结构 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧 (4列): 高频故障设备 Top 5 */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                高频故障型号 Top 5
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                点击行联动
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
              仅列出故障率最高的设备型号及维修次数
            </p>

            {topFaultModels.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                暂无高频故障型号记录
              </div>
            ) : (
              <div className="space-y-2.5">
                {topFaultModels.map((item, idx) => {
                  const isSelected = selectedFaultModel === item.model;
                  return (
                    <Button
                      key={idx}
                      type="button"
                      variant={isSelected ? 'secondary' : 'ghost'}
                      size="md"
                      onClick={() => setSelectedFaultModel(isSelected ? null : item.model)}
                      className={`w-full h-auto p-3.5 border text-left justify-between group ${
                        isSelected
                          ? 'bg-teal-500/10 border-teal-500/80 shadow-sm ring-1 ring-teal-500/40'
                          : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <span className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                          isSelected
                            ? 'bg-teal-600 text-white'
                            : idx === 0
                              ? 'bg-amber-500 text-white'
                              : idx === 1
                                ? 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                          {idx + 1}
                        </span>
                        <p className={`text-sm font-bold truncate ${
                          isSelected ? 'text-teal-900 dark:text-teal-200' : 'text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400'
                        }`}>
                          {item.model}
                        </p>
                      </div>

                      <div className="shrink-0">
                        <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg block ${
                          isSelected
                            ? 'bg-teal-600 text-white'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 dark:bg-amber-950/40'
                        }`}>
                          {item.count} 次
                        </span>
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedFaultModel && (
            <div className="mt-5 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>已锁定: <strong className="text-teal-700 dark:text-teal-300">{selectedFaultModel}</strong></span>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => setSelectedFaultModel(null)}
              >
                取消锁定
              </Button>
            </div>
          )}
        </div>

        {/* 右侧 (8列): 多维联动诊断看板 */}
        <div className="lg:col-span-8 space-y-5">
          {/* 诊断目标 Head 统计条 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 block">当前诊断设备对象</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {selectedFaultModel ? selectedFaultModel : '全量设备维保数据'}
                  {selectedFaultModel && (
                    <span className="text-xs px-2 py-0.2 rounded-md bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 font-normal">
                      已联动
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-xs">累计维保次数</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-xs">
                  {selectedModelDetail.totalCount} 次
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-xs">累计维修花费</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 font-mono text-xs">
                  ¥{selectedModelDetail.totalCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 联动图表组 1: 故障类型分布 & 2: 故障发生地点分布 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 故障原因分类分布 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-0.5">
                <AlertCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                故障原因分类分布
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {selectedFaultModel ? '该型号真实上报的故障类型频次' : '全量设备的故障类型汇总'}
              </p>

              {selectedModelDetail.faultTypeData.length === 0 ? (
                <div className="h-48 w-full mt-3 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  暂无故障类型数据
                </div>
              ) : (
                <div className="h-52 w-full mt-3" role="img" aria-label="故障原因分类分布柱状图">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedModelDetail.faultTypeData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} opacity={chartTheme.gridOpacity} vertical={false} />
                      <XAxis dataKey="name" stroke={chartTheme.axisColor} fontSize={10} tickLine={false} tick={{ fill: chartTheme.axisText }} />
                      <YAxis stroke={chartTheme.axisColor} fontSize={10} tickLine={false} tick={{ fill: chartTheme.axisText }} allowDecimals={false} />
                      <Tooltip content={<CustomDotTooltip defaultUnit="单" />} cursor={{ fill: chartTheme.cursorFill }} isAnimationActive={!reducedMotion} />
                      <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={28} name="故障单数" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* 故障发生地点分布 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-0.5">
                <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                故障发生地点分布
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                主要损坏设备分布的教室与教学办公场所
              </p>

              {selectedModelDetail.locationData.length === 0 ? (
                <div className="h-48 w-full mt-3 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  暂无地点分布数据
                </div>
              ) : (
                <div className="mt-3 space-y-2 max-h-52 overflow-y-auto pr-1">
                  {selectedModelDetail.locationData.map((loc, lIdx) => (
                    <div key={lIdx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{loc.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold font-mono">
                          {loc.value} 次
                        </span>
                        <span className="text-slate-400 font-mono">
                          ¥{loc.cost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 联动维度 3: 报修发生时间分布与历史明细记录 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-0.5">
              <CalendarClock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              报修发生时间分布与复盘记录
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              按时间倒序追踪每一次维保故障的发生时间、对应地点与故障分类
            </p>

            {selectedModelDetail.timelineData.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl mt-3">
                暂无故障报修明细记录
              </div>
            ) : (
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedModelDetail.timelineData.map((item, tIdx) => (
                  <div key={tIdx} className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                    <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                      <span className="px-2 py-1 rounded-lg bg-slate-200/70 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 font-mono font-semibold shrink-0 text-[11px]">
                        {item.date}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{item.modelName}</span>
                          <span className="text-xs px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium shrink-0">
                            {item.faultType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 mt-0.5 truncate">
                          <span><MapPin className="w-3 h-3 inline text-teal-500 mr-0.5" />{item.location}</span>
                          <span>•</span>
                          <span>上报人: {item.reporter}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 max-w-[180px]">
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">
                        ¥{item.cost.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate block" title={item.notes}>
                        {item.notes}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
