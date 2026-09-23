/**
 * Masks an address for logging.
 *
 * Recipients are personal data. The domain and first character are enough to
 * trace a delivery problem; the full local part is not needed and should not
 * sit in an aggregated log indefinitely.
 *
 *   ada.lovelace@example.com -> a***@example.com
 */
export function maskAddress(address: string): string {
  const at = address.lastIndexOf('@');
  if (at <= 0) return '***';
  const local = address.slice(0, at);
  const domain = address.slice(at);
  return `${local[0]}***${domain}`;
}
