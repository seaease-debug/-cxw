import React from "react";

export interface AutoFilterNoticeProps {
  /** 用户勾选的总台数。 */
  totalSelected: number;
  /** 其中真正可退库（领用服役中）的台数。 */
  validCount: number;
}

/**
 * 批量退库的「自动过滤」提示条：只有**存在非领用服役项**时才出现。
 * ★ 判据写在这里、组件无条件被父级渲染 —— 父组件的分支因此少一个。
 *   文案里的 `{" "}` 是**排版用的显式空格**，不许删（删了渲染产物就变）。
 */
export const AutoFilterNotice: React.FC<AutoFilterNoticeProps> = ({
  totalSelected,
  validCount,
}) => {
  if (validCount >= totalSelected) return null;

  return (
    <div className="mx-8 mt-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 p-4 rounded-xl text-xs font-semibold select-none leading-relaxed">
      ⚙️ <strong>自动过滤提示：</strong>已选中的{" "}
      {totalSelected}{" "}
      台设备中包含非领用服役中的项目。将仅对其中的{" "}
      <strong>{validCount} 台</strong>领用设备批量办理回收退库。
    </div>
  );
};
