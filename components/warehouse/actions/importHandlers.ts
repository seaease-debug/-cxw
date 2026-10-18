import React from "react";
import { useToast } from "../../Toast";
import { decodeFile } from "../../../utils/fileDecode";
import { API_BASE } from "../../../services/api";
import type { WarehouseActionsCtx } from "./handlersCtx";
import { sendJson } from "./handlersCtx";
import type { WarehouseActionsState } from "./state";
import { parseAssetCsv, downloadAssetTemplateCsv } from "./csv";

/**
 * B4 拆分自 handlers.ts 的 `useWarehouseImportHandlers`（原单一箭头函数 68 行 / 复杂度 13）。
 * 拆法：把「进度条推进 / 成功收尾 / 失败收尾 / 主流程」四个可独立判断的块提到模块级。
 * ★ 所有**副作用调用点的先后顺序原样保留** —— 逻辑台逐条比副作用轨迹，顺序变了就会 FAIL。
 */

interface ImportDeps {
  showToast: ReturnType<typeof useToast>["showToast"];
  setIsImporting: WarehouseActionsState["setIsImporting"];
  setImportProgress: WarehouseActionsState["setImportProgress"];
  setImportErrors: WarehouseActionsState["setImportErrors"];
  fileInputRef: WarehouseActionsState["fileInputRef"];
}

interface ImportMeta {
  schoolCode: string;
  uploader: string;
  uploaderRealName: string;
  fetchData: () => Promise<void>;
}

type Timer = ReturnType<typeof setInterval>;

/** 进度条推进器：随机步进 + 85 封顶 + 到顶即清定时器。 */
function makeProgressTicker(setImportProgress: ImportDeps["setImportProgress"]): Timer {
  const interval = setInterval(() => {
    setImportProgress((prev: number) => {
      if (prev >= 85) {
        clearInterval(interval);
        return 85;
      }
      return prev + Math.floor(Math.random() * 8) + 4;
    });
  }, 100);
  return interval;
}

/** 请求成功后的收尾（进度灌满 → 等进度条走完 → 复位 → 提示 → 刷新）。 */
async function applyImportSuccess(
  res: Response,
  deps: ImportDeps,
  fetchData: () => Promise<void>,
): Promise<void> {
  deps.setImportProgress(100);
  await new Promise((resolve) => setTimeout(resolve, 600));
  deps.setIsImporting(false);
  deps.setImportProgress(0);
  const result = await res.json();
  deps.showToast(result.message || "导入成功", "success");
  fetchData();
}

/** 请求失败后的收尾：优先展示逐行错误清单，否则退化为单条提示。 */
async function applyImportFailure(res: Response, deps: ImportDeps): Promise<void> {
  deps.setIsImporting(false);
  deps.setImportProgress(0);
  const result = await res.json();
  if (result.errors && Array.isArray(result.errors)) {
    deps.setImportErrors(result.errors);
  } else {
    deps.showToast(result.error || "导入失败，数据不满足系统约束", "error");
  }
}

/** 导入主流程（解码 → 解析 → 空文件短路 → 上送 → 收尾 → 清空 input）。 */
async function runImport(
  interval: Timer,
  file: File,
  deps: ImportDeps,
  meta: ImportMeta,
): Promise<void> {
  try {
    const csv = await decodeFile(file);
    const assets = parseAssetCsv(csv);
    if (assets.length === 0) {
      clearInterval(interval);
      deps.setIsImporting(false);
      deps.setImportProgress(0);
      deps.showToast("文件为空", "warning");
      return;
    }

    const res = await sendJson(`${API_BASE}/assets/bulk`, "POST", {
      assets,
      schoolCode: meta.schoolCode,
      uploader: meta.uploader,
      uploaderRealName: meta.uploaderRealName,
    });

    clearInterval(interval);

    if (res.ok) await applyImportSuccess(res, deps, meta.fetchData);
    else await applyImportFailure(res, deps);

    if (deps.fileInputRef.current) deps.fileInputRef.current.value = "";
  } catch {
    clearInterval(interval);
    deps.setIsImporting(false);
    deps.setImportProgress(0);
    deps.showToast("导入失败", "error");
  }
}

/** 批量导入 / 模板下载。 */
export function useWarehouseImportHandlers(ctx: WarehouseActionsCtx) {
  const { s, user, userRealName, fetchData } = ctx;
  const { showToast } = useToast();
  const { setIsImporting, setImportProgress, setImportErrors, fileInputRef, schoolCode } = s;

  const deps: ImportDeps = {
    showToast,
    setIsImporting,
    setImportProgress,
    setImportErrors,
    fileInputRef,
  };

  const handleAssetImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(10);
    setImportErrors([]);

    const interval = makeProgressTicker(setImportProgress);

    await runImport(interval, file, deps, {
      schoolCode,
      uploader: user?.username || "admin",
      uploaderRealName: userRealName,
      fetchData,
    });
  };

  return { handleAssetImport, downloadAssetTemplate: downloadAssetTemplateCsv };
}
