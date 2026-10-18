// components/assetDetail/PhotoSection.tsx
// 左栏 · 设备实物照片（含「同型号共享照片」标记与查看大图遮罩）。
import React from "react";
import { Camera } from "lucide-react";

interface PhotoSectionProps {
  displayPhoto: string | null;
  isSharedPhoto: boolean;
  onPreview: (src: string) => void;
}

export const PhotoSection: React.FC<PhotoSectionProps> = ({
  displayPhoto,
  isSharedPhoto,
  onPreview,
}) => (
  <section>
    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
      <Camera className="w-4 h-4 text-teal-600 dark:text-teal-400" />
      <span>设备实物照片</span>
    </h3>

    {displayPhoto ? (
      <div className="relative group w-full h-64 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-2">
        <img
          src={displayPhoto}
          alt="设备实物照片"
          className="w-full h-full object-contain cursor-zoom-in hover:scale-105 transition-all duration-300"
          onClick={() => onPreview(displayPhoto)}
        />
        {isSharedPhoto && (
          <span className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-xs px-2.5 py-1 rounded-lg backdrop-blur-sm font-medium">
            同型号共享照片
          </span>
        )}
        <div
          className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          onClick={() => onPreview(displayPhoto)}
        >
          <span className="text-white text-xs font-bold bg-slate-900/80 px-3 py-1.5 rounded-lg backdrop-blur-sm">
            点击查看大图
          </span>
        </div>
      </div>
    ) : (
      <div className="w-full h-44 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400">
        <Camera className="w-8 h-8 opacity-40 mb-2" />
        <span className="text-xs font-medium">暂无实物照片</span>
      </div>
    )}
  </section>
);
