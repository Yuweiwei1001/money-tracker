import { isInMonth } from './date';
import type { Transaction } from './types';

export function monthExpenseCents(
  transactions: readonly Transaction[],
  monthKey: string,
  excludeId?: string
): number {
  let total = 0;
  for (const transaction of transactions) {
    if (
      transaction.type !== 'expense' ||
      transaction.id === excludeId ||
      !isInMonth(transaction.date, monthKey)
    ) {
      continue;
    }
    total += transaction.amountCents;
  }
  return total;
}

export function getBudgetOverAmount(
  budgetCents: number | null,
  beforeCents: number,
  afterCents: number
): number | null {
  if (budgetCents === null) {
    return null;
  }
  if (beforeCents <= budgetCents && afterCents > budgetCents) {
    return afterCents - budgetCents;
  }
  return null;
}
