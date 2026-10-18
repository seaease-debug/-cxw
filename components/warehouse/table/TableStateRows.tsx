import React from "react";
import { Package } from "lucide-react";
import { ErrorState } from "../../ui/ErrorState";

export interface TableErrorRowProps {
  colSpan: number;
  errorMsg: string;
  onRetry: () => void;
}

/** 加载失败整行。 */
export const TableErrorRow: React.FC<TableErrorRowProps> = ({
  colSpan,
  errorMsg,
  onRetry,
}) => (
  <tr>
    <td colSpan={colSpan} className="py-8">
      <ErrorState message={errorMsg} onRetry={onRetry} />
    </td>
  </tr>
);

export interface TableEmptyRowProps {
  colSpan: number;
}

/** 筛选无结果整行。 */
export const TableEmptyRow: React.FC<TableEmptyRowProps> = ({ colSpan }) => (
  <tr>
    <td colSpan={colSpan} className="px-4">
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <Package className="w-7 h-7 text-slate-300 dark:text-slate-600" />
        </div>
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          未找到匹配的资产
        </h4>
        <p className="text-xs text-slate-400 text-center max-w-xs">
          没有资产符合当前的筛选条件，试试更换搜索词或状态标签。
        </p>
      </div>
    </td>
  </tr>
);
