// components/mobileScanner/types.ts
// B1-5：原 components/MobileScanner.tsx 的类型定义外提。
// 说明：这些接口原本内联在 1687 行的单文件里，搬出来后没有任何语义改动。
import { UserAccount } from '../../types';

/** 后端 /api/assets 原始行（下划线命名） */
export interface RawDbAsset {
  id: number | string;
  asset_no: string;
  name: string;
  type: string;
  brand_model: string;
  specification?: string;
  serial_no: string;
  purchase_date: string;
  purchase_price: number;
  supplier?: string;
  warranty_period?: string;
  status: string;
  department: string;
  keeper: string;
  location: string;
  warehouse_location: string;
  mac_address?: string;
  remarks?: string;
  retirement_years?: number;
  uploader?: string;
  audit_code?: string;
  voucher_image?: string;
  asset_image?: string;
  outbound_date?: string;
}

export interface MobileScannerProps {
  user: UserAccount | null;
  initialAssetNo?: string;
  _onLoginRequired?: () => void;
  _onClose?: () => void;
  hideSimulatorContainer?: boolean; // If true, render the phone screen directly to match real mobile devices
}

/** 当前展开的作业表单 */
export type ScannerForm = 'outbound' | 'return' | 'location' | 'repair' | null;
