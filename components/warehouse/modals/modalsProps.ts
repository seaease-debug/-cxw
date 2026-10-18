import React from "react";
import {
  Asset,
  AssetStatus,
  UserAccount,
  Supplier,
  Warehouse as WarehouseRecord,
  AssetTypeItem,
} from "../../../types";

/**
 * B3 拆分：从 WarehouseModals.tsx 原样搬出的 props 契约（**字段逐字未改**）。
 * 抽到独立文件是为了让 WarehouseModalSections.tsx 能引用它而不与入口形成模块环。
 * 入口仍以 `export type { WarehouseModalsProps }` 转发 ⇒ 对外可见面不变。
 */
export interface WarehouseModalsProps {
  // Visibility flags
  showInboundModal: boolean;
  showReturnModal: boolean;
  showReportModal: boolean;
  showBatchOutboundModal: boolean;
  showBatchReturnModal: boolean;
  showBatchProcessModal: boolean;

  // Import status
  isImporting: boolean;
  importProgress: number;
  importErrors: string[];

  // Asset data
  viewingAsset: Asset | null;
  editingAsset: Asset | null;
  updatingAsset: Asset | null;
  returningAsset: Asset | null;
  selectedAssetForOut: Asset | null;
  realAssets: Asset[];
  selectedBatchAssetIds: string[];

  // Account / dept data
  accountList: UserAccount[];
  dynamicDepts: string[];

  // Submit state
  isSubmitting: boolean;

  // Report modal state
  dbFaultTypes: Array<{ id: number; name: string; enabled?: boolean }>;
  reporterName: string;
  reporterContact: string;
  faultType: string;
  faultDesc: string;
  submittingReport: boolean;
  showReportKeeperSuggestions: boolean;

  // Inbound modal state
  inboundType: string;
  inboundAssetImage: string | null;
  inboundDate: string;
  warehouseLocation: string;
  schoolCode: string;
  assetTypes: AssetTypeItem[];
  suppliers: Supplier[];
  warehouseList: WarehouseRecord[];

  // Return modal state
  returnWarehouse: string;
  returnStatus: AssetStatus;
  returnImage: string | null;

  // Outbound modal state
  selectedDeptForOut: string;
  selectedDeptForBatchOut: string;
  keeperInput: string;
  showKeeperSuggestions: boolean;
  singleOutLocationInput: string;
  showSingleOutLocationSuggestions: boolean;
  batchOutLocationInput: string;
  showBatchOutLocationSuggestions: boolean;
  fixedLocations: Array<{ id: number; name: string; description: string }>;
  outboundImage: string | null;

  // Batch process state
  batchActionType: "restock" | "scrap" | "scrap_confirm" | "";
  isSingleProcess: boolean;

  // Refs
  inboundAssetImageRef: React.RefObject<HTMLInputElement | null>;
  returnFileInputRef: React.RefObject<HTMLInputElement | null>;
  outboundFileInputRef: React.RefObject<HTMLInputElement | null>;
  batchOutboundFileInputRef: React.RefObject<HTMLInputElement | null>;
  batchReturnFileInputRef: React.RefObject<HTMLInputElement | null>;

  // Toast
  showToast: (
    message: string,
    type: "success" | "error" | "warning" | "info",
  ) => void;

  // State setters
  setImportErrors: (errors: string[]) => void;
  setViewingAsset: (asset: Asset | null) => void;
  setAssetsToPrint: (assets: Asset[] | null) => void;
  setShowReportModal: (show: boolean) => void;
  setReporterName: (name: string) => void;
  setReporterContact: (contact: string) => void;
  setFaultType: (type: string) => void;
  setFaultDesc: (desc: string) => void;
  setSubmittingReport: (submitting: boolean) => void;
  setShowReportKeeperSuggestions: (show: boolean) => void;
  setInboundType: (type: string) => void;
  setInboundAssetImage: (image: string | null) => void;
  setInboundDate: (date: string) => void;
  setWarehouseLocation: (location: string) => void;
  setSchoolCode: (code: string) => void;
  setShowReturnModal: (show: boolean) => void;
  setReturnWarehouse: (warehouse: string) => void;
  setReturnStatus: (status: AssetStatus) => void;
  setShowUpdateModal: (show: boolean) => void;
  setUpdatingAsset: (asset: Asset | null) => void;
  setSelectedDeptForOut: (dept: string) => void;
  setSelectedDeptForBatchOut: (dept: string) => void;
  setKeeperInput: (input: string) => void;
  setShowKeeperSuggestions: (show: boolean) => void;
  setSingleOutLocationInput: (input: string) => void;
  setShowSingleOutLocationSuggestions: (show: boolean) => void;
  setBatchOutLocationInput: (input: string) => void;
  setShowBatchOutLocationSuggestions: (show: boolean) => void;
  setOutboundImage: (image: string | null) => void;
  setPreviewImage: (image: string | null) => void;
  setReturnImage: (image: string | null) => void;
  setShowBatchOutboundModal: (show: boolean) => void;
  setShowBatchReturnModal: (show: boolean) => void;
  setShowBatchProcessModal: (show: boolean) => void;
  setSelectedBatchAssetIds: (ids: string[]) => void;

  // Handler functions
  handleBack: () => void;
  handleInboundSubmit: (e: React.FormEvent) => void;
  handleOutboundSubmit: (e: React.FormEvent) => void;
  handleReturnImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleReturnSubmit: () => void;
  handleUpdateLocationSubmit: (e: React.FormEvent) => void;
  handleOutboundImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBatchOutboundSubmit: (e: React.FormEvent) => void;
  handleBatchReturnSubmit: (e: React.FormEvent) => void;
  handleBatchProcessSubmit: (
    action: "restock" | "scrap" | "scrap_confirm",
  ) => void;
}
