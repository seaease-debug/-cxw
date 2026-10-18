import { useState, useEffect } from 'react';

// ─── 状态语义色（固定不可变）──────────────────────────────────
export const CHART_STATUS_COLORS: Record<string, string> = {
  '服役中': '#0d9488',
  '闲置': '#76C7CC',
  '闲置待周转': '#76C7CC',
  '维护中': '#f59e0b',
  '风险关注数': '#f59e0b',
  '报废待审': '#e11d48',
};

// ─── 分类色（辅助，最多 6 色）─────────────────────────────────
export const CHART_CATEGORY_COLORS: string[] = [
  '#0d9488', // teal-600 品牌主色
  '#64748b', // slate-500 中性
  '#f59e0b', // amber-500 暖色
  '#e11d48', // rose-600 冷暖对比
  '#76C7CC', // teal-300 品牌浅色
  '#475569', // slate-600 中性深
];

// ─── 暗色模式检测 hook ────────────────────────────────────────
export function useChartTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // 初始检测
    setIsDark(document.documentElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return {
    isDark,
    axisColor: isDark ? '#475569' : '#94a3b8',
    axisText: isDark ? '#94a3b8' : '#64748b',
    gridColor: isDark ? '#334155' : '#cbd5e1',
    gridOpacity: isDark ? 0.3 : 0.2,
    tooltipBg: isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.96)',
    tooltipBorder: isDark ? '#334155' : '#e2e8f0',
    tooltipText: isDark ? '#f1f5f9' : '#0f172a',
    tooltipTextSecondary: isDark ? '#cbd5e1' : '#1e293b',
    cursorFill: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.15)',
  };
}

// ─── 减弱动画检测 ─────────────────────────────────────────────
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

// ─── 骨架屏组件 ───────────────────────────────────────────────
export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="animate-pulse" style={{ height }}>
      <div className="h-full w-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
    </div>
  );
}

// ─── 空状态组件 ───────────────────────────────────────────────
export function EmptyChartState({ message = '暂无数据' }: { message?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500"
      style={{ minHeight: 200 }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="M7 14l3-3 3 3 5-5" opacity="0.4" />
      </svg>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
