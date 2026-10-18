import React from 'react';
import {
  MapPin,
  Building2,
  AlertCircle
} from 'lucide-react';
import { Badge, SearchBar } from '../ui';
import { AssetItem, getAssetPrice } from './types';
import { useReportsData } from './useReportsData';

interface ReportsSpatialProps {
  data: ReturnType<typeof useReportsData>;
  onSelectAsset?: (asset: AssetItem) => void;
}

export const ReportsSpatial: React.FC<ReportsSpatialProps> = ({ data, onSelectAsset }) => {
  const {
    locations,
    selectedLocation,
    setSelectedLocation,
    locationSearch,
    setLocationSearch,
    filteredLocations,
    locationAnalysis
  } = data;

  return (
    <section className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              地点空间设备档案 (微格教室 / 实验室等)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              以场所视角查看微格教室、录播教室等具体地点的在用设备、保管人、采购日期及在修情况
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="min-w-[180px]">
              <SearchBar
                placeholder="查找场所名称..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
              />
            </div>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/50 text-teal-900 dark:text-teal-200 text-xs rounded-lg px-3 py-2 font-bold focus:outline-none"
            >
              {filteredLocations.map(loc => (
                <option key={loc.id} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 场所芯片 */}
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-1">快捷切换地点:</span>
          {locations.slice(0, 6).map(loc => (
            <button
              key={loc.id}
              type="button"
              onClick={() => setSelectedLocation(loc.name)}
              className={`px-3 py-1 text-xs rounded-full font-semibold transition-colors cursor-pointer outline-none focus:outline-none focus:ring-0 ${
                selectedLocation === loc.name
                  ? 'bg-teal-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* 场所指标卡 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">当前场所</p>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
            <Building2 className="w-5 h-5 text-teal-600" />
            {locationAnalysis.locName}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            保管责任人: <strong className="text-slate-800 dark:text-slate-200">{locationAnalysis.keepers}</strong>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">场所设备件数</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {locationAnalysis.totalCount} <span className="text-xs font-normal text-slate-500">件</span>
          </h3>
          <p className="text-xs text-teal-600 dark:text-teal-400 mt-1 font-semibold">
            ¥ {locationAnalysis.totalValue.toLocaleString()} 资产原值
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">正常服役设备</p>
          <h3 className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">
            {locationAnalysis.inServiceCount} <span className="text-xs font-normal text-slate-500">件</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            闲置备用: {locationAnalysis.idleCount} 件
          </p>
        </div>

        <div className={`border rounded-xl p-5 shadow-sm ${
          locationAnalysis.inRepairCount > 0 
            ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50' 
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">在修/故障状态</p>
          <h3 className={`text-2xl font-bold mt-1 ${locationAnalysis.inRepairCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
            {locationAnalysis.inRepairCount} <span className="text-xs font-normal text-slate-500">件在修</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            {locationAnalysis.inRepairCount > 0 ? '需关注该场地设备修复进展' : '场地设备运行良好无故障'}
          </p>
        </div>
      </div>

      {/* 场所设备列表 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {locationAnalysis.locName} 在场设备明细清单
          </h3>
          <span className="text-xs text-slate-500">
            共 {locationAnalysis.locAssets.length} 件登记资产
          </span>
        </div>

        {locationAnalysis.locAssets.length === 0 ? (
          <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm">该场所当前未登记或未分配任何固定资产</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">资产编号</th>
                  <th className="py-2.5 px-3 font-semibold">设备名称 / 型号</th>
                  <th className="py-2.5 px-3 font-semibold">设备类别</th>
                  <th className="py-2.5 px-3 font-semibold">保管人</th>
                  <th className="py-2.5 px-3 font-semibold">采购原值</th>
                  <th className="py-2.5 px-3 font-semibold">采购日期</th>
                  <th className="py-2.5 px-3 font-semibold">当前状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {locationAnalysis.locAssets.map((asset) => (
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
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[220px]">{asset.brand_model}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {asset.category || asset.type || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                      {asset.keeper || '未指定'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-800 dark:text-slate-200 font-semibold">
                      ¥{getAssetPrice(asset).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                      {asset.purchase_date || '-'}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge
                        tone={
                          asset.status === '服役中' ? 'teal' :
                          asset.status === '维修中' ? 'amber' :
                          asset.status === '待报废' ? 'rose' : 'slate'
                        }
                        className="font-medium"
                      >
                        {asset.status || '闲置'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
