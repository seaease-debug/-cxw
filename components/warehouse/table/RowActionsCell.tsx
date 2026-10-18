import React from "react";
import { Rocket } from "lucide-react";
import { Asset, AssetStatus, UserRole } from "../../../types";
import { Button } from "../../ui/Button";
import { TableActionHandlers, canManageAssets } from "./shared";
import { PendingActions, ScrapPendingActions, DefaultActions } from "./RowActionGroups";

export interface RowActionsCellProps {
  asset: Asset;
  userRole: UserRole;
  isPendingMode: boolean;
  cellClass: string;
  handlers: TableActionHandlers;
}

/**
 * 默认行的「操作」单元格。
 *
 * ★ 四个分支**不是互斥**的，必须原样保留各自的独立条件：
 *   - 「出库」只看 `status === 在库 && 可管理`，与 isPendingMode 无关
 *     （所以在待周转筛选下，一台在库资产会同时出现「出库」与「再次出库」）；
 *   - 后三个分支才是 `isPendingMode` / `SCRAP_PENDING` / 「其余」的派发。
 */
export const RowActionsCell: React.FC<RowActionsCellProps> = ({
  asset,
  userRole,
  isPendingMode,
  cellClass,
  handlers,
}) => (
  <td className={`${cellClass} text-right`}>
    <div className="flex items-center justify-end space-x-2">
      {canManageAssets(userRole) &&
        asset.currentStatus === AssetStatus.NEW_IN_WAREHOUSE && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handlers.setSelectedAssetForOut(asset)}
          >
            <Rocket className="w-3 h-3" /> 出库
          </Button>
        )}

      {isPendingMode && (
        <PendingActions asset={asset} userRole={userRole} handlers={handlers} />
      )}

      {asset.currentStatus === AssetStatus.SCRAP_PENDING && (
        <ScrapPendingActions
          asset={asset}
          userRole={userRole}
          handlers={handlers}
        />
      )}

      {!isPendingMode && asset.currentStatus !== AssetStatus.SCRAP_PENDING && (
        <DefaultActions asset={asset} userRole={userRole} handlers={handlers} />
      )}
    </div>
  </td>
);
