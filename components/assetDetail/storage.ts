// components/assetDetail/storage.ts
// 本机登录态（localStorage）读取。所有 try/catch 收敛在这里，
// 让调用方拿到的是「干净值」，不再层层嵌套 try + if。
import type { AccountLite } from "./shared";

/** local 里是否存有登录用户（决定价格/金额是否脱敏）。 */
export const hasSavedUser = (): boolean => {
  try {
    return !!localStorage.getItem("eduasset_user");
  } catch {
    return false;
  }
};

/** 读取本机登录用户的姓名与部门；缺失或坏数据一律回落到空串。 */
export const readSavedReporter = (): { name: string; department: string } => {
  try {
    const saved = localStorage.getItem("eduasset_user");
    if (!saved) return { name: "", department: "" };
    const u = JSON.parse(saved);
    return { name: u.realName || u.username || "", department: u.department || "" };
  } catch {
    return { name: "", department: "" };
  }
};

/** 在账号表里按「姓名或工号」找到对应账号。 */
export const findAccountByName = (
  accounts: AccountLite[],
  name: string,
): AccountLite | undefined =>
  accounts.find((acc) => acc.realName === name || acc.username === name);
