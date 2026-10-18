import { useEffect } from "react";
import { Asset } from "../../../types";
import { getBeijingDateString, getBeijingDateStr8 } from "../warehouseUtils";
import type { WarehouseActionsState } from "./state";

interface EffectsParams {
  s: WarehouseActionsState;
  getAssetPhoto: (asset: Asset) => { image: string; isShared: boolean } | null;
}

/**
 * `useWarehouseActions` 的全部副作用（原样搬出）。
 */
export function useWarehouseActionsEffects({ s, getAssetPhoto }: EffectsParams) {
  const {
    setOutboundId,
    inboundType,
    inboundDate,
    warehouseLocation,
    editingAsset,
    setInboundType,
    setInboundAssetImage,
    setInboundDate,
    setWarehouseLocation,
    setSchoolCode,
    showInboundModal,
    setShowInboundModal,
    setEditingAsset,
    selectedAssetForOut,
    setSelectedAssetForOut,
    setOutboundImage,
    setKeeperInput,
    setShowKeeperSuggestions,
    setSelectedDeptForOut,
    showUpdateModal,
    setShowUpdateModal,
    setUpdatingAsset,
    showReturnModal,
    setShowReturnModal,
    setReturningAsset,
    viewingAsset,
    setViewingAsset,
  } = s;

  useEffect(() => {
    const today = getBeijingDateStr8();
    setOutboundId(
      `OUT-${today}-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
    );
  }, [inboundType, inboundDate, warehouseLocation]);

  useEffect(() => {
    if (editingAsset) {
      setInboundType(editingAsset.type);
      const photoObj = getAssetPhoto(editingAsset);
      setInboundAssetImage(photoObj ? photoObj.image : null);

      let validDate = getBeijingDateString();
      if (editingAsset.purchaseDate) {
        const dStr = editingAsset.purchaseDate.replace(/\//g, "-");
        const parts = dStr.split("-");
        if (parts.length === 3 && parseInt(parts[0]) > 1000) {
          validDate = `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
        } else {
          const d = new Date(editingAsset.purchaseDate);
          if (!isNaN(d.getTime())) {
            const offset = d.getTimezoneOffset() * 60000;
            const localISOTime = new Date(d.getTime() - offset)
              .toISOString()
              .slice(0, 10);
            validDate = localISOTime;
          }
        }
      }
      setInboundDate(validDate);
      setWarehouseLocation(editingAsset.warehouseLocation || "1楼小仓库");
      setSchoolCode(editingAsset.no.startsWith("XN") ? "XN" : "NB");
    } else {
      setInboundType("笔记本电脑");
      setInboundAssetImage(null);
      setInboundDate(getBeijingDateString());
      setWarehouseLocation("1楼小仓库");
      setSchoolCode("NB");
    }
  }, [editingAsset, showInboundModal, getAssetPhoto]);

  useEffect(() => {
    if (selectedAssetForOut) {
      setKeeperInput("");
      setShowKeeperSuggestions(false);
      setSelectedDeptForOut("语文");
    }
  }, [selectedAssetForOut]);

  // Keyboard Shortcuts (ESC to close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showInboundModal) {
          setShowInboundModal(false);
          setEditingAsset(null);
        } else if (selectedAssetForOut) {
          setSelectedAssetForOut(null);
          setOutboundImage(null);
        } else if (showUpdateModal) {
          setShowUpdateModal(false);
          setUpdatingAsset(null);
        } else if (showReturnModal) {
          setShowReturnModal(false);
          setReturningAsset(null);
        } else if (viewingAsset) {
          setViewingAsset(null);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[type="text"].pl-8',
        );
        searchInput?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    showInboundModal,
    selectedAssetForOut,
    showUpdateModal,
    showReturnModal,
    viewingAsset,
  ]);
}
