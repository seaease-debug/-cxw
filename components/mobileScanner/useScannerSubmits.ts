// components/mobileScanner/useScannerSubmits.ts
// B1-5：五个「作业提交」处理器。原它们与状态、渲染同处一个 1488 行函数内。
// 每个处理器仍保持**完全相同的**成功/失败提示文案与刷新时机。
import React from 'react';
import { logError } from '../../utils/logger';
import { patchLocation, postOutbound, postRepair, postRecycleProcess, postReturn } from './api';
import { ScannerData } from './useScannerData';
import { ScannerStore } from './useScannerStore';

export const useScannerSubmits = (store: ScannerStore, data: ScannerData) => {
  const {
    scannedAsset, setActiveForm, setSubmitting, outboundImage,
    returnWarehouse, returnStatus, repairReporterName, repairReporterContact,
    repairFaultType, repairFaultDesc, setRepairFaultDesc, toast, confirm,
  } = store;
  const { refreshData } = data;

  const handleOutboundSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!scannedAsset) return;

    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const department = formData.get('department') as string;
    const keeper = formData.get('keeper') as string;
    const location = formData.get('location') as string;
    const outboundDate = formData.get('outboundDate') as string;

    try {
      const ok = await postOutbound({
        assetId: scannedAsset.id, department, keeper, location, outboundDate, voucherImage: outboundImage,
      });
      if (ok) {
        setActiveForm(null);
        toast.success("出库处理成功");
        await refreshData();
      } else {
        toast.error("出库提交失败");
      }
    } catch (err) {
      logError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!scannedAsset) return;

    setSubmitting(true);
    try {
      const ok = await postReturn({
        assetId: scannedAsset.id, warehouseLocation: returnWarehouse, returnStatus, voucherImage: outboundImage,
      });
      if (ok) {
        setActiveForm(null);
        toast.success("退库归还提交成功");
        await refreshData();
      } else {
        toast.error("退库提交失败");
      }
    } catch (err) {
      logError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLocationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!scannedAsset) return;

    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const location = formData.get('location') as string;
    const remarks = formData.get('remarks') as string;

    try {
      const ok = await patchLocation(scannedAsset.id, location, remarks);
      if (ok) {
        setActiveForm(null);
        toast.success("存放位置更新成功");
        await refreshData();
      } else {
        toast.error("更新位置失败");
      }
    } catch (err) {
      logError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRepairSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!scannedAsset) return;

    if (!repairReporterName.trim() || !repairFaultDesc.trim()) {
      toast.error("请填写报修教职工姓名和故障现象描述");
      return;
    }

    setSubmitting(true);
    try {
      const ok = await postRepair({
        assetId: scannedAsset.id,
        assetNo: scannedAsset.no,
        assetName: `${scannedAsset.brandModel || scannedAsset.type}`,
        reporterName: repairReporterName,
        reporterContact: repairReporterContact,
        faultType: repairFaultType,
        faultDescription: repairFaultDesc,
      });
      if (ok) {
        toast.success("故障报修已成功提交！科技信息中心将尽快处理");
        setActiveForm(null);
        setRepairFaultDesc("");
        await refreshData();
      } else {
        toast.error("提交报修失败，请重试");
      }
    } catch (err) {
      logError(err);
      toast.error("网络错误，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const handleScrapProcess = async (action: 'scrap' | 'scrap_confirm') => {
    if (!scannedAsset) return;
    const isConfirmed = await confirm({
      title: action === 'scrap' ? "发起报废申请" : "彻底报废清理",
      message: action === 'scrap' ? "是否确认发起报废申请？" : "是否确认将此装备彻底报废清理？",
      type: "danger",
      confirmText: "确认",
      cancelText: "取消"
    });
    if (!isConfirmed) return;

    setSubmitting(true);
    try {
      const ok = await postRecycleProcess(scannedAsset.id, action);
      if (ok) {
        toast.success(action === 'scrap' ? "报废申请已提交" : "已完成报废清理");
        await refreshData();
      } else {
        toast.error("操作更新失败");
      }
    } catch (err) {
      logError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    handleOutboundSubmit, handleReturnSubmit, handleLocationSubmit, handleRepairSubmit, handleScrapProcess,
  };
};

export type ScannerSubmits = ReturnType<typeof useScannerSubmits>;
