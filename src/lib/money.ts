import type { Transaction, TransactionType } from './types';

export function parseAmountToCents(rawValue: string): number | null {
  const value = rawValue.trim().replace(/,/g, '');
  if (!/^\d+(\.\d{0,2})?$/.test(value)) {
    return null;
  }
  const [yuanPart, fractionPart = ''] = value.split('.');
  const cents =
    Number(yuanPart) * 100 + Number(fractionPart.padEnd(2, '0').slice(0, 2));
  if (!Number.isSafeInteger(cents) || cents <= 0) {
    return null;
  }
  return cents;
}

export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function formatCents(cents: number): string {
  const negative = cents < 0;
  const absolute = Math.abs(cents);
  const yuan = Math.floor(absolute / 100);
  const fraction = absolute % 100;
  const grouped = String(yuan).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${negative ? '-' : ''}${grouped}.${String(fraction).padStart(2, '0')}`;
}

export function formatYuan(cents: number): string {
  return `${cents < 0 ? '-' : ''}¥${formatCents(Math.abs(cents))}`;
}

export function formatSignedYuan(cents: number, type: TransactionType): string {
  return `${type === 'expense' ? '-' : '+'}¥${formatCents(cents)}`;
}

export function formatCentsPlain(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function sumCents(
  transactions: readonly Transaction[],
  type: TransactionType
): number {
  return transactions.reduce(
    (total, transaction) =>
      transaction.type === type ? total + transaction.amountCents : total,
    0
  );
}
