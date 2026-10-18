// admin/RiskPanel.tsx — 模块 2 容器（左：环形图；右：风险透视三联）
import { AlertCircle } from 'lucide-react';
import type { OverviewApi } from '../api';
import { renderRiskDonut } from './RiskDonut';
import { renderRiskTopModels } from './RiskTopModels';
import { renderRiskViewControls } from './RiskViewControls';
import { renderRiskMatrix } from './RiskMatrix';

/** 模块 2: 存量与风险关注资产状态分布 */
export const renderRiskModule = (a: OverviewApi) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-6">
      <div>
        <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5 text-amber-500" />
          存量与风险关注状态分布
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
          以环形图精准分析全校受控资产中长期闲置(&gt;180天)、故障在修与待报废设备的占比分布
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {renderRiskDonut(a)}
        {renderRiskRight(a)}
      </div>
    </div>
  );
};

/** 右侧：风险焦点资产透视分析卡片区。 */
export const renderRiskRight = (a: OverviewApi) => {
  return (
    <div className="lg:col-span-2 space-y-3.5">
      {renderRiskTopModels(a)}
      {renderRiskViewControls(a)}
      {renderRiskMatrix(a)}
    </div>
  );
};
