import React from "react";
import {
  ProgressAndViewerSection,
  ReportSection,
  InboundSection,
  AssetUpdateSection,
  OutboundSections,
  ReturnSections,
  BatchProcessSection,
} from "./warehouse/modals/WarehouseModalSections";
import type { WarehouseModalsProps } from "./warehouse/modals/modalsProps";

// B3 拆分：原 451 行（其中单一箭头函数 279 行 —— 先解构 ~100 行 props，再透传 9 个弹窗）
// → 薄入口。改动仅「搬运」：
//   ① props 契约 `WarehouseModalsProps` 逐字搬到 ./warehouse/modals/modalsProps 并在此转发；
//   ② 10 个弹窗按**原渲染顺序**切成 7 个小组件（./warehouse/modals/WarehouseModalSections）；
//   ③ 本文件只做组合。片段（fragment）不产生 DOM 节点 ⇒ 渲染产物逐字符不变。
export type { WarehouseModalsProps };

const WarehouseModals: React.FC<WarehouseModalsProps> = (props) => (
  <>
    <ProgressAndViewerSection {...props} />
    <ReportSection {...props} />
    <InboundSection {...props} />
    <AssetUpdateSection {...props} />
    <OutboundSections {...props} />
    <ReturnSections {...props} />
    <BatchProcessSection {...props} />
  </>
);

export default WarehouseModals;
