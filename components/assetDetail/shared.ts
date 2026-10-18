// components/assetDetail/shared.ts
// AssetDetail 拆分后的共享层：对外 props 类型、内部轻量类型、以及跨文件复用的常量。
import { Asset, Supplier } from "../../types";

export interface AssetDetailProps {
  asset: Asset;
  onBack: () => void;
  onPrintLabel?: (asset: Asset) => void;
  suppliers?: Supplier[];
}

/** 报修弹窗里用到的账号条目（/api/accounts 的子集）。 */
export interface AccountLite {
  username: string;
  realName: string;
  department?: string;
  role: string;
}

/** /api/fault-types 的条目。 */
export interface FaultTypeLite {
  id: number;
  name: string;
  /** 后端返回 0/1（停用为 0）；前端只判断 `!== 0`，不消费具体数值。 */
  enabled?: number;
}

/**
 * 后端未配置故障分类时的兜底清单。
 * ★ 原文在「提交时的兜底 fault_type」与「故障分类下拉的兜底选项」两处
 *   写了逐字相同的 6 项字面量；这里收敛为一份，避免两处将来各改各的。
 */
export const DEFAULT_FAULT_TYPES = [
  "硬件损坏 / 配件故障",
  "软件 / 操作系统异常",
  "无法开机 / 供电故障",
  "屏幕 / 外观破损",
  "网络 / 通信故障",
  "其他故障",
];

/** 故障分类候选名：优先用后端配置，为空时回落到兜底清单。 */
export const faultTypeNames = (dbFaultTypes: FaultTypeLite[]): string[] =>
  dbFaultTypes.length > 0 ? dbFaultTypes.map((f) => f.name) : DEFAULT_FAULT_TYPES;

/** 历史条目的默认配色（未命中任何规则时使用）。 */
export const DEFAULT_HISTORY_STYLE = {
  dotBg: "bg-slate-400",
  titleStyle: "font-bold text-slate-800 dark:text-slate-200",
};
