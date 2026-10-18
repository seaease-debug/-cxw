
import '@fontsource/noto-sans-sc/400.css';
import '@fontsource/noto-sans-sc/500.css';
import '@fontsource/noto-sans-sc/600.css';
import '@fontsource/noto-sans-sc/700.css';
// 可变字重单文件：一次覆盖 100–800，供全项目 110 处 font-mono（编号 / 金额 / 时间）使用。
// 此前 --font-mono 声明了 "JetBrains Mono" 但该字体从未打包 ⇒ 实际落到 Consolas，
// 且中文因前两级字体都不含 CJK 而掉进系统宋体。见 DESIGN.md §3「字体载体」。
import '@fontsource-variable/jetbrains-mono';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './components/Toast';
import { DialogProvider } from './components/ui/DialogContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ToastProvider>
      <DialogProvider>
        <App />
      </DialogProvider>
    </ToastProvider>
  </React.StrictMode>
);
