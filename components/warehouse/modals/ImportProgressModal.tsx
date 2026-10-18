import React from "react";
import { motion } from "framer-motion";
import { Upload, AlertTriangle, X } from "lucide-react";
import { Button } from "../../ui/Button";
import { IconButton } from "../../ui/IconButton";

export interface ImportProgressModalProps {
  isImporting: boolean;
  importProgress: number;
  importErrors: string[];
  onCloseErrors: () => void;
}

export const ImportProgressModal: React.FC<ImportProgressModalProps> = ({
  isImporting,
  importProgress,
  importErrors,
  onCloseErrors,
}) => {
  if (!isImporting && importErrors.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-modal-overlay)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden z-[var(--z-modal)] border border-slate-200 dark:border-slate-800"
      >
        {isImporting ? (
          <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-teal-50 dark:bg-teal-950/40 rounded-full flex items-center justify-center border border-teal-100 dark:border-teal-900/40">
              <Upload className="w-8 h-8 text-teal-600 dark:text-teal-400 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                正在批量导入资产...
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                正在解析 CSV 文件数据并进行资产唯一编号自动核验分配
              </p>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden relative">
              <div
                className="bg-teal-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${importProgress}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
              {importProgress}%
            </span>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center border border-rose-100 dark:border-rose-900/40">
                  <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    导入数据格式校验未通过
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    共发现 {importErrors.length} 处数据规范冲突，请修正后重试
                  </p>
                </div>
              </div>
              <IconButton
                icon={<X size={16} />}
                label="关闭"
                onClick={onCloseErrors}
                className="w-7 h-7"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 my-4">
              {importErrors.map((err, idx) => (
                <div
                  key={idx}
                  className="bg-rose-50/70 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-lg p-3 text-xs text-rose-800 dark:text-rose-300 font-mono leading-relaxed"
                >
                  {err}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={onCloseErrors}
              >
                我知道了
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
