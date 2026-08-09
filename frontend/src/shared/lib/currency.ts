export const CURRENCY_CODES = ['USD', 'EUR', 'UAH'] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  UAH: '₴',
};

// All prices are stored/entered in USD. These are fixed approximate rates for
// display conversion only — not live exchange rates.
const RATES_FROM_USD: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  UAH: 41.5,
};

export function convertFromUsd(amountUsd: number, currency: CurrencyCode): number {
  return amountUsd * RATES_FROM_USD[currency];
}

export function formatPrice(amountUsd: number, currency: CurrencyCode): string {
  const converted = convertFromUsd(amountUsd, currency);
  return `${CURRENCY_SYMBOLS[currency]}${converted.toFixed(2)}`;
}
