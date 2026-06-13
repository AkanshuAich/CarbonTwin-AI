/**
 * Tiny nano-id alternative — generates a URL-safe unique ID
 * Avoids adding the `nanoid` package for a simple utility
 */
export function nanoid(size = 21): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let result = "";
  const array = new Uint8Array(size);
  crypto.getRandomValues(array);
  for (let i = 0; i < size; i++) {
    result += chars[array[i]! % chars.length];
  }
  return result;
}
