import React from 'react';
import { Download, Upload, Archive, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

// B3 拆分：备份中心的三张子卡各自成组件（原 129 行的单卡函数拆分）。
interface FullCardProps {
  isFullBackingUp: boolean;
  isRestoring: boolean;
  onFullBackup: () => void;
}

export const BackupFullCard: React.FC<FullCardProps> = ({
  isFullBackingUp,
  isRestoring,
  onFullBackup,
}) => (
  <div className="p-4 bg-teal-50/50 dark:bg-teal-950/20 rounded-2xl border border-teal-200/80 dark:border-teal-800/60 hover:border-teal-400 transition-colors">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Archive className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            全量系统备份（含图片附件）
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white tracking-wide">
            强烈推荐
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          将 SQLite 数据库与全部资产照片、出库单凭证（<code className="text-[11px] font-mono bg-teal-100/70 dark:bg-teal-900/60 px-1 py-0.5 rounded text-teal-800 dark:text-teal-200">uploads/</code> 目录）统一打包压缩为 <code className="text-[11px] font-mono text-teal-700 dark:text-teal-300">.tar.gz</code> 归档包。解压到新服务器图片信息完好如初。
        </p>
      </div>
      <Button 
        variant="primary"
        size="sm"
        disabled={isFullBackingUp || isRestoring}
        onClick={onFullBackup}
        className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shrink-0 self-start sm:self-center cursor-pointer disabled:opacity-50"
      >
        {isFullBackingUp ? (
          <span className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            打包压缩中...
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            立即全量打包备份
          </span>
        )}
      </Button>
    </div>
  </div>
);

interface RestoreCardProps {
  isRestoring: boolean;
  isFullBackingUp: boolean;
  restoreInputRef: React.RefObject<HTMLInputElement | null>;
}

export const BackupRestoreCard: React.FC<RestoreCardProps> = ({
  isRestoring,
  isFullBackingUp,
  restoreInputRef,
}) => (
  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 transition-colors">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            全量数据恢复 / 导入
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            支持 .tar.gz
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          上传由本系统导出的全量备份压缩包。系统将在自动创建安全快照后，一键完整恢复数据库并覆盖解压全部实物图片。
        </p>
      </div>
      <Button 
        variant="secondary"
        size="sm"
        disabled={isRestoring || isFullBackingUp}
        onClick={() => restoreInputRef.current?.click()}
        className="bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 shrink-0 self-start sm:self-center cursor-pointer disabled:opacity-50"
      >
        {isRestoring ? (
          <span className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            正在解压还原...
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            选择备份包导入恢复
          </span>
        )}
      </Button>
    </div>
  </div>
);

interface LightCardProps {
  isFullBackingUp: boolean;
  isRestoring: boolean;
  onLightBackup: () => void;
}

export const BackupLightCard: React.FC<LightCardProps> = ({
  isFullBackingUp,
  isRestoring,
  onLightBackup,
}) => (
  <div className="p-4 bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-700/50">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="space-y-1">
        <p className="font-medium text-sm text-slate-800 dark:text-slate-200">
          轻量数据库备份（仅 .db）
        </p>
        <p className="text-xs text-slate-400">
          仅下载 SQLite 数据库文件（不包含图片），适用于仅需快速核验台账记录的轻量场景。
        </p>
      </div>
      <Button 
        variant="secondary"
        size="sm"
        disabled={isFullBackingUp || isRestoring}
        onClick={onLightBackup}
        className="shrink-0 self-start sm:self-center text-xs"
      >
        仅备份 .db
      </Button>
    </div>
  </div>
);
