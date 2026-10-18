import React from "react";
import { Input } from "../../../ui/Input";
import { UserAccount } from "../../../../types";
import {
  KEEPER_EMPTY_CLASS,
  KEEPER_ITEM_CLASS,
  SUGGEST_LIST_CLASS,
  SUGGEST_LIST_CLASS_SANS,
  matchesKeeperQuery,
} from "./shared";

export interface KeeperFieldProps {
  /** 可选人员池（来自调用方的 `accountList`）。 */
  accountList: UserAccount[];
  /** 当前选中部门 —— 联想会按它过滤。 */
  dept: string;
  value: string;
  showSuggestions: boolean;
  /** 输入变化（原始文本，未做匹配）。 */
  onValue: (value: string) => void;
  /** 命中同名人员时自动回填其部门。 */
  onDept: (dept: string) => void;
  onShowSuggestions: (show: boolean) => void;
  /**
   * ★ 批量弹窗的联想容器**历来带 `font-sans`**，单个弹窗没有。
   *   属既有差异，抽取时保留（统一留给「样式批」）。
   */
  panelSans?: boolean;
  /**
   * ★ key 形态**既有差异**：单个弹窗用 `acc.id`，批量弹窗用数组下标。
   *   默认 `id`；批量侧传 `index` 以保持逐字节等价的渲染行为。
   */
  keyMode?: "id" | "index";
}

/**
 * 领用人输入 + 联想下拉（单个 / 批量出库共用）。
 *
 * 抽出来的动机：两个弹窗各自内联了一份**逻辑完全相同**的实现
 *（过滤 → 命中自动回填部门 → mousedown 选中 → 空态文案），
 * 差异只有「容器是否 `font-sans`」和「key 形态」两处，已提为显式 prop。
 */
export const KeeperField: React.FC<KeeperFieldProps> = ({
  accountList,
  dept,
  value,
  showSuggestions,
  onValue,
  onDept,
  onShowSuggestions,
  panelSans = false,
  keyMode = "id",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onValue(val);
    onShowSuggestions(true);
    const matched = accountList.find((acc) => acc.realName === val);
    if (matched && matched.department) {
      onDept(matched.department);
    }
  };

  // 200ms 是既有延时（比位置联想的 250ms 短），保留差异。
  const handleBlur = () => setTimeout(() => onShowSuggestions(false), 200);

  const handlePick = (acc: UserAccount) => {
    onValue(acc.realName);
    onShowSuggestions(false);
    if (acc.department) {
      onDept(acc.department);
    }
  };

  const filtered = accountList.filter((acc) => matchesKeeperQuery(acc, dept, value));

  return (
    <div className="relative">
      <Input
        label="领用人 (使用人)"
        name="keeper"
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => onShowSuggestions(true)}
        onBlur={handleBlur}
        required
        placeholder="例如: 张老师"
        autoComplete="off"
      />
      {showSuggestions && (
        <div className={panelSans ? SUGGEST_LIST_CLASS_SANS : SUGGEST_LIST_CLASS}>
          {filtered.length > 0 ? (
            filtered.map((acc, idx) => (
              <div
                key={keyMode === "index" ? idx : acc.id}
                className={KEEPER_ITEM_CLASS}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handlePick(acc);
                }}
              >
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                  {acc.realName}
                </span>
                <span className="text-xs text-slate-400">
                  {acc.department || acc.role}
                </span>
              </div>
            ))
          ) : (
            <div className={KEEPER_EMPTY_CLASS}>未找到该部门匹配人员</div>
          )}
        </div>
      )}
    </div>
  );
};
