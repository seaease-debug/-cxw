// components/assetDetail/LifecycleSection.tsx
// 右栏 · 生命周期监控条：标准年限 / 已服役 / 剩余 / 进度条。
import React from "react";

interface LifecycleSectionProps {
  totalRetirementYears: number;
  usedTime: string;
  remainingText: string;
  lifePercentage: number;
}

export const LifecycleSection: React.FC<LifecycleSectionProps> = ({
  totalRetirementYears,
  usedTime,
  remainingText,
  lifePercentage,
}) => (
  <section className="p-5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
    <div className="flex justify-between items-end">
      <div>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          生命周期 ({totalRetirementYears}年标准)
        </p>
        <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-0.5">
          已服役: {usedTime}
        </p>
      </div>
      <p className="text-xs font-bold text-brand">{remainingText}</p>
    </div>

    <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-brand transition-all duration-700 rounded-full"
        style={{ width: `${lifePercentage}%` }}
      ></div>
    </div>
  </section>
);
