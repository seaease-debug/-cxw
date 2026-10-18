import React from "react";
import { Asset, UserRole } from "../../../types";
import { canManageAssets, isReadOnlyStatus } from "./shared";

export interface LocationCellProps {
  asset: Asset;
  cellClass: string;
  userRole: UserRole;
  openEditModal: (asset: Asset) => void;
}

/**
 * 位置单元格。
 *
 * 原实现把同一条「可管理角色 && 非只读三态」判据在 className / title / onClick
 * 三处**各写了一遍**（各 4 个条件分支）；此处收敛为一个 `editable` 布尔量。
 */
export const LocationCell: React.FC<LocationCellProps> = ({
  asset,
  cellClass,
  userRole,
  openEditModal,
}) => {
  const editable =
    canManageAssets(userRole) && !isReadOnlyStatus(asset.currentStatus);
  return (
    <td className={cellClass}>
      <div
        className={`flex items-center space-x-1 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors ${
          editable ? "cursor-pointer hover:text-teal-600" : ""
        }`}
        title={editable ? "点击修改位置" : ""}
        onClick={() => (editable ? openEditModal(asset) : null)}
      >
        <span>📍</span>
        <span>{asset.warehouseLocation || asset.currentLocationId}</span>
      </div>
    </td>
  );
};
