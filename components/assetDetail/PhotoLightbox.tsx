// components/assetDetail/PhotoLightbox.tsx
// 照片大图灯箱：点击遮罩或按钮关闭。
import React from "react";
import { Button } from "../ui/Button";

interface PhotoLightboxProps {
  src: string;
  onClose: () => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({ src, onClose }) => (
  <div
    className="fixed inset-0 bg-black/90 z-[var(--z-modal-overlay)] flex items-center justify-center p-4 cursor-zoom-out"
    onClick={onClose}
  >
    <div
      className="relative max-w-3xl flex flex-col items-center justify-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <img
        src={src}
        alt="照片预览"
        className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-xl shadow-xl border border-slate-800"
      />
      <Button
        variant="secondary"
        size="sm"
        className="mt-4 text-white bg-white/10 hover:bg-white/20 border-white/20 rounded-full"
        onClick={onClose}
      >
        ✕ 点击任意处或此处关闭
      </Button>
    </div>
  </div>
);
