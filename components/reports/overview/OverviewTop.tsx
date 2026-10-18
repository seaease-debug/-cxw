// OverviewTop.tsx — 报表总览·上半区入口（薄桶）
//
// B2g 拆分：原 537 行的 5 个渲染函数已按职责移入 ./top/ 下的 5 个文件。
// 本文件**刻意保留 5 个导出名与原调用契约** ⇒ ReportsOverview.tsx 零改动。
export { renderKpiCards } from './top/KpiCards';
export { renderHealthRow } from './top/HealthCharts';
export { renderStatusFlowRow } from './top/StatusFlowChart';
export { renderKeeperDistributionRow } from './top/KeeperDistribution';
export { renderWarehouseComposition } from './top/WarehouseComposition';
