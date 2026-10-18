// B1-4b3：从 useReportsData 本体抽出的三个纯派生值。
// 抽出的唯一目的是让 hook 本体的圈复杂度落回阈值内 —— 判定分支与取值逐条保持原样。
import { User, UserRole } from '../../../types';
import type { ChartTheme } from '../types';

/** 原 hook 内联表达式原样外提：管理员判定（含 legacy 角色别名） */
export function isAdminUser(user: User | null): boolean {
  return user?.role === UserRole.ADMIN || String(user?.role) === 'admin' || String(user?.role) === 'superadmin' || String(user?.role) === 'system_admin';
}

/** 原 hook 内联表达式原样外提：当前用户展示名（real_name > name > realName > username） */
export function displayNameOf(user: User | null): string {
  return user?.real_name || user?.name || user?.realName || user?.username || '当前用户';
}

// 原 useMemo 的 5 个三元表达式拆成两张常量表（明/暗各一张）。
// 2026-10-18：两张表已上移到 `components/reports/chartPalette.ts`
// （唯一代码真源），此处只做二选一 —— 不再保留第二份色值副本。
import { CHART_THEME_DARK, CHART_THEME_LIGHT } from '../chartPalette';

/** 图表主题（明/暗两套常量二选一） */
export function chartThemeFor(isDark: boolean): ChartTheme {
  return isDark ? CHART_THEME_DARK : CHART_THEME_LIGHT;
}
