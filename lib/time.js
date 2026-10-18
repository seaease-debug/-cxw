// lib/time.js
// 服务端共享：北京时间（UTC+8）格式化工具。
// 从 server.js 原样搬出，逻辑零改动。

export function getBeijingTimeString(date = new Date()) {
  const bjTime = new Date(date.getTime() + (8 * 3600 * 1000));
  const year = bjTime.getUTCFullYear();
  const month = String(bjTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(bjTime.getUTCDate()).padStart(2, '0');
  const hour = String(bjTime.getUTCHours()).padStart(2, '0');
  const minute = String(bjTime.getUTCMinutes()).padStart(2, '0');
  const second = String(bjTime.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export function getBeijingDateString(date = new Date()) {
  const bjTime = new Date(date.getTime() + (8 * 3600 * 1000));
  const year = bjTime.getUTCFullYear();
  const month = String(bjTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(bjTime.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getBeijingDateStr8(date = new Date()) {
  return getBeijingDateString(date).replace(/-/g, '');
}
