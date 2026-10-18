// components/maintenance/modals/CreateReportModal.tsx
// 弹窗 1：登记设备故障报修（原 renderCreateModal）。整块原样搬运，无分支改动。
import React from 'react';
import { Wrench } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { CustomSelect } from '../../CustomSelect';
import { FAULT_TYPES, type MaintenanceApi } from '../useMaintenance';

export type CreateReportModalProps = Pick<
  MaintenanceApi,
  | 'showCreateModal'
  | 'setShowCreateModal'
  | 'handleCreateReport'
  | 'selectedAssetId'
  | 'setSelectedAssetId'
  | 'assets'
  | 'reporterName'
  | 'setReporterName'
  | 'reporterContact'
  | 'setReporterContact'
  | 'faultType'
  | 'setFaultType'
  | 'dbFaultTypes'
  | 'faultDesc'
  | 'setFaultDesc'
  | 'submitting'
>;

/** 弹窗 1：登记设备故障报修。 */
export const CreateReportModal: React.FC<CreateReportModalProps> = ({
  showCreateModal, setShowCreateModal, handleCreateReport,
  selectedAssetId, setSelectedAssetId, assets,
  reporterName, setReporterName, reporterContact, setReporterContact,
  faultType, setFaultType, dbFaultTypes, faultDesc, setFaultDesc, submitting,
}) => {
  if (!showCreateModal) return null;
  return (

    <div 
      className="fixed inset-0 bg-black/50 z-[var(--z-modal-overlay)] flex items-center justify-center p-4 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowCreateModal(false);
        }
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800/80 animate-in fade-in zoom-in duration-150 cursor-default font-sans">
        <div className="p-5 bg-teal-600 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base tracking-wide flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-300" />
              登记设备故障报修
            </h3>
            <p className="text-xs text-teal-100/80 mt-0.5">登记设备故障并开启维修跟踪</p>
          </div>
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateModal(false)}
            className="w-8 h-8 rounded-full text-white hover:bg-white/20 p-0"
          >
            ✕
          </Button>
        </div>

        <form onSubmit={handleCreateReport} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              选择报修装备 <span className="text-rose-500 font-bold ml-0.5">*</span>
            </label>
            <CustomSelect
              value={selectedAssetId}
              onChange={setSelectedAssetId}
              options={[
                { value: "", label: "-- 请选择要报修的装备 --" },
                ...assets.map(a => ({
                  value: a.id,
                  label: `${a.no} - ${a.brandModel || a.name} (${a.currentStatus})`
                }))
              ]}
              size="sm"
              className="bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="text"
              label="报修教职工 *"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 font-semibold"
              placeholder="填写姓名"
              required
            />
            <Input
              type="text"
              label="所属部门/科室"
              value={reporterContact}
              onChange={(e) => setReporterContact(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 font-semibold"
              placeholder="部门信息"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              故障分类 <span className="text-rose-500 font-bold ml-0.5">*</span>
            </label>
            <CustomSelect
              value={faultType}
              onChange={setFaultType}
              options={(dbFaultTypes.length > 0 ? dbFaultTypes : FAULT_TYPES).map((ft) => ({
                value: ft,
                label: ft
              }))}
              size="sm"
              className="bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <Input
            as="textarea"
            label="故障具体描述 *"
            value={faultDesc}
            onChange={(e) => setFaultDesc(e.target.value)}
            rows={3}
            className="bg-slate-50 dark:bg-slate-800"
            placeholder="请说明故障发生经过及现象..."
            required
          />

          <div className="pt-2 flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setShowCreateModal(false)}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              variant="primary"
              size="md"
            >
              {submitting ? '正在提交...' : '确认提交报修'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
