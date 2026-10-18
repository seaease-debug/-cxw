// components/mobileScanner/AssetForms.tsx
import { Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { CustomSelect } from '../CustomSelect';
import { Input } from '../ui/Input';
import { getBeijingDateString } from './helpers';
import { ScannerApi } from './useMobileScanner';
export const AssetFormsPanel = ({ s }: { s: ScannerApi }) => {
  const { activeForm, setActiveForm, setOutboundImage } = s;
  if (!activeForm) return null;
  return (
    <div className="bg-teal-50 dark:bg-slate-900 border border-teal-100 dark:border-teal-900/50 p-5 rounded-xl shadow-md space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-teal-900 dark:text-teal-300 tracking-wider flex items-center">
          <Shield size={14} className="mr-1 text-teal-500" />
          {activeForm === 'outbound' ? '领用出库登记' : activeForm === 'return' ? '归还退库登记' : activeForm === 'repair' ? '设备故障报修' : '最新位置修改'}
        </span>
        <Button variant="ghost" size="sm" onClick={() => { setActiveForm(null); setOutboundImage(null); }} className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-bold p-0 h-auto">✕ 取消</Button>
      </div>
      {activeForm === 'outbound' && (<OutboundForm s={s} />)}
      {activeForm === 'return' && (<ReturnForm s={s} />)}
      {activeForm === 'location' && (<LocationForm s={s} />)}
      {activeForm === 'repair' && (<RepairForm s={s} />)}
    </div>
  );
};

/** Outbound Borrow Form */
export const OutboundForm = ({ s }: { s: ScannerApi }) => {
  const {
    accountList, dynamicDepts, fileInputRef, handleOutboundSubmit,
    handlePhotoUpload, keeperInput, outboundId, outboundImage, selectedDept, setKeeperInput,
    setSelectedDept, setShowKeeperSuggestions, showKeeperSuggestions, submitting,
  } = s;
  return (
    <form onSubmit={handleOutboundSubmit} className="space-y-3.5">
      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">领用部门 <span className="text-rose-500 font-bold ml-0.5">*</span></label>
        <CustomSelect 
          name="department" 
          value={selectedDept}
          onChange={setSelectedDept}
          options={dynamicDepts.map(d => ({ value: d, label: d }))}
          size="sm"
          className="bg-white dark:bg-slate-800"
        />
      </div>
      <div className="relative">
        <Input 
          name="keeper"
          type="text" 
          label="领用人 (教职工)"
          value={keeperInput}
          onChange={(e) => {
            const val = e.target.value;
            setKeeperInput(val);
            setShowKeeperSuggestions(true);
            const matched = accountList.find(acc => acc.realName === val);
            if (matched && matched.department) {
              setSelectedDept(matched.department);
            }
          }}
          placeholder="教职工拼音首字母或名字"
          required
        />
        {showKeeperSuggestions && (
          <div className="absolute z-[var(--z-dropdown)] w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-36 overflow-y-auto">
            {accountList.filter(acc => !keeperInput || acc.realName.includes(keeperInput)).length > 0 ? (
              accountList.filter(acc => !keeperInput || acc.realName.includes(keeperInput)).map(acc => (
                <div 
                  key={acc.id}
                  onClick={() => {
                    setKeeperInput(acc.realName);
                    setShowKeeperSuggestions(false);
                    if (acc.department) {
                      setSelectedDept(acc.department);
                    }
                  }}
                  className="px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center text-xs font-bold border-b border-slate-50 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  <span>{acc.realName}</span>
                  <span className="text-xs text-slate-400">{acc.department}</span>
                </div>
              ))
            ) : (
              <div className="p-2 text-center text-xs text-slate-400">没有匹配的教职工</div>
            )}
          </div>
        )}
      </div>
       <Input 
         name="location"
         type="text" 
         label="最新存放物理位置"
         placeholder="例如: 信息科研楼401室"
         required
       />
       <div>
         <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">出库单号 (系统保留)</label>
         <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono text-slate-500 dark:text-slate-400 font-extrabold select-all">{outboundId}</div>
       </div>
       <Input 
         name="outboundDate"
         type="date"
         label="出库登记日期"
         defaultValue={getBeijingDateString()}
         required
       />
      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">凭证/物资签字照拍照上传 (选填)</label>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-center bg-white dark:bg-slate-800/80 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            capture="environment" 
            onChange={handlePhotoUpload} 
          />
          {outboundImage ? (
            <img src={outboundImage} className="max-h-20 mx-auto rounded-lg" alt="Voucher" />
          ) : (
            <div className="text-slate-400">
              <span>📸 拍照上传</span>
              <p className="text-xs mt-0.5">支持调取移动端原生相机</p>
            </div>
          )}
        </div>
      </div>
      <Button 
        type="submit" 
        variant="primary"
        disabled={submitting} 
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-lg shadow-teal-100 dark:shadow-none"
      >
        {submitting ? '保存中...' : '提交领用登记(严谨)'}
      </Button>
    </form>
  );
};

/** Return Form (Full Strict Form) */
export const ReturnForm = ({ s }: { s: ScannerApi }) => {
  const {
    fileInputRef, handlePhotoUpload, handleReturnSubmit, outboundImage,
    returnStatus, returnWarehouse, setReturnStatus, setReturnWarehouse, submitting,
  } = s;
  return (
    <form onSubmit={handleReturnSubmit} className="space-y-3.5">
      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">退库目的地仓库 <span className="text-rose-500 font-bold ml-0.5">*</span></label>
        <CustomSelect 
          value={returnWarehouse}
          onChange={setReturnWarehouse}
          options={[
            { value: "周转仓-可用区", label: "周转仓-可用区" },
            { value: "周转仓-待检测区", label: "周转仓-待检测区" }
          ]}
          size="sm"
          className="bg-white dark:bg-slate-800"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">归还判定状态 <span className="text-rose-500 font-bold ml-0.5">*</span></label>
        <CustomSelect 
          value={returnStatus}
          onChange={setReturnStatus}
          options={[
            { value: "周转仓(待处理)", label: "周转仓(待处理) / 待检测维护" },
            { value: "周转仓(待派发)", label: "周转仓(待派发) / 可立即借调" },
            { value: "待报废", label: "直接判定淘汰 / 申请待报废" }
          ]}
          size="sm"
          className="bg-white dark:bg-slate-800"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">凭证拍照(上传) / 退库凭证 (选填)</label>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-center bg-white dark:bg-slate-800/80 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            capture="environment" 
            onChange={handlePhotoUpload} 
          />
          {outboundImage ? (
            <img src={outboundImage} className="max-h-20 mx-auto rounded-lg" alt="Return Voucher" />
          ) : (
            <div className="text-slate-400">
              <span>📸 物资回收拍照</span>
            </div>
          )}
        </div>
      </div>
      <Button 
        type="submit" 
        variant="primary"
        disabled={submitting} 
        className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md"
      >
        {submitting ? '保存中...' : '提交资产归还登记'}
      </Button>
    </form>
  );
};

/** Location & Remarks Change Form */
export const LocationForm = ({ s }: { s: ScannerApi }) => {
  const { handleLocationSubmit, scannedAsset, submitting } = s;
  if (!scannedAsset) return null;
  return (
    <form onSubmit={handleLocationSubmit} className="space-y-3.5">
      <Input 
        name="location"
        type="text" 
        label="修正存放位置 *"
        className="w-full bg-white dark:bg-slate-800"
        defaultValue={scannedAsset.currentLocationId}
        placeholder="新门牌号 / 物理仓号"
        required
      />
      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">附加现场标记说明 (选填)</label>
        <textarea 
          name="remarks"
          className="w-full bg-white dark:bg-slate-800 border border-field text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-xs h-16 resize-none"
          defaultValue={scannedAsset.remarks}
          placeholder="例如: 屏幕上有划痕，功能完好"
        />
      </div>
      <Button 
        type="submit" 
        variant="primary"
        disabled={submitting} 
        className="w-full bg-teal-600 text-white font-semibold text-xs py-2.5 rounded-xl"
      >
        {submitting ? '变更中...' : '保存变更'}
      </Button>
    </form>
  );
};

/** Repair Form */
export const RepairForm = ({ s }: { s: ScannerApi }) => {
  const {
    accountList, dynamicDepts, dynamicFaultTypes, handleRepairSubmit, repairFaultDesc,
    repairFaultType, repairReporterContact, repairReporterName, setRepairFaultDesc,
    setRepairFaultType, setRepairReporterContact, setRepairReporterName,
    setShowMobileRepairSuggestions, showMobileRepairSuggestions, submitting,
  } = s;
  return (
    <form onSubmit={handleRepairSubmit} className="space-y-3.5">
      <Input 
        type="text" 
        label="部门"
        value={repairReporterContact}
        onChange={(e) => setRepairReporterContact(e.target.value)}
        className="w-full bg-white dark:bg-slate-800"
        placeholder="请选择或输入部门，如: 科技信息中心"
        list="mobile-repair-depts"
      />
      <datalist id="mobile-repair-depts">
        {dynamicDepts.map((d, i) => (
          <option key={i} value={d} />
        ))}
      </datalist>
      <div className="relative">
        <Input 
          type="text" 
          label="报修教职工姓名 *"
          value={repairReporterName}
          onChange={(e) => {
            const val = e.target.value;
            setRepairReporterName(val);
            setShowMobileRepairSuggestions(true);
            const matched = accountList.find(acc => acc.realName === val);
            if (matched && matched.department) {
              setRepairReporterContact(matched.department);
            }
          }}
          onFocus={() => setShowMobileRepairSuggestions(true)}
          onBlur={() => setTimeout(() => setShowMobileRepairSuggestions(false), 200)}
          className="w-full bg-white dark:bg-slate-800"
          placeholder="选择或输入姓名，如: 张老师"
          required
          autoComplete="off"
        />
        {showMobileRepairSuggestions && (
          <div className="absolute z-[var(--z-dropdown)] w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-40 overflow-y-auto font-sans">
            {(() => {
              const filteredList = accountList.filter((acc) => {
                const deptMatch = !repairReporterContact || acc.department === repairReporterContact;
                const textMatch = !repairReporterName || acc.realName.includes(repairReporterName);
                return deptMatch && textMatch;
              });
              return filteredList.length > 0 ? (
                filteredList.map((acc, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center border-b border-slate-50 dark:border-slate-700 last:border-0 text-xs"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setRepairReporterName(acc.realName);
                      setShowMobileRepairSuggestions(false);
                      if (acc.department) {
                        setRepairReporterContact(acc.department);
                      }
                    }}
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{acc.realName}</span>
                    <span className="text-xs text-slate-400">{acc.department || acc.role}</span>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-slate-400 text-center">
                  未匹配，可手工输入
                </div>
              );
            })()}
          </div>
        )}
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">故障类型 <span className="text-rose-500 font-bold ml-0.5">*</span></label>
        <CustomSelect 
          value={repairFaultType}
          onChange={setRepairFaultType}
          options={(dynamicFaultTypes.length > 0 ? dynamicFaultTypes : [
            "硬件损坏 / 配件故障",
            "软件 / 操作系统异常",
            "无法开机 / 供电故障",
            "屏幕 / 外观破损",
            "网络 / 通信故障",
            "其他故障"
          ]).map((ft) => ({ value: ft, label: ft }))}
          size="sm"
          className="bg-white dark:bg-slate-800"
        />
      </div>
      <Input 
        as="textarea"
        label="故障现象描述 *"
        value={repairFaultDesc}
        onChange={(e) => setRepairFaultDesc(e.target.value)}
        rows={3}
        className="text-xs font-medium resize-none bg-white dark:bg-slate-800"
        placeholder="请描述故障现象..."
        required
      />
      <Button 
        type="submit" 
        variant="primary"
        disabled={submitting} 
        className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md"
      >
        {submitting ? '提交中...' : '确认提交故障报修单'}
      </Button>
    </form>
  );
};
