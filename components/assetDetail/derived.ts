// components/assetDetail/derived.ts
// AssetDetail 的纯派生逻辑：把 props / state 换算成页面上要显示的值。
// ★ 全部是纯函数（不持有状态、不碰 DOM），便于单独推理与对拍。
import { Asset, AssetStatus, Supplier } from "../../types";
import type { BadgeTone } from "../ui/Badge";
import { AccountLite, DEFAULT_HISTORY_STYLE } from "./shared";

/** 剩余天数文案：`2100` → `5.75 年 (70个月)`；≤ 0 → `已超期`。 */
export const formatRemainingDays = (days: number): string => {
  if (days <= 0) return "已超期";
  const yearsDecimal = (days / 365).toFixed(2);
  const totalMonths = Math.floor(days / 30);
  return `${yearsDecimal} 年 (${totalMonths}个月)`;
};

/** 已服役时长：`2024-01-05` → `1年2个月`；无日期 → `未记录`。 */
export const calculateUsedTime = (purchaseDate: string): string => {
  if (!purchaseDate) return "未记录";
  const start = new Date(purchaseDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  let result = "";
  if (years > 0) result += `${years}年`;
  if (months > 0 || years === 0) result += `${months}个月`;
  return result;
};

/**
 * 生命周期：返回标准报废年限与进度条百分比。
 * ★ 「已用 > 0 时保底 8%」是原实现的刻意行为（保证非零进度可见），保持不动。
 */
export const computeLifecycle = (
  asset: Asset,
): { totalRetirementYears: number; lifePercentage: number } => {
  const totalRetirementYears = asset.retirementYears || 8;
  const totalDays = totalRetirementYears * 365;
  let usedDays = 0;
  if (asset.purchaseDate) {
    const pDate = new Date(asset.purchaseDate);
    const now = new Date();
    if (!isNaN(pDate.getTime())) {
      const diffMs = Math.max(0, now.getTime() - pDate.getTime());
      usedDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }
  } else if (asset.remainingDays !== undefined) {
    usedDays = Math.max(0, totalDays - asset.remainingDays);
  }

  const rawPct = (usedDays / totalDays) * 100;
  const lifePercentage = usedDays > 0 ? Math.min(100, Math.max(8, Math.round(rawPct))) : 0;
  return { totalRetirementYears, lifePercentage };
};

/** 展示用状态：优先 currentStatus，回退 status，再回退「新设备在库」。 */
export const resolveDisplayStatus = (asset: Asset): string =>
  asset.currentStatus || asset.status || "新设备在库";

/** 状态徽章色调。 */
export const resolveStatusTone = (displayStatus: string): BadgeTone => {
  if (displayStatus === AssetStatus.IN_USE) return "teal";
  if (displayStatus === AssetStatus.IN_REPAIR) return "amber";
  if (displayStatus === AssetStatus.SCRAPPED) return "rose";
  return "slate";
};

/** 保管人展示名。 */
export const resolveDisplayKeeper = (asset: Asset): string =>
  asset.currentKeeperId || "未指定保管人";

/** 在账号表里按 realName / username 匹配保管人。 */
export const matchKeeperAccount = (
  accountList: AccountLite[],
  keeperId: string,
): AccountLite | undefined =>
  accountList.find(
    (a) => (a.realName && a.realName === keeperId) || (a.username && a.username === keeperId),
  );

/** 使用人所属部门：先看保管人账号，再逐级回退，最后落到「科技信息中心」。 */
export const resolveDepartment = (asset: Asset, matchedKeeper?: AccountLite): string =>
  matchedKeeper?.department ||
  asset.departmentId ||
  asset.department ||
  asset.dept ||
  "科技信息中心";

/** 服役中/维修中 → 自行保管；否则 → 仓库位置（含 currentLocationId / location 回退）。 */
export const resolveDisplayLocation = (asset: Asset, isServing: boolean): string =>
  isServing
    ? asset.currentLocationId || asset.location || "自行保管"
    : asset.warehouseLocation ||
      asset.warehouse_location ||
      asset.currentLocationId ||
      asset.location ||
      "1楼小仓库";

/**
 * 报修弹窗里的存放位置。
 * ★ 与原主区域口径**不同**：只把「服役中」算服役（不含「维修中」），且非服役分支
 *   不回退 currentLocationId / location。故单独一份，不与上面合并。
 */
export const resolveModalLocation = (asset: Asset): string =>
  (asset.currentStatus || asset.status) === AssetStatus.IN_USE
    ? asset.currentLocationId || asset.location || "自行保管"
    : asset.warehouseLocation || asset.warehouse_location || "1楼小仓库";

/** 供应商展示名：命中供应商表则用其名称，否则非 S1 的原始 id 直接展示，S1/空 → null。 */
export const resolveSupplierName = (
  supplierList: Supplier[],
  asset: Asset,
): string | null => {
  const matched = supplierList.find(
    (s) => s.id === asset.supplierId || s.name === asset.supplierId,
  );
  if (matched) return matched.name;
  return asset.supplierId && asset.supplierId !== "S1" ? asset.supplierId : null;
};

/** 历史条目文案脱敏：未登录时抹掉一切金额（登录态不受影响）。 */
export const formatHistoryDescription = (desc: string, isLoggedIn: boolean): string => {
  let cleanDesc = (desc || "").replace(/资产编号\s*[:：]/g, "编号:");
  if (!isLoggedIn) {
    cleanDesc = cleanDesc
      .replace(
        /(?:花销金额|花费金额|维修金额|维修花费|费用|花销|花费|金额)\s*[:：]?\s*￥?¥?\s*\d+(?:\.\d+)?\s*元?/g,
        "$1: *** (仅登录可见)",
      )
      .replace(/￥¥?\d+(?:\.\d+)?元?/g, "￥*** (仅登录可见)");
  }
  return cleanDesc;
};

// ── 历史条目配色：规则表 + 派发 ─────────────────────────────────────────────
// ★ 原实现是一条 6 段 if/else-if 链（含多处 ||），单独抽成一个函数会让该函数
//   圈复杂度达到 13（> 10）而新增 S1541。拆成 6 个独立谓词后，每个函数各自计分。
// ★ 顺序 = 原 if 链顺序，语义等价于「先命中者胜」。
const isRegisterAction = (s: string) => s.includes("初始") || s.includes("登记");
const isOutboundAction = (s: string) => s.includes("出库") || s.includes("领用");
const isReturnAction = (s: string) =>
  s.includes("退库") || s.includes("归还") || s.includes("回收");
const isRepairAction = (s: string) =>
  s.includes("报修") || s.includes("维修") || s.includes("故障");
const isScrapAction = (s: string) => s.includes("报废");
const isInboundAction = (s: string) => s.includes("入库");

const HISTORY_STYLE_RULES: Array<{
  match: (s: string) => boolean;
  dotBg: string;
  titleStyle: string;
}> = [
  {
    match: isRegisterAction,
    dotBg: "bg-teal-500",
    titleStyle: "font-bold text-teal-600 dark:text-teal-400",
  },
  {
    match: isOutboundAction,
    dotBg: "bg-teal-600",
    titleStyle: "font-bold text-teal-600 dark:text-teal-400",
  },
  {
    match: isReturnAction,
    dotBg: "bg-amber-500",
    titleStyle: "font-bold text-amber-600 dark:text-amber-400",
  },
  {
    match: isRepairAction,
    dotBg: "bg-rose-500",
    titleStyle: "font-bold text-rose-600 dark:text-rose-400",
  },
  {
    match: isScrapAction,
    dotBg: "bg-slate-600",
    titleStyle: "font-bold text-slate-700 dark:text-slate-300",
  },
  {
    match: isInboundAction,
    dotBg: "bg-emerald-500",
    titleStyle: "font-bold text-emerald-600 dark:text-emerald-400",
  },
];

/** 历史条目的圆点背景与标题样式（action_type 可能为 undefined，按空串处理）。 */
export const resolveHistoryStyle = (
  actionType: string | undefined,
): { dotBg: string; titleStyle: string } => {
  const typeStr = actionType || "";
  const hit = HISTORY_STYLE_RULES.find((r) => r.match(typeStr));
  return hit ? { dotBg: hit.dotBg, titleStyle: hit.titleStyle } : DEFAULT_HISTORY_STYLE;
};

/** 该状态是否可以发起新报修（已报废 / 待报废 / 维修中 均不可）。 */
export const canStartRepair = (displayStatus: string): boolean =>
  displayStatus !== AssetStatus.SCRAPPED &&
  displayStatus !== AssetStatus.SCRAP_PENDING &&
  displayStatus !== AssetStatus.IN_REPAIR;

/** 服役中或维修中（决定位置取「自行保管」还是仓库）。 */
export const isServingStatus = (displayStatus: string): boolean =>
  displayStatus === AssetStatus.IN_USE || displayStatus === AssetStatus.IN_REPAIR;

/**
 * 打开报修弹窗时给「所属部门」挑一个默认值：
 * 保管人账号的部门 → 当前已填部门 → 资产自身部门 → 账号表第一个部门 → 科技信息中心。
 */
export const pickDefaultDepartment = (
  matchedKeeper: AccountLite | undefined,
  currentContact: string,
  assetDepartment: string | undefined,
  depts: string[],
): string =>
  matchedKeeper?.department ||
  currentContact ||
  assetDepartment ||
  (depts.length > 0 ? depts[0] : "科技信息中心");
