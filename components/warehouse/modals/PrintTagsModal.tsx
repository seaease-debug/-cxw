import React, { useEffect, useState } from "react";
import { Asset, UserAccount } from "../../../types";
import { Button } from "../../ui/Button";
import QrCode from "../../QrCode";

export interface PrintTagsModalProps {
  assetsToPrint: Asset[] | null;
  accounts?: UserAccount[];
  onClose: () => void;
}

export const PrintTagsModal: React.FC<PrintTagsModalProps> = ({
  assetsToPrint,
  accounts,
  onClose,
}) => {
  const [accountMap, setAccountMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      const map: Record<string, string> = {};
      accounts.forEach((acc) => {
        if (acc.username) map[acc.username] = acc.realName;
      });
      setAccountMap(map);
    } else {
      fetch("/api/accounts")
        .then((res) => res.json())
        .then((data: UserAccount[]) => {
          if (Array.isArray(data)) {
            const map: Record<string, string> = {};
            data.forEach((acc) => {
              if (acc.username) map[acc.username] = acc.realName;
            });
            setAccountMap(map);
          }
        })
        .catch(() => {});
    }
  }, [accounts]);

  if (!assetsToPrint || assetsToPrint.length === 0) return null;

  const formatHandler = (asset: Asset) => {
    const rawUploader = asset.uploader || "admin";
    const realName = accountMap[rawUploader];

    if (rawUploader === "admin") {
      return realName ? `经手人: ${realName}` : "经手人: 系统管理员";
    }

    if (realName) {
      return `经手人: ${realName} (${rawUploader})`;
    }

    if (asset.keeper && asset.keeper !== "admin" && asset.keeper !== "系统管理员" && rawUploader) {
      return `经手人: ${asset.keeper} (${rawUploader})`;
    }

    return `经手人: ${rawUploader}`;
  };

  return (
    <div className="fixed inset-0 z-[var(--z-modal-top-overlay,2500)] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print-backdrop">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            /* 隐藏普通页面中的布局元素、所有侧边栏以及带有 no-print 类的元素 */
            aside, header, nav, footer, sidebar, .no-print {
              display: none !important;
            }
            /* 隐藏其他所有弹窗（例如资产详情/档案模态框） */
            .fixed:not(.print-backdrop) {
              display: none !important;
            }
            /* 让打印背景盖满整个打印页，并使用纯白底色遮蔽后面未隐藏的任何底层内容 */
            .print-backdrop {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: 100% !important;
              background: white !important;
              backdrop-filter: none !important;
              padding: 0 !important;
              margin: 0 !important;
              z-index: var(--z-modal-top-overlay, 2500) !important;
              display: block !important;
              overflow: visible !important;
            }
            /* 打印卡片消除外边距、阴影和多余边框 */
            .print-card {
              position: relative !important;
              width: 100% !important;
              max-width: 100% !important;
              height: auto !important;
              max-height: none !important;
              background: white !important;
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
              overflow: visible !important;
            }
            /* 标签排版设置 */
            .print-tag-container {
              display: grid !important;
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 20px !important;
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
            }
            /* 标签卡片边框和打印色彩设置 */
            .print-tag-card {
              border: 1.5px solid #1e293b !important; /* 墨绿色系或深灰色系的硬质边框 */
              box-shadow: none !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin-bottom: 1.5cm !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `,
        }}
      />
      <div className="relative z-[var(--z-modal-top,2600)] bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden p-6 md:p-8 flex flex-col print-card animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4 mb-6 no-print">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
              <span>🖨️ 固定资产登记标签打印预览</span>
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              为您准备了符合 <strong>80mm x 55mm</strong> 标准背胶标签纸大小的排版布局，带设备身份证二维码。
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.print()}
            >
              <span>🖨️ 打印</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              关闭预览
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="print-tag-container grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            {assetsToPrint.map((asset) => {
              const qrUrl = `${window.location.origin}${window.location.pathname}?asset_no=${encodeURIComponent(asset.no)}`;
              return (
                <div
                  key={asset.id}
                  className="print-tag-card bg-white border border-slate-300 rounded-xl p-4 shadow-sm relative text-slate-800 flex flex-col justify-between w-full h-[180px] max-w-[400px] mx-auto overflow-hidden font-sans"
                >
                  {/* Header bar with colored tag */}
                  <div className="flex justify-between items-center border-b pb-2">
                    <div className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                      <span className="text-xs font-semibold tracking-wider text-slate-900">
                        科技信息中心固资标签
                      </span>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-500 font-mono font-semibold uppercase px-1.5 py-0.5 rounded border border-slate-200">
                      {asset.type}
                    </span>
                  </div>

                  {/* Content Section */}
                  <div className="flex items-center justify-between py-2 flex-grow">
                    <div className="space-y-1 px-1 flex-grow pr-3">
                      <p className="text-[13px] font-semibold text-slate-900 line-clamp-1 mb-1">
                        {asset.brandModel || asset.name}
                      </p>
                      <p className="text-xs text-slate-600 font-medium font-mono">
                        <span className="text-slate-400 font-sans">编号: </span>
                        <strong>{asset.no}</strong>
                      </p>
                      {asset.auditCode &&
                        asset.auditCode.trim() !== "" &&
                        asset.auditCode !== asset.no && (
                          <p className="text-xs text-slate-600 font-medium font-mono">
                            <span className="text-slate-400 font-sans">
                              资产编号:{" "}
                            </span>
                            <strong>{asset.auditCode}</strong>
                          </p>
                        )}
                      <p className="text-xs text-slate-600 font-medium font-mono">
                        <span className="text-slate-400 font-sans">S/N: </span>
                        <strong>{asset.serialNo || "-"}</strong>
                      </p>
                    </div>

                    {/* QR code block container */}
                    <div className="flex flex-col items-center justify-center pl-2 border-l border-slate-200 shrink-0 w-24">
                      <QrCode
                        value={qrUrl}
                        size={64}
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                  </div>

                  {/* Bottom disclaimer footer */}
                  <div className="border-t pt-1 flex justify-between items-center text-[10px] font-semibold text-slate-400">
                    <span>※ 请勿私自涂改、撕毁此标签</span>
                    <span>{formatHandler(asset)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
