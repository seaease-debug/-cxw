// components/maintenance/modals/shared.ts
// ---------------------------------------------------------------------------
// 维修弹窗（B2e 拆分）共享的**纯函数**与**判据**。
//
// ★ 本文件不是「顺手美化」的地方：每个函数都是从改前的 MaintenanceModals.tsx
//   里把分支**逐字搬出来**的。抽取的唯一目的是把 AST 分支节点从组件本体移走 ——
//   SonarSource S1541 `complexity` 只数分支节点、与写法无关，
//   唯一有效手法就是「把分支切进多个独立函数」。
//
// ★ 形状差异**有意保留、不合并**：
//   · resolveKeeperName 沿用存底明细调用点的 `assetId.toString()`（**无** `?.`），
//     与 resolveSupplierName 一路的 `assetId?.toString()` 不是同一形。
//     合并会改变「asset_id 为 null」时的行为（抛错 vs 返回 undefined），
//     属数据契约批的事，重构批不动。
// ---------------------------------------------------------------------------
import { Asset, MaintenanceRecord, Supplier, Warehouse as WarehouseRecord } from '../../../types';

/** 资产定位：资产 id 或资产编号双键匹配（原文件里逐字重复 3 次的同一表达式）。 */
export const findLinkedAsset = (
  assets: Asset[],
  assetId: string | number | undefined,
  assetNo: string | undefined,
) => assets.find(a => a.id === assetId?.toString() || a.no === assetNo);

/**
 * 由关联资产解析「维保服务商显示名」。
 * 原 renderCostVendor 里**两个 IIFE 各自重算一遍**，此处合并为一份 ——
 * 纯函数，同输入同输出，渲染产物不变。
 */
export function resolveSupplierName(
  assets: Asset[],
  suppliers: Supplier[],
  assetId: string | number | undefined,
  assetNo: string | undefined,
): string {
  const linkedAsset = findLinkedAsset(assets, assetId, assetNo);
  const matched = linkedAsset?.supplierId
    ? suppliers.find(s => s.id.toString() === linkedAsset.supplierId.toString() || s.name === linkedAsset.supplierId)
    : null;
  return matched ? matched.name : (linkedAsset?.supplierId || '');
}

/** 服务商联想项。 */
export interface VendorOption {
  name: string;
  info?: string;
  isLinked?: boolean;
}

/** 联想列表：装备关联项置顶，其后按**名称**去重追加全部服务商。 */
export function buildVendorOptions(suppliers: Supplier[], supplierName: string): VendorOption[] {
  const list: VendorOption[] = [];
  if (supplierName) {
    list.push({ name: supplierName, isLinked: true });
  }
  suppliers.forEach(s => {
    if (!list.some(item => item.name === s.name)) {
      list.push({
        name: s.name,
        info: s.contact_person ? `联系人: ${s.contact_person}` : (s.phone ? `电话: ${s.phone}` : undefined)
      });
    }
  });
  return list;
}

/** 联想过滤：空输入视为不设限（原 `.filter` 谓词逐字保留）。 */
export const filterVendorOptions = (list: VendorOption[], query: string): VendorOption[] =>
  list.filter(item => !query || item.name.toLowerCase().includes(query.toLowerCase()));

/** 无仓库数据时的兜底点位（原字面量逐字保留）。 */
export const FALLBACK_WAREHOUSE_OPTIONS = [
  { value: "1楼小仓库", label: "1楼小仓库 (1FSM)" },
  { value: "1楼办公室仓库", label: "1楼办公室仓库 (1FOF)" },
  { value: "4楼大仓库", label: "4楼大仓库 (4FBG)" },
  { value: "3楼中心机房", label: "3楼中心机房 (3FCR)" },
];

/** 仓库下拉选项：有数据用数据，否则兜底点位（原三元与模板串逐字保留）。 */
export const warehouseOptions = (warehouses: WarehouseRecord[]) =>
  warehouses.length > 0
    ? warehouses.map(w => ({
        value: w.name,
        label: `${w.name} ${w.code ? `(${w.code})` : ''}`
      }))
    : FALLBACK_WAREHOUSE_OPTIONS;

/** 「按报废处置」：结果选报废，或状态被判无法修复（原重复两遍的判据）。 */
export const isScrapDisposition = (resultAction: string, status: string): boolean =>
  resultAction === 'SCRAP' || status === '无法修复';

/**
 * 仓库选择块是否显示（原三元 guard 逐字保留）。
 * ★ 边界：状态 `无法修复` 且结果动作是 `SITE_REPAIR_COMPLETE` 时**不显示**。
 */
export const shouldAskWarehouse = (resultAction: string, status: string): boolean =>
  resultAction === 'RETURN_TO_WAREHOUSE' || resultAction === 'SCRAP' || (status === '无法修复' && resultAction !== 'SITE_REPAIR_COMPLETE');

/** 现场完修提示里回填的「原位置」（原 IIFE 的 `||` 链逐字保留）。 */
export function resolveSiteLocation(
  assets: Asset[],
  assetId: string | number | undefined,
  assetNo: string | undefined,
): string {
  const linkedAsset = findLinkedAsset(assets, assetId, assetNo);
  return linkedAsset?.currentLocationId || linkedAsset?.location || linkedAsset?.warehouseLocation || '现场使用点位';
}

/** 存底明细：保管人（★ 沿用调用点原本的 `assetId.toString()`，无 `?.`）。 */
export const resolveKeeperName = (
  assets: Asset[],
  assetId: string | number,
  assetNo: string,
): string =>
  assets.find(a => a.id === assetId.toString() || a.no === assetNo)?.currentKeeperId || '库管员';

/** 存底明细：报修日期（缺省回落创建时间前 10 位）。★ 调用点外层还有 <p> 包装。 */
export const resolveRepairDate = (rec: MaintenanceRecord): string =>
  rec.repair_date || rec.created_at?.substring(0,10);

/** 存底明细：完修日期文本。 */
export const finishDateText = (finishDate?: string): string =>
  finishDate || '尚未完修/进行中';

/** 存底明细：完修日期配色（有完修日期 → emerald，否则灰斜体）。★ 取值在 <p> 的模板串里。 */
export const finishDateClass = (finishDate?: string): string =>
  finishDate ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 italic';

/** 存底明细：空值占位（四处 `|| '占位文案'` 逐字搬运）。 */
export const reporterContactText = (v?: string) =>
  v || '无电话';
export const faultTypeText = (v?: string) =>
  v || '通用';
export const repairVendorText = (v?: string) =>
  v || '未登记';
export const costOf = (rec: MaintenanceRecord) =>
  rec.cost || 0;
