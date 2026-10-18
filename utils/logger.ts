const isDev = typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV;

export function logError(...args: unknown[]): void {
  if (isDev) console.error(...args);
}
