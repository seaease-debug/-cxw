import React from 'react';
import { BackupCenter } from './BackupCenter';
import { MigrationGuide } from './MigrationGuide';
import { useSystemBackup } from './useSystemBackup';

// B3 拆分：Admin「系统全局参数」tab 的薄容器 —— 逻辑在 useSystemBackup，
// 两张卡分别在 BackupCenter / MigrationGuide。渲染结构与原内联 JSX 一致。
export const BackupPanel: React.FC = () => {
  const {
    isFullBackingUp,
    isRestoring,
    restoreInputRef,
    handleFullBackup,
    handleLightBackup,
    handleRestoreFileSelected,
  } = useSystemBackup();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-2">
      {/* 隐藏的备份包上传恢复 input */}
      <input
        ref={restoreInputRef}
        type="file"
        accept=".tar.gz,.gz,.tar"
        onChange={handleRestoreFileSelected}
        className="hidden"
        aria-label="选择全量备份文件"
      />

      <BackupCenter
        isFullBackingUp={isFullBackingUp}
        isRestoring={isRestoring}
        restoreInputRef={restoreInputRef}
        onFullBackup={handleFullBackup}
        onLightBackup={handleLightBackup}
      />

      <MigrationGuide />
    </div>
  );
};
