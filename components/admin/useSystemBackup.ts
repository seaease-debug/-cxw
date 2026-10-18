import { useRef, useState } from 'react';
import { useToast } from '../Toast';
import { useDialog } from '../ui/DialogContext';
import { logError } from '../../utils/logger';

// B3 拆分：Admin「系统全局参数」里的备份/还原逻辑单独成 hook。
const getBeijingDateString = () => {
  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const nd = new Date(utc + (3600000 * 8));
  const year = nd.getFullYear();
  const month = String(nd.getMonth() + 1).padStart(2, '0');
  const day = String(nd.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** 触发浏览器下载一个 Blob（原 Admin 内联 2 次的同一模式，集中到 1 处）。 */
function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/** 拉取全量备份包（失败时抛出与原文一致的错误文案）。 */
async function fetchFullBackup(): Promise<Blob> {
  const res = await fetch('/api/system/backup-full');
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || '全量打包备份失败');
  }
  return res.blob();
}

/** 上传备份包执行全量还原；成功返回提示文案。 */
async function postRestoreFull(file: File): Promise<string> {
  const res = await fetch('/api/system/restore-full', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    body: file,
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok || !result.success) {
    throw new Error(result.error || '系统全量恢复失败');
  }

  return result.message || '全量系统还原成功！正在重新加载系统...';
}

/** 读取 file input 的首个文件（原内联 `e.target.files?.[0]`，抽出以降低分支数）。 */
function pickFirstFile(e: React.ChangeEvent<HTMLInputElement>): File | null {
  return e.target.files?.[0] ?? null;
}

/** 还原前的风险确认框参数（原内联在 handler 里）。 */
function buildRestoreConfirm(file: File) {
  const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2);
  return {
    title: '⚠️ 风险操作：确认执行系统全量还原？',
    message: `即将使用备份包【${file.name}】（大小: ${fileSizeMb} MB）完整恢复系统数据库与全部图片附件。\n\n恢复前系统将自动生成安全快照。数据覆盖完成后页面将自动刷新，请确认是否继续？`,
    confirmText: '确认还原',
    cancelText: '取消',
    type: 'danger' as const,
  };
}

export function useSystemBackup() {
  const { showToast } = useToast();
  const { confirm } = useDialog();
  const [isFullBackingUp, setIsFullBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const handleFullBackup = async () => {
    try {
      setIsFullBackingUp(true);
      showToast("正在打包系统全量数据（含数据库与全部图片附件），请稍候...", "info");
      const blob = await fetchFullBackup();
      downloadBlob(blob, `eduasset_full_backup_${getBeijingDateString()}.tar.gz`);
      showToast("全量备份包导出成功！图片附件与数据均已封装", "success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '全量备份失败，请稍后重试';
      showToast(msg, "error");
      logError(e);
    } finally {
      setIsFullBackingUp(false);
    }
  };

  const handleLightBackup = async () => {
    try {
      showToast("正在开始备份数据库...", "info");
      const res = await fetch('/api/system/backup');
      if (!res.ok) throw new Error('Backup failed');
      downloadBlob(await res.blob(), `eduasset_backup_${getBeijingDateString()}.db`);
      showToast("数据库备份下载成功", "success");
    } catch (e: unknown) {
      showToast("备份失败，请稍后重试", "error");
      logError(e);
    }
  };

  const handleRestoreFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = pickFirstFile(e);
    if (!file) return;

    // Reset input to allow re-selecting same file
    e.target.value = '';

    if (!(await confirm(buildRestoreConfirm(file)))) return;

    setIsRestoring(true);
    showToast("正在上传并解压还原系统，请勿关闭或刷新浏览器窗口...", "info");
    try {
      showToast(await postRestoreFull(file), 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '全量恢复失败，请检查备份包完整性';
      showToast(msg, 'error');
      logError(err);
    } finally {
      setIsRestoring(false);
    }
  };

  return {
    isFullBackingUp,
    isRestoring,
    restoreInputRef,
    handleFullBackup,
    handleLightBackup,
    handleRestoreFileSelected,
  };
}
