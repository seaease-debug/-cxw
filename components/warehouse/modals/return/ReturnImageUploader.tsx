import React from "react";
import { Camera } from "lucide-react";
import { RETURN_UPLOAD_TONE, ReturnUploadTone } from "./shared";

export interface ReturnImageUploaderProps {
  image: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tone: ReturnUploadTone;
  /** 无图时的提示文案 —— 单个 / 批量不同。 */
  emptyText: string;
  /** 已有图时的提示文案 —— 单个 / 批量不同。 */
  filledText: string;
}

/**
 * 交接凭证上传区（单个 / 批量共用）。
 * ★ 只把**配色族**与**两句文案**参数化，其余 JSX 逐字节保留 —— 包括
 *   `input` 的 prop 顺序（React 按 prop 顺序输出属性，顺序变了就是产物变了）。
 */
export const ReturnImageUploader: React.FC<ReturnImageUploaderProps> = ({
  image,
  inputRef,
  onFileSelect,
  tone,
  emptyText,
  filledText,
}) => {
  const t = RETURN_UPLOAD_TONE[tone];

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
        image ? t.filledBox : t.idleBox
      }`}
      onClick={() => inputRef.current?.click()}
    >
      {image ? (
        <div className="relative group">
          <img
            src={image}
            alt="Preview"
            className="h-32 mx-auto rounded-lg shadow-sm object-contain"
          />
          <p className={`text-xs ${t.filledHint} font-bold mt-2`}>
            {filledText}
          </p>
        </div>
      ) : (
        <div className="py-4">
          <Camera size={28} className="block mb-2 opacity-30 mx-auto" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {emptyText}
          </span>
        </div>
      )}
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/*"
        onChange={onFileSelect}
      />
    </div>
  );
};
