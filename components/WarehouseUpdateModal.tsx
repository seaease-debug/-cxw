import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Asset, DEPT_CODES, UserAccount } from '../types';
import { User, MapPin, Calendar, Building, Info, FileText, Trash2, Upload, Pencil, X, Lightbulb, Check, Camera } from 'lucide-react';
import { CustomSelect } from './CustomSelect';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { logError } from '../utils/logger';

interface WarehouseUpdateModalProps {
  asset: Asset;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  accountList?: UserAccount[];
}

const getBeijingDateString = () => {
  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const nd = new Date(utc + (3600000 * 8));
  const year = nd.getFullYear();
  const month = String(nd.getMonth() + 1).padStart(2, '0');
  const day = String(nd.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const WarehouseUpdateModal: React.FC<WarehouseUpdateModalProps> = ({
  asset,
  isSubmitting,
  onClose,
  onSubmit,
  accountList = [],
}) => {
  const [selectedDept, setSelectedDept] = useState(asset.departmentId || '科技信息中心');
  const dynamicDepts = Array.from(
    new Set([
      ...Object.keys(DEPT_CODES),
      ...accountList.map((a) => a.department).filter(Boolean),
    ])
  );
  const [keeperInput, setKeeperInput] = useState(asset.currentKeeperId || '');
  const [showKeeperSuggestions, setShowKeeperSuggestions] = useState(false);
  const [locationInput, setLocationInput] = useState(asset.currentLocationId || '');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [fixedLocations, setFixedLocations] = useState<Array<{ id: number; name: string; description: string }>>([]);
  const [localVoucherImage, setLocalVoucherImage] = useState<string | null>(asset.voucherImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFixedLocations(data);
        }
      })
      .catch((err) => logError('Failed to load locations:', err));
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalVoucherImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeVoucher = () => {
    setLocalVoucherImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-[var(--z-modal-overlay)] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
        onClick={onClose}
      ></motion.div>

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden z-[var(--z-modal)] flex flex-col"
      >
        {/* Header - Fixed to top, no sticky needed */}
        <div className="p-5 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="p-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-lg"><Pencil size={14} /></span>
              <span>出库/领用登记信息修正</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-semibold flex items-center gap-1.5">
              <span>正在修正资产：</span>
              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">{asset.brandModel || asset.name}</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="font-mono text-slate-400">{asset.no}</span>
            </p>
          </div>
          <Button 
            variant="ghost"
            size="sm"
            onClick={onClose} 
            className="w-8 h-8 rounded-full p-0"
            aria-label="关闭对话框"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Form - split into scrollable body and fixed footer */}
        <form onSubmit={onSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5 md:space-y-6">
            {/* Informative Guidance Banner matching User's Business Logic */}
            <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-xl text-amber-900/90 dark:text-amber-200 text-xs flex gap-3">
              <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-semibold">
                <p className="font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-1.5"><Lightbulb size={14} /> 信息修正规范指引：</p>
                <p className="mt-0.5 text-slate-600 dark:text-slate-300 font-medium">
                  本模块【仅限修正】出库登记时的手误或填错信息（如录错领用人、归属部门或上传了错误的凭证）。
                  <strong className="text-slate-800 dark:text-slate-100"> 如果设备发生了物理位置、归属人的实际流转</strong>，为了保证系统审计日志和物资追踪链条的 100% 严谨，请先为设备办理【退库登记】后再重新【出库】。
                </p>
              </div>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* 1. Department selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-2 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>领用归属部门 <Check size={12} className="inline-block mr-1" /></span>
              </label>
              <CustomSelect
                name="department"
                value={selectedDept}
                onChange={setSelectedDept}
                options={dynamicDepts.map((d) => ({ value: d, label: d }))}
              />
            </div>

            {/* 2. Keeper with suggestions list */}
            <div className="relative">
              <Input
                label="领用责任人 (保管人)"
                icon={<User className="w-3.5 h-3.5 text-slate-400" />}
                name="keeper"
                type="text"
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
                onFocus={() => setShowKeeperSuggestions(true)}
                onBlur={() => setTimeout(() => setShowKeeperSuggestions(false), 250)}
                required
                placeholder="例如: 张老师"
                autoComplete="off"
              />
              
              {showKeeperSuggestions && (
                <div className="absolute z-[var(--z-dropdown)] w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {accountList.filter(
                    (acc) => !keeperInput || acc.realName.includes(keeperInput)
                  ).length > 0 ? (
                    accountList
                      .filter((acc) => !keeperInput || acc.realName.includes(keeperInput))
                      .map((acc) => (
                        <div
                          key={acc.id}
                          className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setKeeperInput(acc.realName);
                            setShowKeeperSuggestions(false);
                            if (acc.department) {
                              setSelectedDept(acc.department);
                            }
                          }}
                        >
                          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{acc.realName}</span>
                          <span className="text-xs text-slate-400">{acc.department || acc.role}</span>
                        </div>
                      ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-slate-400 text-center">
                      未找到对应分配账号，支持手动输入任意教工名
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Room Location with fixed location suggestions */}
            <div className="relative">
              <Input
                label="最新存放/保管物理位置"
                icon={<MapPin className="w-3.5 h-3.5 text-slate-400" />}
                name="location"
                type="text"
                value={locationInput}
                onChange={(e) => {
                  setLocationInput(e.target.value);
                  setShowLocationSuggestions(true);
                }}
                onFocus={() => setShowLocationSuggestions(true)}
                onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 250)}
                placeholder="点击选择固定场所或自由输入临时地点"
                required
                autoComplete="off"
              />

              {showLocationSuggestions && (
                <div className="absolute z-[var(--z-dropdown)] w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {fixedLocations.filter(
                    (loc) => !locationInput || loc.name.includes(locationInput) || loc.description?.includes(locationInput)
                  ).length > 0 ? (
                    fixedLocations
                      .filter((loc) => !locationInput || loc.name.includes(locationInput) || loc.description?.includes(locationInput))
                      .map((loc) => (
                        <div
                          key={loc.id}
                          className="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setLocationInput(loc.name);
                            setShowLocationSuggestions(false);
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{loc.name}</span>
                            {loc.description && (
                              <span className="text-xs text-slate-400">{loc.description}</span>
                            )}
                          </div>
                          <span className="text-xs bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                            受控固定场所
                          </span>
                        </div>
                      ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-slate-400 text-center">
                      未在字典匹配，系统将作为【临时/流动地点】保存
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. Outbound Date */}
            <Input
              label="登记出库具体日期"
              name="outboundDate"
              type="date"
              defaultValue={asset.outboundDate || getBeijingDateString()}
              icon={<Calendar className="w-3.5 h-3.5 text-slate-400" />}
              required
            />
          </div>

          {/* 5. Remarks */}
          <Input
            as="textarea"
            label="使用/维保/领用补充备注"
            icon={<FileText className="w-3.5 h-3.5 text-slate-400" />}
            name="remarks"
            defaultValue={asset.remarks}
            className="h-20 resize-none"
            placeholder="如有批复文件号或对原配置有变动请在此处注明..."
          />

          {/* 6. Voucher Image Correction */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-3 flex items-center gap-1.5">
              <span className="flex items-center gap-1.5"><Camera size={14} /> 领用签字凭证/单据更正 (可选)</span>
            </label>
            
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800">
              {localVoucherImage ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={localVoucherImage}
                    alt="Current Voucher"
                    className="h-28 w-44 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                  />
                  <div className="text-center sm:text-left space-y-2">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">已有签字凭证/出库回执单</p>
                    <p className="text-xs text-slate-400">已保存至科技信息中心固定资产库。若要更正：</p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-3 h-3" />
                        <span>重新上传</span>
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={removeVoucher}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>移除此凭证</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-400 rounded-xl p-6 text-center cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all flex flex-col items-center justify-center"
                >
                  <Upload className="w-6 h-6 text-slate-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">点击上传新领归签字凭证/设备签收单</p>
                  <p className="text-xs text-slate-400 mt-1">支持图片文件 (JPG / PNG)，最大不超过 2MB</p>
                </div>
              )}

              {/* Hidden file selector */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />

              {/* Hidden serialized field passed back to form state */}
              <input
                type="hidden"
                name="voucherImage"
                value={localVoucherImage || ''}
              />
            </div>
          </div>

          </div>

          {/* Action buttons - fixed at bottom, below scrollable container */}
          <div className="flex space-x-3 p-5 md:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 shrink-0">
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={onClose}
            >
              取消并退出
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="primary"
              size="md"
              className="flex-1 font-sans"
            >
              {isSubmitting ? '保存修改中...' : '保存修正数据'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default WarehouseUpdateModal;
