import React from "react";
import { Wrench, X } from "lucide-react";
import { Asset, AssetStatus } from "../../../types";
import { CustomSelect } from "../../CustomSelect";
import { Button } from "../../ui/Button";
import { IconButton } from "../../ui/IconButton";
import { Input } from "../../ui/Input";

export interface ReportRepairModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  dbFaultTypes: Array<{ id: number; name: string; enabled?: boolean }>;
  reporterName: string;
  reporterContact: string;
  faultType: string;
  faultDesc: string;
  submittingReport: boolean;
  setReporterName: (name: string) => void;
  setReporterContact: (contact: string) => void;
  setFaultType: (type: string) => void;
  setFaultDesc: (desc: string) => void;
  setSubmittingReport: (submitting: boolean) => void;
  showToast: (message: string, type: "success" | "error" | "warning" | "info") => void;
}

export const ReportRepairModal: React.FC<ReportRepairModalProps> = ({
  asset,
  isOpen,
  onClose,
  dbFaultTypes,
  reporterName,
  reporterContact,
  faultType,
  faultDesc,
  submittingReport,
  setReporterName,
  setReporterContact,
  setFaultType,
  setFaultDesc,
  setSubmittingReport,
  showToast,
}) => {
  if (!asset || !isOpen) return null;

  const availableFaultTypes =
    dbFaultTypes.length > 0
      ? dbFaultTypes.map((f) => f.name)
      : [
          "硬件损坏 / 配件故障",
          "软件 / 操作系统异常",
          "无法开机 / 供电故障",
          "屏幕 / 外观破损",
          "网络 / 通信故障",
          "其他故障",
        ];

  const displayLocation =
    asset.currentLocationId ||
    asset.location ||
    asset.warehouseLocation ||
    asset.warehouse_location ||
    asset.warehouseName ||
    asset.warehouse_name ||
    "主仓库";
  const displayStatus =
    asset.currentStatus ||
    asset.status ||
    asset.current_status ||
    AssetStatus.NEW_IN_WAREHOUSE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterName.trim() || !faultDesc.trim()) {
      showToast("请填写报修人和故障描述", "error");
      return;
    }
    setSubmittingReport(true);
    try {
      const res = await fetch("/api/maintenance/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_id: asset.id,
          asset_no: asset.no,
          asset_name: `${asset.brandModel || asset.name || asset.type}`,
          reporter_name: reporterName,
          reporter_contact: reporterContact,
          fault_type: faultType || availableFaultTypes[0],
          fault_description: faultDesc,
        }),
      });

      if (res.ok) {
        showToast("报修单已提交！科技信息中心将尽快处理", "success");
        onClose();
        setReporterName("");
        setReporterContact("");
        setFaultDesc("");
      } else {
        const data = await res.json();
        showToast(data.error || "提交报修失败", "error");
      }
    } catch {
      showToast("提交报修单失败，请检查网络", "error");
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[var(--z-modal-overlay)] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full shadow-xl overflow-hidden relative z-[var(--z-modal)] font-sans border border-slate-200 dark:border-slate-800">
        <div className="p-5 bg-teal-600 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base tracking-wide flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-300" />
              提交设备故障报修
            </h3>
            <p className="text-xs text-teal-100/80 mt-0.5">
              全校固定资产与耗材快速报修通道
            </p>
          </div>
          <IconButton
            icon={<X size={18} />}
            label="关闭"
            onClick={onClose}
            tone="onBrand"
          />
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">报修设备:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {asset.brandModel || asset.name} ({asset.type})
              </span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-slate-400">资产编号:</span>
              <span className="text-slate-600 dark:text-slate-300">
                {asset.no}
              </span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-slate-400">S/N 序列号:</span>
              <span className="text-slate-600 dark:text-slate-300">
                {asset.serialNo || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">当前位置/状态:</span>
              <span className="text-slate-600 dark:text-slate-300">
                {displayLocation} · {displayStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                label="报修人姓名 *"
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="例如: 张老师"
                required
              />
            </div>
            <div>
              <Input
                label="联系方式 / 办公室"
                type="text"
                value={reporterContact}
                onChange={(e) => setReporterContact(e.target.value)}
                placeholder="例如: 分机8012 / 138..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
              故障类型 *
            </label>
            <CustomSelect
              value={faultType || availableFaultTypes[0]}
              onChange={setFaultType}
              options={availableFaultTypes.map((t) => ({ value: t, label: t }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
              故障现象详细描述 *
            </label>
            <textarea
              rows={3}
              value={faultDesc}
              onChange={(e) => setFaultDesc(e.target.value)}
              placeholder="请尽量详述故障表现（例如：开机无显示、蓝屏报错代码、接口接触不良等），便于维修人员准备备品备件..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-field rounded-lg p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              取消
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={submittingReport}
            >
              {submittingReport ? "提交中..." : "确认提交报修"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
