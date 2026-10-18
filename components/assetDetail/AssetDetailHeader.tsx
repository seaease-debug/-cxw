// components/assetDetail/AssetDetailHeader.tsx
// 档案头部：图标 + 状态徽章 + 名称 + 编号 + 二维码 / 打印标签。
import React from "react";
import { Printer } from "lucide-react";
import { Asset } from "../../types";
import QrCode from "../QrCode";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { categoryIconFor } from "./CategoryIcon";
import { resolveStatusTone } from "./derived";

interface AssetDetailHeaderProps {
  asset: Asset;
  displayStatus: string;
  onPrint: () => void;
}

export const AssetDetailHeader: React.FC<AssetDetailHeaderProps> = ({
  asset,
  displayStatus,
  onPrint,
}) => (
  <header className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-start justify-between gap-6 bg-slate-50/50 dark:bg-slate-900">
    <div className="flex gap-4 md:gap-6 items-start">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-teal-50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40 rounded-xl flex items-center justify-center shrink-0">
        {categoryIconFor(asset.type, asset.name || asset.brandModel)}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone={resolveStatusTone(displayStatus)}>{displayStatus}</Badge>
          <Badge tone="slate">{asset.type || "设备"}</Badge>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
          {asset.brandModel || asset.name}
        </h1>
        <p className="font-mono text-xs text-slate-500 dark:text-slate-400 tracking-wider">
          {asset.no}
        </p>
      </div>
    </div>

    <div className="flex flex-col items-center gap-1.5 ml-auto">
      <div
        onClick={onPrint}
        className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/80 flex items-center justify-center cursor-pointer hover:border-teal-500 transition-all"
        title="点击预览并打印 80mm x 55mm 资产标签"
      >
        <QrCode
          value={`${window.location.origin}${window.location.pathname}?asset_no=${encodeURIComponent(asset.no)}`}
          size={64}
          className="w-16 h-16 object-contain rounded-lg"
        />
      </div>
      <Button
        variant="link"
        size="sm"
        onClick={onPrint}
        className="flex items-center gap-1 font-bold text-teal-600 dark:text-teal-400 p-0"
      >
        <Printer className="w-3.5 h-3.5" />
        <span>打印标签</span>
      </Button>
    </div>
  </header>
);
