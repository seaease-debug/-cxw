import React from "react";
import { Asset } from "../../../../types";

export interface ReturnAssetSummaryProps {
  asset: Asset;
}

/**
 * 单个退库弹窗顶部的「退还资产」摘要块。
 * ★ 批量弹窗**历来没有**这一块（它只显示台数徽标）—— 所以不要「顺手给批量也加上」。
 */
export const ReturnAssetSummary: React.FC<ReturnAssetSummaryProps> = ({
  asset,
}) => (
  <div className="bg-teal-50 dark:bg-teal-950/30 p-4 rounded-xl border border-teal-100 dark:border-teal-900/30">
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-semibold text-teal-400 uppercase">
        退还资产
      </span>
      <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">
        {asset.no}
      </span>
    </div>
    <div className="font-semibold text-slate-800 dark:text-slate-200">
      {asset.brandModel}
    </div>
    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
      原持有人: {asset.currentKeeperId}
    </div>
  </div>
);
