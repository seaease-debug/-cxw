// components/mobileScanner/useScannerControls.ts
// B1-5：扫码、表单开关、拍照与内联登录等「交互控制」处理器。
import React from 'react';
import { getBeijingDateStr8 } from '../warehouse/warehouseUtils';
import { fetchAssetByNo, postLogin, randomOutboundSuffix } from './api';
import { mapRawAsset } from './helpers';
import { ScannerData } from './useScannerData';
import { ScannerStore } from './useScannerStore';

export const useScannerControls = (store: ScannerStore, data: ScannerData) => {
  const {
    assets, setScannedAsset, setScannerOpen, setLoading, setErrorMsg,
    setOutboundId, setKeeperInput, setOutboundImage, setActiveForm, setReturnStatus, setReturnWarehouse,
    setLoginError, loginUsername, loginPassword,
  } = store;
  const { fetchHistory } = data;

  // Simulate scanning code
  const handleScanCode = (code: string) => {
    setLoading(true);
    setErrorMsg("");

    // Search local list first
    const matched = assets.find(a => a.no.toLowerCase() === code.trim().toLowerCase());
    if (matched) {
      setScannedAsset(matched);
      setScannerOpen(false);
      fetchHistory(matched.id);
      setLoading(false);
    } else {
      // Direct API check as fallback
      fetchAssetByNo(code.trim())
        .then(item => {
          const assetObj = mapRawAsset(item, false);
          setScannedAsset(assetObj);
          setScannerOpen(false);
          fetchHistory(assetObj.id);
        })
        .catch(err => {
          setErrorMsg(err.message || "未找到匹配条码或资产编号");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // Generate outbound serial number
  const generateOutboundID = () => {
    const prefix = 'OUT';
    const dateStr = getBeijingDateStr8();
    const suffix = randomOutboundSuffix();
    setOutboundId(`${prefix}-${dateStr}-${suffix}`);
  };

  const handleOutboundClick = () => {
    generateOutboundID();
    setKeeperInput("");
    setOutboundImage(null);
    setActiveForm('outbound');
  };

  const handleReturnClick = () => {
    setReturnStatus("周转仓(待处理)");
    setReturnWarehouse("周转仓-可用区");
    setOutboundImage(null);
    setActiveForm('return');
  };

  // Handle Photo/Voucher mock upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setOutboundImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Inline login processing
  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const userData = await postLogin(loginUsername, loginPassword);
    if (userData === undefined) {
      setLoginError("连接服务器失败");
      return;
    }
    if (!userData) {
      setLoginError("账号或密码错误");
      return;
    }
    localStorage.setItem('eduasset_user', JSON.stringify(userData));
    window.location.reload(); // Quick refresh of the user contexts
  };

  return {
    handleScanCode, generateOutboundID, handleOutboundClick,
    handleReturnClick, handlePhotoUpload, handleInlineLogin,
  };
};

export type ScannerControls = ReturnType<typeof useScannerControls>;
