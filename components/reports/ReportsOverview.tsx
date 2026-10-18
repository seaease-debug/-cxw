// components/reports/ReportsOverview.tsx
// 报表总览页：本文件只做「状态装配 + 版面组合」，各分区渲染在 reports/overview/ 下。
// 拆分前后 JSX 与分支逻辑逐行等价（见 .eng-audit/b1-3/ACCEPTANCE.md）。
import React, { useState, useMemo } from 'react';
import { useReportsData } from './useReportsData';
import type { OverviewApi } from './overview/api';
import {
  renderKpiCards, renderHealthRow, renderStatusFlowRow,
  renderKeeperDistributionRow, renderWarehouseComposition,
} from './overview/OverviewTop';
import { renderAdminBoard } from './overview/OverviewAdminBoard';
import { renderPriceModal } from './overview/OverviewPriceModal';

interface ReportsOverviewProps {
  data: ReturnType<typeof useReportsData>;
}

export const ReportsOverview: React.FC<ReportsOverviewProps> = ({ data }) => {
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [selectedFixModel, setSelectedFixModel] = useState('');
  const [inputFixPrice, setInputFixPrice] = useState('');
  const [isFixingPrice, setIsFixingPrice] = useState(false);
  const [priceFixStatus, setPriceFixStatus] = useState<string | null>(null);

  // 检测在管设备中是否存在采购单价缺失（估算价值为0）的型号
  const zeroPriceModels = useMemo(() => {
    return data.displayedKeeperChartData.filter(item => item.count > 0 && item.totalValueWan === 0);
  }, [data.displayedKeeperChartData]);

  // 补录单价要用到 data 上的更新方法：拆出后壳里只保留这一处解构。
  const { updateModelPrice } = data;

  const handleFixModelPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFixModel || !inputFixPrice) return;
    const num = parseFloat(inputFixPrice);
    if (isNaN(num) || num <= 0) return;

    setIsFixingPrice(true);
    setPriceFixStatus(null);
    try {
      const ok = await updateModelPrice(selectedFixModel, num);
      if (ok) {
        setPriceFixStatus(`成功为「${selectedFixModel}」补录基准单价 ¥${num.toLocaleString()}，报表已即时联动刷新！`);
        setTimeout(() => {
          setIsPriceModalOpen(false);
          setPriceFixStatus(null);
          setInputFixPrice('');
        }, 1500);
      } else {
        setPriceFixStatus('更新失败，请重试');
      }
    } finally {
      setIsFixingPrice(false);
    }
  };

  const api: OverviewApi = {
    ...data,
    isPriceModalOpen, setIsPriceModalOpen,
    selectedFixModel, setSelectedFixModel,
    inputFixPrice, setInputFixPrice,
    isFixingPrice, priceFixStatus, setPriceFixStatus, zeroPriceModels, handleFixModelPrice,
  };

  return (
    <section className="space-y-8">
      {renderKpiCards(api)}
      {renderHealthRow(api)}
      {renderStatusFlowRow(api)}
      {renderKeeperDistributionRow(api)}
      {renderWarehouseComposition(api)}
      {renderAdminBoard(api)}
      {isPriceModalOpen && renderPriceModal(api)}
    </section>
  );
};
