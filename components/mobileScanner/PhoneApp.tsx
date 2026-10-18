// components/mobileScanner/PhoneApp.tsx
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { ScannerApi } from './useMobileScanner';
import { AssetDetailScreen } from './AssetDetailScreen';
import { ScannerScreen } from './ScannerScreen';
const LoadingSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      {/* Status Indicator & Title Card skeleton */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton height="1.25rem" width="60px" className="rounded-full" />
          <Skeleton height="1.25rem" width="50px" className="rounded-full" />
        </div>
        <Skeleton height="1.5rem" width="80%" className="rounded-lg" />
        <Skeleton height="1rem" width="40%" className="rounded" />
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Skeleton height="0.75rem" width="50%" />
            <Skeleton height="1.25rem" width="70%" />
          </div>
          <div className="space-y-1">
            <Skeleton height="0.75rem" width="50%" />
            <Skeleton height="1.25rem" width="70%" />
          </div>
        </div>
      </div>

      {/* Specs & Metadata Card skeleton */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <Skeleton height="1.25rem" width="100px" className="border-b pb-2" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton height="0.75rem" width="60%" />
              <Skeleton height="1.125rem" width="80%" />
            </div>
          ))}
        </div>
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <Skeleton height="0.75rem" width="40%" />
          <Skeleton height="2rem" className="rounded-xl" />
        </div>
      </div>
    </div>
);

export const PhoneApp = ({ s, hideSimulatorContainer }: { s: ScannerApi; hideSimulatorContainer: boolean }) => {
  const { scannedAsset, scannerOpen, setScannedAsset, setScannerOpen, setActiveForm, loading } = s;
  return (
    <div className={`bg-slate-900 overflow-hidden flex flex-col text-slate-800 dark:text-slate-200 select-none ${hideSimulatorContainer ? 'min-h-dvh w-full' : 'h-[680px]'}`}>
      {/* Telephone Notch & Status Bar */}
      {!hideSimulatorContainer && (
        <div className="h-10 bg-slate-950 flex justify-between items-center px-6 text-white text-xs select-none">
          <span className="font-semibold text-xs tracking-tight">09:41</span>
          <div className="w-16 h-4 bg-black rounded-b-xl mx-auto absolute left-1/2 -translate-x-1/2 top-0"></div>
          <div className="flex items-center space-x-1.5 text-xs font-bold">
            <span>5G</span>
            <span>📱 100%</span>
          </div>
        </div>
      )}

      {/* App Title Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 text-white">
        {scannedAsset && !scannerOpen ? (
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => {
              setScannedAsset(null);
              setScannerOpen(true);
              setActiveForm(null);
            }}
            className="flex items-center space-x-1 text-white hover:text-teal-400 p-0 h-auto"
          >
            <ArrowLeft size={16} />
            <span className="text-xs font-semibold">扫码页</span>
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wider text-slate-200">EduAsset 终端</span>
          </div>
        )}
      </div>

      {/* View Shell Content */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <LoadingSkeleton />
        ) : scannerOpen ? (
          <ScannerScreen s={s} />
        ) : (
          <AssetDetailScreen s={s} />
        )}
      </div>

      {/* Footer Area with navigation simulation */}
      {!hideSimulatorContainer && (
        <div className="py-2.5 bg-slate-950 border-t border-slate-900 flex justify-center items-center shadow-lg">
          <div className="w-28 h-1 bg-white/70 rounded-full"></div>
        </div>
      )}
    </div>
  );
};
