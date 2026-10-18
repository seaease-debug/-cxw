/**
 * B4 拆分：本文件原 650 行（1 个共享上下文 + 1 个日期校验 + 4 个 handler hook）。
 *
 * 现只做**转发**，对外可见面一个都没变 ——
 *   `useWarehouseImportHandlers` / `useWarehouseSubmitHandlers` /
 *   `useWarehouseBatchHandlers` / `useWarehouseUiHandlers` / `WarehouseActionsCtx`
 * 全部照旧，调用方 `warehouse/useWarehouseActions.ts` 零改动。
 *
 * 落点：
 *   ./handlersCtx       共享上下文 + 被多处重复的纯逻辑（日期校验 / 表单取值 / JSON 请求 /
 *                       状态资格判定 / 动作查表 / 按 id 筛资产）
 *   ./importHandlers    批量导入（进度条推进、成功/失败收尾、主流程）
 *   ./submitHandlers    入库 / 位置变更 / 出库 / 退库 四个提交
 *   ./batchHandlers     批量出库 / 批量退库 / 批量处置
 *   ./uiHandlers        界面开关 / 图片读取 / 删除
 *
 * ★ 拆的只是**函数边界**，不是行为：所有副作用调用点的先后顺序原样保留，
 *   由 `.eng-audit/b4` 的逻辑台逐条比对副作用轨迹（63 场景 / 350 行）。
 */
export type { WarehouseActionsCtx, BatchProcessAction } from "./handlersCtx";
export { useWarehouseImportHandlers } from "./importHandlers";
export { useWarehouseSubmitHandlers } from "./submitHandlers";
export { useWarehouseBatchHandlers } from "./batchHandlers";
export { useWarehouseUiHandlers } from "./uiHandlers";
