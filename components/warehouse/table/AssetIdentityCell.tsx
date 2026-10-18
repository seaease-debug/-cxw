import React from "react";
import { Asset, UserRole } from "../../../types";
import { canManageAssets, isReadOnlyStatus } from "./shared";

export interface AssetPhotoTagProps {
  asset: Asset;
  getAssetPhoto: (asset: Asset) => { image: string; isShared: boolean } | null;
  setPreviewImage: (image: string | null) => void;
}

/**
 * 品牌型号旁的 📷 标签。
 *
 * 原实现是内联 IIFE（`{(() => { const photo = ...; if (photo) {...} return null; })()}`），
 * 在服役模式行与默认行里**逐字重复了两次**；此处合并为一个组件。
 */
export const AssetPhotoTag: React.FC<AssetPhotoTagProps> = ({
  asset,
  getAssetPhoto,
  setPreviewImage,
}) => {
  const photo = getAssetPhoto(asset);
  if (photo) {
    return (
      <span
        title="设备照片"
        className="cursor-pointer text-xs inline-flex items-center justify-center bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 px-1 py-0.5 rounded font-bold hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-all border border-teal-100 dark:border-teal-900/40"
        onClick={(e) => {
          e.stopPropagation();
          setPreviewImage(photo.image);
        }}
      >
        📷
      </span>
    );
  }
  return null;
};

export interface IdentityCellProps {
  asset: Asset;
  cellClass: string;
  getAssetPhoto: (asset: Asset) => { image: string; isShared: boolean } | null;
  setPreviewImage: (image: string | null) => void;
}

/** 服役模式行的「品牌型号 + 序列号」单元格（型号不可点击编辑）。 */
export const ServiceIdentityCell: React.FC<IdentityCellProps> = ({
  asset,
  cellClass,
  getAssetPhoto,
  setPreviewImage,
}) => (
  <td className={cellClass}>
    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center space-x-1.5">
      <span>{asset.brandModel}</span>
      <AssetPhotoTag
        asset={asset}
        getAssetPhoto={getAssetPhoto}
        setPreviewImage={setPreviewImage}
      />
    </p>
    <p className="text-xs text-slate-400 font-mono tracking-tight">
      {asset.serialNo}
    </p>
  </td>
);

export interface DefaultIdentityCellProps extends IdentityCellProps {
  userRole: UserRole;
  openEditModal: (asset: Asset) => void;
  setViewingAsset: (asset: Asset | null) => void;
}

/**
 * 默认行的「品牌型号 + 序列号」单元格。
 * 点击型号：可管理角色且非只读三态 → 打开编辑；否则 → 打开详情。
 */
export const DefaultIdentityCell: React.FC<DefaultIdentityCellProps> = ({
  asset,
  cellClass,
  userRole,
  getAssetPhoto,
  setPreviewImage,
  openEditModal,
  setViewingAsset,
}) => (
  <td className={cellClass}>
    <div className="flex items-center space-x-1.5">
      <p
        className="font-bold text-slate-800 dark:text-slate-200 text-sm cursor-pointer hover:text-teal-600 transition-colors"
        onClick={() => {
          const isReadOnly = isReadOnlyStatus(asset.currentStatus);
          if (canManageAssets(userRole) && !isReadOnly) {
            openEditModal(asset);
          } else {
            setViewingAsset(asset);
          }
        }}
      >
        {asset.brandModel}
      </p>
      <AssetPhotoTag
        asset={asset}
        getAssetPhoto={getAssetPhoto}
        setPreviewImage={setPreviewImage}
      />
    </div>
    <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5 font-mono tracking-tight">
      {asset.serialNo}
    </p>
  </td>
);
