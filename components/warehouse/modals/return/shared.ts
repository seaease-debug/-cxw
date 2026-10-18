import type { ChangeEvent } from "react";
import {
  Asset,
  AssetStatus,
  WAREHOUSE_CODES,
  Warehouse as WarehouseRecord,
} from "../../../../types";

/**
 * 退库弹窗（单个 / 批量）共享的**判据**与**类名常量**。
 *
 * ★ 与 `../outbound/shared.ts` 同一纪律：这里的类名常量不是「美化」或「统一风格」
 *   用的 —— 两个弹窗的类名**存在既有差异**（单个的选中圆点是 `w-2 h-2`、批量是
 *   `w-2.5 h-2.5`；上传区单个走 teal、批量走 amber），抽取时必须**逐字节保留**：
 *   渲染产物一旦变化，行为对拍会立刻失败。要统一它们是「样式批」的事（C11 清单），
 *   不是重构批该顺手做的。
 *
 * ★ 类名一律写成**完整字面量**（不做 `border-${tone}-500` 这类拼接）——
 *   Tailwind v4 扫源码生成 CSS，动态拼接出来的类名不会被生成。
 */

/** 退库后状态评估卡的两种配色族（对应 RECYCLED_PENDING / SCRAP_PENDING）。 */
export type ReturnCardTone = "emerald" | "rose";

interface CardToneClasses {
  /** 选中：外框 + 底色。 */
  selected: string;
  /** 未选中：外框 + hover 态。 */
  idle: string;
  /** 选中：圆点外圈。 */
  dotBorder: string;
  /** 选中：圆点实心。 */
  dotBg: string;
  /** 选中：标题色。 */
  title: string;
}

export const RETURN_CARD_TONE: Record<ReturnCardTone, CardToneClasses> = {
  emerald: {
    selected:
      "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-700",
    idle: "border-slate-200 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-slate-50 dark:hover:bg-slate-800",
    dotBorder: "border-emerald-600",
    dotBg: "bg-emerald-600",
    title: "text-emerald-800 dark:text-emerald-300",
  },
  rose: {
    selected:
      "border-rose-500 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-700",
    idle: "border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-800 hover:bg-slate-50 dark:hover:bg-slate-800",
    dotBorder: "border-rose-600",
    dotBg: "bg-rose-600",
    title: "text-rose-800 dark:text-rose-300",
  },
};

/** 未选中时圆点的外圈 —— 两个配色族共用同一串。 */
export const DOT_IDLE_BORDER = "border-slate-300 dark:border-slate-600";

/** ★ 单个弹窗的选中圆点尺寸。 */
export const DOT_SIZE_SINGLE = "w-2 h-2";

/** ★ 批量弹窗的选中圆点尺寸（比单个大 0.5，属既有差异，不合并）。 */
export const DOT_SIZE_BATCH = "w-2.5 h-2.5";

/** 未选中时的标题色。 */
export const OPTION_TITLE_IDLE = "text-slate-600 dark:text-slate-300";

/** 上传区两种配色族（单个 teal / 批量 amber）。 */
export type ReturnUploadTone = "teal" | "amber";

interface UploadToneClasses {
  /** 已有图：虚线框样式。 */
  filledBox: string;
  /** 无图：虚线框样式。 */
  idleBox: string;
  /** 已有图时那行提示的字色。 */
  filledHint: string;
}

export const RETURN_UPLOAD_TONE: Record<ReturnUploadTone, UploadToneClasses> = {
  teal: {
    filledBox:
      "border-teal-300 bg-teal-50 dark:bg-teal-950/30 dark:border-teal-700",
    idleBox:
      "border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-slate-50 dark:hover:bg-slate-800",
    filledHint: "text-teal-600 dark:text-teal-400",
  },
  amber: {
    filledBox:
      "border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700",
    idleBox:
      "border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-slate-50 dark:hover:bg-slate-800",
    filledHint: "text-amber-600 dark:text-amber-400",
  },
};

/** 仓库下拉选项：优先用真实仓库表，为空时回退到 `WAREHOUSE_CODES` 的键。 */
export const buildWarehouseOptions = (
  warehouseList: WarehouseRecord[],
): { value: string; label: string }[] =>
  warehouseList.length > 0
    ? warehouseList.map((w) => ({ value: w.name, label: w.name }))
    : Object.keys(WAREHOUSE_CODES).map((w) => ({ value: w, label: w }));

/**
 * 批量的「可退库」判据：被选中 **且** 处于领用服役中。
 * ★ 单个弹窗**不走这条**（它在选中时就把关、弹窗内不再过滤）—— 这不是遗漏，是既有行为。
 */
export const pickReturnableAssets = (
  realAssets: Asset[],
  selectedIds: string[],
): Asset[] =>
  realAssets.filter(
    (a) => selectedIds.includes(a.id) && a.currentStatus === AssetStatus.IN_USE,
  );

/**
 * 读图 → dataURL 的 handler 工厂。
 * ★ 批量弹窗原先把这个 handler 内联在 JSX 上，两个分支（`?.` 与 `if`）都计进
 *   了组件复杂度 ⇒ 提到模块级，组件里只剩一次函数调用。
 */
export const makeImageUploadHandler =
  (setImage: (img: string | null) => void) =>
  (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
