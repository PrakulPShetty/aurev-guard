export function shorten(addr, size = 8) {
  if (!addr) return "";
  return addr.slice(0, size) + "..." + addr.slice(-size);
}

export function jsonPretty(obj) {
  return JSON.stringify(obj, null, 2);
}
