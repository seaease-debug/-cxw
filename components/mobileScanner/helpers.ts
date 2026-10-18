// components/mobileScanner/helpers.ts
// B1-5：纯函数层 —— 原 MobileScanner.tsx 内联的辅助函数 + 三处重复的「后端行 → Asset 映射」。
//
// ★ 复杂度说明：ESLint `complexity` 只按**单个函数**的 AST 分支计分，
//   而 `a || b` 这类 LogicalExpression **照样计数**。
//   原文件里那个 22 字段的对象字面量含 18 个 `||`，复杂度因此高达 19；
//   这里改用 `orValue()` 把「取值兜底」收进一个独立函数，调用方不再计分。
import { Asset, AssetStatus, AssetType, Supplier, UserAccount, UserRole } from '../../types';
import { RawDbAsset } from './types';

/** 保 `||` 语义的取值兜底（右侧常量）。等价于 `value || fallback`，但调用方不产生分支。 */
export const orValue = <T,>(value: unknown, fallback: T): T => (value ? (value as T) : fallback);

const calculateRemainingDaysMobile = (purchaseDateStr: string, retirementYears: number = 8) => {
  if (!purchaseDateStr) return retirementYears * 365;
  try {
    const start = new Date(purchaseDateStr);
    if (isNaN(start.getTime())) return retirementYears * 365;
    const now = new Date();
    const elapsedMs = now.getTime() - start.getTime();
    const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
    const totalDays = retirementYears * 365;
    const remainingDays = Math.max(0, totalDays - elapsedDays);
    return Math.floor(remainingDays);
  } catch {
    return retirementYears * 365;
  }
};

