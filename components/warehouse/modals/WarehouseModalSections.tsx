import React from "react";
import { motion } from "framer-motion";
import WarehouseUpdateModal from "../../WarehouseUpdateModal";
import AssetDetail from "../../AssetDetail";
import { ImportProgressModal } from "./ImportProgressModal";
import { ReportRepairModal } from "./ReportRepairModal";
import { InboundModal } from "./InboundModal";
import { SingleOutboundModal, BatchOutboundModal } from "./OutboundModals";
import { SingleReturnModal, BatchReturnModal } from "./ReturnModals";
import { BatchProcessModal } from "./BatchProcessModal";
import type { WarehouseModalsProps } from "./modalsProps";

// B3 拆分：原 WarehouseModals.tsx 的 279 行单一箭头函数（一个函数里解构 ~100 行再透传
// 9 个弹窗）按**原渲染顺序**切成 7 个小组件。片段（fragment）不产生 DOM 节点 ⇒
// 分组后 DOM 顺序与逐块渲染完全一致。
//
// 顺序（原 L263–449）：ImportProgress → viewingAsset → ReportRepair → Inbound →
//   Update → SingleOut → BatchOut → SingleReturn → BatchReturn → BatchProcess
// 分组：[ProgressAndViewer] [Report] [Inbound] [AssetUpdate]
//       [Outbound] [Return] [BatchProcess] —— 顺序不变。

export const ProgressAndViewerSection: React.FC<WarehouseModalsProps> = (
  props,
) => {
  const {
    isImporting,
    importProgress,
    importErrors,
    setImportErrors,
    viewingAsset,
    setViewingAsset,
    setAssetsToPrint,
  } = props;
  return (
    <>
      <ImportProgressModal
        isImporting={isImporting}
        importProgress={importProgress}
        importErrors={importErrors}
        onCloseErrors={() => setImportErrors([])}
      />

      {viewingAsset && (
        <div className="fixed inset-0 z-[var(--z-modal-overlay)] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setViewingAsset(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative z-[var(--z-modal)] w-full max-w-5xl"
          >
            <AssetDetail
              asset={viewingAsset}
              onBack={() => setViewingAsset(null)}
              onPrintLabel={(a) => setAssetsToPrint([a])}
            />
          </motion.div>
        </div>
      )}
    </>
  );
};

export const ReportSection: React.FC<WarehouseModalsProps> = (props) => {
  const {
    viewingAsset,
    showReportModal,
    setShowReportModal,
    dbFaultTypes,
    reporterName,
    reporterContact,
    faultType,
    faultDesc,
    submittingReport,
    setReporterName,
    setReporterContact,
    setFaultType,
    setFaultDesc,
    setSubmittingReport,
    showToast,
  } = props;
  return (
    <ReportRepairModal
      asset={viewingAsset}
      isOpen={showReportModal}
      onClose={() => setShowReportModal(false)}
      dbFaultTypes={dbFaultTypes}
      reporterName={reporterName}
      reporterContact={reporterContact}
      faultType={faultType}
      faultDesc={faultDesc}
      submittingReport={submittingReport}
      setReporterName={setReporterName}
      setReporterContact={setReporterContact}
      setFaultType={setFaultType}
      setFaultDesc={setFaultDesc}
      setSubmittingReport={setSubmittingReport}
      showToast={showToast}
    />
  );
};

