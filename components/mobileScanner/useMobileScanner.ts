// components/mobileScanner/useMobileScanner.ts
// B1-5：把原 1488 行的组件函数拆成 4 个职责单一的 hook，最后在这里合并成
// 视图层唯一需要的对象 `s`（视图只解构，不直接依赖任何具体 hook）。
//
//   1. useScannerStore    —— 全部 useState / useRef / 派生值
//   2. useScannerData     —— 数据加载（refreshData / fetchHistory / 两个 effect）
//   3. useScannerSubmits  —— 五个作业提交
//   4. useScannerControls —— 扫码、表单开关、拍照、内联登录
import { UserAccount } from '../../types';
import { getCanReportRepair, getCanViewPrice, getHasWritePermission } from './helpers';
import { useScannerControls } from './useScannerControls';
import { useScannerData } from './useScannerData';
import { useScannerStore } from './useScannerStore';
import { useScannerSubmits } from './useScannerSubmits';

export interface UseMobileScannerOptions {
  user: UserAccount | null;
  initialAssetNo?: string;
}

export const useMobileScanner = ({ user, initialAssetNo }: UseMobileScannerOptions) => {
  const store = useScannerStore(initialAssetNo);
  const data = useScannerData(store, user, initialAssetNo);
  const submits = useScannerSubmits(store, data);
  const controls = useScannerControls(store, data);

  return {
    user,
    ...store,
    ...data,
    ...submits,
    ...controls,
    hasWritePermission: getHasWritePermission(user, store.scannedAsset),
    canViewPrice: getCanViewPrice(user),
    canReportRepair: getCanReportRepair(user),
  };
};

export type ScannerApi = ReturnType<typeof useMobileScanner>;
