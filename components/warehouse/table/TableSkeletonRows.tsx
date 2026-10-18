import React from "react";
import { UserRole } from "../../../types";
import { Skeleton, SkeletonCircle } from "../../ui/Skeleton";
import { ROW_CLASS } from "./shared";

export interface TableSkeletonRowsProps {
  userRole: UserRole;
  isInServiceMode: boolean;
}

/** 骨架屏：5 行占位，列数与真实行保持一致（随角色 / 模式变化）。 */
export const TableSkeletonRows: React.FC<TableSkeletonRowsProps> = ({
  userRole,
  isInServiceMode,
}) => (
  <>
    {Array.from({ length: 5 }).map((_, index) => (
      <tr key={index} className={ROW_CLASS}>
        {userRole !== UserRole.USER && (
          <td className="px-4 py-4 w-10 text-center">
            <Skeleton className="w-4 h-4 mx-auto" borderRadius="0.25rem" />
          </td>
        )}
        {isInServiceMode ? (
          <>
            <td className="px-4 py-4">
              <Skeleton className="w-32 h-4 mb-1" />
              <Skeleton className="w-24 h-3" />
            </td>
            <td className="px-4 py-4">
              <Skeleton className="w-16 h-6" borderRadius="0.375rem" />
            </td>
            <td className="px-4 py-4">
              <div className="flex items-center space-x-2">
                <SkeletonCircle size={24} />
                <Skeleton className="w-16 h-4" />
              </div>
            </td>
            <td className="px-4 py-4">
              <Skeleton className="w-20 h-4" />
            </td>
            <td className="px-4 py-4">
              <Skeleton className="w-24 h-4" />
            </td>
            <td className="px-4 py-4">
              <Skeleton className="w-20 h-4" />
            </td>
            <td className="px-4 py-4">
              <Skeleton className="w-16 h-5" borderRadius="0.25rem" />
            </td>
            <td className="px-4 py-4">
              <Skeleton className="w-12 h-5" borderRadius="0.25rem" />
            </td>
            <td className="px-4 py-4">
              <Skeleton className="w-16 h-4" />
            </td>
            <td className="px-4 py-4 text-right">
              <div className="flex justify-end space-x-2">
                <Skeleton className="w-10 h-6" borderRadius="0.5rem" />
                <Skeleton className="w-10 h-6" borderRadius="0.5rem" />
                <Skeleton className="w-10 h-6" borderRadius="0.5rem" />
              </div>
            </td>
          </>
        ) : (
          <>
            <td className="px-4 py-4">
              <Skeleton className="w-32 h-4 mb-1" />
              <Skeleton className="w-24 h-3" />
            </td>
            <td className="px-4 py-4">
              <Skeleton className="w-16 h-6" borderRadius="0.375rem" />
            </td>
            <td className="px-4 py-4">
              <div className="flex items-center space-x-2">
                <SkeletonCircle size={8} />
                <Skeleton className="w-16 h-4" />
              </div>
            </td>
            <td className="px-4 py-4">
              <Skeleton className="w-16 h-4" />
            </td>
            <td className="px-4 py-4">
              <Skeleton className="w-24 h-2 mb-1" borderRadius="9999px" />
              <Skeleton className="w-12 h-3" />
            </td>
            <td className="px-4 py-4">
              <div className="flex items-center space-x-1">
                <SkeletonCircle size={12} />
                <Skeleton className="w-16 h-4" />
              </div>
            </td>
            <td className="px-4 py-4">
              <Skeleton className="w-20 h-4" />
            </td>
            <td className="px-4 py-4 text-right">
              <div className="flex justify-end space-x-2">
                <Skeleton className="w-10 h-6" borderRadius="0.5rem" />
                <Skeleton className="w-14 h-6" borderRadius="0.5rem" />
              </div>
            </td>
          </>
        )}
      </tr>
    ))}
  </>
);
