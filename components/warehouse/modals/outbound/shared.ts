import { AssetStatus } from "../../../../types";

/**
 * 出库弹窗（单个 / 批量）共享的**判据**与**类名常量**。
 *
 * ★ 本文件里的类名常量不是「美化」或「统一风格」用的 —— 两个弹窗的类名
 *   **存在既有差异**（见 `CONTROLLED_TAG_*` 与 `*_SANS` 的注释），
 *   抽取时必须**逐字节保留**：渲染产物一旦变化，行为对拍会立刻失败。
 *   要统一它们是「样式批」的事，不是重构批该顺手做的。
 */

/** 受控固定场所——两个弹窗共用同一形状（与调用方传入的结构一致）。 */
export interface FixedLocation {
  id: number;
  name: string;
  description: string;
}

/** 联想下拉的列表容器（批量侧多一个 `font-sans`，见 `SUGGEST_LIST_CLASS_SANS`）。 */
export const SUGGEST_LIST_CLASS =
  "absolute z-[var(--z-dropdown)] w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto";

/** ★ 批量弹窗的领用人联想容器**历来带 `font-sans`**，单个弹窗没有 ⇒ 两者不可合并。 */
export const SUGGEST_LIST_CLASS_SANS = `${SUGGEST_LIST_CLASS} font-sans`;

/** 领用人联想项（`py-2`）。 */
export const KEEPER_ITEM_CLASS =
  "px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center border-b border-slate-50 dark:border-slate-700/50 last:border-0";

/** 位置联想项（`py-2.5`，与领用人不同）。 */
export const LOCATION_ITEM_CLASS =
  "px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center border-b border-slate-50 dark:border-slate-700/50 last:border-0";

/** 领用人联想无结果（`text-sm`）。 */
export const KEEPER_EMPTY_CLASS = "px-4 py-3 text-sm text-slate-400 text-center";

/** 位置联想无结果（`text-xs`）。 */
export const LOCATION_EMPTY_CLASS = "px-4 py-3 text-xs text-slate-400 text-center";

/** 「受控固定场所」徽章 —— 单个弹窗用 `dark:text-emerald-400`。 */
export const CONTROLLED_TAG_SINGLE =
  "text-xs bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold";

/** 「受控固定场所」徽章 —— 批量弹窗用 `dark:text-emerald-300`（★ 与单个不一致，属既有差异）。 */
export const CONTROLLED_TAG_BATCH =
  "text-xs bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold";

/**
 * 批量出库的「可发放」值域：仅这两态允许被批量发放。
 * 单个出库**不走这条判据**（它由调用方在选中时就把关，弹窗内不再过滤）——
 * 这不是遗漏，是既有行为。
 */
export const isOutboundEligible = (status: AssetStatus): boolean =>
  status === AssetStatus.NEW_IN_WAREHOUSE || status === AssetStatus.RECYCLED_PENDING;

/** 领用人联想：部门命中 且 姓名包含输入；空部门/空输入视为不设限。 */
export const matchesKeeperQuery = (
  account: { realName: string; department?: string },
  dept: string,
  text: string,
): boolean => {
  const deptMatch = !dept || account.department === dept;
  const textMatch = !text || account.realName.includes(text);
  return deptMatch && textMatch;
};

/** 位置联想：名称或描述包含输入；空输入视为不设限。 */
export const matchesLocationQuery = (
  loc: { name: string; description?: string },
  text: string,
): boolean =>
  !text || loc.name.includes(text) || !!loc.description?.includes(text);
