import React from "react";
import { Pencil, RotateCcw, Rocket, Trash2 } from "lucide-react";
import { Asset, AssetStatus } from "../../../types";
import { IconButton } from "../../ui/IconButton";
import { TableActionHandlers } from "./shared";

export interface IconGroupProps {
  asset: Asset;
  handlers: TableActionHandlers;
}

/**
 * 默认行操作里的三组图标按钮。
 *
 * 原本是同一条 `{canManage && (status === A ? (...) : status === B ? (...) : (...))}`
 * 里嵌套的三个分支；此处每个分支各自成为一个独立函数 ——
 * 按 AST 分支节点计数的圈复杂度因此分散到三个函数（每个 ~4），
 * 而不是堆在一个函数里（原 `WarehouseTable.tsx:278` 的复杂度是 47）。
 */

/** 服役中：变更 / 退库。 */
export const InUseIconActions: React.FC<IconGroupProps> = ({
  asset,
  handlers,
}) => (
  <>
    <IconButton
      icon={<Pencil size={11} />}
      label="变更"
      onClick={() => handlers.openUpdateModal(asset)}
      size="xs"
      tone="warning"
      className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
    />
    <IconButton
      icon={<RotateCcw size={11} />}
      label="退库"
      onClick={() => handlers.initiateReturn(asset)}
      size="xs"
      tone="warning"
      className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
    />
  </>
);

/** 待周转：再次出库 / 申请报废。 */
export const RecycledPendingIconActions: React.FC<IconGroupProps> = ({
  asset,
  handlers,
}) => (
  <>
    <IconButton
      icon={<Rocket size={11} />}
      label="再次出库"
      onClick={() => handlers.setSelectedAssetForOut(asset)}
      size="xs"
      className="bg-teal-600 text-white hover:bg-teal-500"
    />
    <IconButton
      icon={<Trash2 size={11} />}
      label="申请报废"
      onClick={() => handlers.handleRecycleProcess(asset.id, "scrap")}
      size="xs"
      tone="dangerTint"
      className="bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40"
    />
  </>
);

/** 在库 / 已报废：编辑（仅在库） / 删除（仅在库或已报废）。 */
export const WarehouseIconActions: React.FC<IconGroupProps> = ({
  asset,
  handlers,
}) => (
  <>
    {asset.currentStatus === AssetStatus.NEW_IN_WAREHOUSE && (
      <IconButton
        icon={<Pencil size={11} />}
        label="编辑"
        onClick={() => handlers.openEditModal(asset)}
        size="xs"
        tone="brand"
        className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
      />
    )}

    {(asset.currentStatus === AssetStatus.NEW_IN_WAREHOUSE ||
      asset.currentStatus === AssetStatus.SCRAPPED) && (
      <IconButton
        icon={<Trash2 size={11} />}
        label="删除"
        onClick={() => handlers.handleDelete(asset.id)}
        size="xs"
        tone="danger"
        className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
      />
    )}
  </>
);
