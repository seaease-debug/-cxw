// lib/rate-limit.js
// 服务端共享：极简内存限流器（供登录等敏感端点做暴力破解防护，OWASP A07）。
//
// 设计边界（务必知悉）：
//  - 计数存进程内存，按进程独立；服务重启即清零。
//  - 仅适用于「单进程部署」。若将来改为多实例/负载均衡，必须换成
//    express-rate-limit + 共享存储（如 Redis），否则各实例各算各的，防护失效。
//  - 不引入第三方依赖，是为了避免新增依赖带来的安装与构建链路风险。

const DEFAULT_SWEEP_INTERVAL_MS = 10 * 60 * 1000;

export function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 60000;
  const max = options.max || 5;
  const message = options.message || '请求过于频繁，请稍后再试';
  const sweepIntervalMs = options.sweepIntervalMs === undefined
    ? DEFAULT_SWEEP_INTERVAL_MS
    : options.sweepIntervalMs;
  const hits = new Map();
  let lastSweep = Date.now();

  // 惰性清理：避免长期运行后 Map 无限增长（CWE-770）
  function sweep(now) {
    if (now - lastSweep < sweepIntervalMs) return;
    lastSweep = now;
    for (const [k, r] of hits) {
      if (now - r.startTime > windowMs) hits.delete(k);
    }
  }

  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    sweep(now);
    let record = hits.get(ip);
    if (!record || now - record.startTime > windowMs) {
      record = { count: 1, startTime: now };
      hits.set(ip, record);
      return next();
    }

    record.count += 1;
    if (record.count > max) {
      const retryAfter = Math.max(1, Math.ceil((record.startTime + windowMs - now) / 1000));
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ message });
    }
    next();
  };
}
