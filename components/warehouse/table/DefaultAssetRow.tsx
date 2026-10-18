import React from "react";
import { Asset, UserRole } from "../../../types";
import { Badge, type BadgeTone } from "../../ui/Badge";
import { formatPrice } from "../../../utils/format";
import { calculateLifeCycle, getTypeColor } from "../warehouseUtils";
import { CELL_CLASS, ROW_CLASS, TableActionHandlers } from "./shared";
import { RowSelectCell } from "./SelectCheckbox";
import { DefaultIdentityCell } from "./AssetIdentityCell";
import { LifeCycleCell } from "./LifeCycleCell";
import { LocationCell } from "./LocationCell";
import { RowActionsCell } from "./RowActionsCell";

export interface DefaultAssetRowProps {
  asset: Asset;
  userRole: UserRole;
  isPendingMode: boolean;
  lifeCycle: ReturnType<typeof calculateLifeCycle>;
  displayStatus: string;
  statusTone: BadgeTone;
  selectedBatchAssetIds: string[];
  setSelectedBatchAssetIds: React.Dispatch<React.SetStateAction<string[]>>;
  getAssetPhoto: (asset: Asset) => { image: string; isShared: boolean } | null;
  setPreviewImage: (image: string | null) => void;
  handlers: TableActionHandlers;
}

/** 默认模式（非服役中）的行。 */
export const DefaultAssetRow: React.FC<DefaultAssetRowProps> = ({
  asset,
  userRole,
  isPendingMode,
  lifeCycle,
  displayStatus,
  statusTone,
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
      <DefaultIdentityCell
        asset={asset}
        cellClass={cellClass}
        userRole={userRole}
        getAssetPhoto={getAssetPhoto}
        setPreviewImage={setPreviewImage}
        openEditModal={handlers.openEditModal}
        setViewingAsset={handlers.setViewingAsset}
      />
      <td className={cellClass}>
        <Badge tone={statusTone}>{displayStatus}</Badge>
      </td>
      <td className={cellClass}>
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${getTypeColor(asset.type)}`}
          />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {asset.type}
          </span>
        </div>
      </td>
      <td
        className={`${cellClass} text-sm font-semibold text-slate-700 dark:text-slate-200`}
      >
        {formatPrice(asset.purchasePrice)}
      </td>
      <LifeCycleCell cellClass={cellClass} lifeCycle={lifeCycle} />
      <LocationCell
        asset={asset}
        cellClass={cellClass}
        userRole={userRole}
        openEditModal={handlers.openEditModal}
      />
      <td
        className={`${cellClass} text-xs font-mono font-medium text-slate-600 dark:text-slate-300`}
      >
        {asset.purchaseDate}
      </td>
      <RowActionsCell
        asset={asset}
        userRole={userRole}
        isPendingMode={isPendingMode}
        cellClass={cellClass}
        handlers={handlers}
      />
    </tr>
  );
};
