import { useState, useRef } from "react";
import { Asset, AssetStatus } from "../../../types";
import { getBeijingDateString } from "../warehouseUtils";

/**
 * `useWarehouseActions` 的全部 state / ref。
 * B2 拆分：从 useWarehouseActions 原样搬出，仅把声明挪到独立 hook，行为不变。
 */
export function useWarehouseActionsState() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Import State
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inbound State
  const [showInboundModal, setShowInboundModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [inboundType, setInboundType] = useState<string>("笔记本电脑");
  const [inboundAssetImage, setInboundAssetImage] = useState<string | null>(null);
  const [inboundDate, setInboundDate] = useState<string>(getBeijingDateString());
  const [warehouseLocation, setWarehouseLocation] = useState<string>("1楼小仓库");
  const [schoolCode, setSchoolCode] = useState<string>("NB");
  const inboundAssetImageRef = useRef<HTMLInputElement>(null);

  // Outbound State
  const [selectedAssetForOut, setSelectedAssetForOut] = useState<Asset | null>(null);
  const [outboundId, setOutboundId] = useState("");
  const [outboundImage, setOutboundImage] = useState<string | null>(null);
  const [keeperInput, setKeeperInput] = useState("");
  const [showKeeperSuggestions, setShowKeeperSuggestions] = useState(false);
  const [selectedDeptForOut, setSelectedDeptForOut] = useState<string>("语文");
  const [selectedDeptForBatchOut, setSelectedDeptForBatchOut] = useState<string>("语文");
  const [singleOutLocationInput, setSingleOutLocationInput] = useState("");
  const [showSingleOutLocationSuggestions, setShowSingleOutLocationSuggestions] = useState(false);
  const [batchOutLocationInput, setBatchOutLocationInput] = useState("");
  const [showBatchOutLocationSuggestions, setShowBatchOutLocationSuggestions] = useState(false);
  const [showBatchOutboundModal, setShowBatchOutboundModal] = useState(false);
  const outboundFileInputRef = useRef<HTMLInputElement>(null);
  const batchOutboundFileInputRef = useRef<HTMLInputElement>(null);

  // Return State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showBatchReturnModal, setShowBatchReturnModal] = useState(false);
  const [returningAsset, setReturningAsset] = useState<Asset | null>(null);
  const [returnWarehouse, setReturnWarehouse] = useState("1楼小仓库");
  const [returnStatus, setReturnStatus] = useState<AssetStatus>(
    AssetStatus.RECYCLED_PENDING,
  );
  const [returnImage, setReturnImage] = useState<string | null>(null);
  const returnFileInputRef = useRef<HTMLInputElement>(null);
  const batchReturnFileInputRef = useRef<HTMLInputElement>(null);

  // Update State
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingAsset, setUpdatingAsset] = useState<Asset | null>(null);

  // Batch Process (Recycle/Scrap/Restock) State
  const [showBatchProcessModal, setShowBatchProcessModal] = useState(false);
  const [batchActionType, setBatchActionType] = useState<
    "restock" | "scrap" | "scrap_confirm" | ""
  >("");
  const [isSingleProcess, setIsSingleProcess] = useState(false);

  // Detail / Print / Type / Lightbox State
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [showAssetTypeModal, setShowAssetTypeModal] = useState(false);
  const [assetsToPrint, setAssetsToPrint] = useState<Asset[] | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Report Repair Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [faultType, setFaultType] = useState("硬件损坏 / 配件故障");
  const [faultDesc, setFaultDesc] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [showReportKeeperSuggestions, setShowReportKeeperSuggestions] = useState(false);

  return {
    isSubmitting,
    setIsSubmitting,
    isImporting,
    setIsImporting,
    importProgress,
    setImportProgress,
    importErrors,
    setImportErrors,
    fileInputRef,
    showInboundModal,
    setShowInboundModal,
    editingAsset,
    setEditingAsset,
    inboundType,
    setInboundType,
    inboundAssetImage,
    setInboundAssetImage,
    inboundDate,
    setInboundDate,
    warehouseLocation,
    setWarehouseLocation,
    schoolCode,
    setSchoolCode,
    inboundAssetImageRef,
    selectedAssetForOut,
    setSelectedAssetForOut,
    outboundId,
    setOutboundId,
    outboundImage,
    setOutboundImage,
    keeperInput,
    setKeeperInput,
    showKeeperSuggestions,
    setShowKeeperSuggestions,
    selectedDeptForOut,
    setSelectedDeptForOut,
    selectedDeptForBatchOut,
    setSelectedDeptForBatchOut,
    singleOutLocationInput,
    setSingleOutLocationInput,
    showSingleOutLocationSuggestions,
    setShowSingleOutLocationSuggestions,
    batchOutLocationInput,
    setBatchOutLocationInput,
    showBatchOutLocationSuggestions,
    setShowBatchOutLocationSuggestions,
    showBatchOutboundModal,
    setShowBatchOutboundModal,
    outboundFileInputRef,
    batchOutboundFileInputRef,
    showReturnModal,
    setShowReturnModal,
    showBatchReturnModal,
    setShowBatchReturnModal,
    returningAsset,
    setReturningAsset,
    returnWarehouse,
    setReturnWarehouse,
    returnStatus,
    setReturnStatus,
    returnImage,
    setReturnImage,
    returnFileInputRef,
    batchReturnFileInputRef,
    showUpdateModal,
    setShowUpdateModal,
    updatingAsset,
    setUpdatingAsset,
    showBatchProcessModal,
    setShowBatchProcessModal,
    batchActionType,
    setBatchActionType,
    isSingleProcess,
    setIsSingleProcess,
    viewingAsset,
    setViewingAsset,
    showAssetTypeModal,
    setShowAssetTypeModal,
    assetsToPrint,
    setAssetsToPrint,
    previewImage,
    setPreviewImage,
    showReportModal,
    setShowReportModal,
    reporterName,
    setReporterName,
    reporterContact,
    setReporterContact,
    faultType,
    setFaultType,
    faultDesc,
    setFaultDesc,
    submittingReport,
    setSubmittingReport,
    showReportKeeperSuggestions,
    setShowReportKeeperSuggestions,
  };
}

export type WarehouseActionsState = ReturnType<typeof useWarehouseActionsState>;
