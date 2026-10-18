import React from "react";
import { Input } from "../../../ui/Input";
import {
  FixedLocation,
  LOCATION_EMPTY_CLASS,
  LOCATION_ITEM_CLASS,
  SUGGEST_LIST_CLASS_SANS,
  matchesLocationQuery,
} from "./shared";

export interface LocationFieldProps {
  /** 表单字段名（两个弹窗都是 `location`）。 */
  name: string;
  /** 「新物理位置」/「发放后物理地点」——两侧文案**不同**，由调用方给。 */
  label: string;
  value: string;
  showSuggestions: boolean;
  fixedLocations: FixedLocation[];
  onValue: (value: string) => void;
  onShowSuggestions: (show: boolean) => void;
  /**
   * ★「受控固定场所」徽章的完整类名。两个弹窗的暗色文字**不同**
   *  （单个 `dark:text-emerald-400`、批量 `dark:text-emerald-300`）⇒ 用常量传入而非内部写死。
   */
  tagClassName: string;
}

/**
 * 位置输入 + 受控固定场所联想（单个 / 批量出库共用）。
 *
 * 抽出来的动机：两个弹窗各内联一份**逻辑完全相同**的实现，且都犯了同一个
 * 排版问题 —— `fixedLocations.filter(...)` 被**算了两遍**（先判 `length > 0`
 * 再 `.map`），批量侧还裹在 IIFE 里。这里改成**算一次**，渲染结果不变。
 */
export const LocationField: React.FC<LocationFieldProps> = ({
  name,
  label,
  value,
  showSuggestions,
  fixedLocations,
  onValue,
  onShowSuggestions,
  tagClassName,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValue(e.target.value);
    onShowSuggestions(true);
  };

  // 250ms 是既有延时（比领用人联想的 200ms 长），保留差异。
  const handleBlur = () => setTimeout(() => onShowSuggestions(false), 250);

  const filtered = fixedLocations.filter((loc) => matchesLocationQuery(loc, value));

  return (
    <div className="relative">
      <Input
        name={name}
        type="text"
        label={label}
        value={value}
        onChange={handleChange}
        onFocus={() => onShowSuggestions(true)}
        onBlur={handleBlur}
        required
        placeholder="点击选择受控固定场所或自由填写"
        autoComplete="off"
      />
      {showSuggestions && (
        <div className={SUGGEST_LIST_CLASS_SANS}>
          {filtered.length > 0 ? (
            filtered.map((loc) => (
              <div
                key={loc.id}
                className={LOCATION_ITEM_CLASS}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onValue(loc.name);
                  onShowSuggestions(false);
                }}
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    {loc.name}
                  </span>
                  {loc.description && (
                    <span className="text-xs text-slate-400">
                      {loc.description}
                    </span>
                  )}
                </div>
                <span className={tagClassName}>受控固定场所</span>
              </div>
            ))
          ) : (
            <div className={LOCATION_EMPTY_CLASS}>
              未在字典匹配，将保存为【临时/流动地点】
            </div>
          )}
        </div>
      )}
    </div>
  );
};