export const InboundSection: React.FC<WarehouseModalsProps> = (props) => {
  const {
    showInboundModal,
    editingAsset,
    inboundType,
    inboundAssetImage,
    inboundDate,
    warehouseLocation,
    schoolCode,
    assetTypes,
    suppliers,
    warehouseList,
    inboundAssetImageRef,
    isSubmitting,
    handleBack,
    handleInboundSubmit,
    setInboundType,
    setSchoolCode,
    setInboundDate,
    setWarehouseLocation,
    setInboundAssetImage,
  } = props;
  return (
    <InboundModal
      isOpen={showInboundModal}
      editingAsset={editingAsset}
      inboundType={inboundType}
      inboundAssetImage={inboundAssetImage}
      inboundDate={inboundDate}
      warehouseLocation={warehouseLocation}
      schoolCode={schoolCode}
      assetTypes={assetTypes}
      suppliers={suppliers}
      warehouseList={warehouseList}
      inboundAssetImageRef={inboundAssetImageRef}
      isSubmitting={isSubmitting}
      onClose={handleBack}
      onSubmit={handleInboundSubmit}
      setInboundType={setInboundType}
      setSchoolCode={setSchoolCode}
      setInboundDate={setInboundDate}
      setWarehouseLocation={setWarehouseLocation}
      setInboundAssetImage={setInboundAssetImage}
    />
  );
};

export const AssetUpdateSection: React.FC<WarehouseModalsProps> = (props) => {
  const {
    updatingAsset,
    isSubmitting,
    setShowUpdateModal,
    setUpdatingAsset,
    handleUpdateLocationSubmit,
    accountList,
  } = props;
  if (!updatingAsset) return null;
  return (
    <WarehouseUpdateModal
      asset={updatingAsset}
      isSubmitting={isSubmitting}
      onClose={() => {
        setShowUpdateModal(false);
        setUpdatingAsset(null);
      }}
      onSubmit={handleUpdateLocationSubmit}
      accountList={accountList}
    />
  );
};

export const OutboundSections: React.FC<WarehouseModalsProps> = (props) => {
  const {
    selectedAssetForOut,
    selectedDeptForOut,
    dynamicDepts,
    keeperInput,
    showKeeperSuggestions,
    singleOutLocationInput,
    showSingleOutLocationSuggestions,
    fixedLocations,
    accountList,
    outboundImage,
    outboundFileInputRef,
    isSubmitting,
    handleBack,
    handleOutboundSubmit,
    setSelectedDeptForOut,
    setKeeperInput,
    setShowKeeperSuggestions,
    setSingleOutLocationInput,
    setShowSingleOutLocationSuggestions,
    setOutboundImage,
    setPreviewImage,
    handleOutboundImageUpload,
    showBatchOutboundModal,
    realAssets,
    selectedBatchAssetIds,
    selectedDeptForBatchOut,
    batchOutLocationInput,
    showBatchOutLocationSuggestions,
    batchOutboundFileInputRef,
    setShowBatchOutboundModal,
    handleBatchOutboundSubmit,
    setSelectedDeptForBatchOut,
    setBatchOutLocationInput,
    setShowBatchOutLocationSuggestions,
  } = props;
  return (
    <>
      <SingleOutboundModal
        isOpen={!!selectedAssetForOut}
        selectedAsset={selectedAssetForOut}
        selectedDept={selectedDeptForOut}
        dynamicDepts={dynamicDepts}
        keeperInput={keeperInput}
        showKeeperSuggestions={showKeeperSuggestions}
        singleOutLocationInput={singleOutLocationInput}
        showSingleOutLocationSuggestions={showSingleOutLocationSuggestions}
        fixedLocations={fixedLocations}
        accountList={accountList}
        outboundImage={outboundImage}
        outboundFileInputRef={outboundFileInputRef}
        isSubmitting={isSubmitting}
        onClose={handleBack}
        onSubmit={handleOutboundSubmit}
        setSelectedDept={setSelectedDeptForOut}
        setKeeperInput={setKeeperInput}
        setShowKeeperSuggestions={setShowKeeperSuggestions}
        setSingleOutLocationInput={setSingleOutLocationInput}
        setShowSingleOutLocationSuggestions={setShowSingleOutLocationSuggestions}
        setOutboundImage={setOutboundImage}
        setPreviewImage={setPreviewImage}
        handleOutboundImageUpload={handleOutboundImageUpload}
      />

      <BatchOutboundModal
        isOpen={showBatchOutboundModal}
        realAssets={realAssets}
        selectedBatchAssetIds={selectedBatchAssetIds}
        selectedDept={selectedDeptForBatchOut}
        dynamicDepts={dynamicDepts}
        keeperInput={keeperInput}
        showKeeperSuggestions={showKeeperSuggestions}
        batchOutLocationInput={batchOutLocationInput}
        showBatchOutLocationSuggestions={showBatchOutLocationSuggestions}
        fixedLocations={fixedLocations}
        accountList={accountList}
        outboundImage={outboundImage}
        batchOutboundFileInputRef={batchOutboundFileInputRef}
        isSubmitting={isSubmitting}
        onClose={() => setShowBatchOutboundModal(false)}
        onSubmit={handleBatchOutboundSubmit}
        setSelectedDept={setSelectedDeptForBatchOut}
        setKeeperInput={setKeeperInput}
        setShowKeeperSuggestions={setShowKeeperSuggestions}
        setBatchOutLocationInput={setBatchOutLocationInput}
        setShowBatchOutLocationSuggestions={setShowBatchOutLocationSuggestions}
        setOutboundImage={setOutboundImage}
      />
    </>
  );
};

