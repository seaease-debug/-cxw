// components/mobileScanner/AssetCards.tsx
import { Clock, MapPin, User } from 'lucide-react';
import { AssetHistory, AssetStatus } from '../../types';
import { formatPrice } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { ScannerApi } from './useMobileScanner';
import { getStatusTone, historyDotStyle, maskSensitiveAmount, resolveWarrantyInfo } from './helpers';
/** Status Indicator & Title Card */
export const AssetTitleCard = ({ s }: { s: ScannerApi }) => {
  const { scannedAsset } = s;
  if (!scannedAsset) return null;
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
      <div className="absolute top-4 right-4">
        <Badge tone={getStatusTone(scannedAsset.currentStatus)}>
          {scannedAsset.currentStatus}
        </Badge>
      </div>
      <Badge tone="teal" className="uppercase font-bold tracking-widest">{scannedAsset.type}</Badge>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-2 leading-snug">{scannedAsset.name || scannedAsset.brandModel}</h3>
      <p className="text-xs text-slate-400 font-mono font-semibold mt-0.5">资产条码: {scannedAsset.no}</p>

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-300 font-medium">
        <div>
          <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">当前保管人</span>
          <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-1">
            <User size={12} className="opacity-40" />
            <span>{scannedAsset.currentKeeperId || '库管员'}</span>
          </span>
        </div>
        <div>
          <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">存放位置</span>
          <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-1">
            <MapPin size={12} className="opacity-40" />
            <span>{scannedAsset.warehouseLocation || scannedAsset.currentLocationId || '周转仓'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export const AssetPhotoCard = ({ s }: { s: ScannerApi }) => {
  const { assetPhoto, isSharedPhoto, setPreviewImage } = s;
  if (!assetPhoto) return null;
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center relative">
       <img 
         src={assetPhoto} 
         alt="设备照片" 
         className="max-h-56 w-auto rounded-xl object-contain cursor-zoom-in active:scale-95 transition-transform"
         onClick={() => setPreviewImage(assetPhoto)} 
       />
       {isSharedPhoto && (
         <span className="absolute bottom-3 right-3 bg-slate-900/60 text-white text-xs px-1.5 py-0.5 rounded backdrop-blur font-semibold">
           同型号共享照片
         </span>
       )}
    </div>
  );
};

const AssetSpecsGrid = ({ s }: { s: ScannerApi }) => {
  const { canViewPrice, scannedAsset } = s;
  if (!scannedAsset) return null;
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-slate-600 dark:text-slate-300 font-semibold">
      <div>
        <span className="block text-xs text-slate-400 font-bold mb-0.5">品牌型号</span>
        <span className="text-slate-800 dark:text-slate-200 font-extrabold">{scannedAsset.brandModel || '-'}</span>
      </div>
      <div>
        <span className="block text-xs text-slate-400 font-bold mb-0.5">序列号 (S/N)</span>
        <span className="text-slate-800 dark:text-slate-200 font-mono font-bold break-all">{scannedAsset.serialNo || '暂无/散装'}</span>
      </div>
      <div>
        <span className="block text-xs text-slate-400 font-bold mb-0.5">采购金额</span>
        {canViewPrice ? (
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-sm">{formatPrice(scannedAsset.purchasePrice || 0)}</span>
        ) : (
          <span className="text-slate-400 font-semibold text-xs select-none">*** (仅限特定权限查看)</span>
        )}
      </div>
      <div>
        <span className="block text-xs text-slate-400 font-bold mb-0.5">所属部门</span>
        <span className="text-slate-800 dark:text-slate-200 font-extrabold">{scannedAsset.departmentId || '科技信息中心'}</span>
      </div>
      <div>
        <span className="block text-xs text-slate-400 font-bold mb-0.5">入库日期</span>
        <span className="text-slate-800 dark:text-slate-200 font-bold">{scannedAsset.purchaseDate || '见采购记录'}</span>
      </div>
      <div>
        <span className="block text-xs text-slate-400 font-bold mb-0.5">领用日期</span>
        <span className="text-slate-800 dark:text-slate-200 font-bold">{scannedAsset.outboundDate ? scannedAsset.outboundDate : (scannedAsset.currentStatus === AssetStatus.NEW_IN_WAREHOUSE ? '未曾领出 (在库在备)' : '查阅历史流转')}</span>
      </div>
    </div>
  );
};

/** Complete Specifications and Metadata */
export const AssetSpecsCard = ({ s }: { s: ScannerApi }) => {
  const { scannedAsset } = s;
  if (!scannedAsset) return null;
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-xs space-y-4">
      <h4 className="font-extrabold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center">
        <span className="mr-1">📋</span>
        <span>完整物资建档与配置特征</span>
      </h4>

      <AssetSpecsGrid s={s} />
      {scannedAsset.specification && (
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <span className="block text-xs text-slate-400 font-bold mb-1">规格配置详情</span>
          <p className="bg-slate-50 dark:bg-slate-800/60 p-2.5 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 text-xs leading-relaxed break-words font-medium">
            {scannedAsset.specification}
          </p>
        </div>
      )}

      {scannedAsset.remarks && (
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <span className="block text-xs text-slate-400 font-bold mb-1">使用备注/管理员备注</span>
          <p className="p-2.5 bg-amber-50/40 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 rounded-xl text-[10.5px] border border-amber-100/60 dark:border-amber-900/40 leading-relaxed font-semibold italic">
            {scannedAsset.remarks}
          </p>
        </div>
      )}
    </div>
  );
};

