import React from "react";
import { Button } from "../../../ui/Button";

export interface BatchReturnActionsProps {
  isSubmitting: boolean;
  onClose: () => void;
}

/**
 * 批量退库弹窗底部操作行（取消 + 确认批量退库）。
 * ★ 单个弹窗底部是**一整颗全宽按钮**，形状不同 ⇒ 不共用；这里只服务批量。
 */
export const BatchReturnActions: React.FC<BatchReturnActionsProps> = ({
  isSubmitting,
  onClose,
}) => (
  <div className="flex space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
    <Button
      type="button"
      variant="secondary"
      size="md"
      onClick={onClose}
      className="flex-1"
    >
      取消
    </Button>
    <Button
      type="submit"
      variant="primary"
      size="md"
      disabled={isSubmitting}
      className="flex-[2] bg-amber-600 hover:bg-amber-500 text-white"
    >
      {isSubmitting ? "正在退库..." : "确认批量退库"}
    </Button>
  </div>
);
