import React from "react";
import { CHECKBOX_CLASS } from "./shared";

export interface SelectCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** 表格勾选框（表头全选与行勾选共用同一个受控实现）。 */
export const SelectCheckbox: React.FC<SelectCheckboxProps> = ({
  checked,
  onChange,
}) => (
  <input
    type="checkbox"
    className={CHECKBOX_CLASS}
    checked={checked}
    onChange={(e) => onChange(e.target.checked)}
  />
);

export interface RowSelectCellProps {
  assetId: string;
  checked: boolean;
  setSelectedBatchAssetIds: React.Dispatch<React.SetStateAction<string[]>>;
}

/**
 * 行首勾选单元格。
 *
 * B2b 之前这段「追加 / 过滤」逻辑在服役模式行与默认行里**各写了一遍**
 * （仅换行不同，逻辑逐字等价）；此处收敛为一处。
 */
export const RowSelectCell: React.FC<RowSelectCellProps> = ({
  assetId,
  checked,
  setSelectedBatchAssetIds,
}) => (
  <td className="px-4 py-4 w-10 text-center">
    <SelectCheckbox
      checked={checked}
      onChange={(isChecked) => {
        if (isChecked) {
          setSelectedBatchAssetIds((prev) => [...prev, assetId]);
        } else {
          setSelectedBatchAssetIds((prev) =>
            prev.filter((id) => id !== assetId),
          );
        }
      }}
    />
  </td>
);
