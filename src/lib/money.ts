export function formatNaira(kobo: number, opts: { decimals?: 0 | 2 } = {}): string {
  if (!Number.isSafeInteger(kobo)) throw new TypeError('Money must be an integer number of kobo')
  const decimals = opts.decimals ?? 0
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(kobo / 100)
}
