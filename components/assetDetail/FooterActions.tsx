// components/assetDetail/FooterActions.tsx
// 吸底操作栏：可报修时给出「故障报修」，否则给出不可报修的说明；右侧恒为「关闭档案」。
import React from "react";
import { Wrench } from "lucide-react";
import { Button } from "../ui/Button";

interface FooterActionsProps {
  canReport: boolean;
  displayStatus: string;
  onOpenReport: () => void;
  onBack: () => void;
}

export const FooterActions: React.FC<FooterActionsProps> = ({
  canReport,
  displayStatus,
  onOpenReport,
  onBack,
}) => (
  <footer className="p-4 md:p-6 bg-slate-50/80 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
    {canReport ? (
      <Button variant="primary" size="md" onClick={onOpenReport}>
        <Wrench className="w-4 h-4" />
        <span>故障报修</span>
      </Button>
    ) : (
      <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-pulse"></span>
        当前资产状态（{displayStatus}）不可发起新报修
      </div>
    )}

    <Button variant="secondary" size="md" onClick={onBack}>
      关闭档案
    </Button>
  </footer>
);
