// components/AssetDetail.tsx
// 资产档案页（薄壳）。原来的 809 行里：状态与副作用在 assetDetail/useAssetDetail.ts，
// 纯派生在 assetDetail/derived.ts，各区块在 assetDetail/ 下的展示组件里。
// 本文件只负责：调用 hook → 组合布局 → 挂载两个浮层。
import React from "react";
import {
  calculateUsedTime,
  canStartRepair,
  computeLifecycle,
  formatRemainingDays,
  isServingStatus,
  matchKeeperAccount,
  resolveDepartment,
  resolveDisplayKeeper,
  resolveDisplayLocation,
  resolveDisplayStatus,
  resolveSupplierName,
} from "./assetDetail/derived";
import { useAssetDetail } from "./assetDetail/useAssetDetail";
import { AssetDetailHeader } from "./assetDetail/AssetDetailHeader";
import { CustodySection } from "./assetDetail/CustodySection";
import { PhotoSection } from "./assetDetail/PhotoSection";
import { SpecSection } from "./assetDetail/SpecSection";
import { LifecycleSection } from "./assetDetail/LifecycleSection";
import { HistorySection } from "./assetDetail/HistorySection";
import { FooterActions } from "./assetDetail/FooterActions";
import { FaultReportModal } from "./assetDetail/FaultReportModal";
import { PhotoLightbox } from "./assetDetail/PhotoLightbox";
import type { AssetDetailProps } from "./assetDetail/shared";

const AssetDetail: React.FC<AssetDetailProps> = ({
  asset,
  onBack,
  onPrintLabel,
  suppliers: propsSuppliers,
}) => {
  const d = useAssetDetail(asset, propsSuppliers);

  const handlePrint = () => (onPrintLabel ? onPrintLabel(asset) : window.print());

  const displayStatus = resolveDisplayStatus(asset);
  const { totalRetirementYears, lifePercentage } = computeLifecycle(asset);
  const displaySupplierName = resolveSupplierName(d.supplierList, asset);
  const displayKeeper = resolveDisplayKeeper(asset);
  const displayDepartment = resolveDepartment(
    asset,
    matchKeeperAccount(d.accountList, asset.currentKeeperId),
  );
  const displayLocation = resolveDisplayLocation(asset, isServingStatus(displayStatus));

  return (
    <div className="relative w-full max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-2 font-sans">
      {/* Header Section */}
      <AssetDetailHeader asset={asset} displayStatus={displayStatus} onPrint={handlePrint} />

      {/* Main Content Body */}
      <div className="p-6 md:p-8 overflow-y-auto max-h-[72vh] custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          {/* Left Column: Custody Status & Photo */}
          <div className="space-y-8">
            <CustodySection
              displayDepartment={displayDepartment}
              displayKeeper={displayKeeper}
              displayLocation={displayLocation}
              outboundDate={asset.outboundDate}
            />
            <PhotoSection
              displayPhoto={d.displayPhoto}
              isSharedPhoto={d.isSharedPhoto}
              onPreview={d.setPreviewImage}
            />
          </div>

          {/* Right Column: Spec Fingerprint & Lifecycle & History */}
          <div className="space-y-8">
            <SpecSection
              asset={asset}
              isLoggedIn={d.isLoggedIn}
              totalRetirementYears={totalRetirementYears}
              displaySupplierName={displaySupplierName}
            />
            <LifecycleSection
              totalRetirementYears={totalRetirementYears}
              usedTime={calculateUsedTime(asset.purchaseDate)}
              remainingText={formatRemainingDays(asset.remainingDays)}
              lifePercentage={lifePercentage}
            />
            <HistorySection
              history={d.history}
              historyLoading={d.historyLoading}
              isLoggedIn={d.isLoggedIn}
            />
          </div>
        </div>
      </div>

      {/* Sticky Footer Action Bar */}
      <FooterActions
        canReport={canStartRepair(displayStatus)}
        displayStatus={displayStatus}
        onOpenReport={d.openReportModal}
        onBack={onBack}
      />

      {/* Fault Report Modal */}
      {d.showReportModal && (
        <FaultReportModal
          asset={asset}
          reporterName={d.reporterName}
          reporterContact={d.reporterContact}
          faultType={d.faultType}
          faultDesc={d.faultDesc}
          faultTypeOptions={d.faultTypeOptions}
          depts={d.depts}
          accounts={d.accountList}
          showSuggestions={d.showKeeperSuggestions}
          submitting={d.submittingReport}
          onClose={d.closeReportModal}
          onSubmit={d.submitReport}
          onNameChange={d.handleNameChange}
          onContactChange={d.setReporterContact}
          onFaultTypeChange={d.setFaultType}
          onFaultDescChange={d.setFaultDesc}
          onPickAccount={d.pickAccount}
          setShowSuggestions={d.setShowKeeperSuggestions}
        />
      )}

      {/* Photo Preview Lightbox Modal */}
      {d.previewImage && (
        <PhotoLightbox src={d.previewImage} onClose={() => d.setPreviewImage(null)} />
      )}
    </div>
  );
};

export default AssetDetail;
