import { Asset, AssetStatus, UserRole } from "../../../types";
import type { BadgeTone } from "../../ui/Badge";
import {
  isRecycledPendingStatus,
  isScrapPendingStatus,
} from "../warehouseUtils";

/**
 * B2b 拆分的共享判据。
 *
 * 为什么单独成文件：这三条判据在表格里被**并列重复**了多次
 * （角色判据 8 次、只读三态 4 次、colSpan 2 次）。逐字重复的判据一旦
 * 只改一处就会产生「改了这个入口、漏了那个入口」的不一致 —— 收敛到
 * 一处后，改行为只有一个入口。
 */

/** 可执行管理操作的角色（admin / keeper）。 */
export const canManageAssets = (userRole: UserRole): boolean =>
  userRole === UserRole.ADMIN || userRole === UserRole.KEEPER;

/** 只读三态：待周转 / 待报废 / 已报废。 */
export const isReadOnlyStatus = (status: AssetStatus): boolean =>
  status === AssetStatus.RECYCLED_PENDING ||
  status === AssetStatus.SCRAP_PENDING ||
  status === AssetStatus.SCRAPPED;

/**
 * 行状态徽章色调。
 * 口径：超期优先于一切（与 displayStatus 的「待报废 (超期)」文案一致），
 * 其后按 status 权威值域映射；未命中任何分支回落 slate。
 */
export const computeStatusTone = (
  status: AssetStatus,
  isOverdue: boolean,
): BadgeTone => {
  if (isOverdue) return "slate";
  if (status === AssetStatus.NEW_IN_WAREHOUSE) return "teal";
  if (status === AssetStatus.IN_USE) return "emerald";
  if (isRecycledPendingStatus(status)) return "amber";
  if (isScrapPendingStatus(status)) return "rose";
  return "slate";
};

/** 错误行 / 空行的 colSpan（随角色与模式变化，共 4 种取值）。 */
export const colSpanFor = (
  userRole: UserRole,
  isInServiceMode: boolean,
): number => {
  const base = isInServiceMode ? 9 : 7;
  return userRole === UserRole.USER ? base : base + 1;
};

/** 表格类名常量（原为每行重复声明的字面量）。 */
export const ROW_CLASS =
  "hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors";
export const CELL_CLASS = "px-4 py-4";
export const CHECKBOX_CLASS =
  "rounded border-slate-300 text-brand focus:ring-brand cursor-pointer";

/**
 * 行操作回调集合。
 * 打包成一个对象是为了让 `max-params`（S107，上限 7）不被 7 个回调撑爆，
 * 同时让子组件只依赖一个「能做哪些操作」的契约。
 */
export interface TableActionHandlers {
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
