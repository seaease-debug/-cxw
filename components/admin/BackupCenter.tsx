import React from 'react';
import { HardDrive, RefreshCw } from 'lucide-react';
import { BackupFullCard, BackupRestoreCard, BackupLightCard } from './BackupCards';

// B3 拆分：备份中心容器（标题 + 三张子卡 + 还原中提示条）。
interface BackupCenterProps {
  isFullBackingUp: boolean;
  isRestoring: boolean;
  restoreInputRef: React.RefObject<HTMLInputElement | null>;
  onFullBackup: () => void;
  onLightBackup: () => void;
}

export const BackupCenter: React.FC<BackupCenterProps> = ({
  isFullBackingUp,
  isRestoring,
  restoreInputRef,
  onFullBackup,
  onLightBackup,
}) => (
  <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            数据维护与备份中心
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            管理固定资产数据库与服务器图片附件的完整灾备方案
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <BackupFullCard
          isFullBackingUp={isFullBackingUp}
          isRestoring={isRestoring}
          onFullBackup={onFullBackup}
        />
        <BackupRestoreCard
          isRestoring={isRestoring}
          isFullBackingUp={isFullBackingUp}
          restoreInputRef={restoreInputRef}
        />
        <BackupLightCard
          isFullBackingUp={isFullBackingUp}
          isRestoring={isRestoring}
          onLightBackup={onLightBackup}
        />
      </div>
    </div>

    {isRestoring && (
      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
        <span>全量数据恢复中，系统正在解压文件并刷新数据库连接，完成后将自动刷新页面...</span>
      </div>
    )}
  </div>
);
