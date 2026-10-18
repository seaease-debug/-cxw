import React from "react";
import { Asset } from "../../../types";
import { Button } from "../../ui/Button";

export interface TablePaginationProps {
  filtered: Asset[];
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  totalPages: number;
}

/** 分页条。 */
export const TablePagination: React.FC<TablePaginationProps> = ({
  filtered,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  totalPages,
}) => (
  <div className="bg-slate-50 dark:bg-slate-900 p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
    <div className="text-xs font-semibold text-slate-400">
      显示{" "}
      {Math.min(filtered.length, (currentPage - 1) * itemsPerPage + 1)} -{" "}
      {Math.min(filtered.length, currentPage * itemsPerPage)} 条，共{" "}
      {filtered.length} 条
    </div>
    <div className="flex space-x-2">
      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((p) => p - 1)}
      >
        ← 上一页
      </Button>
      <div className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100">
        {currentPage} / {totalPages || 1}
      </div>
      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage === totalPages || totalPages === 0}
        onClick={() => setCurrentPage((p) => p + 1)}
      >
        下一页 →
      </Button>
    </div>
  </div>
);
