import React from "react";
import { X } from "lucide-react";
import { IconButton } from "../../../ui/IconButton";

export interface ReturnModalHeaderProps {
  /** 头部容器类名 —— 单个是 `p-5 md:p-6 … shrink-0`、批量是 `p-6 …`，逐字节传入。 */
  containerClass: string;
  /** h3 类名 —— 批量多一个 `flex items-center gap-2`，不能统一。 */
  titleClass: string;
  title: React.ReactNode;
  /** 英文副标题（全大写小字）。 */
  subtitle: string;
  onClose: () => void;
}

/** 退库弹窗头部（标题 + 副标题 + 关闭按钮），单个 / 批量共用。 */
export const ReturnModalHeader: React.FC<ReturnModalHeaderProps> = ({
  containerClass,
  titleClass,
  title,
  subtitle,
  onClose,
}) => (
  <div className={containerClass}>
    <div>
      <h3 className={titleClass}>{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold uppercase tracking-wider">
        {subtitle}
      </p>
    </div>
    <IconButton
      icon={<X size={18} />}
      label="关闭"
      onClick={onClose}
      size="md"
    />
  </div>
);
