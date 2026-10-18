import React from "react";
import { Camera, X } from "lucide-react";
import { IconButton } from "../../../ui/IconButton";

export interface SingleVoucherUploadProps {
  image: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  /** 删除已上传的凭证。 */
  onClear: () => void;
  /** 点击缩略图放大（交给调用方的预览灯箱）。 */
  onPreview: (image: string) => void;
  /** 文件选择回调由调用方提供（含它自己的压缩/校验流程）。 */
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * 单个出库的「领用签字/凭证上传」区块。
 *
 * ★ 细节保留：`onClick` 挂在**外层虚线框**上，但已上传时**不响应点击**
 *   （`!image && ...`）；缩略图与删除按钮各自 `stopPropagation()`。
 *   这三者缺一都会导致点击穿透，行为对拍会抓到。
 */
export const SingleVoucherUpload: React.FC<SingleVoucherUploadProps> = ({
  image,
  fileInputRef,
  onClear,
  onPreview,
  onFile,
}) => (
  <div className="pt-1">
    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
      领用签字/凭证上传 (可选)
    </label>
    <div
      className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${image ? "border-teal-200 dark:border-teal-800 bg-teal-50/30 dark:bg-teal-950/20" : "border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"}`}
      onClick={() => !image && fileInputRef.current?.click()}
    >
      {image ? (
        <div className="relative group inline-block">
          <img
            src={image}
            alt="Voucher Preview"
            className="h-32 rounded-lg shadow-sm cursor-zoom-in hover:scale-105 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(image);
            }}
          />
          <IconButton
            icon={<X size={16} />}
            label="删除凭证"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            size="md"
            tone="danger"
            className="absolute -top-3 -right-3 bg-white dark:bg-slate-800 shadow-md z-10"
          />
          <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
            <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              点击放大
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-2">
          <Camera size={28} className="mb-1.5 opacity-30 mx-auto" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            点击上传领用单/签字照片
          </p>
          <p className="text-xs text-slate-400 mt-0.5">支持 JPG, PNG 格式</p>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={onFile}
      />
    </div>
  </div>
);
