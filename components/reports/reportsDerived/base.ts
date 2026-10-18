// 由 .eng-audit/b1-4/gen-split-derived.mjs 生成 —— 勿手改。
import type { AccountItem, AssetItem } from '../types';
import { getAssetPrice } from '../types';
import type { User } from '../../../types';
import { UserRole } from '../../../types';
import { buildKeeperIdSet, keeperIn } from './keepers';

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeAllKeepersList(a: {
  accountsList: AccountItem[];
  assets: AssetItem[];
}) {
  const { accountsList, assets } = a;
  const set = new Set<string>();
  const invalid = new Set([
    'user', 'user1', 'admin', 'administrator', 'system',
    '系统管理员', '管理员', '普通用户', '超级管理员', '测试账号',
    '未指定保管人', '未分配', '无', '系统用户'
  ]);

  // 1. 如果 accountsList 存在，仅提取 role 为 keeper 的账号
  const keeperAccounts = accountsList.filter(
    acc => acc.role === 'keeper' || acc.role === UserRole.KEEPER
  );

  if (keeperAccounts.length > 0) {
    keeperAccounts.forEach(acc => {
      const real = (acc.realName || acc.real_name || '').trim();
      const uname = (acc.username || '').trim();
      const nameToAdd = real || uname;
      if (nameToAdd && !invalid.has(nameToAdd.toLowerCase())) {
        set.add(nameToAdd);
      }
    });
  } else {
    // 若 accountsList 尚未返回或无 keeper 账号，从 assets 的 keeper 字段提取有效保管人
    assets.forEach(a => {
      const k = (a.keeper || '').trim();
      if (k && !invalid.has(k.toLowerCase()) && k !== '未指定保管人') {
        set.add(k);
      }
    });
  }

  return Array.from(set).sort();
}

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeDisplayAssets(a: {
  accountsList: AccountItem[];
  assets: AssetItem[];
  currentUserDisplayName: string;
  isAdmin: boolean;
  selectedKeeperFilter: string;
  user: User | null;
}) {
  const { accountsList, assets, currentUserDisplayName, isAdmin, selectedKeeperFilter, user } = a;
  if (!isAdmin) {
    const username = user?.username || '';
    return assets.filter((x) => matchesCurrentUser(x, currentUserDisplayName, username));
  }

  if (selectedKeeperFilter === 'ALL') {
    return assets;
  }

  // 查找选中的 keeper 对应的账号标识（真实姓名和用户名）
  const validIds = buildKeeperIdSet(accountsList, selectedKeeperFilter);

  return assets.filter((x) => keeperIn(x, validIds));
}

/** 非管理员视角：keeper 命中当前用户显示名或用户名。 */
function matchesCurrentUser(a: AssetItem, currentUserDisplayName: string, username: string) {
  const k = (a.keeper || '').trim();
  return k === currentUserDisplayName || (username && k === username);
}

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeAllModels(a: {
  displayAssets: ReturnType<typeof computeDisplayAssets>;
}) {
  const { displayAssets } = a;
  const set = new Set<string>();
  displayAssets.forEach(a => {
    if (a.brand_model) set.add(a.brand_model);
    else if (a.name) set.add(a.name);
  });
  return Array.from(set);
}

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeModelPriceMap(a: {
  assets: AssetItem[];
}) {
  const { assets } = a;
  const map = new Map<string, number>();
  assets.forEach(a => {
    const p = getAssetPrice(a);
    const m = (a.brand_model || a.brandModel || a.name || '').trim();
    if (p > 0 && m && !map.has(m)) {
      map.set(m, p);
    }
  });
  return map;
}
