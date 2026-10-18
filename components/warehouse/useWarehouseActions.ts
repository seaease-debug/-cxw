import React from "react";
import { Asset, UserAccount } from "../../types";
import { useWarehouseActionsState } from "./actions/state";
import { useWarehouseActionsEffects } from "./actions/effects";
import {
  useWarehouseImportHandlers,
  useWarehouseSubmitHandlers,
  useWarehouseBatchHandlers,
  useWarehouseUiHandlers,
  type WarehouseActionsCtx,
} from "./actions/handlers";

export interface UseWarehouseActionsParams {
  user: UserAccount;
  realAssets: Asset[];
  fetchData: () => Promise<void>;
  selectedBatchAssetIds: string[];
  setSelectedBatchAssetIds: React.Dispatch<React.SetStateAction<string[]>>;
  getAssetPhoto: (asset: Asset) => { image: string; isShared: boolean } | null;
}

/**
 * 仓库页的全部交互 action。
 *
 * B2 拆分：本 hook 原为 851 行单函数，现改为「state / effects / 4 组 handlers」组合。
 * 返回对象的键与顺序保持不变（行为对拍：Warehouse 页 DOM 逐字节一致）。
 */
export function useWarehouseActions({
  user,
  realAssets,
  fetchData,
  selectedBatchAssetIds,
  setSelectedBatchAssetIds,
  getAssetPhoto,
}: UseWarehouseActionsParams) {
  const userRealName = user?.realName || "";

  const state = useWarehouseActionsState();

  const ctx: WarehouseActionsCtx = {
    s: state,
    user,
    userRealName,
    realAssets,
    fetchData,
    selectedBatchAssetIds,
    setSelectedBatchAssetIds,
  };

  useWarehouseActionsEffects({ s: state, getAssetPhoto });

  const uiH = useWarehouseUiHandlers(ctx);
  const importH = useWarehouseImportHandlers(ctx);
  const submitH = useWarehouseSubmitHandlers(ctx, uiH.handleBack);
  const batchH = useWarehouseBatchHandlers(ctx);

  return {
    isSubmitting: state.isSubmitting,
    isImporting: state.isImporting,
    importProgress: state.importProgress,
    importErrors: state.importErrors,
    fileInputRef: state.fileInputRef,
    showInboundModal: state.showInboundModal,
    editingAsset: state.editingAsset,
    inboundType: state.inboundType,
    inboundAssetImage: state.inboundAssetImage,
    inboundDate: state.inboundDate,
    warehouseLocation: state.warehouseLocation,
    schoolCode: state.schoolCode,
    inboundAssetImageRef: state.inboundAssetImageRef,
    selectedAssetForOut: state.selectedAssetForOut,
    outboundId: state.outboundId,
    outboundImage: state.outboundImage,
    keeperInput: state.keeperInput,
    showKeeperSuggestions: state.showKeeperSuggestions,
    selectedDeptForOut: state.selectedDeptForOut,
    selectedDeptForBatchOut: state.selectedDeptForBatchOut,
    singleOutLocationInput: state.singleOutLocationInput,
    showSingleOutLocationSuggestions: state.showSingleOutLocationSuggestions,
    batchOutLocationInput: state.batchOutLocationInput,
    showBatchOutLocationSuggestions: state.showBatchOutLocationSuggestions,
    showBatchOutboundModal: state.showBatchOutboundModal,
    outboundFileInputRef: state.outboundFileInputRef,
    batchOutboundFileInputRef: state.batchOutboundFileInputRef,
    showReturnModal: state.showReturnModal,
    showBatchReturnModal: state.showBatchReturnModal,
    returningAsset: state.returningAsset,
    returnWarehouse: state.returnWarehouse,
    returnStatus: state.returnStatus,
    returnImage: state.returnImage,
    returnFileInputRef: state.returnFileInputRef,
    batchReturnFileInputRef: state.batchReturnFileInputRef,
    showUpdateModal: state.showUpdateModal,
    updatingAsset: state.updatingAsset,
    showBatchProcessModal: state.showBatchProcessModal,
    batchActionType: state.batchActionType,
    isSingleProcess: state.isSingleProcess,
    viewingAsset: state.viewingAsset,
    showAssetTypeModal: state.showAssetTypeModal,
    assetsToPrint: state.assetsToPrint,
    previewImage: state.previewImage,
    showReportModal: state.showReportModal,
    reporterName: state.reporterName,
    reporterContact: state.reporterContact,
    faultType: state.faultType,
    faultDesc: state.faultDesc,
    submittingReport: state.submittingReport,
    showReportKeeperSuggestions: state.showReportKeeperSuggestions,
    setImportErrors: state.setImportErrors,
    setShowInboundModal: state.setShowInboundModal,
    setEditingAsset: state.setEditingAsset,
    setInboundType: state.setInboundType,
    setInboundAssetImage: state.setInboundAssetImage,
    setInboundDate: state.setInboundDate,
    setWarehouseLocation: state.setWarehouseLocation,
    setSchoolCode: state.setSchoolCode,
    setSelectedAssetForOut: state.setSelectedAssetForOut,
    setOutboundImage: state.setOutboundImage,
    setKeeperInput: state.setKeeperInput,
    setShowKeeperSuggestions: state.setShowKeeperSuggestions,
    setSelectedDeptForOut: state.setSelectedDeptForOut,
    setSelectedDeptForBatchOut: state.setSelectedDeptForBatchOut,
    setSingleOutLocationInput: state.setSingleOutLocationInput,
    setShowSingleOutLocationSuggestions: state.setShowSingleOutLocationSuggestions,
    setBatchOutLocationInput: state.setBatchOutLocationInput,
    setShowBatchOutLocationSuggestions: state.setShowBatchOutLocationSuggestions,
    setShowBatchOutboundModal: state.setShowBatchOutboundModal,
    setShowReturnModal: state.setShowReturnModal,
    setShowBatchReturnModal: state.setShowBatchReturnModal,
    setReturningAsset: state.setReturningAsset,
    setReturnWarehouse: state.setReturnWarehouse,
    setReturnStatus: state.setReturnStatus,
    setReturnImage: state.setReturnImage,
    setShowUpdateModal: state.setShowUpdateModal,
    setUpdatingAsset: state.setUpdatingAsset,
    setShowBatchProcessModal: state.setShowBatchProcessModal,
    setBatchActionType: state.setBatchActionType,
    setIsSingleProcess: state.setIsSingleProcess,
    setViewingAsset: state.setViewingAsset,
    setShowAssetTypeModal: state.setShowAssetTypeModal,
    setAssetsToPrint: state.setAssetsToPrint,
    setPreviewImage: state.setPreviewImage,
    setShowReportModal: state.setShowReportModal,
    setReporterName: state.setReporterName,
    setReporterContact: state.setReporterContact,
    setFaultType: state.setFaultType,
    setFaultDesc: state.setFaultDesc,
    setSubmittingReport: state.setSubmittingReport,
    setShowReportKeeperSuggestions: state.setShowReportKeeperSuggestions,
    handleBack: uiH.handleBack,
    downloadAssetTemplate: importH.downloadAssetTemplate,
    handleAssetImport: importH.handleAssetImport,
    handleInboundSubmit: submitH.handleInboundSubmit,
    handleUpdateLocationSubmit: submitH.handleUpdateLocationSubmit,
    handleRecycleProcess: uiH.handleRecycleProcess,
    handleOutboundImageUpload: uiH.handleOutboundImageUpload,
    handleReturnImageUpload: uiH.handleReturnImageUpload,
    handleOutboundSubmit: submitH.handleOutboundSubmit,
    initiateReturn: uiH.initiateReturn,
    handleReturnSubmit: submitH.handleReturnSubmit,
    handleBatchOutboundSubmit: batchH.handleBatchOutboundSubmit,
    handleBatchReturnSubmit: batchH.handleBatchReturnSubmit,
    handleBatchProcessSubmit: batchH.handleBatchProcessSubmit,
    handleDelete: uiH.handleDelete,
    openEditModal: uiH.openEditModal,
    openUpdateModal: uiH.openUpdateModal,
  };
}
