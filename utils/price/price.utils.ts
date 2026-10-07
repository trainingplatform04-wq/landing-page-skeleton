/**
 * A price in euros for `locale`: `45,00 €` / `€45.00`. Spaces are plain (ICU emits a
 * no-break space that differs between Node and browsers: hydration-safe output).
 */
export function formatPrice(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' })
    .format(amount)
    .replace(/\p{Zs}/gu, ' ')
}