export const ReturnSections: React.FC<WarehouseModalsProps> = (props) => {
  const {
    showReturnModal,
    returningAsset,
    returnWarehouse,
    returnStatus,
    returnImage,
    warehouseList,
    returnFileInputRef,
    isSubmitting,
    setShowReturnModal,
    handleReturnSubmit,
    setReturnWarehouse,
    setReturnStatus,
    handleReturnImageUpload,
    showBatchReturnModal,
    realAssets,
    selectedBatchAssetIds,
    batchReturnFileInputRef,
    setShowBatchReturnModal,
    handleBatchReturnSubmit,
    setReturnImage,
  } = props;
  return (
    <>
      <SingleReturnModal
        isOpen={showReturnModal}
        returningAsset={returningAsset}
        returnWarehouse={returnWarehouse}
        returnStatus={returnStatus}
        returnImage={returnImage}
        warehouseList={warehouseList}
        returnFileInputRef={returnFileInputRef}
        isSubmitting={isSubmitting}
        onClose={() => setShowReturnModal(false)}
        onSubmit={handleReturnSubmit}
        setReturnWarehouse={setReturnWarehouse}
        setReturnStatus={setReturnStatus}
        handleReturnImageUpload={handleReturnImageUpload}
      />

      <BatchReturnModal
        isOpen={showBatchReturnModal}
        realAssets={realAssets}
        selectedBatchAssetIds={selectedBatchAssetIds}
        returnStatus={returnStatus}
        returnImage={returnImage}
        warehouseList={warehouseList}
        batchReturnFileInputRef={batchReturnFileInputRef}
        isSubmitting={isSubmitting}
        onClose={() => setShowBatchReturnModal(false)}
        onSubmit={handleBatchReturnSubmit}
        setReturnStatus={setReturnStatus}
        setReturnImage={setReturnImage}
      />
    </>
  );
};

export const BatchProcessSection: React.FC<WarehouseModalsProps> = (props) => {
  const {
    showBatchProcessModal,
    batchActionType,
    isSingleProcess,
    realAssets,
    selectedBatchAssetIds,
    isSubmitting,
    setShowBatchProcessModal,
    setSelectedBatchAssetIds,
    handleBatchProcessSubmit,
  } = props;
  return (
    <BatchProcessModal
      isOpen={showBatchProcessModal}
      batchActionType={batchActionType === "" ? null : batchActionType}
      isSingleProcess={isSingleProcess}
      realAssets={realAssets}
      selectedBatchAssetIds={selectedBatchAssetIds}
      isSubmitting={isSubmitting}
      onClose={() => {
        setShowBatchProcessModal(false);
        if (isSingleProcess) {
          setSelectedBatchAssetIds([]);
        }
      }}
      onSubmit={handleBatchProcessSubmit}
    />
  );
};
