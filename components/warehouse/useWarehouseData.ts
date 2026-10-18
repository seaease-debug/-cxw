import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Asset,
  AssetType,
  AssetStatus,
  UserAccount,
  UserRole,
  Supplier,
  Warehouse as WarehouseRecord,
  AssetTypeItem,
  DEPT_CODES,
} from "../../types";
import { logError } from "../../utils/logger";
import {
  isStatusMatch,
  calculateLifeCycle,
  calculateServiceDuration,
} from "./warehouseUtils";
import { API_BASE } from "../../services/api";

export interface RawDbAsset {
  id: number | string;
  asset_no: string;
  name: string;
  type: string;
  brand_model: string;
  serial_no: string;
  purchase_date: string;
  purchase_price: number;
  supplier?: string;
  warranty_period?: string;
  status: string;
  department: string;
  keeper: string;
  location: string;
  warehouse_location: string;
  mac_address?: string;
  remarks?: string;
  voucher_image?: string;
  asset_image?: string;
  outbound_date?: string;
  retirement_years?: number;
  uploader?: string;
  audit_code?: string;
}

export type SortKey = keyof Asset | "lifeCycle" | "duration";

export interface SortConfig {
  key: SortKey;
  direction: "asc" | "desc";
}

export interface UseWarehouseDataParams {
  user: UserAccount;
}

