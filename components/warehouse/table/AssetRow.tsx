import React from "react";
import { Asset, UserRole } from "../../../types";
import { calculateLifeCycle, calculateServiceDuration } from "../warehouseUtils";
import { TableActionHandlers, computeStatusTone } from "./shared";
import { ServiceModeRow } from "./ServiceModeRow";
import { DefaultAssetRow } from "./DefaultAssetRow";

export interface AssetRowProps {
  asset: Asset;
  userRole: UserRole;
  isInServiceMode: boolean;
  isPendingMode: boolean;
  selectedBatchAssetIds: string[];
  setSelectedBatchAssetIds: React.Dispatch<React.SetStateAction<string[]>>;
  getAssetPhoto: (asset: Asset) => { image: string; isShared: boolean } | null;
  setPreviewImage: (image: string | null) => void;
  handlers: TableActionHandlers;
}

/**
 * 单行派发。
 *
 * 保持原 `paginatedData.map()` 回调的**求值顺序**不变：
 *   `calculateLifeCycle` 对每一行都会调用（服役模式下也调，只是结果不参与渲染），
 *   `calculateServiceDuration` 只在服役模式下调用。
 * 两者虽为纯函数、顺序不可观测，但「搬运式重构」以逐字保序为准。
 */
export const AssetRow: React.FC<AssetRowProps> = ({
  asset,
  userRole,
  isInServiceMode,
  isPendingMode,
  selectedBatchAssetIds,
  setSelectedBatchAssetIds,
  getAssetPhoto,
  setPreviewImage,
  handlers,
}) => {
  const lifeCycle = calculateLifeCycle(asset.purchaseDate, asset.retirementYears);
  const displayStatus =
    lifeCycle.isOverdue && !isInServiceMode
      ? "待报废 (超期)"
      : asset.currentStatus;
  const statusTone = computeStatusTone(asset.currentStatus, lifeCycle.isOverdue);

  if (isInServiceMode) {
    const duration = calculateServiceDuration(asset.purchaseDate);
    return (
      <ServiceModeRow
        asset={asset}
        duration={duration}
        userRole={userRole}
        selectedBatchAssetIds={selectedBatchAssetIds}
        setSelectedBatchAssetIds={setSelectedBatchAssetIds}
        getAssetPhoto={getAssetPhoto}
        setPreviewImage={setPreviewImage}
        handlers={handlers}
      />
    );
  }

  return (
    <DefaultAssetRow
      asset={asset}
      userRole={userRole}
      isPendingMode={isPendingMode}
      lifeCycle={lifeCycle}
      displayStatus={displayStatus}
      statusTone={statusTone}
      selectedBatchAssetIds={selectedBatchAssetIds}
      setSelectedBatchAssetIds={setSelectedBatchAssetIds}
      getAssetPhoto={getAssetPhoto}
      setPreviewImage={setPreviewImage}
      handlers={handlers}
    />
  );
};
