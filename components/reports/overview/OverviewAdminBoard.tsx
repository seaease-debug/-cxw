// OverviewAdminBoard.tsx — 管理员看板入口（薄桶）
//
// B2f 拆分：原 575 行的 9 个渲染函数已按职责移入 ./admin/ 下的 7 个文件。
// 本文件**刻意保留 `renderAdminBoard(a)` 的导出名与调用契约** ⇒ ReportsOverview.tsx 零改动。
import type { OverviewApi } from './api';
import { renderBoardTitle } from './admin/BoardTitle';
import { renderKeeperChartModule } from './admin/KeeperBoard';
import { renderRiskModule } from './admin/RiskPanel';

/** ==================== 管理员专属 Keeper 资产与风险管控看板 ==================== */
export const renderAdminBoard = (a: OverviewApi) => {
  return (
    <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-8">
      {renderBoardTitle()}
      {renderKeeperChartModule(a)}
      {renderRiskModule(a)}
    </div>
  );
};