export function useWarehouseData({ user }: UseWarehouseDataParams) {
  const userRole = user?.role || UserRole.USER;
  const userRealName = user?.realName || "";

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [realAssets, setRealAssets] = useState<Asset[]>([]);
  const [accountList, setAccountList] = useState<UserAccount[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouseList, setWarehouseList] = useState<WarehouseRecord[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetTypeItem[]>([]);
  const [fixedLocations, setFixedLocations] = useState<
    Array<{ id: number; name: string; description: string }>
  >([]);
  const [dbFaultTypes, setDbFaultTypes] = useState<
    Array<{ id: number; name: string; enabled?: boolean }>
  >([]);

  // Filter & Pagination & Sort State
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(() =>
    userRole === UserRole.USER ? AssetStatus.IN_USE : "ALL"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({
    key: "currentStatus",
    direction: "asc",
  });
  const [selectedBatchAssetIds, setSelectedBatchAssetIds] = useState<string[]>(
    [],
  );

  const dynamicDepts = useMemo(() => {
    return Array.from(
      new Set([
        ...Object.keys(DEPT_CODES),
        ...accountList.map((a) => a.department).filter(Boolean),
      ]),
    );
  }, [accountList]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const assetsUrl =
        userRole === UserRole.ADMIN
          ? `${API_BASE}/assets`
          : userRole === UserRole.KEEPER
            ? `${API_BASE}/assets?uploader=${encodeURIComponent(user?.username || "")}`
            : `${API_BASE}/assets?keeper=${encodeURIComponent(userRealName)}`;

      const [
        assetsRes,
        accountsRes,
        suppliersRes,
        warehousesRes,
        assetTypesRes,
        locationsRes,
      ] = await Promise.all([
        fetch(assetsUrl),
        fetch(`${API_BASE}/accounts`),
        fetch(`${API_BASE}/suppliers`),
        fetch(`${API_BASE}/warehouses`),
        fetch(`${API_BASE}/asset-types`),
        fetch(`${API_BASE}/locations`),
      ]);

      const assetsData: RawDbAsset[] = await assetsRes.json();
      setRealAssets(
        assetsData.map((item: RawDbAsset) => ({
          id: item.id.toString(),
          no: item.asset_no,
          name: item.name,
          type: item.type as AssetType,
          brandModel: item.brand_model,
          specification: item.brand_model,
          serialNo: item.serial_no,
          purchaseDate: item.purchase_date,
          purchasePrice: item.purchase_price,
          supplierId: item.supplier || "",
          warrantyPeriod: item.warranty_period || "3年",
          currentStatus: item.status as AssetStatus,
          departmentId: item.department,
          currentKeeperId: item.keeper,
          currentLocationId: item.location,
          warehouseLocation: item.warehouse_location,
          macAddress: item.mac_address,
          remarks: item.remarks,
          remainingDays: 2920,
          qrCodeInfo: item.asset_no,
          voucherImage: item.voucher_image,
          assetImage: item.asset_image,
          outboundDate: item.outbound_date,
          uploader: item.uploader,
          auditCode: item.audit_code,
        })),
      );

      setAccountList(await accountsRes.json());
      setSuppliers(await suppliersRes.json());

      try {
        const dynamicWh = await warehousesRes.json();
        setWarehouseList(dynamicWh);
      } catch (whErr) {
        logError("Failed to parse warehouses:", whErr);
      }

      try {
        const dynamicTypes = await assetTypesRes.json();
        setAssetTypes(dynamicTypes);
      } catch (typesErr) {
        logError("Failed to parse asset types:", typesErr);
      }

      try {
        const dynamicLocs = await locationsRes.json();
        if (Array.isArray(dynamicLocs)) setFixedLocations(dynamicLocs);
      } catch (locErr) {
        logError("Failed to parse locations:", locErr);
      }
    } catch (e) {
      logError("Fetch failed", e);
      setErrorMsg("数据加载失败，请检查网络连接或稍后重试");
    } finally {
      setLoading(false);
    }
  }, [user?.username, userRealName, userRole]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetch(`${API_BASE}/fault-types`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const enabled = data.filter(
            (f: { enabled: number }) => f.enabled !== 0,
          );
          setDbFaultTypes(enabled);
        }
      })
      .catch((err) => logError("Failed to load fault types:", err));
  }, []);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedBatchAssetIds([]);
  }, [filterText, statusFilter, itemsPerPage]);

  const requestSort = (key: SortKey) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getAssetPhoto = useCallback(
    (asset: Asset) => {
      if (asset.assetImage) return { image: asset.assetImage, isShared: false };
      const sharedAsset = realAssets.find(
        (a) => a.brandModel === asset.brandModel && a.assetImage,
      );
      if (sharedAsset && sharedAsset.assetImage) return { image: sharedAsset.assetImage, isShared: true };
      return null;
    },
    [realAssets],
  );

  // Filter Logic
  const statusFiltered = useMemo(() => {
    if (userRole === UserRole.USER) {
      return realAssets.filter((a) => isStatusMatch(a.currentStatus, AssetStatus.IN_USE));
    }
    return statusFilter === "ALL"
      ? realAssets
      : realAssets.filter((a) => isStatusMatch(a.currentStatus, statusFilter));
  }, [realAssets, statusFilter, userRole]);

  const filtered = useMemo(() => {
    const text = filterText.toLowerCase();
    if (!text) return statusFiltered;
    return statusFiltered.filter(
      (a) =>
        (a.no || "").toLowerCase().includes(text) ||
        (a.brandModel || "").toLowerCase().includes(text) ||
        (a.serialNo || "").toLowerCase().includes(text) ||
        (a.type || "").toLowerCase().includes(text) ||
        (a.currentKeeperId || "").toLowerCase().includes(text) ||
        (a.departmentId || "").toLowerCase().includes(text),
    );
  }, [statusFiltered, filterText]);

  // Sort Logic
  const sortedData = useMemo(() => {
    if (!sortConfig) return filtered;

    return [...filtered].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      if (sortConfig.key === "lifeCycle") {
        aVal = calculateLifeCycle(
          a.purchaseDate,
          a.retirementYears,
        ).diffYears;
        bVal = calculateLifeCycle(
          b.purchaseDate,
          b.retirementYears,
        ).diffYears;
      } else if (sortConfig.key === "duration") {
        aVal = calculateServiceDuration(a.purchaseDate);
        bVal = calculateServiceDuration(b.purchaseDate);
        if (aVal === "-") aVal = -1;
        if (bVal === "-") bVal = -1;
      } else {
        aVal = a[sortConfig.key] ?? "";
        bVal = b[sortConfig.key] ?? "";
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    return sortedData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  }, [sortedData, currentPage, itemsPerPage]);

  return {
    loading,
    errorMsg,
    realAssets,
    setRealAssets,
    accountList,
    suppliers,
    warehouseList,
    assetTypes,
    fixedLocations,
    dbFaultTypes,
    dynamicDepts,
    fetchData,
    filterText,
    setFilterText,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    sortConfig,
    requestSort,
    selectedBatchAssetIds,
    setSelectedBatchAssetIds,
    filtered,
    sortedData,
    paginatedData,
    totalPages,
    getAssetPhoto,
  };
}
