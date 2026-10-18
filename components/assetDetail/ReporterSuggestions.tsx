// components/assetDetail/ReporterSuggestions.tsx
// 报修人姓名联想下拉：按「所属部门 + 输入关键字」双条件过滤账号。
// ★ 原实现是 JSX 里的 IIFE；IIFE 里的函数会被 max-lines-per-function 双重计数，
//   提到组件层后两个问题一起消失。
import React from "react";
import { AccountLite } from "./shared";

interface ReporterSuggestionsProps {
  accounts: AccountLite[];
  /** 当前所属部门；为空表示不过滤部门。 */
  contact: string;
  /** 当前输入；为空表示不过滤关键字。 */
  name: string;
  onPick: (acc: AccountLite) => void;
}

export const ReporterSuggestions: React.FC<ReporterSuggestionsProps> = ({
  accounts,
  contact,
  name,
  onPick,
}) => {
  const filteredList = accounts.filter((acc) => {
    const deptMatch = !contact || acc.department === contact;
    const textMatch = !name || acc.realName.includes(name);
    return deptMatch && textMatch;
  });

  return (
    <div className="absolute z-[var(--z-dropdown)] w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-44 overflow-y-auto font-sans">
      {filteredList.length > 0 ? (
        filteredList.map((acc, idx) => (
          <div
            key={idx}
            className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center border-b border-slate-50 dark:border-slate-700 last:border-0 text-xs"
            onMouseDown={(e) => {
              e.preventDefault();
              onPick(acc);
            }}
          >
            <span className="font-semibold text-slate-800 dark:text-slate-100">{acc.realName}</span>
            <span className="text-xs text-slate-400">{acc.department || acc.role}</span>
          </div>
        ))
      ) : (
        <div className="px-3 py-2 text-xs text-slate-400 text-center">
          未在账号列表中匹配，可直接手工输入
        </div>
      )}
    </div>
  );
};
