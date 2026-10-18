// components/mobileScanner/useScannerStore.ts
// B1-5：原 MobileScanner 组件的**全部本地状态**集中于此。
//
// 拆分原因：原组件函数 1488 行（S138 上限 200）。状态与业务逻辑混在一个函数里，
// 既无法单独复用，也无法让「渲染」与「状态」分别受行数约束。
// 这里只放 useState / useRef / 派生值，不放任何网络调用与提交逻辑。
import React, { useRef, useState } from 'react';
import { Asset, AssetHistory, DEPT_CODES, Supplier, UserAccount } from '../../types';
import { useDialog } from '../ui/DialogContext';
import { useToast } from '../Toast';
import { ScannerForm } from './types';

export const useScannerStore = (initialAssetNo?: string) => {
  const { confirm } = useDialog();
  const toast = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [accountList, setAccountList] = useState<UserAccount[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [scannedAsset, setScannedAsset] = useState<Asset | null>(null);
  const [assetPhoto, setAssetPhoto] = useState<string | null>(null);
  const [isSharedPhoto, setIsSharedPhoto] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [assetHistory, setAssetHistory] = useState<AssetHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [barcodeInput, setBarcodeInput] = useState("");
  const [scannerOpen, setScannerOpen] = useState(!initialAssetNo);

  const [activeForm, setActiveForm] = useState<ScannerForm>(null);
  const [submitting, setSubmitting] = useState(false);

  const [repairReporterName, setRepairReporterName] = useState("");
  const [repairReporterContact, setRepairReporterContact] = useState("");
  const [repairFaultType, setRepairFaultType] = useState("硬件损坏 / 配件故障");
  const [repairFaultDesc, setRepairFaultDesc] = useState("");
  const [showMobileRepairSuggestions, setShowMobileRepairSuggestions] = useState(false);
  const [dynamicFaultTypes, setDynamicFaultTypes] = useState<string[]>([]);

  // Outbound Form fields
  const [outboundId, setOutboundId] = useState("");
  const [keeperInput, setKeeperInput] = useState("");
  const [selectedDept, setSelectedDept] = useState("科技信息中心");
  const dynamicDepts = React.useMemo(() => {
    return Array.from(
      new Set([
        ...Object.keys(DEPT_CODES),
        ...accountList.map((a) => a.department).filter(Boolean),
      ])
    );
  }, [accountList]);
  const [showKeeperSuggestions, setShowKeeperSuggestions] = useState(false);
  const [outboundImage, setOutboundImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Return Form State
  const [returnStatus, setReturnStatus] = useState("周转仓(待处理)");
  const [returnWarehouse, setReturnWarehouse] = useState("周转仓-可用区");

  // Inline Login Frame (for guest users scanning who want to become keepers)
  const [showInlineLogin, setShowInlineLogin] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  return {
    confirm, toast,
    assets, setAssets,
    accountList, setAccountList,
    suppliers, setSuppliers,
    scannedAsset, setScannedAsset,
    assetPhoto, setAssetPhoto,
    isSharedPhoto, setIsSharedPhoto,
    previewImage, setPreviewImage,
    assetHistory, setAssetHistory,
    loading, setLoading,
    errorMsg, setErrorMsg,
    barcodeInput, setBarcodeInput,
    scannerOpen, setScannerOpen,
    activeForm, setActiveForm,
    submitting, setSubmitting,
    repairReporterName, setRepairReporterName,
    repairReporterContact, setRepairReporterContact,
    repairFaultType, setRepairFaultType,
    repairFaultDesc, setRepairFaultDesc,
    showMobileRepairSuggestions, setShowMobileRepairSuggestions,
    dynamicFaultTypes, setDynamicFaultTypes,
    outboundId, setOutboundId,
    keeperInput, setKeeperInput,
    selectedDept, setSelectedDept,
    dynamicDepts,
    showKeeperSuggestions, setShowKeeperSuggestions,
    outboundImage, setOutboundImage,
    fileInputRef,
    returnStatus, setReturnStatus,
    returnWarehouse, setReturnWarehouse,
    showInlineLogin, setShowInlineLogin,
    loginUsername, setLoginUsername,
    loginPassword, setLoginPassword,
    loginError, setLoginError,
  };
};

export type ScannerStore = ReturnType<typeof useScannerStore>;
