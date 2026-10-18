// components/maintenance/MaintenanceModals.tsx
// ---------------------------------------------------------------------------
// 维修模块 3 个弹窗（更新进度 / 登记报修 / 存底明细）—— 本文件现在是**薄桶**。
//
// 实现已按「一个组件一个文件」搬到 ./modals/ 下（B2e，原 618 行 → 桶 12 行 +
// 8 个模块 826 行）。每个子组件的 props 都是 `Pick<MaintenanceApi, …>`，
// 所以这里 `{...a}` 直接展开即可 —— 不写手工转发，避免「转错了 props」
// 这种 tsc 之外的低级风险。
//
// ★ 刻意**保留 `renderX(a)` 这个原调用契约**（而不是把 MaintenanceView.tsx
//   改成 JSX 调用点）：调用方因此一个字节都不用动，炸半径 = 本文件 + modals/。
//   这与 B2d 让 OutboundModals.tsx 继续导出两个公开组件的思路一致。
// ---------------------------------------------------------------------------
import { UpdateRecordModal } from './modals/UpdateRecordModal';
import { CreateReportModal } from './modals/CreateReportModal';
import { DetailRecordModal } from './modals/DetailRecordModal';
import type { MaintenanceApi } from './useMaintenance';

export const renderUpdateModal = (a: MaintenanceApi) => <UpdateRecordModal {...a} />;
export const renderCreateModal = (a: MaintenanceApi) => <CreateReportModal {...a} />;
export const renderDetailModal = (a: MaintenanceApi) => <DetailRecordModal {...a} />;
