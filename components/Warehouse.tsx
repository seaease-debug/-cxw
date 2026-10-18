import React from "react";
import { UserAccount, UserRole } from "../types";
import { useToast } from "./Toast";
import { Button } from "./ui/Button";
import WarehouseModals from "./WarehouseModals";
import { AssetTypeManager } from "./AssetTypeManager";
import { useWarehouseData } from "./warehouse/useWarehouseData";
import { useWarehouseActions } from "./warehouse/useWarehouseActions";
import { WarehouseToolbar } from "./warehouse/WarehouseToolbar";
import { WarehouseTable } from "./warehouse/WarehouseTable";
import { PrintTagsModal } from "./warehouse/modals/PrintTagsModal";

interface WarehouseProps {
  user: UserAccount;
}

export { isRecycledPendingStatus, isScrapPendingStatus, isStatusMatch } from "./warehouse/warehouseUtils";

const Warehouse: React.FC<WarehouseProps> = ({ user }) => {
  const { showToast } = useToast();
  const userRole = user?.role || UserRole.USER;

  const data = useWarehouseData({ user });
  const actions = useWarehouseActions({
    user,
    realAssets: data.realAssets,
    fetchData: data.fetchData,
    selectedBatchAssetIds: data.selectedBatchAssetIds,
    setSelectedBatchAssetIds: data.setSelectedBatchAssetIds,
    getAssetPhoto: data.getAssetPhoto,
  });

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-300 relative pb-20">
      <WarehouseToolbar
        user={user}
        realAssets={data.realAssets}
        statusFilter={data.statusFilter}
        setStatusFilter={data.setStatusFilter}
        filterText={data.filterText}
        setFilterText={data.setFilterText}
        itemsPerPage={data.itemsPerPage}
        setItemsPerPage={data.setItemsPerPage}
        selectedBatchAssetIds={data.selectedBatchAssetIds}
        setSelectedBatchAssetIds={data.setSelectedBatchAssetIds}
        fileInputRef={actions.fileInputRef}
        onDownloadTemplate={actions.downloadAssetTemplate}
        onAssetImport={actions.handleAssetImport}
        onNewInbound={() => {
          actions.setEditingAsset(null);
          actions.setShowInboundModal(true);
        }}
        onBatchPrint={(selected) => actions.setAssetsToPrint(selected)}
        onBatchOutbound={() => {
          actions.setKeeperInput("");
          actions.setOutboundImage(null);
          actions.setShowBatchOutboundModal(true);
        }}
        onBatchReturn={() => {
          actions.setReturnImage(null);
          actions.setShowBatchReturnModal(true);
        }}
        onBatchScrap={() => {
          actions.setBatchActionType("scrap");
          actions.setIsSingleProcess(false);
          actions.setShowBatchProcessModal(true);
        }}
        onBatchScrapConfirm={() => {
          actions.setBatchActionType("scrap_confirm");
          actions.setIsSingleProcess(false);
          actions.setShowBatchProcessModal(true);
        }}
      />

      <div className="bg-white dark:bg-slate-900 rounded-b-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[600px] flex flex-col relative z-0">
        <WarehouseTable
          loading={data.loading}
          errorMsg={data.errorMsg}
          onRetry={data.fetchData}
          paginatedData={data.paginatedData}
          filtered={data.filtered}
          statusFilter={data.statusFilter}
          userRole={userRole}
          selectedBatchAssetIds={data.selectedBatchAssetIds}
          setSelectedBatchAssetIds={data.setSelectedBatchAssetIds}
          sortConfig={data.sortConfig}
          requestSort={data.requestSort}
          currentPage={data.currentPage}
          setCurrentPage={data.setCurrentPage}
          itemsPerPage={data.itemsPerPage}
          totalPages={data.totalPages}
          getAssetPhoto={data.getAssetPhoto}
          setPreviewImage={actions.setPreviewImage}
          setViewingAsset={actions.setViewingAsset}
          openEditModal={actions.openEditModal}
          openUpdateModal={actions.openUpdateModal}
          setSelectedAssetForOut={actions.setSelectedAssetForOut}
          initiateReturn={actions.initiateReturn}
          handleRecycleProcess={actions.handleRecycleProcess}
          handleDelete={actions.handleDelete}
        />
      </div>

      {/* Lightbox Modal */}
      {actions.previewImage && (
        <div
          className="fixed inset-0 z-[var(--z-modal-overlay)] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => actions.setPreviewImage(null)}
        >
          <div
            className="relative max-w-3xl flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={actions.previewImage}
              alt="Full Preview"
              className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-xl shadow-xl border border-slate-800"
            />
            <Button
              variant="secondary"
              size="sm"
              className="mt-4 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full border-white/20"
              onClick={() => actions.setPreviewImage(null)}
            >
              ✕ 点击任意处或此处关闭
            </Button>
          </div>
        </div>
      )}

      {actions.showAssetTypeModal && (
        <AssetTypeManager
          onClose={() => {
            actions.setShowAssetTypeModal(false);
            data.fetchData();
          }}
        />
      )}

      <WarehouseModals
        showInboundModal={actions.showInboundModal}
        showReturnModal={actions.showReturnModal}
        showReportModal={actions.showReportModal}
        showBatchOutboundModal={actions.showBatchOutboundModal}
        showBatchReturnModal={actions.showBatchReturnModal}
        showBatchProcessModal={actions.showBatchProcessModal}
        isImporting={actions.isImporting}
        importProgress={actions.importProgress}
        importErrors={actions.importErrors}
        viewingAsset={actions.viewingAsset}
        editingAsset={actions.editingAsset}
        updatingAsset={actions.updatingAsset}
        returningAsset={actions.returningAsset}
        selectedAssetForOut={actions.selectedAssetForOut}
        realAssets={data.realAssets}
        selectedBatchAssetIds={data.selectedBatchAssetIds}
        accountList={data.accountList}
        dynamicDepts={data.dynamicDepts}
        isSubmitting={actions.isSubmitting}
        dbFaultTypes={data.dbFaultTypes}
        reporterName={actions.reporterName}
        reporterContact={actions.reporterContact}
        faultType={actions.faultType}
        faultDesc={actions.faultDesc}
        submittingReport={actions.submittingReport}
        showReportKeeperSuggestions={actions.showReportKeeperSuggestions}
        inboundType={actions.inboundType}
        inboundAssetImage={actions.inboundAssetImage}
        inboundDate={actions.inboundDate}
        warehouseLocation={actions.warehouseLocation}
        schoolCode={actions.schoolCode}
        assetTypes={data.assetTypes}
        suppliers={data.suppliers}
        warehouseList={data.warehouseList}
        returnWarehouse={actions.returnWarehouse}
        returnStatus={actions.returnStatus}
        returnImage={actions.returnImage}
        selectedDeptForOut={actions.selectedDeptForOut}
        selectedDeptForBatchOut={actions.selectedDeptForBatchOut}
        keeperInput={actions.keeperInput}
        showKeeperSuggestions={actions.showKeeperSuggestions}
        singleOutLocationInput={actions.singleOutLocationInput}
        showSingleOutLocationSuggestions={actions.showSingleOutLocationSuggestions}
        batchOutLocationInput={actions.batchOutLocationInput}
        showBatchOutLocationSuggestions={actions.showBatchOutLocationSuggestions}
        fixedLocations={data.fixedLocations}
        outboundImage={actions.outboundImage}
        batchActionType={actions.batchActionType}
        isSingleProcess={actions.isSingleProcess}
        inboundAssetImageRef={actions.inboundAssetImageRef}
        returnFileInputRef={actions.returnFileInputRef}
        outboundFileInputRef={actions.outboundFileInputRef}
        batchOutboundFileInputRef={actions.batchOutboundFileInputRef}
        batchReturnFileInputRef={actions.batchReturnFileInputRef}
        showToast={showToast}
        setImportErrors={actions.setImportErrors}
        setViewingAsset={actions.setViewingAsset}
        setAssetsToPrint={actions.setAssetsToPrint}
        setShowReportModal={actions.setShowReportModal}
        setReporterName={actions.setReporterName}
        setReporterContact={actions.setReporterContact}
        setFaultType={actions.setFaultType}
        setFaultDesc={actions.setFaultDesc}
        setSubmittingReport={actions.setSubmittingReport}
        setShowReportKeeperSuggestions={actions.setShowReportKeeperSuggestions}
        setInboundType={actions.setInboundType}
        setInboundAssetImage={actions.setInboundAssetImage}
        setInboundDate={actions.setInboundDate}
        setWarehouseLocation={actions.setWarehouseLocation}
        setSchoolCode={actions.setSchoolCode}
        setShowReturnModal={actions.setShowReturnModal}
        setReturnWarehouse={actions.setReturnWarehouse}
        setReturnStatus={actions.setReturnStatus}
        setShowUpdateModal={actions.setShowUpdateModal}
        setUpdatingAsset={actions.setUpdatingAsset}
        setSelectedDeptForOut={actions.setSelectedDeptForOut}
        setSelectedDeptForBatchOut={actions.setSelectedDeptForBatchOut}
        setKeeperInput={actions.setKeeperInput}
        setShowKeeperSuggestions={actions.setShowKeeperSuggestions}
        setSingleOutLocationInput={actions.setSingleOutLocationInput}
        setShowSingleOutLocationSuggestions={actions.setShowSingleOutLocationSuggestions}
        setBatchOutLocationInput={actions.setBatchOutLocationInput}
        setShowBatchOutLocationSuggestions={actions.setShowBatchOutLocationSuggestions}
        setOutboundImage={actions.setOutboundImage}
        setPreviewImage={actions.setPreviewImage}
        setReturnImage={actions.setReturnImage}
        setShowBatchOutboundModal={actions.setShowBatchOutboundModal}
        setShowBatchReturnModal={actions.setShowBatchReturnModal}
        setShowBatchProcessModal={actions.setShowBatchProcessModal}
        setSelectedBatchAssetIds={data.setSelectedBatchAssetIds}
        handleBack={actions.handleBack}
        handleInboundSubmit={actions.handleInboundSubmit}
        handleOutboundSubmit={actions.handleOutboundSubmit}
        handleReturnImageUpload={actions.handleReturnImageUpload}
        handleReturnSubmit={actions.handleReturnSubmit}
        handleUpdateLocationSubmit={actions.handleUpdateLocationSubmit}
        handleOutboundImageUpload={actions.handleOutboundImageUpload}
        handleBatchOutboundSubmit={actions.handleBatchOutboundSubmit}
        handleBatchReturnSubmit={actions.handleBatchReturnSubmit}
        handleBatchProcessSubmit={actions.handleBatchProcessSubmit}
      />

      <PrintTagsModal
        assetsToPrint={actions.assetsToPrint}
        accounts={data.accountList}
        onClose={() => actions.setAssetsToPrint(null)}
      />
    </div>
  );
};

export default Warehouse;
