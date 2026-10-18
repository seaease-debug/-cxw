// top/KpiCards.tsx — 模块 A：保管人视角 4 大核心 KPI 指标卡片
//
// 原 renderKpiCards（103 行）把 4 张卡片内联在一个函数里 ⇒ 超 100 行阈值。
// 这里 4 张卡片各自成组件（每个单独计分），容器只剩版面组合。
// props 用 Pick<OverviewApi, …> 且字段名与原文完全一致 ⇒ 搬走的 JSX 一字未改。
import { Server, AlertTriangle, CalendarClock, PackageCheck } from 'lucide-react';
import { Badge } from '../../../ui';
import type { OverviewApi } from '../api';

/** 1. 在管资产总数（含服役率进度条）。 */
const KpiTotalCard = ({ kpiStats }: Pick<OverviewApi, 'kpiStats'>) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">在管资产总数</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          {kpiStats.totalCount} <span className="text-xs font-normal text-slate-500">件</span>
        </h3>
        <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-1">
          ¥ {kpiStats.totalValue.toLocaleString()} <span className="text-slate-400 font-normal">原值金额</span>
        </p>
      </div>
      <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20">
        <Server className="w-5 h-5" />
      </div>
    </div>
    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/80">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>设备服役率</span>
        <span className="font-semibold text-teal-600">{kpiStats.usageRate}% 在用</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div className="bg-teal-600 h-full rounded-full" style={{ width: `${kpiStats.usageRate}%` }} />
      </div>
    </div>
  </div>
);

/** 2. 维保报警（点击跳转 alerts）。 */
const KpiWarrantyCard = ({ kpiStats, setActiveTab }: Pick<OverviewApi, 'kpiStats' | 'setActiveTab'>) => (
  <div
    onClick={() => setActiveTab('alerts')}
    className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 rounded-xl p-5 shadow-sm cursor-pointer hover:border-rose-400 transition-all group"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-rose-600 dark:text-rose-400">维保报警</p>
        <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
          {kpiStats.warrantyAlertCount} <span className="text-xs font-normal text-slate-500">件</span>
        </h3>
        <Badge tone="rose" className="mt-1 font-medium">
          临近过保 / 已过保
        </Badge>
      </div>
      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
        <AlertTriangle className="w-5 h-5" />
      </div>
    </div>
    <p className="text-xs text-rose-500 dark:text-rose-400 mt-3 pt-2.5 border-t border-rose-100 dark:border-rose-900/30 flex items-center justify-between">
      <span>需及时跟进质保续签</span>
      <span className="font-medium group-hover:underline">&rarr; 查看明细</span>
    </p>
  </div>
);

/** 3. 折旧超期预警（点击跳转 alerts）。 */
const KpiDepreciationCard = ({ kpiStats, setActiveTab }: Pick<OverviewApi, 'kpiStats' | 'setActiveTab'>) => (
  <div
    onClick={() => setActiveTab('alerts')}
    className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 rounded-xl p-5 shadow-sm cursor-pointer hover:border-amber-400 transition-all group"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">折旧预警 (超期)</p>
        <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
          {kpiStats.usefulLifeAlertCount} <span className="text-xs font-normal text-slate-500">件</span>
        </h3>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">已达到/超过预定使用年限</p>
      </div>
      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
        <CalendarClock className="w-5 h-5" />
      </div>
    </div>
    <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 pt-2.5 border-t border-amber-100 dark:border-amber-900/30 flex items-center justify-between">
      <span>提示评估申请报废</span>
      <span className="font-medium group-hover:underline">&rarr; 查看明细</span>
    </p>
  </div>
);

/** 4. 在修 / 故障跟进（点击跳转 maintenance）。 */
const KpiRepairCard = ({ kpiStats, setActiveTab }: Pick<OverviewApi, 'kpiStats' | 'setActiveTab'>) => (
  <div
    onClick={() => setActiveTab('maintenance')}
    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm cursor-pointer hover:border-teal-500 transition-all group"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">在修 / 故障跟进</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          {kpiStats.inRepairCount} <span className="text-xs font-normal text-slate-500">件在修</span>
        </h3>
        <p className="text-xs text-teal-600 dark:text-teal-400 mt-1 font-medium">
          报废待审: {kpiStats.scrapPendingCount} 件
        </p>
      </div>
      <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20">
        <PackageCheck className="w-5 h-5" />
      </div>
    </div>
    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
      <span>实时追踪维修状态</span>
      <span className="font-medium group-hover:underline text-teal-600">&rarr; 维修大厅</span>
    </p>
  </div>
);

/** 保管人视角 4 大核心 KPI 指标卡片 */
export const renderKpiCards = (a: OverviewApi) => {
  const { kpiStats, setActiveTab } = a;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <KpiTotalCard kpiStats={kpiStats} />
      <KpiWarrantyCard kpiStats={kpiStats} setActiveTab={setActiveTab} />
      <KpiDepreciationCard kpiStats={kpiStats} setActiveTab={setActiveTab} />
      <KpiRepairCard kpiStats={kpiStats} setActiveTab={setActiveTab} />
    </div>
  );
};
