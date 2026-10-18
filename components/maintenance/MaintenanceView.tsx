// components/maintenance/MaintenanceView.tsx
// 维修模块主页面渲染：顶部横幅 + 筛选栏 + 记录表格。
// 3 个弹窗在 MaintenanceModals.tsx，本文件在壳里组合。
import React from 'react';
import { Wrench, Clock, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { UserAccount, AssetStatus, UserRole } from '../../types';
import { formatPrice } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { SearchBar } from '../ui/SearchBar';
import { EmptyState } from '../ui/EmptyState';
import { DateRange } from '../ui/DateRange';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Skeleton } from '../ui/Skeleton';
import { useMaintenance, type MaintenanceApi } from './useMaintenance';
import { renderUpdateModal, renderCreateModal, renderDetailModal } from './MaintenanceModals';

/** 维修状态徽章：按语义映射色（待处理/维修中 = amber，已完修 = emerald，无法修复 = rose）。 */
const getStatusBadge = (status: string) => {
    switch (status) {
      case '待维修':
        return <Badge tone="amber"><Clock size={12} className="mr-1" />待维修</Badge>;
      case '维修中':
        return <Badge tone="amber"><Wrench size={12} className="mr-1" />维修中</Badge>;
      case '已完修':
        return <Badge tone="emerald"><CheckCircle2 size={12} className="mr-1" />已完修</Badge>;
      case '无法修复':
        return <Badge tone="rose"><XCircle size={12} className="mr-1" />无法修复</Badge>;
      default:
        return <Badge tone="slate">{status}</Badge>;
    }
};

