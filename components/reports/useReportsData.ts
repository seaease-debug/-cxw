import { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from '../../types';
import type { AccountItem, AlertFilter, AssetItem, ChartTheme, KeeperViewMode, LeaderboardSortBy, LocationItem, MaintenanceRecordItem, RiskFilterType, RiskSortBy, SystemWarehouseItem } from './types';
import { computeAllKeepersList, computeDisplayAssets, computeAllModels, computeModelPriceMap } from './reportsDerived/base';
import { computeKpiStats, computeKeeperLeaderboardData, computeKeeperAssetStats, computeDisplayedKeeperChartData, computeAvailableYears, computeAssetStatusTransferData } from './reportsDerived/overview';
import { computeRiskInspectionAnalysis, computeModelBatchHealthData, computeAllModelsHealthOverview, computeAllModelsHealthChartData } from './reportsDerived/risk';
import { computeWarehousesData } from './reportsDerived/warehouse';
import { computeAlertAnalysis, computeFilteredAlertAssets } from './reportsDerived/alerts';
import { computeScopedMaintenance, computeTopFaultModels, computeActiveMaintenanceRecords, computeSelectedModelDetail } from './reportsDerived/maintenance';
import { computeLocationAnalysis, computeFilteredLocations } from './reportsDerived/spatial';
import { makeFetchData, makeResolvePrice, makeUpdateModelPrice } from './reportsDerived/actions';
import { isAdminUser, displayNameOf, chartThemeFor } from './reportsDerived/session';

export function useReportsData(user: User | null) {
  // 基础数据状态
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecordItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [systemWarehouses, setSystemWarehouses] = useState<SystemWarehouseItem[]>([]);
  const [accountsList, setAccountsList] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 导航与筛选状态
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'maintenance' | 'spatial'>('overview');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('主楼302');
  const [locationSearch, setLocationSearch] = useState<string>('');
  const [selectedKeeperFilter, setSelectedKeeperFilter] = useState<string>('ALL');

  // 排序与子视图状态
  const [leaderboardSortBy, setLeaderboardSortBy] = useState<LeaderboardSortBy>('count');
  const [riskFilterType, setRiskFilterType] = useState<RiskFilterType>('all');
  const [riskSortBy, setRiskSortBy] = useState<RiskSortBy>('count');
  const [selectedRiskModel, setSelectedRiskModel] = useState<string | null>(null);
  const [riskModalSearch, setRiskModalSearch] = useState<string>('');
  const [riskModalPage, setRiskModalPage] = useState<number>(1);

  const [selectedStatusYear, setSelectedStatusYear] = useState<string>('2026');
  const [keeperViewMode, setKeeperViewMode] = useState<KeeperViewMode>('top5');
  const [keeperChartPos, setKeeperChartPos] = useState<{ x: number; y: number } | null>(null);
  const [alertFilter, setAlertFilter] = useState<AlertFilter>('all');
  const [selectedFaultModel, setSelectedFaultModel] = useState<string | null>(null);

  // 权限与显示名
  const isAdmin = isAdminUser(user);
  const currentUserDisplayName = displayNameOf(user);

  // 暗黑模式感知
  const [isDark, setIsDark] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    if (typeof window !== 'undefined' && window.matchMedia) {
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    return () => observer.disconnect();
  }, []);

  const chartTheme: ChartTheme = useMemo(() => chartThemeFor(isDark), [isDark]);

  // 数据加载
  const fetchData = useCallback(makeFetchData({ setAccountsList, setAssets, setLoading, setLocations, setMaintenance, setSystemWarehouses }), []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 提取仅限 Keeper 角色（仓库管理员/专职保管员）的列表，排除普通用户
  const allKeepersList = useMemo(() => computeAllKeepersList({ accountsList, assets }), [assets, accountsList]);

  // 根据当前视角和筛选切片计算 displayAssets
  const displayAssets = useMemo(() => computeDisplayAssets({ accountsList, assets, currentUserDisplayName, isAdmin, selectedKeeperFilter, user }), [assets, accountsList, isAdmin, user?.username, currentUserDisplayName, selectedKeeperFilter]);

  // 所有可用型号列表
  const allModels = useMemo(() => computeAllModels({ displayAssets }), [displayAssets]);

  useEffect(() => {
    if (allModels.length > 0 && !allModels.includes(selectedModel)) {
      setSelectedModel(allModels[0]);
    }
  }, [allModels, selectedModel]);

  // 建立全资产同型号有效基准价格映射表（若某条资产自身价格为0，自动继承同型号非零基准价）
  const modelPriceMap = useMemo(() => computeModelPriceMap({ assets }), [assets]);

  // 获取资产有效价格（自身价格优先，同型号非零基准价次之）
  const resolvePrice = useCallback(makeResolvePrice({ modelPriceMap }), [modelPriceMap]);

  // 批量补录型号基准单价
  const updateModelPrice = useCallback(makeUpdateModelPrice({ fetchData }), [fetchData]);

  // 1. KPI 核心指标
  const kpiStats = useMemo(() => computeKpiStats({ displayAssets, resolvePrice }), [displayAssets]);

  // 2. 管理员专属 - Keeper 领用/保管资产排行榜
  const keeperLeaderboardData = useMemo(() => computeKeeperLeaderboardData({ accountsList, allKeepersList, assets, leaderboardSortBy, resolvePrice }), [allKeepersList, assets, accountsList, leaderboardSortBy]);

  // 3. 存量与风险关注资产列表分析
  const riskInspectionAnalysis = useMemo(() => computeRiskInspectionAnalysis({ displayAssets, maintenance, resolvePrice, riskFilterType, riskSortBy }), [displayAssets, riskFilterType, riskSortBy, maintenance]);

  // 4. 同型号各批次健康堆叠数据
  const modelBatchHealthData = useMemo(() => computeModelBatchHealthData({ displayAssets, selectedModel }), [displayAssets, selectedModel]);

  // 5. 全型号整体健康状态对比
  const allModelsHealthOverview = useMemo(() => computeAllModelsHealthOverview({ displayAssets }), [displayAssets]);

  const allModelsHealthChartData = useMemo(() => computeAllModelsHealthChartData({ allModelsHealthOverview }), [allModelsHealthOverview]);

  // 6. 仓库保管资产构成
  const warehousesData = useMemo(() => computeWarehousesData({ currentUserDisplayName, displayAssets, resolvePrice, systemWarehouses, user }), [systemWarehouses, displayAssets, user?.username, currentUserDisplayName]);

  // 可用年份
  const availableYears = useMemo(() => computeAvailableYears({ displayAssets }), [displayAssets]);

  // 7. 资产流转与状态变更趋势
  const assetStatusTransferData = useMemo(() => computeAssetStatusTransferData({ displayAssets, maintenance, selectedStatusYear }), [displayAssets, maintenance, selectedStatusYear]);

  // 8. Keeper 保管领用分布
  const keeperAssetStats = useMemo(() => computeKeeperAssetStats({ displayAssets, resolvePrice }), [displayAssets]);

  const displayedKeeperChartData = useMemo(() => computeDisplayedKeeperChartData({ keeperAssetStats, keeperViewMode }), [keeperAssetStats, keeperViewMode]);

  // 9. 维保预警
  const alertAnalysis = useMemo(() => computeAlertAnalysis({ displayAssets }), [displayAssets]);

  const filteredAlertAssets = useMemo(() => computeFilteredAlertAssets({ alertAnalysis, alertFilter }), [alertFilter, alertAnalysis]);

  // 10. 故障与维修效率
  const scopedMaintenance = useMemo(() => computeScopedMaintenance({ currentUserDisplayName, displayAssets, isAdmin, maintenance, user }), [maintenance, displayAssets, isAdmin, currentUserDisplayName, user?.username]);

  const topFaultModels = useMemo(() => computeTopFaultModels({ assets, scopedMaintenance }), [scopedMaintenance, assets]);

  const activeMaintenanceRecords = useMemo(() => computeActiveMaintenanceRecords({ assets, scopedMaintenance, selectedFaultModel }), [scopedMaintenance, selectedFaultModel, assets]);

  const selectedModelDetail = useMemo(() => computeSelectedModelDetail({ activeMaintenanceRecords, assets }), [activeMaintenanceRecords, assets]);

  // 11. 空间地点档案
  const locationAnalysis = useMemo(() => computeLocationAnalysis({ displayAssets, resolvePrice, selectedLocation }), [displayAssets, selectedLocation]);

  const filteredLocations = useMemo(() => computeFilteredLocations({ locationSearch, locations }), [locations, locationSearch]);

  return {
    // 基础数据与加载
    assets,
    maintenance,
    locations,
    systemWarehouses,
    accountsList,
    loading,
    isAdmin,
    currentUserDisplayName,
    isDark,
    reducedMotion,
    chartTheme,

    // 导航与筛选
    activeTab,
    setActiveTab,
    selectedKeeperFilter,
    setSelectedKeeperFilter,
    allKeepersList,
    displayAssets,

    // KPI & Overview
    kpiStats,
    allModels,
    selectedModel,
    setSelectedModel,
    modelBatchHealthData,
    allModelsHealthChartData,
    selectedStatusYear,
    setSelectedStatusYear,
    availableYears,
    assetStatusTransferData,
    keeperViewMode,
    setKeeperViewMode,
    keeperChartPos,
    setKeeperChartPos,
    displayedKeeperChartData,
    keeperAssetStats,
    warehousesData,

    // Keeper Leaderboard & Risk
    leaderboardSortBy,
    setLeaderboardSortBy,
    keeperLeaderboardData,
    riskFilterType,
    setRiskFilterType,
    riskSortBy,
    setRiskSortBy,
    riskInspectionAnalysis,
    selectedRiskModel,
    setSelectedRiskModel,
    riskModalSearch,
    setRiskModalSearch,
    riskModalPage,
    setRiskModalPage,

    // Alerts
    alertAnalysis,
    alertFilter,
    setAlertFilter,
    filteredAlertAssets,

    // Maintenance
    topFaultModels,
    selectedFaultModel,
    setSelectedFaultModel,
    selectedModelDetail,

    // Spatial
    locationAnalysis,
    selectedLocation,
    setSelectedLocation,
    locationSearch,
    setLocationSearch,
    filteredLocations,

    // Actions
    refetchData: fetchData,
    updateModelPrice
  };
}

