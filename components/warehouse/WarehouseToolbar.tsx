import React from "react";
import {
  Download,
  Upload,
  Rocket,
  RotateCcw,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Asset, AssetStatus, UserAccount, UserRole } from "../../types";
import { Button } from "../ui/Button";
import { SearchBar } from "../ui/SearchBar";
import { Badge } from "../ui/Badge";
import {
  getBeijingDateString,
  isRecycledPendingStatus,
  isScrapPendingStatus,
} from "./warehouseUtils";
import { useToast } from "../Toast";

export interface WarehouseToolbarProps {
  user: UserAccount;
  realAssets: Asset[];
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  filterText: string;
  setFilterText: (text: string) => void;
  itemsPerPage: number;
  setItemsPerPage: (num: number) => void;
  selectedBatchAssetIds: string[];
  setSelectedBatchAssetIds: (ids: string[]) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onDownloadTemplate: () => void;
  onAssetImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewInbound: () => void;
  onBatchPrint: (assets: Asset[]) => void;
  onBatchOutbound: () => void;
  onBatchReturn: () => void;
  onBatchScrap: () => void;
  onBatchScrapConfirm: () => void;
}

export const WarehouseToolbar: React.FC<WarehouseToolbarProps> = ({
  user,
  realAssets,
  statusFilter,
  setStatusFilter,
  filterText,
  setFilterText,
  itemsPerPage,
  setItemsPerPage,
  selectedBatchAssetIds,
  setSelectedBatchAssetIds,
  fileInputRef,
  onDownloadTemplate,
  onAssetImport,
  onNewInbound,
  onBatchPrint,
  onBatchOutbound,
  onBatchReturn,
  onBatchScrap,
  onBatchScrapConfirm,
}) => {
  const { showToast } = useToast();
  const userRole = user?.role || UserRole.USER;
  const userRealName = user?.realName || "";
  const isInServiceMode = statusFilter === AssetStatus.IN_USE;

  const handleExportAssets = async () => {
    const statusParam = statusFilter === "ALL" ? "ALL" : statusFilter;
    const searchParam = filterText ? encodeURIComponent(filterText) : "";
    const roleParams =
      userRole === UserRole.KEEPER
        ? `&uploader=${encodeURIComponent(user?.username || "")}`
        : userRole !== UserRole.ADMIN
          ? `&keeper=${encodeURIComponent(userRealName)}`
          : "";
    const url = `/api/export/assets?status=${statusParam}&search=${searchParam}${roleParams}`;
    try {
      showToast("正在准备资产导出数据...", "info");
      const res = await fetch(url);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `资产导出_${getBeijingDateString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      showToast("资产导出成功", "success");
    } catch {
      showToast("导出资产失败，请确认您已登录并拥有相关权限", "error");
    }
  };

  const selectedAssets = realAssets.filter((a) =>
    selectedBatchAssetIds.includes(a.id),
  );
  const outboundValid = selectedAssets.filter(
    (a) =>
      a.currentStatus === AssetStatus.NEW_IN_WAREHOUSE ||
      isRecycledPendingStatus(a.currentStatus),
  );
  const returnValid = selectedAssets.filter(
    (a) => a.currentStatus === AssetStatus.IN_USE,
  );
  const scrapValid = selectedAssets.filter(
    (a) =>
      a.currentStatus === AssetStatus.NEW_IN_WAREHOUSE ||
      isRecycledPendingStatus(a.currentStatus),
  );
  const scrapConfirmValid = selectedAssets.filter((a) =>
    isScrapPendingStatus(a.currentStatus),
  );

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <span className="text-teal-600">📦</span> 资产管理
            </h2>
            <p className="text-slate-400 text-xs font-semibold mt-0.5 uppercase tracking-widest">
              Asset Management & Ledger
            </p>
          </div>
        </div>

        {(userRole === UserRole.ADMIN || userRole === UserRole.KEEPER) && (
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onDownloadTemplate}
              className="h-9"
            >
              <Download className="w-3.5 h-3.5" /> <span>下载模版</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-9"
            >
              <Upload className="w-3.5 h-3.5" /> <span>批量导入 CSV</span>
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv"
              onChange={onAssetImport}
            />

            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportAssets}
              className="h-9"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出资产</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={onNewInbound}
              className="h-9"
            >
              <span className="mr-1.5 text-base">+</span> 新设备入库
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col space-y-3 bg-white dark:bg-slate-900 rounded-t-xl">
        {/* Status Tabs - 仅管理员和保管员需要多状态切换，普通用户仅关注服役中资产 */}
        {userRole !== UserRole.USER && (
          <div className="flex space-x-1 overflow-x-auto pb-1">
            {[
              { id: "ALL", label: "全部资产" },
              { id: AssetStatus.NEW_IN_WAREHOUSE, label: "新设备在库" },
              { id: AssetStatus.IN_USE, label: "服役中" },
              { id: AssetStatus.RECYCLED_PENDING, label: "待周转" },
              { id: AssetStatus.SCRAP_PENDING, label: "待报废" },
              { id: AssetStatus.SCRAPPED, label: "已报废" },
            ].map((tab) => (
              <Button
                key={tab.id}
                size="sm"
                variant={statusFilter === tab.id ? "primary" : "secondary"}
                onClick={() => setStatusFilter(tab.id)}
                className={`whitespace-nowrap ${
                  statusFilter === tab.id
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent"
                    : ""
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        )}

        {/* Batch Actions Bar */}
        {selectedBatchAssetIds.length > 0 && (
          <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 animate-in slide-in-from-top-4 duration-300 shadow-xl border border-slate-800">
            <div className="flex items-center space-x-3">
              <Badge tone="teal" solid className="whitespace-nowrap">
                已选择 {selectedBatchAssetIds.length} 项
              </Badge>
              <div className="text-xs text-slate-300 font-bold leading-tight">
                工作流按钮将自动筛选符合相应操作状态的设备：
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={selectedAssets.length === 0}
                onClick={() => onBatchPrint(selectedAssets)}
                title={
                  selectedAssets.length > 0
                    ? "为所有选中的资产批量打印标签挂牌"
                    : "无可打印的资产"
                }
              >
                🖨️ 批量挂牌
              </Button>

              <Button
                variant="primary"
                size="sm"
                disabled={outboundValid.length === 0}
                onClick={onBatchOutbound}
                title={
                  outboundValid.length > 0
                    ? `对 ${outboundValid.length} 台设备办理批量出库`
                    : "无可办理出库的在库/周转设备"
                }
              >
                <Rocket className="w-3.5 h-3.5" /> 批量出库 (
                {outboundValid.length}台)
              </Button>

              <Button
                variant="secondary"
                size="sm"
                disabled={returnValid.length === 0}
                onClick={onBatchReturn}
                className={
                  returnValid.length > 0
                    ? "bg-amber-600 hover:bg-amber-500 text-white border-transparent"
                    : ""
                }
                title={
                  returnValid.length > 0
                    ? `对 ${returnValid.length} 台服役中设备进行退回仓库回收`
                    : "无可退库的服役中设备"
                }
              >
                <RotateCcw className="w-3.5 h-3.5" /> 批量退库 (
                {returnValid.length}台)
              </Button>

              <Button
                variant="danger"
                size="sm"
                disabled={scrapValid.length === 0}
                onClick={onBatchScrap}
                title={
                  scrapValid.length > 0
                    ? `对 ${scrapValid.length} 台设备发起报废申请`
                    : "无可申请报废的在库/周转设备"
                }
              >
                <Trash2 className="w-3.5 h-3.5" /> 批量申请报废 (
                {scrapValid.length}台)
              </Button>

              {userRole === UserRole.ADMIN && (
                <Button
                  variant="danger"
                  size="sm"
                  disabled={scrapConfirmValid.length === 0}
                  onClick={onBatchScrapConfirm}
                  className={
                    scrapConfirmValid.length > 0
                      ? "bg-rose-800 hover:bg-rose-700"
                      : ""
                  }
                  title={
                    scrapConfirmValid.length > 0
                      ? `对 ${scrapConfirmValid.length} 台已申请报废进行审核销账`
                      : "无待审核报废的设备"
                  }
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> 批量确认报废 (
                  {scrapConfirmValid.length}台)
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedBatchAssetIds([])}
                className="text-slate-400 hover:text-white"
              >
                取消
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <SearchBar
              placeholder={
                isInServiceMode
                  ? "搜索持有人、部门、序列号..."
                  : "搜索序列号、型号、类型、品牌..."
              }
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          <div className="flex-1" />
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400">
              每页显示:
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-slate-50 dark:bg-slate-800 border border-field text-slate-900 dark:text-slate-100 text-xs font-semibold rounded-lg px-2 py-1 outline-none focus:border-brand-light"
            >
              <option value={10}>10条</option>
              <option value={30}>30条</option>
              <option value={50}>50条</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
};
