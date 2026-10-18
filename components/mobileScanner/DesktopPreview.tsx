// components/mobileScanner/DesktopPreview.tsx
import { Shield } from 'lucide-react';
import { ScannerApi } from './useMobileScanner';
import { PhoneApp } from './PhoneApp';
import { PhotoPreviewModal } from './PhotoPreviewModal';
export const DesktopPreview = ({ s }: { s: ScannerApi }) => {
  const { scannedAsset } = s;
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">📱 移动端固定资产扫码查验与操作门户</h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1 font-medium">
          该模块专门针对物理设备上的二维条码标签提供手机端的扫码解析。游客用户（教职工、普通学生）无需登录，即可扫描校内设备上的二维码，迅速查看资产基本寿命、参数特征及所属历史流转日志。管理员与保管员在移动设备上手动输入资产或通过扫码后，能以最高效、严谨的步骤录入出库、退归还、修缮变动和资产废置处理。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Aspect: Instructions, Quick links and Real Phone scan QR generator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="font-bold text-md text-slate-800 dark:text-slate-100 flex items-center">
              <span className="mr-2">📲</span>
              在真实手机微信/相机中查验
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              科技信息中心仓库里的每一台固定资产排架上都贴有对应的二维码。你可以点击下方一键产生可供真实手机扫描的二维码，或者调用局域网移动设备测试：
            </p>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
              {scannedAsset ? (
                <>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`${window.location.origin}${window.location.pathname}?asset_no=${scannedAsset.no}`)}&size=160x160`}
                    alt="Real Scan QR Code"
                    className="w-40 h-40 bg-white p-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-700"
                  />
                  <span className="block text-xs text-slate-400 font-mono font-bold uppercase mt-2.5">{scannedAsset.no}（扫我测试）</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xs">
                    请打开手机微信扫一扫（或相机扫码），能够立即在手机全屏端查看本台 <b className="text-slate-700 dark:text-slate-200">{scannedAsset.brandModel}</b> 的流转与所有控制操作。
                  </p>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">📳</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-400">在右侧模拟器中查验任何一类物资</p>
                  <p className="text-xs text-slate-400 mt-1">这里就会相应呈现出可手机真扫测试的条码</p>
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">扫码后的状态响应逻辑列表：</p>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 font-medium text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span className="text-emerald-700 dark:text-emerald-400">在库 / 周转中</span>
                  <span className="text-slate-600 dark:text-slate-300">仅允许教师、主管执行 <b className="text-slate-700 dark:text-slate-200">出库领用登记</b></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-teal-700 dark:text-teal-400">服役中 (借调中)</span>
                  <span className="text-slate-600 dark:text-slate-300">仅允许登记 <b className="text-slate-700 dark:text-slate-200">归还登记</b> / <b className="text-slate-700 dark:text-slate-200">变更位置信息</b></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-700 dark:text-rose-400">待废 / 废料区</span>
                  <span className="text-slate-600 dark:text-slate-300">仅允许保管人操作 <b className="text-slate-700 dark:text-slate-200">报废确认</b></span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-xl space-y-4">
            <h4 className="font-extrabold text-sm text-amber-400 flex items-center">
              <Shield size={16} className="mr-1.5 text-amber-400" />
              严谨的数据完整度约束
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              贯彻系统安全规范，本移动扫码端的“领用出库登记”、“退回登记”都配有完整的强制字段输入机制，系统自动分配最新的设备出库订单码，从前端有效避免了以往移动端容易产生的漏记、重记等物资管理通病，确保存档链条 100% 完整与严谨。
            </p>
          </div>
        </div>

        {/* Center / Right Aspect: Beautiful Interactive Smartphone replica */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="relative p-4 bg-slate-800 rounded-device-mock shadow-xl border-4 border-slate-700 max-w-sm w-full">
            {/* Phone speaker mesh & front lens */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-full z-10 flex justify-between items-center px-4">
              <div className="w-16 h-1 bg-slate-800 rounded-full mx-auto"></div>
              <div className="w-2.5 h-2.5 bg-slate-900 rounded-full"></div>
            </div>

            {/* Embedded device replica */}
          <PhoneApp s={s} hideSimulatorContainer={false} />
          </div>
        </div>
      </div>

      <PhotoPreviewModal s={s} />
    </div>
  );
};
