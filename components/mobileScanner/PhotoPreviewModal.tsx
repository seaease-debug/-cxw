// components/mobileScanner/PhotoPreviewModal.tsx
import { Button } from '../ui/Button';
import { ScannerApi } from './useMobileScanner';
/** 原文件里这段遮罩弹窗被**重复写了两遍**（容器模式 / 桌面模式各一份），此处合一。 */
export const PhotoPreviewModal = ({ s }: { s: ScannerApi }) => {
  const { previewImage, setPreviewImage } = s;
  if (!previewImage) return null;
  return (
    <div 
      className="fixed inset-0 bg-black/90 z-[var(--z-modal-overlay)] flex items-center justify-center p-4 cursor-zoom-out"
      onClick={() => setPreviewImage(null)}
    >
      <div className="relative max-w-3xl flex flex-col items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
        <img 
          src={previewImage} 
          alt="照片预览" 
          className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-xl shadow-xl border border-slate-800" 
        />
        <Button 
          variant="secondary"
          size="sm"
          className="mt-4 text-white text-xs font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full border-none"
          onClick={() => setPreviewImage(null)}
        >
          ✕ 点击任意处或此处关闭
        </Button>
      </div>
    </div>
  );
};
