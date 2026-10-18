// components/mobileScanner/AssetDetailScreen.tsx
import { ScannerApi } from './useMobileScanner';
import { AssetActionsBar } from './AssetActionsBar';
import { AssetHistoryCard, AssetLifetimeCard, AssetPhotoCard, AssetSpecsCard, AssetTitleCard, AssetWarrantyCard } from './AssetCards';
import { AssetFormsPanel } from './AssetForms';
export const AssetDetailScreen = ({ s }: { s: ScannerApi }) => {
  const { scannedAsset } = s;
  return (
    <div className="space-y-4 pb-8">
      {scannedAsset && (
        <>
          <AssetTitleCard s={s} />
          <AssetPhotoCard s={s} />
          <AssetSpecsCard s={s} />
          <AssetFormsPanel s={s} />
          <AssetActionsBar s={s} />
          <AssetLifetimeCard s={s} />
          <AssetWarrantyCard s={s} />
          <AssetHistoryCard s={s} />
        </>
      )}
    </div>
  );
};
