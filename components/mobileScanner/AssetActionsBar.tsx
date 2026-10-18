// components/mobileScanner/AssetActionsBar.tsx
import { Info, Shield } from 'lucide-react';
import { AssetStatus } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ScannerApi } from './useMobileScanner';
export const AssetActionsBar = ({ s }: { s: ScannerApi }) => {
  const { hasWritePermission } = s;
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
      <RepairReportButton s={s} />

      {hasWritePermission ? (
        <KeeperActionGrid s={s} />
      ) : (
        <GuestNotice s={s} />
      )}
    </div>
  );
};

/** Actions Bar for Keepers & Admins */
const RepairReportButton = ({ s }: { s: ScannerApi }) => {
  const { canReportRepair, setActiveForm, setRepairFaultDesc, setRepairReporterContact, setRepairReporterName, user } = s;
  if (!canReportRepair) return null;
  return (
    <Button 
      variant="primary"
      onClick={() => {
        setRepairReporterName(user?.realName || user?.username || "");
        setRepairReporterContact(user?.department || "");
        setRepairFaultDesc("");
        setActiveForm('repair');
      }}
      className="w-full bg-amber-600 hover:bg-amber-500 text-white py-2.5 px-3 rounded-lg text-xs font-bold shadow-md flex items-center justify-center space-x-1.5"
    >
      <span className="text-sm">🛠️</span>
      <span>在线提交故障报修</span>
    </Button>
  );
};

const KeeperActionGrid = ({ s }: { s: ScannerApi }) => {
  const { handleOutboundClick, handleReturnClick, handleScrapProcess, scannedAsset, setActiveForm } = s;
  if (!scannedAsset) return null;
  return (
    <div>
      <div className="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-extrabold mb-3">
        <Shield size={12} />
        <span>已授权的资产管辖端：可以完成登记、变更与处置</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Outbound button */}
        {(scannedAsset.currentStatus === AssetStatus.NEW_IN_WAREHOUSE || 
          scannedAsset.currentStatus === AssetStatus.RECYCLED_PENDING) ? (
          <Button 
            variant="primary"
            onClick={handleOutboundClick}
            className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-lg text-xs font-semibold shadow-md flex items-center justify-center space-x-1"
          >
            <span>🚀 领用出库</span>
          </Button>
        ) : (
          <Button 
            type="button" 
            variant="ghost"
            disabled 
            className="bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 py-2.5 px-3 rounded-lg text-xs font-semibold cursor-not-allowed text-center"
          >
            无法进行出库
          </Button>
        )}

        {/* Return/Return modal trigger */}
        {scannedAsset.currentStatus === AssetStatus.IN_USE ? (
          <Button 
            variant="primary"
            onClick={handleReturnClick}
            className="bg-amber-600 hover:bg-amber-700 text-white py-2.5 px-3 rounded-lg text-xs font-semibold shadow-md flex items-center justify-center space-x-1"
          >
            <span>↩ 归还退库</span>
          </Button>
        ) : (
          <Button 
            type="button" 
            variant="ghost"
            disabled 
            className="bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 py-2.5 px-3 rounded-lg text-xs font-semibold cursor-not-allowed text-center"
          >
            无法进行退库
          </Button>
        )}

        {/* Location update */}
        <Button 
          variant="secondary"
          onClick={() => setActiveForm('location')}
          className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1"
        >
          <span>📍 变更定位</span>
        </Button>

        {/* Scrap button */}
        {scannedAsset.currentStatus === AssetStatus.SCRAP_PENDING ? (
          <Button 
            variant="danger"
            onClick={() => handleScrapProcess('scrap_confirm')}
            className="bg-rose-600 hover:bg-rose-700 text-white py-2.5 px-3 rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center space-x-1"
          >
            <span>⚠️ 确认废弃</span>
          </Button>
        ) : scannedAsset.currentStatus !== AssetStatus.SCRAPPED ? (
          <Button 
            variant="secondary"
            onClick={() => handleScrapProcess('scrap')}
            className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1"
          >
            <span>🗑 申报报废</span>
          </Button>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs py-2.5 rounded-lg font-bold text-center border border-slate-200 dark:border-slate-700">
            已报废清理
          </div>
        )}
      </div>
    </div>
  );
};

const GuestNotice = ({ s }: { s: ScannerApi }) => {
  const {
    handleInlineLogin, loginError, loginPassword, loginUsername, setLoginPassword,
    setLoginUsername, setShowInlineLogin, showInlineLogin, user,
  } = s;
  return (
    <div className="space-y-3">
      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-start space-x-2">
        <Info size={14} className="text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
          {user 
            ? "您对该资产无处置管辖权。只有该资产的上传保管人或超级管理员才可以进行手机出库、修改和报废等处置操作。" 
            : "您正在以游客(只读)身份浏览。如果是科技信息中心教师、管理员或保管员，请点击下方登录来解锁物理资产的手机出库、修改和报废操作。"}
        </p>
      </div>
      {!user && (
        showInlineLogin ? (
          <form onSubmit={handleInlineLogin} className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 mt-2 space-y-2.5">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase">管辖账号安全登录</p>
            <div>
              <Input 
                type="text" 
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full bg-white dark:bg-slate-900"
                placeholder="用户名 (如 admin / keeper1)"
                required
              />
            </div>
            <div>
              <Input 
                type="password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-white dark:bg-slate-900"
                placeholder="安全密码"
                required
              />
            </div>
            {loginError && <p className="text-xs text-rose-500 font-semibold">{loginError}</p>}
            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => setShowInlineLogin(false)}
                className="flex-1 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded text-xs font-semibold"
              >
                取消
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                className="flex-1 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-semibold"
              >
                立即登录
              </Button>
            </div>
          </form>
        ) : (
          <Button 
            variant="primary"
            onClick={() => setShowInlineLogin(true)}
            className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold text-center"
          >
            🔑 登录主管/保管员账号以操作
          </Button>
        )
      )}
    </div>
  );
};
