// top/WarehouseComposition.tsx — 模块 E：仓库保管资产构成与核心物品
//
// 自 OverviewTop.tsx 原样搬出（**零改动**）。
import { Warehouse, Box, Coins } from 'lucide-react';
import { Badge } from '../../../ui';
import type { OverviewApi } from '../api';

/** 仓库保管资产构成与核心物品 */
export const renderWarehouseComposition = (a: OverviewApi) => {
  const { warehousesData } = a;
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Warehouse className="w-5 h-5 text-teal-700 dark:text-teal-400" />
          仓库保管资产构成与核心物品
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          各仓库在管资产总件数、估算价值及主要设备型号
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {warehousesData.map((wh) => (
          <div
            key={wh.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4"
          >
            {/* 仓库基本头信息 */}
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{wh.name}</h4>
                  {wh.code && (
                    <Badge tone="teal" className="font-mono">
                      {wh.code}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-teal-700 dark:text-teal-400 font-mono block">
                  {wh.count.toLocaleString()} <span className="text-xs font-normal">件</span>
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono block mt-0.5">
                  ¥ {wh.totalValueWan}万
                </span>
              </div>
            </div>

            {/* 在库主力型号 Top 3 */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Box className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                <span>在库主力型号 Top 3</span>
              </div>

              <div className="space-y-2.5">
                {wh.topModels.length > 0 ? (
                  wh.topModels.map((tm, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-700 dark:text-slate-200 font-medium truncate max-w-[170px]">
                          {i + 1}. {tm.model}
                        </span>
                        <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                          {tm.count}件 ({tm.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-teal-700 dark:bg-teal-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(3, tm.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 dark:text-slate-500 py-2 text-center bg-slate-50 dark:bg-slate-800 rounded-lg">
                    暂无在库备件设备
                  </div>
                )}
              </div>
            </div>

            {/* 底部最高单件价值设备提示框 */}
            <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100/90 dark:border-amber-900/40 rounded-xl p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Coins className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-tight">最高单件价值设备</p>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate mt-0.5">
                    {wh.maxValDevice.name}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-1">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                  ¥{wh.maxValDevice.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
