// components/assetDetail/report.ts
// 故障报修提交（纯数据层）：拼装 body、发请求、把结果归一成「成功 / 失败+文案」。
// 网络层异常**直接抛出**，由调用方决定提示语（与原实现的 try/catch 位置一致）。
import { Asset } from "../../types";
import { postMaintenanceRecord } from "./api";

export interface FaultReportInput {
  asset: Asset;
  reporterName: string;
  reporterContact: string;
  faultType: string;
  faultDesc: string;
  /** 故障分类候选（后端配置优先，空则兜底），用于 fault_type 的最终回落。 */
  faultTypeOptions: string[];
}

export type FaultReportResult = { ok: true } | { ok: false; message: string };

export const submitFaultReport = async (input: FaultReportInput): Promise<FaultReportResult> => {
  const { asset, reporterName, reporterContact, faultType, faultDesc, faultTypeOptions } = input;

  const res = await postMaintenanceRecord({
    asset_id: asset.id,
    asset_no: asset.no,
    asset_name: `${asset.brandModel || asset.name || asset.type}`,
    reporter_name: reporterName,
    reporter_contact: reporterContact,
    fault_type: faultType || faultTypeOptions[0],
    fault_description: faultDesc,
  });

  if (res.ok) return { ok: true };
  const errData = await res.json().catch(() => ({}));
  return { ok: false, message: errData.error || "提交失败，请重试" };
};
