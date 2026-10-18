// components/assetDetail/FaultReportModal.tsx
// 故障报修弹窗：资产摘要 + 所属部门 + 报修人（带账号联想）+ 故障分类 + 描述。
// ★ 这里的「存放位置」口径与主区域不同（见 derived.resolveModalLocation），
//   且部门/分类下拉是 CustomSelect，不要替换成原生 select。
import React from "react";
import { Wrench } from "lucide-react";
import { Asset } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { CustomSelect } from "../CustomSelect";
import { ReporterSuggestions } from "./ReporterSuggestions";
import { resolveModalLocation } from "./derived";
import { AccountLite } from "./shared";

interface FaultReportModalProps {
  asset: Asset;
  reporterName: string;
  reporterContact: string;
  faultType: string;
  faultDesc: string;
  faultTypeOptions: string[];
  depts: string[];
  accounts: AccountLite[];
  showSuggestions: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onNameChange: (val: string) => void;
  onContactChange: (val: string) => void;
  onFaultTypeChange: (val: string) => void;
  onFaultDescChange: (val: string) => void;
  onPickAccount: (acc: AccountLite) => void;
  setShowSuggestions: (v: boolean) => void;
}

export const FaultReportModal: React.FC<FaultReportModalProps> = ({
  asset,
  reporterName,
  reporterContact,
  faultType,
  faultDesc,
  faultTypeOptions,
  depts,
  accounts,
  showSuggestions,
  submitting,
  onClose,
  onSubmit,
  onNameChange,
  onContactChange,
  onFaultTypeChange,
  onFaultDescChange,
  onPickAccount,
  setShowSuggestions,
}) => (
  <div
    className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[var(--z-modal-overlay)] flex items-center justify-center p-4 cursor-pointer"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}
  >
    <div className="bg-transparent rounded-xl max-w-md w-full shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150 font-sans cursor-default">
      <div className="p-5 bg-brand text-white flex justify-between items-center rounded-t-xl">
        <div>
          <h3 className="font-bold text-base tracking-wide flex items-center gap-2">
            <Wrench className="w-4 h-4 text-emerald-300" />
            提交设备故障报修
          </h3>
          <p className="text-xs text-teal-100/80 mt-0.5">全校固定资产与耗材快速报修通道</p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="p-6 bg-white dark:bg-slate-900 space-y-4 rounded-b-xl border border-t-0 border-slate-200 dark:border-slate-800"
      >
        <div className="p-3.5 bg-slate-50/90 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {asset.name || asset.brandModel}
            </p>
            <Badge tone="teal" className="font-mono">
              {asset.type || "设备"}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/80 dark:border-slate-700">
            <div>
              <span className="text-slate-400 dark:text-slate-500">存放位置：</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {resolveModalLocation(asset)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500">资产状态：</span>
              <span className="font-semibold text-teal-600 dark:text-teal-400">
                {asset.currentStatus || asset.status || "服役中"}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            所属部门 / 科组 <span className="text-rose-500 font-bold ml-0.5">*</span>
          </label>
          <CustomSelect
            value={reporterContact}
            onChange={(val) => onContactChange(val)}
            options={depts.map((d) => ({ value: d, label: d }))}
            placeholder="请选择所属部门"
          />
        </div>

        <div className="relative">
          <Input
            label="报修教职工姓名 *"
            type="text"
            value={reporterName}
            onChange={(e) => onNameChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="选择或输入姓名，如: 张老师"
            required
            autoComplete="off"
          />
          {showSuggestions && (
            <ReporterSuggestions
              accounts={accounts}
              contact={reporterContact}
              name={reporterName}
              onPick={onPickAccount}
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            故障分类 <span className="text-rose-500 font-bold ml-0.5">*</span>
          </label>
          <CustomSelect
            value={faultType}
            onChange={onFaultTypeChange}
            options={faultTypeOptions.map((ft) => ({ value: ft, label: ft }))}
            size="sm"
          />
        </div>

        <Input
          as="textarea"
          label="故障具体描述 *"
          value={faultDesc}
          onChange={(e) => onFaultDescChange(e.target.value)}
          rows={3}
          className="resize-none"
          placeholder="请说明故障发生经过及现象..."
          required
        />

        <div className="pt-2 flex justify-end space-x-3">
          <Button type="button" variant="secondary" size="md" className="flex-1" onClick={onClose}>
            取消
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            variant="primary"
            size="md"
            className="flex-[2]"
          >
            {submitting ? "提交中..." : "确定提交报修"}
          </Button>
        </div>
      </form>
    </div>
  </div>
);
