// lib/assetId.js
// 服务端共享：资产编号生成规则。
// 从 server.js 原样搬出，逻辑零改动。

// Warehouse Code Mapping for ID Generation
const WAREHOUSE_CODES = {
  '1楼小仓库': '1FSM',
  '1楼办公室仓库': '1FOF',
  '4楼大仓库': '4FBG',
  '3楼中心机房': '3FCR'
};

/**
 * Generate a unique Asset ID based on rules
 * Format: [School]-[Date]-[Warehouse][Random4]
 * Example: NB-20260218-1FSM2j3b
 */
export function generateAssetID(schoolCode, dateStr, warehouseLocation) {
  let datePart;

  if (dateStr) {
    const parts = dateStr.match(/(\d+)/g);

    if (parts && parts.length >= 3) {
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      datePart = `${year}${month}${day}`;
    } else {
      const digits = dateStr.replace(/\D/g, '');
      if (digits.length === 8) {
        datePart = digits;
      } else {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        datePart = `${y}${m}${d}`;
      }
    }
  } else {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    datePart = `${y}${m}${d}`;
  }

  const whCode = WAREHOUSE_CODES[warehouseLocation] || warehouseLocation || 'UNK';

  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `${schoolCode}-${datePart}-${whCode}${randomPart}`;
}
