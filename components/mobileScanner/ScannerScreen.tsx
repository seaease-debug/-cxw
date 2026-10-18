// components/mobileScanner/ScannerScreen.tsx
import { Camera } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ScannerApi } from './useMobileScanner';
export const ScannerScreen = ({ s }: { s: ScannerApi }) => {
  const { assets, barcodeInput, setBarcodeInput, errorMsg, handleScanCode } = s;
  return (
    <div className="space-y-4">
      {/* Camera Scanning Frame */}
      <div className="relative bg-slate-950 aspect-slate rounded-xl overflow-hidden shadow-inner border border-slate-800 flex flex-col items-center justify-center text-center p-6 text-white h-60">
        {/* Laser scan lines */}
        <div className="absolute inset-x-0 h-[2px] bg-emerald-400 w-full animate-[bounce_3s_infinite] opacity-60"></div>
        <div className="absolute inset-10 border-2 border-emerald-500 border-dashed rounded-xl opacity-30"></div>

        <Camera size={44} className="text-emerald-400 mb-3 animate-pulse" />
        <h4 className="font-semibold text-sm text-slate-100">请对准物资上的二维码</h4>
        <p className="text-xs text-slate-400 mt-1">支持：条形码、二维码、标签扫描</p>

        <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/5">
          <p className="text-xs text-emerald-300 font-mono font-bold tracking-widest truncate">
            CAMERA ACTIVE: REAR_LENS_F1.8
          </p>
        </div>
      </div>

      {/* Manual Entry or Testing Picker */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div>
          <div className="flex items-end space-x-2">
            <Input 
              label="手动输入条码/物资编号"
              type="text"
              className="font-mono text-xs"
              placeholder="例如: NB-2023-INFO-001"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
            />
            <Button 
              variant="primary"
              size="sm"
              onClick={() => barcodeInput.trim() && handleScanCode(barcodeInput)}
              className="bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl px-4 h-[34px] shrink-0"
            >
              检 索
            </Button>
          </div>
          {errorMsg && <p className="text-xs text-rose-500 font-bold mt-1.5 flex items-center">⚠ {errorMsg}</p>}
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400 font-bold uppercase mb-2">一键选择已有物资 模拟扫码：</p>
          <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
            {assets.slice(0, 8).map(a => (
              <Button 
                key={a.id}
                variant="secondary"
                onClick={() => handleScanCode(a.no)}
                className="w-full text-left p-2.5 h-auto hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center text-xs font-bold"
              >
                <div>
                  <p className="text-slate-800 dark:text-slate-200 font-semibold">{a.brandModel}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{a.no}</p>
                </div>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 p-1 rounded uppercase font-semibold">{a.currentStatus.substring(0, 4)}</span>
              </Button>
            ))}
            {assets.length === 0 && (
              <p className="text-center py-4 text-xs text-slate-400">正在获取可用资产库...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
