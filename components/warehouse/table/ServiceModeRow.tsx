import React from "react";
import { Asset, UserRole } from "../../../types";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { formatPrice } from "../../../utils/format";
import { CELL_CLASS, ROW_CLASS, TableActionHandlers, canManageAssets } from "./shared";
import { RowSelectCell } from "./SelectCheckbox";
import { ServiceIdentityCell } from "./AssetIdentityCell";

export interface ServiceModeRowProps {
  asset: Asset;
  duration: number | "-";
  userRole: UserRole;
  selectedBatchAssetIds: string[];
  setSelectedBatchAssetIds: React.Dispatch<React.SetStateAction<string[]>>;
  getAssetPhoto: (asset: Asset) => { image: string; isShared: boolean } | null;
  setPreviewImage: (image: string | null) => void;
  handlers: TableActionHandlers;
}

/**
 * 服役模式（`statusFilter === 服役中`）的行：列定义与默认行完全不同
 * —— 展示领用人 / 部门 / 物理位置 / 领用日期 / 服役时长 / 凭证。
 */
export const ServiceModeRow: React.FC<ServiceModeRowProps> = ({
  asset,
  duration,
  userRole,
  selectedBatchAssetIds,
  setSelectedBatchAssetIds,
  getAssetPhoto,
  setPreviewImage,
  handlers,
}) => {
  const cellClass = CELL_CLASS;
  return (
    <tr className={ROW_CLASS}>
      {userRole !== UserRole.USER && (
        <RowSelectCell
          assetId={asset.id}
          checked={selectedBatchAssetIds.includes(asset.id)}
          setSelectedBatchAssetIds={setSelectedBatchAssetIds}
        />
      )}
      <ServiceIdentityCell
        asset={asset}
        cellClass={cellClass}
        getAssetPhoto={getAssetPhoto}
        setPreviewImage={setPreviewImage}
      />
      <td className={cellClass}>
        <Badge tone="emerald">服役中</Badge>
      </td>
      <td className={cellClass}>
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          {asset.currentKeeperId || "未知"}
        </p>
      </td>
      <td className={cellClass}>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {asset.departmentId}
        </p>
      </td>
      <td className={cellClass}>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {asset.currentLocationId}
        </p>
      </td>
      <td className={cellClass}>
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
          {asset.outboundDate || "-"}
        </p>
      </td>
      <td className={cellClass}>
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-mono tabular-nums">
          {typeof duration === "number" ? duration.toFixed(1) : duration}{" "}
          年
        </span>
      </td>
      <td className={cellClass}>
        {asset.voucherImage ? (
          <Badge
            tone="teal"
            className="cursor-zoom-in hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors"
            onClick={() => setPreviewImage(asset.voucherImage!)}
          >
            📄 已签字
          </Badge>
        ) : (
          <Badge tone="amber">⚠️ 待补</Badge>
        )}
      </td>
      <td
        className={`${cellClass} text-xs font-semibold text-slate-700 dark:text-slate-200 font-mono tabular-nums`}
      >
        {formatPrice(asset.purchasePrice || 0)}
      </td>
      <td className={`${cellClass} text-right`}>
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlers.setViewingAsset(asset)}
          >
            详情
          </Button>
          {canManageAssets(userRole) && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlers.openUpdateModal(asset)}
              >
                变更
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlers.initiateReturn(asset)}
                className="bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60"
              >
                退库
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};
