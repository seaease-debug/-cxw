import React from "react";
import { Camera, Check } from "lucide-react";

export interface BatchVoucherUploadProps {
  image: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImage: (image: string) => void;
}

/**
 * 批量出库的「批量领用交接凭证」区块。
 *
 * ★ 与单个出库的凭证区**刻意不合并**：两者的虚线框配色、点击语义
 *   （单个已上传时不响应点击，批量则「点击更换」）、缩略图 `alt`
 *   （`Voucher-Preview` vs `Voucher Preview`）、文案全部不同。
 *   强行合成一个组件只会退化成「一堆布尔 prop」，故保留为两个组件。
 *
 * ★ FileReader 逻辑内联在此（改前就在 `onChange` 里内联），不像单个出库那样
 *   交给调用方 —— 这是既有差异，原样保留。
 */
export const BatchVoucherUpload: React.FC<BatchVoucherUploadProps> = ({
  image,
  fileInputRef,
  onImage,
}) => {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
        批量领用交接凭证 (签字确认函等){" "}
        <Check size={12} className="inline-block mr-1" />
      </label>
      <div
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
          image
            ? "border-teal-600 bg-teal-600/5"
            : "border-slate-200 dark:border-slate-700 hover:border-teal-600 hover:bg-slate-50 dark:hover:bg-slate-800"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        {image ? (
          <div className="relative group">
            <img
              src={image}
              alt="Voucher-Preview"
              className="h-32 mx-auto rounded-lg shadow-sm object-contain"
            />
            <p className="text-xs text-teal-600 font-bold mt-2">
              已经捕获签名凭据，点击更换
            </p>
          </div>
        ) : (
          <div className="py-4">
            <Camera size={28} className="block mb-2 opacity-30 mx-auto" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              上传批量领用单、交接照、或签字凭证
            </span>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFile}
        />
      </div>
    </div>
  );
};
