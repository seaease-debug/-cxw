// components/mobileScanner/useScannerData.ts
// B1-5：数据加载层 —— 原 refreshData（复杂度 36、嵌套 5 层）拆成 4 个互不叠加的小函数。
//
// ★ 关键等价性约束：`targetNo = scannedAsset?.no || initialAssetNo` 读的是**闭包渲染期**的
//   scannedAsset（不是刚刚 set 进去的那个，React 状态更新是异步的）。
//   所以本文件刻意**不使用 useCallback**，保持与原件一致的「每次渲染重建闭包」语义。
import { useEffect } from 'react';
import { UserAccount } from '../../types';
import { logError } from '../../utils/logger';
import {
  loadAccounts,
  loadAssetHistory,
  loadAssets,
  loadFaultTypes,
  loadInitialAssetByNo,
  loadModelPhoto,
  loadSuppliers,
} from './api';
import { mapRawAsset } from './helpers';
import { ScannerStore } from './useScannerStore';

export const useScannerData = (store: ScannerStore, user: UserAccount | null, initialAssetNo?: string) => {
  const {
    scannedAsset, setScannedAsset, setScannerOpen, setAssets, setSuppliers, setAccountList,
    setAssetHistory, setAssetPhoto, setIsSharedPhoto,
    setDynamicFaultTypes, setRepairFaultType,
  } = store;

  const fetchHistory = async (assetId: string) => {
    try {
      const data = await loadAssetHistory(assetId);
      if (data) setAssetHistory(data);
    } catch (err) {
      logError("Failed to fetch asset logs:", err);
    }
  };

  // 1. 启动预取：按 asset_no 直达（游客可用的端点）
  const loadInitialAsset = async () => {
    try {
      const item = await loadInitialAssetByNo(initialAssetNo as string);
      if (item) {
        const assetObj = mapRawAsset(item, true);
        setScannedAsset(assetObj);
        setScannerOpen(false);
        fetchHistory(assetObj.id);
      }
    } catch (err) {
      logError("Failed to load initial scanned asset as guest:", err);
    }
  };

  // 2. 登录后的全量列表（资产 / 供应商 / 账号）
  const loadAuthedLists = async () => {
    const list = await loadAssets();
    if (list) {
      setAssets(list);
      const targetNo = scannedAsset?.no || initialAssetNo;
      const matched = targetNo ? list.find(a => a.no === targetNo) : undefined;
      if (matched) setScannedAsset(matched);
    }
    setSuppliers(await loadSuppliers());
    const accounts = await loadAccounts();
    if (accounts) setAccountList(accounts);
  };

  // 3. 故障类型（游客与登录都拉）
  const applyFaultTypes = async () => {
    try {
      const types = await loadFaultTypes();
      if (types) {
        setDynamicFaultTypes(types);
        setRepairFaultType(types[0]);
      }
    } catch (ftErr) {
      logError("Failed to fetch fault types:", ftErr);
    }
  };

  // Load backend assets and staff lists
  const refreshData = async () => {
    try {
      if (initialAssetNo) {
        await loadInitialAsset();
      }
      if (user) {
        await loadAuthedLists();
      } else {
        // Guests: load suppliers from public API
        setSuppliers(await loadSuppliers());
      }
      await applyFaultTypes();
    } catch (err) {
      logError("Failed to load backend assets:", err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [initialAssetNo]);

  useEffect(() => {
    if (scannedAsset) {
      if (scannedAsset.assetImage) {
        setAssetPhoto(scannedAsset.assetImage);
        setIsSharedPhoto(false);
      } else {
        loadModelPhoto(scannedAsset.brandModel || scannedAsset.name)
          .then(data => {
            if (data.asset_image) {
              setAssetPhoto(data.asset_image);
              setIsSharedPhoto(true);
            } else {
              setAssetPhoto(null);
              setIsSharedPhoto(false);
            }
          })
          .catch(err => {
            logError('Failed to load model photo:', err);
            setAssetPhoto(null);
            setIsSharedPhoto(false);
          });
      }
    } else {
      setAssetPhoto(null);
      setIsSharedPhoto(false);
    }
  }, [scannedAsset]);

  return { refreshData, fetchHistory };
};

export type ScannerData = ReturnType<typeof useScannerData>;
