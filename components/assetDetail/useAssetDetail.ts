// components/assetDetail/useAssetDetail.ts
// AssetDetail 的全部状态与副作用（从原组件原样搬出，仅把纯逻辑拆到 storage/report）。
//
// ★ 保留的三个易踩点：
//   ① 供应商：有 props 时**不再请求**，但无论如何都会请求一次 /api/accounts；
//   ② accounts 是**两个 useEffect 各取一次**（原文如此，两处口径还不同：一处带 res.ok
//      守卫、一处不带），不要"顺手合并"成一次请求；
//   ③ 历史随 asset.id 重载；照片有 assetImage 时直接用，否则去查同型号图。
import React, { useEffect, useMemo, useState } from "react";
import { Asset, AssetHistory, Supplier } from "../../types";
import { logError } from "../../utils/logger";
import { useToast } from "../Toast";
import {
  fetchAccounts,
  fetchAccountsOrEmpty,
  fetchAssetHistory,
  fetchFaultTypes,
  fetchModelPhoto,
  fetchSuppliers,
} from "./api";
import { pickDefaultDepartment } from "./derived";
import { submitFaultReport } from "./report";
import { findAccountByName, hasSavedUser, readSavedReporter } from "./storage";
import { AccountLite, FaultTypeLite, faultTypeNames } from "./shared";

export const useAssetDetail = (asset: Asset, propsSuppliers?: Supplier[]) => {
  const toast = useToast();

  const [supplierList, setSupplierList] = useState<Supplier[]>(propsSuppliers || []);
  const [history, setHistory] = useState<AssetHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(true);
  const [displayPhoto, setDisplayPhoto] = useState<string | null>(null);
  const [isSharedPhoto, setIsSharedPhoto] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [faultType, setFaultType] = useState("硬件损坏 / 配件故障");
  const [faultDesc, setFaultDesc] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [accountList, setAccountList] = useState<AccountLite[]>([]);
  const [showKeeperSuggestions, setShowKeeperSuggestions] = useState(false);
  const [dbFaultTypes, setDbFaultTypes] = useState<FaultTypeLite[]>([]);

  // 供应商 + 账号（这一路带 res.ok 守卫，失败静默回落）
  useEffect(() => {
    if (!propsSuppliers || propsSuppliers.length === 0) {
      fetchSuppliers()
        .then((data) => setSupplierList(data))
        .catch((err) => logError("Failed to load suppliers:", err));
    } else {
      setSupplierList(propsSuppliers);
    }

    fetchAccountsOrEmpty()
      .then((data) => setAccountList(data))
      .catch(() => {});
  }, [propsSuppliers]);

  // 报修人默认值（本机登录态）+ 账号表 + 故障分类
  useEffect(() => {
    const saved = readSavedReporter();
    if (saved.name) setReporterName(saved.name);
    if (saved.department) setReporterContact(saved.department);

    fetchAccounts()
      .then((data) => {
        if (!Array.isArray(data)) return;
        setAccountList(data);
        const dept = findAccountByName(data, saved.name)?.department;
        if (dept) setReporterContact(dept);
      })
      .catch((err) => logError("Failed to fetch accounts:", err));

    fetchFaultTypes()
      .then((data) => {
        if (!Array.isArray(data)) return;
        const enabled = data.filter((f) => f.enabled !== 0);
        setDbFaultTypes(enabled);
        if (enabled.length > 0) setFaultType(enabled[0].name);
      })
      .catch((err) => logError("Failed to fetch fault types:", err));
  }, []);

  const depts = useMemo(() => {
    const set = new Set<string>();
    accountList.forEach((a) => {
      if (a.department) set.add(a.department);
    });
    return Array.from(set);
  }, [accountList]);

  const reloadHistory = () => {
    setHistoryLoading(true);
    fetchAssetHistory(asset.id)
      .then((data) => setHistory(data))
      .catch((err) => logError("Failed to load history:", err))
      .finally(() => setHistoryLoading(false));
  };

  useEffect(() => {
    reloadHistory();
  }, [asset.id]);

  useEffect(() => {
    if (asset.assetImage) {
      setDisplayPhoto(asset.assetImage);
      setIsSharedPhoto(false);
    } else {
      fetchModelPhoto(asset.brandModel || asset.name)
        .then((data) => {
          if (data.asset_image) {
            setDisplayPhoto(data.asset_image);
            setIsSharedPhoto(true);
          } else {
            setDisplayPhoto(null);
            setIsSharedPhoto(false);
          }
        })
        .catch((err) => {
          logError("Failed to load model photo:", err);
          setDisplayPhoto(null);
        });
    }
  }, [asset.id, asset.assetImage, asset.brandModel, asset.name]);

  const isLoggedIn = useMemo(() => hasSavedUser(), []);

  const faultTypeOptions = faultTypeNames(dbFaultTypes);

  const openReportModal = () => {
    const defaultName = reporterName || readSavedReporter().name;
    if (defaultName) setReporterName(defaultName);
    const matchedAcc = findAccountByName(accountList, defaultName);
    setReporterContact(
      pickDefaultDepartment(matchedAcc, reporterContact, asset?.department, depts),
    );
    setShowReportModal(true);
  };

  const closeReportModal = () => setShowReportModal(false);

  const handleNameChange = (val: string) => {
    setReporterName(val);
    setShowKeeperSuggestions(true);
    const matched = accountList.find((acc) => acc.realName === val);
    if (matched && matched.department) {
      setReporterContact(matched.department);
    }
  };

  const pickAccount = (acc: AccountLite) => {
    setReporterName(acc.realName);
    setShowKeeperSuggestions(false);
    if (acc.department) {
      setReporterContact(acc.department);
    }
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterName.trim() || !faultDesc.trim()) {
      toast.error("请填写报修人和故障描述");
      return;
    }
    setSubmittingReport(true);
    try {
      const result = await submitFaultReport({
        asset,
        reporterName,
        reporterContact,
        faultType,
        faultDesc,
        faultTypeOptions,
      });
      if (result.ok) {
        toast.success("报修申请已安全提交！科技信息中心将尽快处理");
        setShowReportModal(false);
        setFaultDesc("");
        reloadHistory();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("网络请求失败");
    } finally {
      setSubmittingReport(false);
    }
  };

  return {
    supplierList, history, historyLoading, displayPhoto, isSharedPhoto, previewImage,
    setPreviewImage, showReportModal, reporterName, reporterContact, setReporterContact,
    faultType, setFaultType, faultDesc, setFaultDesc, submittingReport, accountList,
    showKeeperSuggestions, setShowKeeperSuggestions, depts, faultTypeOptions, isLoggedIn,
    openReportModal, closeReportModal, submitReport, handleNameChange, pickAccount,
  };
};