const getBeijingDateString = () => {
  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const nd = new Date(utc + (3600000 * 8));
  const year = nd.getFullYear();
  const month = String(nd.getMonth() + 1).padStart(2, '0');
  const day = String(nd.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export { calculateRemainingDaysMobile, getBeijingDateString };

/**
 * 后端原始行 → 前端 Asset。
 * ★ `withAssetImage` 不是可选参数而是**必填开关**：原文件三处拷贝里，
 *   `handleScanCode` 的 API 兜底分支（原 336-360 行）**没有** `assetImage` 字段，
 *   而 `refreshData` 的两处都有。合并时若一律补上，会让扫码兜底拿到的资产多出
 *   一张图 → 触发「同型号共享照片」逻辑改变。此处显式保留该不对称。
 */
export const mapRawAsset = (item: RawDbAsset, withAssetImage: boolean): Asset => {
  const imagePart: { assetImage?: string } = withAssetImage ? { assetImage: item.asset_image } : {};
  const asset: Asset = {
    id: item.id.toString(),
    no: item.asset_no,
    serialNo: orValue(item.serial_no, ''),
    name: orValue(item.name, ''),
    type: item.type as AssetType,
    brandModel: orValue(item.brand_model, ''),
    specification: orValue(item.specification, ''),
    purchaseDate: orValue(item.purchase_date, ''),
    purchasePrice: orValue(item.purchase_price, 0),
    supplierId: orValue(item.supplier, ''),
    warrantyPeriod: orValue(item.warranty_period, '3年'),
    currentStatus: item.status as AssetStatus,
    departmentId: orValue(item.department, ''),
    currentKeeperId: orValue(item.keeper, ''),
    currentLocationId: orValue(item.location, ''),
    warehouseLocation: orValue(item.warehouse_location, ''),
    remarks: orValue(item.remarks, ''),
    remainingDays: calculateRemainingDaysMobile(item.purchase_date, orValue(item.retirement_years, 8)),
    qrCodeInfo: item.asset_no,
    voucherImage: orValue(item.voucher_image, ''),
    ...imagePart,
    outboundDate: orValue(item.outbound_date, ''),
    retirementYears: orValue(item.retirement_years, 8),
    uploader: orValue(item.uploader, ''),
  };
  return asset;
};

/** Helper colors */
export const getStatusTone = (status: AssetStatus) => {
  switch (status) {
    case AssetStatus.NEW_IN_WAREHOUSE: return 'emerald';
    case AssetStatus.IN_USE: return 'teal';
    case AssetStatus.RECYCLED_PENDING: return 'amber';
    case AssetStatus.SCRAP_PENDING: return 'rose';
    case AssetStatus.SCRAPPED: return 'slate';
    default: return 'slate';
  }
};

export const getHasWritePermission = (user: UserAccount | null, asset: Asset | null): boolean =>
  Boolean(user && (
    user.role === UserRole.ADMIN ||
    (user.role === UserRole.KEEPER && asset && asset.uploader === user.username)
  ));

export const getCanViewPrice = (user: UserAccount | null): boolean =>
  Boolean(user && (user.role === UserRole.ADMIN || user.role === UserRole.KEEPER));

export const getCanReportRepair = (user: UserAccount | null): boolean =>
  Boolean(user && (
    user.role === UserRole.ADMIN ||
    user.role === UserRole.KEEPER ||
    user.role === UserRole.USER
  ));

// —— 流转记录时间轴样式 ——
// ★ 原实现是 6 段 if/else 链，含 8 个 `||` ⇒ 复杂度 15。
//   这里改成「规则表 + find/some」：分支落进独立回调，外层只剩 1 个三元。
//   语义完全一致 —— 规则按原 if 链顺序排列，find 取首个命中。
const HISTORY_STYLE_RULES: Array<[string[], string, string]> = [
  [['初始', '登记'], 'bg-teal-500', 'font-extrabold text-teal-600'],
  [['出库', '领用'], 'bg-teal-600', 'font-extrabold text-teal-600 dark:text-teal-400'],
  [['退库', '归还', '回收'], 'bg-amber-500', 'font-extrabold text-amber-600'],
  [['报修', '维修', '故障'], 'bg-rose-500', 'font-extrabold text-rose-600'],
  [['报废'], 'bg-slate-600', 'font-extrabold text-slate-700 dark:text-slate-300'],
  [['入库'], 'bg-emerald-500', 'font-extrabold text-emerald-600'],
];
const HISTORY_STYLE_DEFAULT = { dotBg: 'bg-slate-400', titleStyle: 'font-extrabold text-slate-800 dark:text-slate-200' };

export const historyDotStyle = (actionType: string): { dotBg: string; titleStyle: string } => {
  const hit = HISTORY_STYLE_RULES.find(([keys]) => keys.some((k) => actionType.includes(k)));
  return hit ? { dotBg: hit[1], titleStyle: hit[2] } : HISTORY_STYLE_DEFAULT;
};

const AMOUNT_LABEL_RE = /(?:花销金额|花费金额|维修金额|维修花费|费用|花销|花费|金额)\s*[:：]?\s*￥?¥?\s*\d+(?:\.\d+)?\s*元?/g;
const AMOUNT_BARE_RE = /￥¥?\d+(?:\.\d+)?元?/g;

/** 未登录时把历史描述里的金额打码（登录则原样返回） */
export const maskSensitiveAmount = (description: string, loggedIn: boolean): string =>
  loggedIn
    ? description
    : description
      .replace(AMOUNT_LABEL_RE, '$1: *** (仅登录可见)')
      .replace(AMOUNT_BARE_RE, '￥*** (仅登录可见)');

/** 供应商电话是否可用（排除空值 / 字面「无」/ 纯空白） */
export const hasUsablePhone = (value?: string): boolean => Boolean(value && value !== '无' && value.trim() !== '');

export const findSupplier = (supplierId: string, suppliers: Supplier[]): Supplier | undefined =>
  suppliers.find((s) => s.id === supplierId || s.name === supplierId);

/** 一键拨号目标：供应商电话 → 校内上传人 → 默认总机 */
export const resolveSupplierPhone = (supplier: Supplier | undefined, uploader: string): string => {
  if (supplier && hasUsablePhone(supplier.phone)) return supplier.phone as string;
  if (hasUsablePhone(uploader)) return uploader;
  return '0574-88126625';
};

/**
 * 售后卡片的四个派生值。
 * ★ 收进独立函数的原因：这些 `?:` / `||` 若留在组件里，会与 JSX 里的分支
 *   累加到同一个函数上（实测把 WarrantyCard 推到复杂度 12）。
 */
export const resolveWarrantyInfo = (asset: Asset, suppliers: Supplier[]) => {
  const supplier = findSupplier(asset.supplierId, suppliers);
  const supplierName = supplier ? supplier.name : orValue(asset.supplierId, '暂无/默认提供商');
  const supplierPhone = supplier && hasUsablePhone(supplier.phone) ? (supplier.phone as string) : null;
  const targetPhone = resolveSupplierPhone(supplier, orValue(asset.uploader, ''));
  return { supplier, supplierName, supplierPhone, targetPhone };
};
