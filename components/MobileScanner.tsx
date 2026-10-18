// components/MobileScanner.tsx
// ---------------------------------------------------------------------------
// B1-5：本文件原为 1687 行（S104 最后一个超标文件，组件函数 1488 行 / 复杂度 63）。
// 现已拆为：
//   components/mobileScanner/            —— 逻辑层
//     types.ts        类型
//     helpers.ts      纯函数（映射 / 权限 / 时间轴样式 / 金额打码 / 供应商联系）
//     api.ts          全部网络调用
//     useScannerStore.ts / useScannerData.ts / useScannerSubmits.ts / useScannerControls.ts
//     useMobileScanner.ts                —— 合并上面四个 hook，视图层只认它
//   components/mobileScanner/            —— 视图层
//     PhoneApp.tsx          手机外壳（刘海 / 标题栏 / 内容切换 / 底栏）
//     ScannerScreen.tsx     扫码页
//     AssetDetailScreen.tsx 资产详情页（组合下面六张卡）
//     AssetCards.tsx        标题 / 照片 / 规格 / 寿命 / 售后 / 流转记录
//     AssetForms.tsx        出库 / 退库 / 变更位置 / 报修 四个表单
//     AssetActionsBar.tsx   操作条（报修 / 保管人操作网格 / 游客提示与内联登录）
//     DesktopPreview.tsx    桌面端整体布局（说明 + 手机样机）
//     PhotoPreviewModal.tsx 图片放大遮罩
//
// ★ 本次为**纯搬运 + 扁平化**，不改任何业务行为：所有 JSX 由按行号区间切片生成，
//   表达式一字未改（详见 .eng-audit/b1-5/gen-b1-5.mjs 与 ACCEPTANCE.md）。
// ---------------------------------------------------------------------------
import React from 'react';
import { DesktopPreview } from './mobileScanner/DesktopPreview';
import { PhoneApp } from './mobileScanner/PhoneApp';
import { PhotoPreviewModal } from './mobileScanner/PhotoPreviewModal';
import { MobileScannerProps } from './mobileScanner/types';
import { useMobileScanner } from './mobileScanner/useMobileScanner';

const MobileScanner: React.FC<MobileScannerProps> = ({
  user,
  initialAssetNo,
  hideSimulatorContainer = false,
}) => {
  const s = useMobileScanner({ user, initialAssetNo });

  // FULL CONTAINER MODE (Render device on desktop sidebar, but responsive/empty for standalone/mobile browsers)
  if (hideSimulatorContainer) {
    return (
      <>
        <PhoneApp s={s} hideSimulatorContainer={true} />
        <PhotoPreviewModal s={s} />
      </>
    );
  }

  return <DesktopPreview s={s} />;
};

export default MobileScanner;
