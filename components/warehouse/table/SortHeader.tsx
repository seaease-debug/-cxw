import React from "react";
import type { SortConfig, SortKey } from "../useWarehouseData";

export interface SortHeaderProps {
  label: string;
  sortKey: SortKey;
  align?: "left" | "right";
  /** 当前排序配置（决定箭头方向与是否显示箭头）。 */
  sortConfig: SortConfig | null;
  /** 触发排序。 */
  requestSort: (key: SortKey) => void;
}

/**
 * 可排序表头单元格。
 *
 * B2b 之前它定义在 `WarehouseTable` 函数体内（每次渲染都新建一个组件类型，
 * 且整个函数体被计入外层组件的函数规模）；此处原样提到模块级，
 * 只把原来是闭包捕获的 `sortConfig` / `requestSort` 改成显式 props。
 */
export const SortHeader: React.FC<SortHeaderProps> = ({
  label,
  sortKey,
  align = "left",
  sortConfig,
  requestSort,
}) => (
  <th
    className={`px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors select-none ${
      align === "right" ? "text-right" : ""
    }`}
    onClick={() => requestSort(sortKey)}
  >
    <div
      className={`flex items-center space-x-1 ${
        align === "right" ? "justify-end" : ""
      }`}
    >
      <span>{label}</span>
      {sortConfig?.key === sortKey && (
        <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
      )}
    </div>
  </th>
);
