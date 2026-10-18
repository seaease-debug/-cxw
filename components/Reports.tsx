import React from 'react';
import {
  Activity,
  Warehouse,
  ShieldAlert,
  Wrench,
  MapPin,
  UserCheck
} from 'lucide-react';
import { ReportsProps } from './reports/types';
import { useReportsData } from './reports/useReportsData';
import { ReportsOverview } from './reports/ReportsOverview';
import { ReportsAlerts } from './reports/ReportsAlerts';
import { ReportsMaintenance } from './reports/ReportsMaintenance';
import { ReportsSpatial } from './reports/ReportsSpatial';
import { ReportsRiskModal } from './reports/ReportsRiskModal';

export const Reports: React.FC<ReportsProps> = ({
  user,
  onSelectAsset
}) => {
  const reportsData = useReportsData(user);
  const {
    activeTab,
    setActiveTab,
    isAdmin,
    selectedKeeperFilter,
    setSelectedKeeperFilter,
    allKeepersList,
    assets
  } = reportsData;

  return (
    <div className="space-y-8 p-4 md:p-6 text-slate-800 dark:text-slate-100 min-h-dvh pb-20 transition-colors duration-200">
      {/* 顶栏标题与维度 Tab 导航 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            统计报表与资产分析
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            实时监测资产生命周期、批次健康度、状态流转及场所设备档案
          </p>
        </div>

        {/* 维度切换 Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl self-start lg:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer outline-none focus:outline-none focus:ring-0 ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
            }`}
          >
            <Warehouse className="w-4 h-4 text-teal-500" />
            保管概览与批次健康
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer outline-none focus:outline-none focus:ring-0 ${
              activeTab === 'alerts'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            维保与超期预警
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('maintenance')}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer outline-none focus:outline-none focus:ring-0 ${
              activeTab === 'maintenance'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
            }`}
          >
            <Wrench className="w-4 h-4 text-amber-500" />
            故障与维修效率
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('spatial')}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer outline-none focus:outline-none focus:ring-0 ${
              activeTab === 'spatial'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
            }`}
          >
            <MapPin className="w-4 h-4 text-teal-500" />
            地点空间设备档案
          </button>
        </div>
      </div>

      {/* 管理员专属：全局/保管人切片筛选器 */}
      {isAdmin && (
        <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300">
              <UserCheck className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                保管人数据切片视角：
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">
                {selectedKeeperFilter === 'ALL'
                  ? '目前显示【全校全量资产分析】'
                  : `目前切片查看【${selectedKeeperFilter}】名下资产分析`}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedKeeperFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer outline-none focus:outline-none focus:ring-0 flex items-center gap-1.5 ${
                selectedKeeperFilter === 'ALL'
                  ? 'bg-teal-600 text-white shadow-xs font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              🌐 全校全量 ({assets.length}件)
            </button>
            {allKeepersList.map(keeperName => {
              const matchedAcc = reportsData.accountsList.find(acc => {
                const name = acc.realName || acc.real_name || '';
                return name === keeperName || acc.username === keeperName;
              });
              const validIds = new Set<string>([keeperName]);
              if (matchedAcc) {
                const name = (matchedAcc.realName || matchedAcc.real_name || '').trim();
                const uname = (matchedAcc.username || '').trim();
                if (name) validIds.add(name);
                if (uname) validIds.add(uname);
              }
              const count = assets.filter(a => {
                const k = (a.keeper || '').trim();
                return validIds.has(k);
              }).length;
              return (
                <button
                  key={keeperName}
                  type="button"
                  onClick={() => setSelectedKeeperFilter(keeperName)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer outline-none focus:outline-none focus:ring-0 flex items-center gap-1.5 ${
                    selectedKeeperFilter === keeperName
                      ? 'bg-teal-600 text-white shadow-xs font-bold'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80'
                  }`}
                >
                  👤 {keeperName}
                  <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedKeeperFilter === keeperName ? 'bg-teal-800 text-teal-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 1. 保管概览、批次健康与状态流转 (主面板) */}
      {activeTab === 'overview' && (
        <ReportsOverview data={reportsData} />
      )}

      {/* 2. 维保与超期预警 (Tab 2) */}
      {activeTab === 'alerts' && (
        <ReportsAlerts data={reportsData} onSelectAsset={onSelectAsset} />
      )}

      {/* 3. 故障与维修效率 (Tab 3) */}
      {activeTab === 'maintenance' && (
        <ReportsMaintenance data={reportsData} />
      )}

      {/* 4. 地点空间设备档案 (Tab 4) */}
      {activeTab === 'spatial' && (
        <ReportsSpatial data={reportsData} onSelectAsset={onSelectAsset} />
      )}

      {/* 5. 风险型号钻取全生命周期明细弹窗 */}
      <ReportsRiskModal data={reportsData} onSelectAsset={onSelectAsset} />
    </div>
  );
};

export default Reports;
