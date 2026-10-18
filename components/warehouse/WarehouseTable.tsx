import React from "react";
import { Asset, AssetStatus, UserRole } from "../../types";
import type { SortConfig, SortKey } from "./useWarehouseData";
import { colSpanFor, type TableActionHandlers } from "./table/shared";
import { TableHeaderRow } from "./table/TableHeaderRow";
import { TableSkeletonRows } from "./table/TableSkeletonRows";
import { TableErrorRow, TableEmptyRow } from "./table/TableStateRows";
import { AssetRow } from "./table/AssetRow";
import { TablePagination } from "./table/TablePagination";

export interface WarehouseTableProps {
  loading: boolean;
  errorMsg: string | null;
  onRetry: () => void;
  paginatedData: Asset[];
  filtered: Asset[];
  statusFilter: string;
  userRole: UserRole;
  selectedBatchAssetIds: string[];
  setSelectedBatchAssetIds: React.Dispatch<React.SetStateAction<string[]>>;
  sortConfig: SortConfig | null;
  requestSort: (key: SortKey) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  totalPages: number;
  getAssetPhoto: (asset: Asset) => { image: string; isShared: boolean } | null;
  setPreviewImage: (image: string | null) => void;
  setViewingAsset: (asset: Asset | null) => void;
  openEditModal: (asset: Asset) => void;
  openUpdateModal: (asset: Asset) => void;
  setSelectedAssetForOut: (asset: Asset | null) => void;
  initiateReturn: (asset: Asset) => void;
  handleRecycleProcess: (
    assetId: string,
    action: "restock" | "scrap" | "scrap_confirm",
  ) => void;
  handleDelete: (id: string) => void;
}

/**
 * 资产表格外壳。
 *
 * B2b 拆分前：786 行单文件，其中 `paginatedData.map()` 回调独占 445 行、
 * 复杂度 47（全项目第二差），且 `SortHeader` 定义在组件体内被重复计入函数规模。
 * 拆分后本文件只负责「三态派发（骨架 / 错误 / 数据）+ 分页」，
 * 表体、单元格、操作簇各自独立成模块：
 *
 *   table/shared.ts              角色/只读/色调/colSpan 判据 + 类名常量
 *   table/SortHeader.tsx         可排序表头
 *   table/TableHeaderRow.tsx     表头行（两套列定义）
 *   table/TableSkeletonRows.tsx  骨架屏
 *   table/TableStateRows.tsx     错误行 / 空行
 *   table/AssetRow.tsx           行派发（服役模式 / 默认）
 *   table/ServiceModeRow.tsx     服役模式行
 *   table/DefaultAssetRow.tsx    默认行
 *   table/AssetIdentityCell.tsx  型号+序列号单元格 + 📷 标签
 *   table/LifeCycleCell.tsx      生命周期进度条
 *   table/LocationCell.tsx       位置单元格
 *   table/RowActionsCell.tsx     操作单元格（4 个非互斥分支）
 *   table/RowActionGroups.tsx    待周转 / 待报废 / 默认 三个动作组
 *   table/IconActionGroups.tsx   服役中 / 待周转 / 在库 三组图标按钮
 *   table/SelectCheckbox.tsx     勾选框 + 行勾选单元格
 *   table/TablePagination.tsx    分页条
 */
export const WarehouseTable: React.FC<WarehouseTableProps> = ({
  loading,
  errorMsg,
  onRetry,
  paginatedData,
  filtered,
  statusFilter,
  userRole,
  selectedBatchAssetIds,
  setSelectedBatchAssetIds,
  sortConfig,
  requestSort,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  totalPages,
  getAssetPhoto,
  setPreviewImage,
  setViewingAsset,
  openEditModal,
  openUpdateModal,
  setSelectedAssetForOut,
  initiateReturn,
  handleRecycleProcess,
  handleDelete,
}) => {
  const isInServiceMode = statusFilter === AssetStatus.IN_USE;
  const isPendingMode = statusFilter === AssetStatus.RECYCLED_PENDING;
  const colSpan = colSpanFor(userRole, isInServiceMode);

  const handlers: TableActionHandlers = {
    setViewingAsset,
    openEditModal,
    openUpdateModal,
    setSelectedAssetForOut,
    initiateReturn,
    handleRecycleProcess,
    handleDelete,
  };

  return (
    <>
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 sticky top-0 z-[var(--z-sticky)]">
            <TableHeaderRow
              userRole={userRole}
              isInServiceMode={isInServiceMode}
              paginatedData={paginatedData}
              selectedBatchAssetIds={selectedBatchAssetIds}
              setSelectedBatchAssetIds={setSelectedBatchAssetIds}
              sortConfig={sortConfig}
              requestSort={requestSort}
            />
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
            {loading ? (
              <TableSkeletonRows
                userRole={userRole}
                isInServiceMode={isInServiceMode}
              />
            ) : errorMsg ? (
              <TableErrorRow
                colSpan={colSpan}
                errorMsg={errorMsg}
                onRetry={onRetry}
              />
            ) : (
              paginatedData.map((a) => (
                <AssetRow
                  key={a.id}
                  asset={a}
                  userRole={userRole}
                  isInServiceMode={isInServiceMode}
                  isPendingMode={isPendingMode}
                  selectedBatchAssetIds={selectedBatchAssetIds}
                  setSelectedBatchAssetIds={setSelectedBatchAssetIds}
                  getAssetPhoto={getAssetPhoto}
                  setPreviewImage={setPreviewImage}
                  handlers={handlers}
                />
              ))
            )}

            {!loading && !errorMsg && paginatedData.length === 0 && (
              <TableEmptyRow colSpan={colSpan} />
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        filtered={filtered}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
      />
    </>
  );
};