/** 顶部横幅 + 筛选栏。 */
const renderToolbar = (a: MaintenanceApi) => {
  const {
    totalCount, pendingCount, inProgressCount, completedCount, records,
    filterStatus, setFilterStatus, startDate, endDate, setStartDate, setEndDate,
    searchTerm, setSearchTerm,
  } = a;
  return (
    <>

    {/* Header Banner */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div>
        <div className="flex items-center space-x-2">
          <div className="p-2.5 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 rounded-xl border border-teal-100 dark:border-teal-900/50">
            <Wrench size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">维修全生命周期管理</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">追踪维修进度与费用存底、完修重新归仓</p>
          </div>
        </div>
      </div>
    </div>

    {/* Filter and Search Bar */}
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Tab Filters */}
      <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
        { [
          { id: 'ALL', label: '全部单据', count: totalCount },
          { id: '待维修', label: '待处理', count: pendingCount },
          { id: '维修中', label: '维修中', count: inProgressCount },
          { id: '已完修', label: '已完修', count: completedCount },
          { id: '无法修复', label: '无法修复', count: records.filter(r => r.repair_status === '无法修复').length },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterStatus(tab.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center transition-colors cursor-pointer outline-none focus:outline-none focus:ring-0 ${
              filterStatus === tab.id
                ? 'bg-slate-900 dark:bg-teal-600 text-white shadow-xs font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label} <span className={`ml-1 px-1.5 py-0.2 text-[11px] rounded-full font-mono ${filterStatus === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search & Date Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
        {/* Date Range Picker */}
        <DateRange
          start={startDate}
          end={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
          onClear={() => { setStartDate(''); setEndDate(''); }}
          startAriaLabel="开始日期"
          endAriaLabel="结束日期"
        />

        {/* Search Field */}
        <div className="w-full sm:w-64">
          <SearchBar
            placeholder="搜索报修单号、资产名、报修人..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
    </div>
    </>
  );
};

/** 记录表格（含骨架与空态）。 */
const renderTable = (a: MaintenanceApi) => {
  const {
    loading, filteredRecords, assets, user,
    handleOpenUpdateModal, handleDeleteRecord, setShowDetailModal,
  } = a;
  return (

    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {loading ? (
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-9 gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} height="1rem" className="rounded-md" />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid grid-cols-9 gap-4 py-3.5 border-b border-slate-200 dark:border-slate-800/50 items-center">
              <div className="col-span-1 space-y-1.5"><Skeleton height="1.125rem" width="80%" /><Skeleton height="0.75rem" width="55%" /></div>
              <div className="col-span-1 space-y-1.5"><Skeleton height="1.125rem" width="90%" /><Skeleton height="0.75rem" width="60%" /></div>
              <div className="col-span-1 space-y-1.5"><Skeleton height="1.125rem" width="75%" /><Skeleton height="0.75rem" width="45%" /></div>
              <div className="col-span-1"><Skeleton height="1.125rem" width="65%" /></div>
              <div className="col-span-1"><Skeleton height="1.125rem" width="70%" /></div>
              <div className="col-span-1"><Skeleton height="1.125rem" width="50%" /></div>
              <div className="col-span-1"><Skeleton height="1.125rem" width="85%" /></div>
              <div className="col-span-1"><Skeleton height="1.5rem" width="75%" className="rounded-full" /></div>
              <div className="col-span-1 flex justify-end"><Skeleton height="1.75rem" width="60px" className="rounded-lg" /></div>
            </div>
          ))}
        </div>
      ) : filteredRecords.length === 0 ? (
        <EmptyState
          icon={<Wrench size={32} className="text-slate-400" />}
          title="暂无相关报修记录"
          description="如设备发生故障需要送修或登记成本，请在资产详细信息中发起报修。"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-widest">
                <th className="py-3 px-4">维修点位</th>
                <th className="py-3 px-4">报修资产</th>
                <th className="py-3 px-4">报修人</th>
                <th className="py-3 px-4">故障分类</th>
                <th className="py-3 px-4">维保服务商</th>
                <th className="py-3 px-4 text-right">维修费用</th>
                <th className="py-3 px-4">登记/完修时间</th>
                <th className="py-3 px-4 text-center">状态</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-200 font-medium">
              {filteredRecords.map((rec) => {
                const asset = assets.find(a => a.id === rec.asset_id.toString() || a.no === rec.asset_no);
                let location = '科技信息中心';
                let personName = '未指定保管人';
                if (asset) {
                  const displayStatus = asset.currentStatus || asset.status || '新设备在库';
                  const isServing = displayStatus === AssetStatus.IN_USE || displayStatus === AssetStatus.IN_REPAIR;
                  if (isServing) {
                    location = asset.currentLocationId || asset.location || '自行保管';
                    const keeper = (asset.currentKeeperId || asset.keeper || '').trim();
                    personName = (keeper && keeper !== '?' && keeper !== '未指定保管人')
                      ? keeper
                      : (rec.reporter_name || '领用人');
                  } else {
                    location = asset.warehouseLocation || asset.warehouse_location || asset.currentLocationId || asset.location || '1楼办公室仓库';
                    const keeper = (asset.currentKeeperId || asset.keeper || '').trim();
                    personName = (keeper && keeper !== '?' && keeper !== '未指定保管人')
                      ? keeper
                      : '未指定保管人';
                  }
                } else {
                  location = rec.reporter_contact ? '在用地点' : '1楼办公室仓库';
                  personName = rec.reporter_name || '报修联系人';
                }
                return (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{location}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-normal">{personName}</p>
                    </td>
                    <td className="py-4 px-4 max-w-[200px]">
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{rec.asset_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-300 font-mono mt-0.5">{rec.asset_no}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{rec.reporter_name}</p>
                      {rec.reporter_contact && <p className="text-xs text-slate-500 dark:text-slate-300">{rec.reporter_contact}</p>}
                    </td>
                    <td className="py-4 px-4">
                      <Badge tone="slate">
                        {rec.fault_type || '通用故障'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      {rec.repair_vendor ? (
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate max-w-[140px]">{rec.repair_vendor}</p>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-300 italic text-xs">未登记</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-sm text-slate-900 dark:text-slate-100">
                      {rec.cost > 0 ? formatPrice(rec.cost) : <span className="text-slate-500 dark:text-slate-300 font-normal">￥0.00</span>}
                    </td>
                    <td className="py-4 px-4">
                      {rec.repair_status === '已完修' || rec.repair_status === '无法修复' ? (
                        <div>
                          <p className="font-semibold text-emerald-700 dark:text-emerald-400">完修：{rec.finish_date || rec.created_at?.substring(0, 10)}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">报修：{rec.repair_date || rec.created_at?.substring(0, 10)}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-slate-700 dark:text-slate-200">报修：{rec.repair_date || rec.created_at?.substring(0, 10)}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">等待处理中</p>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(rec.repair_status)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(user.role === UserRole.ADMIN || user.role === UserRole.KEEPER) && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenUpdateModal(rec)}
                          >
                            更新/完修
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setShowDetailModal(rec)}
                        >
                          详情
                        </Button>
                        {user.role === UserRole.ADMIN && (
                          <IconButton
                            icon={<Trash2 size={13} className="shrink-0" />}
                            label="删除记录"
                            onClick={() => handleDeleteRecord(rec.id)}
                            size="sm"
                            shape="rounded"
                            tone="danger"
                            className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-rose-300 dark:hover:border-rose-800 shadow-xs"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const MaintenanceView: React.FC<{ user: UserAccount }> = ({ user }) => {
  const m = useMaintenance(user);

  return (
    <div className="space-y-6 pb-12">
      {renderToolbar(m)}
      {renderTable(m)}
      {renderUpdateModal(m)}
      {renderCreateModal(m)}
      {renderDetailModal(m)}
    </div>
  );
};

export default MaintenanceView;
