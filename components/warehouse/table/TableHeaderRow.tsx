import React from "react";
import { Asset, UserRole } from "../../../types";
import type { SortConfig, SortKey } from "../useWarehouseData";
import { SortHeader } from "./SortHeader";
import { SelectCheckbox } from "./SelectCheckbox";

export interface TableHeaderRowProps {
  userRole: UserRole;
  isInServiceMode: boolean;
  paginatedData: Asset[];
  selectedBatchAssetIds: string[];
  setSelectedBatchAssetIds: React.Dispatch<React.SetStateAction<string[]>>;
  sortConfig: SortConfig | null;
  requestSort: (key: SortKey) => void;
}

/** 表头行：全选勾选框 + 两套列定义（服役模式 / 默认模式）。 */
export const TableHeaderRow: React.FC<TableHeaderRowProps> = ({
  userRole,
  isInServiceMode,
  paginatedData,
  selectedBatchAssetIds,
  setSelectedBatchAssetIds,
  sortConfig,
  requestSort,
}) => (
  <tr>
    {userRole !== UserRole.USER && (
      <th className="px-4 py-3 w-10 text-center">
        <SelectCheckbox
          checked={
            paginatedData.length > 0 &&
            paginatedData.every((a) => selectedBatchAssetIds.includes(a.id))
          }
          onChange={(isChecked) => {
            if (isChecked) {
              const pageIds = paginatedData.map((a) => a.id);
              setSelectedBatchAssetIds((prev) =>
                Array.from(new Set([...prev, ...pageIds])),
              );
            } else {
              const pageIds = paginatedData.map((a) => a.id);
              setSelectedBatchAssetIds((prev) =>
                prev.filter((id) => !pageIds.includes(id)),
              );
            }
          }}
        />
      </th>
    )}
    {isInServiceMode ? (
      <>
        <SortHeader
          label="品牌型号"
          sortKey="brandModel"
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
        <SortHeader
          label="状态"
          sortKey="currentStatus"
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
        <SortHeader
          label="领用人"
          sortKey="currentKeeperId"
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
        <SortHeader
          label="所属部门"
          sortKey="departmentId"
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
        <SortHeader
          label="物理位置"
          sortKey="currentLocationId"
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
        <SortHeader
          label="领用日期"
          sortKey="outboundDate"
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
        <SortHeader
          label="服役时长"
          sortKey="duration"
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
        <th className="px-4 py-3">凭证</th>
        <SortHeader
          label="价值"
          sortKey="purchasePrice"
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
        <th className="px-4 py-3 text-right">操作</th>
      </>
    ) : (
      <>
        <SortHeader
          label="品牌型号"
          sortKey="brandModel"
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
        <SortHeader
          label="状态"
          sortKey="currentStatus"
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
        <SortHeader
          label="类型"
          sortKey="type"
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
        <SortHeader
          label="采购金额"
          sortKey="purchasePrice"
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
        <SortHeader
          label="生命周期"
          sortKey="lifeCycle"
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
        <SortHeader
          label="位置"
          sortKey="warehouseLocation"
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
        <SortHeader
          label="入库日期"
          sortKey="purchaseDate"
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
        <th className="px-4 py-3 text-right">操作</th>
      </>
    )}
  </tr>
);
