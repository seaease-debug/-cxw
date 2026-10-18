import React, { useMemo } from 'react';
import {
  X,
  Layers,
  Search,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button, Badge } from '../ui';
import { AssetItem, getAssetPrice } from './types';
import { useReportsData } from './useReportsData';

interface ReportsRiskModalProps {
  data: ReturnType<typeof useReportsData>;
  onSelectAsset?: (asset: AssetItem) => void;
}

export const ReportsRiskModal: React.FC<ReportsRiskModalProps> = ({ data, onSelectAsset }) => {
  const {
    selectedRiskModel,
    setSelectedRiskModel,
    riskModalSearch,
    setRiskModalSearch,
    riskModalPage,
    setRiskModalPage,
    riskInspectionAnalysis
  } = data;

  const currentStat = useMemo(() => {
    if (!selectedRiskModel) return null;
    return riskInspectionAnalysis.modelStats.find(s => s.model === selectedRiskModel) || null;
  }, [selectedRiskModel, riskInspectionAnalysis.modelStats]);

  const modalFilteredItems = useMemo(() => {
    if (!currentStat) return [];
    const query = riskModalSearch.trim().toLowerCase();
    if (!query) return currentStat.items;
    return currentStat.items.filter(item => {
      const a = item.asset;
      const assetNo = (a.asset_no || '').toLowerCase();
      const name = (a.name || '').toLowerCase();
      const keeper = (a.keeper || '').toLowerCase();
      const loc = (a.location || a.warehouse_location || '').toLowerCase();
      return assetNo.includes(query) || name.includes(query) || keeper.includes(query) || loc.includes(query);
    });
  }, [currentStat, riskModalSearch]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(modalFilteredItems.length / pageSize));
  const currentPageItems = useMemo(() => {
    const start = (riskModalPage - 1) * pageSize;
    return modalFilteredItems.slice(start, start + pageSize);
  }, [modalFilteredItems, riskModalPage]);

  if (!selectedRiskModel || !currentStat) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-modal bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* 弹窗顶部栏 */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate" title={selectedRiskModel}>
                  {selectedRiskModel}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold">
                  共 {currentStat.count} 台风险设备
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                型号穿透明细看板 · 点击任意单机可直接调出资产全生命周期档案
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSelectedRiskModel(null)}
            aria-label="关闭风险型号明细弹窗"
            className="rounded-lg p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* 弹窗核心统计摘要条 */}
        <div className="px-5 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-400 block">沉淀资产总值</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
              ¥{currentStat.totalValue.toLocaleString()}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-400 block">状态分布构成</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              闲置 {currentStat.idleCount} · 在修 {currentStat.repairCount} · 报废 {currentStat.scrapCount}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-400 block">平均闲置天数</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 font-mono text-sm">
              {currentStat.avgIdleDays} 天
            </span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-400 block">主要存放地点</span>
            <span className="font-bold text-teal-700 dark:text-teal-300 truncate block" title={currentStat.topLocation}>
              {currentStat.topLocation}
            </span>
          </div>
        </div>

        {/* 弹窗内部检索与过滤栏 */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索编号 / 名称 / 保管人 / 存放地点..."
              value={riskModalSearch}
              onChange={(e) => {
                setRiskModalSearch(e.target.value);
                setRiskModalPage(1);
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-field rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="text-xs text-slate-500">
            已检索到 <strong className="text-slate-900 dark:text-white font-mono">{modalFilteredItems.length}</strong> 台
          </div>
        </div>

        {/* 弹窗主体表格 */}
        <div className="flex-1 overflow-y-auto min-h-[300px] p-4">
          {currentPageItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs">未找到符合搜索条件的设备记录</p>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-y border-slate-200 dark:border-slate-800 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">资产编号</th>
                  <th className="py-2.5 px-3 font-semibold">设备名称</th>
                  <th className="py-2.5 px-3 font-semibold">风险类型</th>
                  <th className="py-2.5 px-3 font-semibold">保管人</th>
                  <th className="py-2.5 px-3 font-semibold">存放地点</th>
                  <th className="py-2.5 px-3 font-semibold">原值(元)</th>
                  <th className="py-2.5 px-3 font-semibold">关键状态 / 维修信息</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {currentPageItems.map(({ asset, riskType, idleDays, maintRecord }) => (
                  <tr
                    key={asset.id}
                    onClick={() => {
                      if (onSelectAsset) {
                        onSelectAsset(asset);
                        setSelectedRiskModel(null);
                      }
                    }}
                    className="hover:bg-teal-50/40 dark:hover:bg-teal-950/20 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-teal-700 dark:text-teal-400">
                      {asset.asset_no}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                      {asset.name}
                    </td>
                    <td className="py-2.5 px-3">
                      {riskType === 'idle180' && (
                        <Badge tone="amber" className="font-semibold">
                          长期闲置 {idleDays}天
                        </Badge>
                      )}
                      {riskType === 'repair' && (
                        <Badge tone="rose" className="font-semibold">
                          故障在修
                        </Badge>
                      )}
                      {riskType === 'scrap' && (
                        <Badge tone="rose" className="font-semibold">
                          待报废审批
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                      {asset.keeper || '未指定'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {asset.warehouse_location || asset.location || '专职保管处'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      ¥{getAssetPrice(asset).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      {riskType === 'repair' && maintRecord ? (
                        <div className="space-y-0.5 text-[11px]">
                          <span className="text-rose-600 dark:text-rose-400 font-semibold block">
                            报修单号: {maintRecord.record_no || '未关联单号'}
                          </span>
                          <span className="text-slate-400 font-mono">
                            费用: ¥{maintRecord.cost} · 维修商: {maintRecord.repair_vendor || '原厂维保'}
                          </span>
                        </div>
                      ) : riskType === 'idle180' ? (
                        <span className="text-amber-700 dark:text-amber-300 font-mono text-[11px]">
                          入库/采购时间: {asset.purchase_date || asset.inbound_date || '未记录'}
                        </span>
                      ) : (
                        <span className="text-rose-700 dark:text-rose-300 text-[11px]">
                          建议技术评定后执行报废出库
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 弹窗底部翻页控制 */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            第 <strong className="text-slate-900 dark:text-white font-mono">{riskModalPage}</strong> / {totalPages} 页 · 每页 {pageSize} 条
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={riskModalPage <= 1}
              onClick={() => setRiskModalPage(p => Math.max(1, p - 1))}
              className="px-2.5 py-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> 上一页
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={riskModalPage >= totalPages}
              onClick={() => setRiskModalPage(p => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1"
            >
              下一页 <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
