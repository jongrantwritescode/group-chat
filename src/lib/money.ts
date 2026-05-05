import { dinero, toDecimal, add, subtract, multiply, allocate } from 'dinero.js';
import type { Dinero } from 'dinero.js';

// Currency definitions (inline — @dinero.js/currencies does not exist on npm)
const currencies: Record<string, { code: string; base: number; exponent: number }> = {
  USD: { code: 'USD', base: 10, exponent: 2 },
  EUR: { code: 'EUR', base: 10, exponent: 2 },
  GBP: { code: 'GBP', base: 10, exponent: 2 },
  JPY: { code: 'JPY', base: 10, exponent: 0 },
  CAD: { code: 'CAD', base: 10, exponent: 2 },
  AUD: { code: 'AUD', base: 10, exponent: 2 },
  MXN: { code: 'MXN', base: 10, exponent: 2 },
  BRL: { code: 'BRL', base: 10, exponent: 2 },
};

export function getCurrency(code: string) {
  const currency = currencies[code.toUpperCase()];
  if (!currency) return currencies.USD;
  return currency;
}

/** Create a Dinero object from an integer amount in minor units (cents) */
export function fromCents(amountCents: number, currencyCode: string): Dinero<number> {
  const currency = getCurrency(currencyCode);
  return dinero({ amount: amountCents, currency });
}

/** Format a Dinero object as a human-readable currency string */
export function formatMoney(d: Dinero<number>): string {
  return toDecimal(d, ({ value, currency }) => {
    const num = parseFloat(value);
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: currency.exponent,
        maximumFractionDigits: currency.exponent,
      }).format(num);
    } catch {
      return `${currency.code} ${num.toFixed(currency.exponent)}`;
    }
  });
}

/** Format cents directly to a currency string */
export function formatCents(amountCents: number, currencyCode: string): string {
  return formatMoney(fromCents(amountCents, currencyCode));
}

/**
 * Split an amount equally among n participants, distributing remainder to the first member.
 * Uses the trip's actual currency to compute the correct minor-unit exponent.
 */
export function splitEqually(totalCents: number, count: number, currencyCode: string): number[] {
  if (count === 0) return [];
  const currency = getCurrency(currencyCode);
  const total = dinero({ amount: totalCents, currency });
  const ratios = Array(count).fill(1) as number[];
  const shares = allocate(total, ratios);
  return shares.map((s) => {
    let cents = 0;
    toDecimal(s, ({ value }) => {
      cents = Math.round(parseFloat(value) * Math.pow(10, currency.exponent));
      return '';
    });
    return cents;
  });
}

/**
 * Split by percentage weights (must sum to 100).
 * Uses the trip's actual currency to compute the correct minor-unit exponent.
 */
export function splitByPercentage(
  totalCents: number,
  percentages: number[],
  currencyCode: string,
): number[] {
  const sum = percentages.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 100) > 0.01) throw new Error('Percentages must sum to 100');

  const currency = getCurrency(currencyCode);
  const total = dinero({ amount: totalCents, currency });
  // Convert percentages to integer ratios (multiply by 100 for precision)
  const ratios = percentages.map((p) => Math.round(p * 100));
  const shares = allocate(total, ratios);
  return shares.map((s) => {
    let cents = 0;
    toDecimal(s, ({ value }) => {
      cents = Math.round(parseFloat(value) * Math.pow(10, currency.exponent));
      return '';
    });
    return cents;
  });
}

export { dinero, add, subtract, multiply };
