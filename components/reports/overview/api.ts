// components/reports/overview/api.ts
// ReportsOverview 拆分后的共享上下文：data（useReportsData 返回值）+ 页面局部状态。
// 各分区渲染函数只解构自己用到的名字——与拆分前的组件作用域等价。
import type { FormEvent } from 'react';
import type { useReportsData } from '../useReportsData';

export interface OverviewLocalState {
  isPriceModalOpen: boolean;
  setIsPriceModalOpen: (value: boolean) => void;
  selectedFixModel: string;
  setSelectedFixModel: (value: string) => void;
  inputFixPrice: string;
  setInputFixPrice: (value: string) => void;
  isFixingPrice: boolean;
  priceFixStatus: string | null;
  setPriceFixStatus: (value: string | null) => void;
  zeroPriceModels: ReturnType<typeof useReportsData>['displayedKeeperChartData'];
  handleFixModelPrice: (e: FormEvent) => Promise<void>;
}

export type OverviewApi = ReturnType<typeof useReportsData> & OverviewLocalState;
