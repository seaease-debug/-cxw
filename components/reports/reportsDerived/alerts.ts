// 由 .eng-audit/b1-4/gen-split-derived.mjs 生成 —— 勿手改。
import { CHART_SEMANTIC } from '../chartPalette';
import type { AlertFilter, AssetItem } from '../types';

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeAlertAnalysis(a: {
  displayAssets: AssetItem[];
}) {
  const { displayAssets } = a;
  const today = new Date();
  let warrantyExpiredCount = 0;
  let warrantyExpiringSoonCount = 0;
  let usefulLifeExpiredCount = 0;
  let usefulLifeExpiringSoonCount = 0;

  const warrantyExpiredList: AssetItem[] = [];
  const warrantyExpiringSoonList: AssetItem[] = [];
  const usefulLifeExpiredList: AssetItem[] = [];
  const usefulLifeExpiringSoonList: AssetItem[] = [];

  displayAssets.forEach(asset => {
    if (asset.warranty_expire) {
      const expDate = new Date(asset.warranty_expire);
      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        warrantyExpiredCount++;
        warrantyExpiredList.push(asset);
      } else if (diffDays <= 90) {
        warrantyExpiringSoonCount++;
        warrantyExpiringSoonList.push(asset);
      }
    }

    const pDate = asset.purchase_date ? new Date(asset.purchase_date) : today;
    const yearsInService = (today.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const limitYears = asset.useful_life_years || 5;

    if (yearsInService >= limitYears) {
      usefulLifeExpiredCount++;
      usefulLifeExpiredList.push(asset);
    } else if (limitYears - yearsInService <= 1) {
      usefulLifeExpiringSoonCount++;
      usefulLifeExpiringSoonList.push(asset);
    }
  });

  const pieData = [
    { name: '正常质保期内', value: Math.max(0, displayAssets.length - warrantyExpiredCount - warrantyExpiringSoonCount), color: CHART_SEMANTIC.inService },
    { name: '临近过保 (≤90天)', value: warrantyExpiringSoonCount, color: CHART_SEMANTIC.expiring },
    { name: '已超过质保期', value: warrantyExpiredCount, color: CHART_SEMANTIC.scrapped },
  ];

  return {
    warrantyExpiredCount,
    warrantyExpiringSoonCount,
    usefulLifeExpiredCount,
    usefulLifeExpiringSoonCount,
    warrantyExpiredList,
    warrantyExpiringSoonList,
    usefulLifeExpiredList,
    usefulLifeExpiringSoonList,
    pieData
  };
}

/** （B1-4a：由 useReportsData 的对应记忆化块原样外提，逻辑未改） */
export function computeFilteredAlertAssets(a: {
  alertAnalysis: ReturnType<typeof computeAlertAnalysis>;
  alertFilter: AlertFilter;
}) {
  const { alertAnalysis, alertFilter } = a;
  if (alertFilter === 'warranty_expired') return alertAnalysis.warrantyExpiredList;
  if (alertFilter === 'warranty_expiring') return alertAnalysis.warrantyExpiringSoonList;
  if (alertFilter === 'useful_expired') return alertAnalysis.usefulLifeExpiredList;
  if (alertFilter === 'useful_expiring') return alertAnalysis.usefulLifeExpiringSoonList;

  const map = new Map<number | string, AssetItem>();
  [...alertAnalysis.warrantyExpiredList, ...alertAnalysis.warrantyExpiringSoonList, ...alertAnalysis.usefulLifeExpiredList].forEach(item => {
    map.set(item.id, item);
  });
  return Array.from(map.values());
}
