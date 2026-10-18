// DESIGN.md §2.4「图表配色（Recharts）」的**唯一代码真源**。
//
// 图表无法用 Tailwind 类上色，hex 属 DESIGN.md §7 Don'ts-4 的明文例外；
// 但「允许写 hex」≠「允许到处复制」—— 此前同一组色值散落在 5 个文件里各写一遍
// （session.ts / RiskDonut / alerts.ts / KeeperDistribution / CustomDotTooltip），
// 改一次主色要改五处，漏一处就是线上图表颜色不一致。现统一收口到本文件。
//
// 改色流程：只改这里 → `node .eng-audit/design-scan.mjs` 仍为 0（本文件按文件名豁免，
// 它就是「令牌层」的 TS 形态）→ 记得同步 DESIGN.md §2.4 的两张表。
import type { ChartTheme } from './types';

/** 状态语义色 —— DESIGN.md §2.4「状态语义色」表，顺序即图表色序 */
export const CHART_SEMANTIC = {
  /** 服役中 / 正常质保期内 / 故障与维保中 —— teal-600 */
  inService: '#0d9488',
  /** 闲置 / 闲置待周转 —— teal-300 */
  idle: '#76C7CC',
  /** 维护中 / 风险关注数 / 长期闲置(>180天) —— amber-500 */
  maintenance: '#f59e0b',
  /** 临近过保(≤90天) —— amber-600 */
  expiring: '#d97706',
  /** 报废待审 / 已超质保期 / 待报废审批 —— rose-600 */
  scrapped: '#e11d48',
} as const;

/** 主题令牌（亮色）—— DESIGN.md §2.4「主题令牌」表 */
export const CHART_THEME_LIGHT: ChartTheme = {
  axisColor: '#64748b',
  axisText: '#475569',
  gridColor: '#e2e8f0',
  gridOpacity: 0.8,
  cursorFill: 'rgba(241, 245, 249, 0.7)',
};

/** 主题令牌（暗色）—— DESIGN.md §2.4「主题令牌」表 */
export const CHART_THEME_DARK: ChartTheme = {
  axisColor: '#94a3b8',
  axisText: '#cbd5e1',
  gridColor: '#334155',
  gridOpacity: 0.6,
  cursorFill: 'rgba(51, 65, 85, 0.4)',
};
