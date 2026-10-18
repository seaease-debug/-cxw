import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  Archive,
  Hourglass,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import { Badge } from '../ui';
import { CustomDotTooltip } from './CustomDotTooltip';
import { AssetItem } from './types';
import { useReportsData } from './useReportsData';

interface ReportsAlertsProps {
  data: ReturnType<typeof useReportsData>;
  onSelectAsset?: (asset: AssetItem) => void;
}

export const ReportsAlerts: React.FC<ReportsAlertsProps> = ({ data, onSelectAsset }) => {
  const {
    alertAnalysis,
    alertFilter,
    setAlertFilter,
    filteredAlertAssets,
    reducedMotion
  } = data;

  const today = new Date();

  return (
    <section className="space-y-6">
      {/* 预警分类卡片与饼图 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：质保健康度饼图 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              质保周期健康度
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">全校资产设备维保期健康分布状态</p>
          </div>

          <div className="h-52 w-full my-2 relative" role="img" aria-label="质保周期健康度饼图">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={alertAnalysis.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                  isAnimationActive={!reducedMotion}
                >
                  {alertAnalysis.pieData.map((entry, index) => (
                    <Cell key={`alert-pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomDotTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400 font-medium">总受控资产</span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-mono">
                {alertAnalysis.pieData.reduce((acc, cur) => acc + cur.value, 0)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
            {alertAnalysis.pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧：4 项预警指标卡片 */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. 已过保设备 */}
          <div
            onClick={() => setAlertFilter(alertFilter === 'warranty_expired' ? 'all' : 'warranty_expired')}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              alertFilter === 'warranty_expired'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> 已过保修期
                </span>
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {alertAnalysis.warrantyExpiredCount} <span className="text-xs font-normal text-slate-400">件</span>
                </h4>
              </div>
              <Badge tone="rose" className="font-medium">
                高风险
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              超过原厂质保，后续维修需学校全额自费。
            </p>
          </div>

          {/* 2. 临近过保设备 (90天内) */}
          <div
            onClick={() => setAlertFilter(alertFilter === 'warranty_expiring' ? 'all' : 'warranty_expiring')}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              alertFilter === 'warranty_expiring'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> 临近过保 (≤90天)
                </span>
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {alertAnalysis.warrantyExpiringSoonCount} <span className="text-xs font-normal text-slate-400">件</span>
                </h4>
              </div>
              <Badge tone="amber" className="font-medium">
                需跟进
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              建议及时联系供货商评估延保或集中巡检。
            </p>
          </div>

          {/* 3. 超期服役 (达到使用年限) */}
          <div
            onClick={() => setAlertFilter(alertFilter === 'useful_expired' ? 'all' : 'useful_expired')}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              alertFilter === 'useful_expired'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <Archive className="w-4 h-4" /> 超期服役设备
                </span>
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {alertAnalysis.usefulLifeExpiredCount} <span className="text-xs font-normal text-slate-400">件</span>
                </h4>
              </div>
              <Badge tone="rose" className="font-medium">
                折旧完毕
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              已达最低使用年限，建议评估报废或调配降级。
            </p>
          </div>

          {/* 4. 临近使用年限 (≤1年) */}
          <div
            onClick={() => setAlertFilter(alertFilter === 'useful_expiring' ? 'all' : 'useful_expiring')}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              alertFilter === 'useful_expiring'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Hourglass className="w-4 h-4" /> 临近使用年限 (≤1年)
                </span>
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {alertAnalysis.usefulLifeExpiringSoonCount} <span className="text-xs font-normal text-slate-400">件</span>
                </h4>
              </div>
              <Badge tone="amber" className="font-medium">
                预算规划
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              1年内将达到预定年限，可提前规划替换预算。
            </p>
          </div>
        </div>
      </div>

      {/* 预警资产明细列表 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-teal-600 dark:text-teal-400" />
              预警资产清单
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-normal">
                共 {filteredAlertAssets.length} 件
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              点击上方卡片可筛选不同预警类型，点击单行设备可打开详情
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <span className="text-xs text-slate-500 dark:text-slate-400 px-2">过滤:</span>
            <button
              type="button"
              onClick={() => setAlertFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer outline-none focus:outline-none focus:ring-0 ${
                alertFilter === 'all'
                  ? 'bg-teal-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
              }`}
            >
              全部预警
            </button>
            <button
              type="button"
              onClick={() => setAlertFilter('warranty_expired')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer outline-none focus:outline-none focus:ring-0 ${
                alertFilter === 'warranty_expired'
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
              }`}
            >
              已过保
            </button>
            <button
              type="button"
              onClick={() => setAlertFilter('warranty_expiring')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer outline-none focus:outline-none focus:ring-0 ${
                alertFilter === 'warranty_expiring'
                  ? 'bg-amber-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
              }`}
            >
              临近过保
            </button>
            <button
              type="button"
              onClick={() => setAlertFilter('useful_expired')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer outline-none focus:outline-none focus:ring-0 ${
                alertFilter === 'useful_expired'
                  ? 'bg-purple-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
              }`}
            >
              超期服役
            </button>
          </div>
        </div>

        {filteredAlertAssets.length === 0 ? (
          <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-teal-500 mx-auto mb-2" />
            <p className="text-sm">暂无当前分类的预警资产</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">资产编号</th>
                  <th className="py-2.5 px-3 font-semibold">资产名称 / 型号</th>
                  <th className="py-2.5 px-3 font-semibold">保管人</th>
                  <th className="py-2.5 px-3 font-semibold">存放地点</th>
                  <th className="py-2.5 px-3 font-semibold">采购日期</th>
                  <th className="py-2.5 px-3 font-semibold">质保到期日</th>
                  <th className="py-2.5 px-3 font-semibold">已服役年限</th>
                  <th className="py-2.5 px-3 font-semibold">预警标签</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredAlertAssets.map((asset) => {
                  const pDate = asset.purchase_date ? new Date(asset.purchase_date) : today;
                  const yearsInService = ((today.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);
                  const isExpired = asset.warranty_expire && new Date(asset.warranty_expire).getTime() < today.getTime();
                  const isExpiring = asset.warranty_expire && !isExpired && (new Date(asset.warranty_expire).getTime() - today.getTime()) <= (90 * 24 * 60 * 60 * 1000);
                  const isOverLife = Number(yearsInService) >= (asset.useful_life_years || 5);

                  return (
                    <tr
                      key={asset.id}
                      onClick={() => onSelectAsset && onSelectAsset(asset)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-teal-700 dark:text-teal-400">
                        {asset.asset_no}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{asset.name}</div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{asset.brand_model}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                        {asset.keeper || '未指定'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                        {asset.location || asset.warehouse_location || '未指定地点'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                        {asset.purchase_date || '-'}
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className={isExpired ? 'text-rose-600 dark:text-rose-400 font-bold' : isExpiring ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}>
                          {asset.warranty_expire || '未登记'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">
                        {yearsInService} 年 / 规程 {asset.useful_life_years || 5} 年
                      </td>
                      <td className="py-2.5 px-3">
                        {isExpiring && (
                          <Badge tone="amber" className="mr-1 font-medium">
                            临近过保
                          </Badge>
                        )}
                        {isExpired && (
                          <Badge tone="rose" className="mr-1 font-medium">
                            已过保修
                          </Badge>
                        )}
                        {isOverLife && (
                          <Badge tone="amber" className="font-medium">
                            超期服役
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
