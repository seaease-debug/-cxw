// components/assetDetail/HistorySection.tsx
// 右栏 · 流转记录轨迹：加载骨架 / 记录列表 / 空态。
import React from "react";
import { History } from "lucide-react";
import { AssetHistory } from "../../types";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { formatHistoryDescription, resolveHistoryStyle } from "./derived";

interface HistorySectionProps {
  history: AssetHistory[];
  historyLoading: boolean;
  isLoggedIn: boolean;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  history,
  historyLoading,
  isLoggedIn,
}) => (
  <section>
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
        <History className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        <span>流转记录轨迹</span>
      </h3>
      <span className="text-xs font-mono text-slate-400">共 {history.length} 条记录</span>
    </div>

    <div className="relative pl-6 space-y-4 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
      <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
      {historyLoading ? (
        Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="relative pl-2 space-y-1.5 animate-pulse">
            <div className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-900 z-10"></div>
            <div className="flex justify-between items-center">
              <Skeleton height="0.875rem" width="25%" className="rounded" />
              <Skeleton height="0.75rem" width="30%" className="rounded" />
            </div>
            <Skeleton height="0.75rem" width="70%" className="rounded" />
            <Skeleton height="0.75rem" width="45%" className="rounded" />
          </div>
        ))
      ) : history.length > 0 ? (
        history.map((log, idx) => {
          const { dotBg, titleStyle } = resolveHistoryStyle(log.action_type);
          const cleanDesc = formatHistoryDescription(log.description, isLoggedIn);

          return (
            <div key={idx} className="relative pl-2 group">
              <div
                className={`absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full ${dotBg} ring-4 ring-white dark:ring-slate-900 z-10`}
              ></div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs ${titleStyle}`}>{log.action_type}</p>
                  <span className="text-xs font-mono text-slate-400 shrink-0">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                {cleanDesc && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {cleanDesc}
                  </p>
                )}
                <p className="text-xs text-slate-400">操作人: {log.operator || "系统"}</p>
              </div>
            </div>
          );
        })
      ) : (
        <EmptyState
          icon={<History size={24} className="text-slate-400" />}
          title="暂无流转记录"
          description="该资产暂无生命周期与操作流转记录。"
          className="p-6"
        />
      )}
    </div>
  </section>
);