/** Asset Lifetime Countdown Progress */
export const AssetLifetimeCard = ({ s }: { s: ScannerApi }) => {
  const { scannedAsset } = s;
  if (!scannedAsset) return null;
  return (
    <div className="bg-slate-900 p-5 rounded-xl text-white space-y-4">
      <h4 className="text-xs font-semibold text-teal-400 uppercase tracking-widest flex items-center">
        <Clock size={12} className="mr-1" />
        <span>资产寿命监控</span>
      </h4>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-slate-400">
          <span>生命周期进度</span>
          <span className="font-bold text-white">
            {(100 - (Math.max(0, scannedAsset.remainingDays) / ((scannedAsset.retirementYears || 8) * 365)) * 100).toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${scannedAsset.remainingDays < 365 ? 'bg-rose-500' : 'bg-teal-500'}`} 
            style={{ width: `${100 - (Math.max(0, scannedAsset.remainingDays) / ((scannedAsset.retirementYears || 8) * 365)) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-slate-800 p-3 rounded-xl border border-slate-700/30 text-xs flex justify-between items-center">
        <div>
          <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">预测剩余寿命</span>
          <span className="font-semibold text-teal-400">
            {scannedAsset.remainingDays <= 0 ? '已到报废年限 (请处置)' : `${(scannedAsset.remainingDays / 365).toFixed(1)} 年 (约${Math.floor(scannedAsset.remainingDays/30)}个月)`}
          </span>
        </div>
        <span className={`text-xs px-1.5 py-0.5 rounded font-semibold uppercase ${scannedAsset.remainingDays < 365 ? 'bg-rose-950 text-rose-400' : 'bg-teal-950 text-teal-400'}`}>
          {scannedAsset.remainingDays < 365 ? '极限/超期' : '完好/安全'}
        </span>
      </div>
    </div>
  );
};

/** Warranty & Supplier Contact details */
export const AssetWarrantyCard = ({ s }: { s: ScannerApi }) => {
  const { scannedAsset, suppliers } = s;
  if (!scannedAsset) return null;
  const { supplier, supplierName, supplierPhone, targetPhone } = resolveWarrantyInfo(scannedAsset, suppliers);
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-xs space-y-3">
      <h4 className="font-extrabold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2 mb-2 flex items-center">
        <span className="mr-1">🛠️</span>
        <span>售后与维保信息</span>
      </h4>

      <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-100 dark:border-teal-900/50 flex justify-between items-center">
        <div>
          <span className="block text-xs text-teal-400 font-bold mb-0.5">保修截止/期限</span>
          <span className="font-semibold text-teal-800 dark:text-teal-300">{scannedAsset.warrantyPeriod || '3年'}</span>
        </div>
      </div>

      <div className="space-y-2 pt-1 font-medium text-slate-600 dark:text-slate-300">
        <p><span className="text-slate-400">供应商:</span> <span className="font-extrabold text-slate-800 dark:text-slate-200">{supplierName}</span></p>
        {supplier?.contact_person && <p><span className="text-slate-400">驻场联系人:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{supplier.contact_person}</span></p>}

        {supplierPhone ? (
          <p className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800"><span className="text-slate-400">供应商联系电话:</span> <span className="font-bold text-teal-600">{supplierPhone}</span></p>
        ) : (
          <p className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-slate-400">校内求助电话:</span> <span className="font-extrabold text-teal-600">{scannedAsset.uploader || '无'}</span>
          </p>
        )}

        <a 
          href={`tel:${targetPhone}`}
          className="mt-3 w-full flex items-center justify-center space-x-1.5 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-lg font-bold shadow-md hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 transition-all text-xs cursor-pointer"
        >
          <span>📞 一键拨打售后电话</span>
        </a>
      </div>
    </div>
  );
};

/** Historical Flow trajectories */
export const AssetHistoryCard = ({ s }: { s: ScannerApi }) => {
  const { assetHistory, user } = s;
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
      <h4 className="font-extrabold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
        <span>👁️‍🗨️</span>
        <span className="ml-1">流转记录轨迹</span>
      </h4>

      <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-100 dark:before:bg-slate-800">
        {[...assetHistory]
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((log: AssetHistory, idx: number) => (
            <HistoryLogItem key={idx} log={log} loggedIn={Boolean(user)} />
          ))}
      </div>
    </div>
  );
};

const HistoryLogItem = ({ log, loggedIn }: { log: AssetHistory; loggedIn: boolean }) => {
  const { dotBg, titleStyle } = historyDotStyle(log.action_type || '');
  const cleanDesc = maskSensitiveAmount(log.description || '', loggedIn);
  return (
    <div className="relative z-10 text-xs leading-relaxed">
      <div className={`absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full ${dotBg} ring-2 ring-white dark:ring-slate-900 z-10`}></div>
      <div className="flex justify-between items-center text-slate-400 font-bold">
        <span className={titleStyle}>{log.action_type || '位置变更'}</span>
        <span className="text-xs font-mono text-slate-400">{new Date(log.created_at).toLocaleString('zh-CN', { hour12: false })}</span>
      </div>
      {log.action_type !== '初始入库登记' && log.action_type !== '信息变更' && cleanDesc && (
        <p className="text-slate-600 dark:text-slate-300 mt-1 font-medium">{cleanDesc}</p>
      )}
      <p className="text-xs text-slate-400 mt-0.5">操作人员: {log.operator || '系统管理员'}</p>
    </div>
  );
};
