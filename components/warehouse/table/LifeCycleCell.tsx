import React from "react";
import { calculateLifeCycle } from "../warehouseUtils";

export interface LifeCycleCellProps {
  cellClass: string;
  lifeCycle: ReturnType<typeof calculateLifeCycle>;
}

/** 生命周期进度条单元格。 */
export const LifeCycleCell: React.FC<LifeCycleCellProps> = ({
  cellClass,
  lifeCycle,
}) => (
  <td className={cellClass}>
    <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex items-center">
      <div
        className={`h-full ${lifeCycle.color}`}
        style={{ width: `${lifeCycle.percentage}%` }}
      />
    </div>
    <p className="text-xs text-slate-500 dark:text-slate-300 mt-1 font-mono font-bold">
      {lifeCycle.diffYears.toFixed(1)} 年
    </p>
  </td>
);
