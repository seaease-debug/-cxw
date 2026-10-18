// B1-4b1：keeper 匹配共享谓词。
// 由 base.ts 的 computeDisplayAssets 与 overview.ts 的 computeKeeperLeaderboardData
// 中两段完全相同的「查账号 → 建有效标识集」逻辑提取而成，逻辑未改。
import type { AccountItem, AssetItem } from '../types';

/** 按 keeper 名查找账号：realName / real_name 或 username 命中。 */
export function findAccountByKeeper(accountsList: AccountItem[], keeperName: string): AccountItem | undefined {
  return accountsList.find((acc) => {
    const name = acc.realName || acc.real_name || '';
    return name === keeperName || acc.username === keeperName;
  });
}

/** 把账号的真实姓名与用户名（各自 trim 后非空者）并入标识集合。 */
export function addAccountIdentifiers(validIds: Set<string>, acc: AccountItem): void {
  const name = (acc.realName || acc.real_name || '').trim();
  const uname = (acc.username || '').trim();
  if (name) validIds.add(name);
  if (uname) validIds.add(uname);
}

/** keeper 名本身 + 其匹配账号的别名，构成可接受的标识集合。 */
export function buildKeeperIdSet(accountsList: AccountItem[], keeperName: string): Set<string> {
  const validIds = new Set<string>([keeperName]);
  const matchedAcc = findAccountByKeeper(accountsList, keeperName);
  if (matchedAcc) addAccountIdentifiers(validIds, matchedAcc);
  return validIds;
}

/** 资产的 keeper 是否命中标识集合。 */
export function keeperIn(a: AssetItem, validIds: Set<string>): boolean {
  const k = (a.keeper || '').trim();
  return validIds.has(k);
}
