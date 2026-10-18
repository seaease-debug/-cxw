import { AssetStatus } from "../../types";

export const getBeijingDateString = (): string => {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const nd = new Date(utc + 3600000 * 8);
  const year = nd.getFullYear();
  const month = String(nd.getMonth() + 1).padStart(2, "0");
  const day = String(nd.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getBeijingDateStr8 = (): string => {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const nd = new Date(utc + 3600000 * 8);
  const year = nd.getFullYear();
  const month = String(nd.getMonth() + 1).padStart(2, "0");
  const day = String(nd.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

export const isRecycledPendingStatus = (status: string): boolean => {
  return (
    status === AssetStatus.RECYCLED_PENDING ||
    status === "待周转" ||
    status === "周转仓(待处理)" ||
    status === "周转仓(待派发)" ||
    status === "待处理(周转)" ||
    status === "待处理"
  );
};

export const isScrapPendingStatus = (status: string): boolean => {
  return (
    status === AssetStatus.SCRAP_PENDING ||
    status === "待报废" ||
    status === "报废仓(待处置)" ||
    status === "待处置" ||
    status === "报废审核中"
  );
};

export const isStatusMatch = (
  assetStatus: string,
  filterStatus: string,
): boolean => {
  if (filterStatus === "ALL") return true;
  if (
    filterStatus === AssetStatus.RECYCLED_PENDING ||
    filterStatus === "待周转"
  ) {
    return isRecycledPendingStatus(assetStatus);
  }
  if (
    filterStatus === AssetStatus.SCRAP_PENDING ||
    filterStatus === "待报废"
  ) {
    return isScrapPendingStatus(assetStatus);
  }
  return assetStatus === filterStatus;
};

export const getTypeColor = (type: string): string => {
  if (type.includes("电脑")) return "bg-teal-500";
  if (type.includes("打印") || type.includes("扫描")) return "bg-emerald-500";
  if (type.includes("服务") || type.includes("交换")) return "bg-teal-500";
  if (type.includes("显示") || type.includes("投影")) return "bg-amber-500";
  return "bg-slate-400";
};

export const calculateLifeCycle = (
  dateStr: string,
  retirementYears: number = 8,
) => {
  const start = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  const percentage = Math.max(
    2,
    Math.min(100, (diffYears / retirementYears) * 100),
  );

  let color = "bg-emerald-500";
  if (diffYears >= retirementYears) color = "bg-slate-900";
  else if (diffYears >= retirementYears * 0.75) color = "bg-rose-500";
  else if (diffYears >= retirementYears * 0.5) color = "bg-amber-500";
  else if (diffYears >= retirementYears * 0.25) color = "bg-teal-500";

  return {
    percentage,
    color,
    isOverdue: diffYears >= retirementYears,
    diffYears,
  };
};

export const calculateServiceDuration = (
  startDateStr?: string,
): number | "-" => {
  if (!startDateStr) return "-";
  const start = new Date(startDateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  return diffYears;
};
