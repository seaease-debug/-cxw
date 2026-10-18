import React from "react";
import { AlertTriangle, Rocket, Trash2 } from "lucide-react";
import { Asset, AssetStatus, UserRole } from "../../../types";
import { Button } from "../../ui/Button";
import { TableActionHandlers, canManageAssets } from "./shared";
import {
  InUseIconActions,
  RecycledPendingIconActions,
  WarehouseIconActions,
} from "./IconActionGroups";

export interface RowActionGroupProps {
  asset: Asset;
  userRole: UserRole;
  handlers: TableActionHandlers;
}

/** 待周转模式：详情 / 再次出库 / 申请报废。 */
export const PendingActions: React.FC<RowActionGroupProps> = ({
  asset,
  userRole,
  handlers,
}) => (
  <>
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
          variant="primary"
          size="sm"
          onClick={() => handlers.setSelectedAssetForOut(asset)}
        >
          <Rocket className="w-3 h-3" /> 再次出库
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handlers.handleRecycleProcess(asset.id, "scrap")}
          className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/40 hover:bg-rose-100"
        >
          <Trash2 className="w-3 h-3" /> 申请报废
        </Button>
      </>
    )}
  </>
);

/** 待报废：详情 / 确认报废。 */
export const ScrapPendingActions: React.FC<RowActionGroupProps> = ({
  asset,
  userRole,
  handlers,
}) => (
  <>
    <Button
      variant="secondary"
      size="sm"
      onClick={() => handlers.setViewingAsset(asset)}
    >
      详情
    </Button>
    {canManageAssets(userRole) && (
      <Button
        variant="danger"
        size="sm"
        onClick={() => handlers.handleRecycleProcess(asset.id, "scrap_confirm")}
      >
        <AlertTriangle className="w-3 h-3" /> 确认报废
      </Button>
    )}
  </>
);

/** 默认（非待周转、非待报废）：详情 + 按状态分派的图标按钮组。 */
export const DefaultActions: React.FC<RowActionGroupProps> = ({
  asset,
  userRole,
  handlers,
}) => (
  <>
    <Button
      variant="secondary"
      size="sm"
      onClick={() => handlers.setViewingAsset(asset)}
    >
      详情
    </Button>

    {canManageAssets(userRole) && (
      <>
        {asset.currentStatus === AssetStatus.IN_USE ? (
          <InUseIconActions asset={asset} handlers={handlers} />
        ) : asset.currentStatus === AssetStatus.RECYCLED_PENDING ? (
          <RecycledPendingIconActions asset={asset} handlers={handlers} />
        ) : (
          <WarehouseIconActions asset={asset} handlers={handlers} />
        )}
      </>
    )}
  </>
);
