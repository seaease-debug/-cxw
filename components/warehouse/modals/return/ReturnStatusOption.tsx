import React from "react";
import {
  DOT_IDLE_BORDER,
  OPTION_TITLE_IDLE,
  RETURN_CARD_TONE,
  ReturnCardTone,
} from "./shared";

interface StatusDotProps {
  selected: boolean;
  tone: ReturnCardTone;
  /** ★ 单个 `w-2 h-2` / 批量 `w-2.5 h-2.5` —— 既有差异，由调用方传入。 */
  dotSize: string;
}

/**
 * 选中圆点。★ 单独成组件不光是为了复用：`complexity` 只看 AST 分支节点，
 * 圆点里的「外圈三态」与「实心两点」必须在**独立函数**里才会各自计分。
 */
export const StatusDot: React.FC<StatusDotProps> = ({
  selected,
  tone,
  dotSize,
}) => {
  const t = RETURN_CARD_TONE[tone];

  return (
    <div
      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
        selected ? t.dotBorder : DOT_IDLE_BORDER
      }`}
    >
      {selected && <div className={`${dotSize} ${t.dotBg} rounded-full`} />}
    </div>
  );
};

export interface ReturnStatusOptionProps {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  tone: ReturnCardTone;
  /** ★ 单个 `w-2 h-2` / 批量 `w-2.5 h-2.5` —— 既有差异，由调用方传入。 */
  dotSize: string;
  /**
   * 传入 `radioName` 时才渲染那个隐藏 radio —— 只有**批量**弹窗需要它来提供
   * 表单语义（单个弹窗历来没有），所以这里必须可选，不能「统一补上」。
   */
  radioName?: string;
  radioValue?: string;
}

/** 退库后状态评估卡（单个 / 批量共用）；标题、描述、配色、圆点尺寸全部由调用方给。 */
export const ReturnStatusOption: React.FC<ReturnStatusOptionProps> = ({
  selected,
  onSelect,
  title,
  description,
  tone,
  dotSize,
  radioName,
  radioValue,
}) => {
  const t = RETURN_CARD_TONE[tone];

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
        selected ? t.selected : t.idle
      }`}
    >
      {radioName && (
        <input
          type="radio"
          name={radioName}
          value={radioValue}
          checked={selected}
          readOnly
          className="sr-only"
        />
      )}
      <div className="flex items-center space-x-2 mb-1">
        <StatusDot selected={selected} tone={tone} dotSize={dotSize} />
        <span
          className={`text-sm font-semibold ${
            selected ? t.title : OPTION_TITLE_IDLE
          }`}
        >
          {title}
        </span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 pl-6 leading-tight">
        {description}
      </p>
    </div>
  );
};
