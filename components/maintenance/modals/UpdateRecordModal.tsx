// components/maintenance/modals/UpdateRecordModal.tsx
// 弹窗 2：更新维修进度与登记完修（原 renderUpdateModal）。
// 三处子块改为组件调用；「现场完修」提示里的原位置由 inline IIFE 改为 ./shared 纯函数。
import React from 'react';
import { Check } from 'lucide-react';
import { UserRole } from '../../../types';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { CustomSelect } from '../../CustomSelect';
import type { MaintenanceApi } from '../useMaintenance';
import { resolveSiteLocation } from './shared';
import { CostVendorField } from './CostVendorField';
import { ResultActionPicker } from './ResultActionPicker';
import { WarehousePicker } from './WarehousePicker';

export type UpdateRecordModalProps = Pick<
  MaintenanceApi,
  | 'showUpdateModal'
  | 'selectedRecord'
  | 'user'
  | 'handleUpdateRecord'
  | 'updateStatus'
  | 'setUpdateStatus'
  | 'updateCost'
  | 'setUpdateCost'
  | 'updateResultAction'
  | 'setUpdateResultAction'
  | 'updateNotes'
  | 'setUpdateNotes'
  | 'submitting'
  | 'setShowUpdateModal'
  | 'assets'
  | 'suppliers'
  | 'updateVendor'
  | 'setUpdateVendor'
  | 'showVendorSuggestions'
  | 'setShowVendorSuggestions'
  | 'targetWarehouse'
  | 'setTargetWarehouse'
  | 'warehouses'
>;

/** 弹窗 2：更新维修进度与登记完修。 */
export const UpdateRecordModal: React.FC<UpdateRecordModalProps> = ({
  showUpdateModal, selectedRecord, user, handleUpdateRecord,
  updateStatus, setUpdateStatus, updateCost, setUpdateCost,
  updateResultAction, setUpdateResultAction, updateNotes, setUpdateNotes,
  submitting, setShowUpdateModal, assets,
  suppliers, updateVendor, setUpdateVendor, showVendorSuggestions, setShowVendorSuggestions,
  targetWarehouse, setTargetWarehouse, warehouses,
}) => {
  if (!showUpdateModal || !selectedRecord) return null;
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.KEEPER) return null;
  const subProps = {
    selectedRecord, assets, suppliers,
    updateVendor, setUpdateVendor, showVendorSuggestions, setShowVendorSuggestions,
    updateResultAction, setUpdateResultAction, setUpdateStatus,
    updateStatus, targetWarehouse, setTargetWarehouse, warehouses,
  };
  return (

    <div 
      className="fixed inset-0 bg-black/50 z-[var(--z-modal-overlay)] flex items-center justify-center p-4 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowUpdateModal(false);
        }
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-150 cursor-default">
        <div className="p-6 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">{selectedRecord.record_no}</span>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">更新维修进度与登记完修</h3>
          </div>
        </div>

        <form onSubmit={handleUpdateRecord} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedRecord.asset_name}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">报修人: {selectedRecord.reporter_name} ({selectedRecord.reporter_contact || '未填电话'})</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">故障现象: {selectedRecord.fault_description}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              当前维修处理状态 <span className="text-rose-500 font-bold ml-0.5">*</span>
            </label>
            <CustomSelect
              value={updateStatus}
              onChange={(val) => {
                setUpdateStatus(val);
                if (val === '已完修') {
                  setUpdateResultAction('RETURN_TO_WAREHOUSE');
                } else if (val === '无法修复') {
                  setUpdateResultAction('SCRAP');
                } else {
                  setUpdateResultAction('NONE');
                }
              }}
              options={[
                { value: "待维修", label: "待维修 (已登记/待安排送修)" },
                { value: "维修中", label: "维修中 (正在诊断/送修服务商)" },
                { value: "已完修", label: "已完修 (修复正常，可返仓归还)" },
                { value: "无法修复", label: "无法修复 (损伤严重，建议转待报废)" }
              ]}
              size="sm"
              className="bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                type="number"
                step="0.01"
                label="维修花费金额 (￥) *"
                value={updateCost}
                onChange={(e) => setUpdateCost(parseFloat(e.target.value) || 0)}
                className="font-bold bg-slate-50 dark:bg-slate-800"
                placeholder="0.00"
                required
              />
            </div>

          <CostVendorField {...subProps} />
          </div>

          <ResultActionPicker {...subProps} />

          {updateResultAction === 'SITE_REPAIR_COMPLETE' && (
            <div className="p-3.5 bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/50 rounded-xl text-xs text-teal-900 dark:text-teal-300 flex items-start gap-2.5">
              <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-teal-200">现场 / 原位完修模式（不回仓）</p>
                <p className="text-xs text-slate-600 dark:text-teal-300/80 mt-1 leading-relaxed">
                  设备已在现场修复完毕或修好后原路送回。系统将直接恢复其【在用】状态，并完整保留原放置位置（{resolveSiteLocation(assets, selectedRecord.asset_id, selectedRecord.asset_no)}）及原使用人/保管人，无需经过仓库再次办理领用出库。
                </p>
              </div>
            </div>
          )}

          <WarehousePicker {...subProps} />

          <Input
            as="textarea"
            label="维修说明 / 替换配件记录"
            value={updateNotes}
            onChange={(e) => setUpdateNotes(e.target.value)}
            rows={2}
            className="bg-slate-50 dark:bg-slate-800"
            placeholder="如更换内存条、主板维修、网卡替换等..."
          />

          <div className="pt-2 flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setShowUpdateModal(false)}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              variant="primary"
              size="md"
            >
              {submitting ? '保存中...' : '保存更新并记录存底'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
