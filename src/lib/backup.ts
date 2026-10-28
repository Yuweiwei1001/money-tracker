import { dateKeyFromDate, isValidDateKey, pad2 } from './date';
import { isTransactionType } from './types';
import type { AppData, Transaction } from './types';

type BackupFile = {
  app: 'money-tracker';
  version: 1;
  exportedAt: string;
  transactions: Transaction[];
  budgetCents: number | null;
};

export function buildBackup(data: AppData, exportedAt = new Date()): string {
  const payload: BackupFile = {
    app: 'money-tracker',
    version: 1,
    exportedAt: exportedAt.toISOString(),
    transactions: data.transactions,
    budgetCents: data.budgetCents,
  };
  return JSON.stringify(payload, null, 2);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseTransaction(value: unknown): Transaction | null {
  if (!isRecord(value)) {
    return null;
  }
  const { id, type, amountCents, category, date, note, createdAt } = value;
  if (typeof id !== 'string' || id.length === 0) {
    return null;
  }
  if (!isTransactionType(type)) {
    return null;
  }
  if (!Number.isInteger(amountCents) || (amountCents as number) <= 0) {
    return null;
  }
  if (typeof category !== 'string' || category.trim().length === 0) {
    return null;
  }
  if (typeof date !== 'string' || !isValidDateKey(date)) {
    return null;
  }

  return {
    id,
    type,
    amountCents: amountCents as number,
    category: category.trim(),
    date,
    note: typeof note === 'string' ? note : '',
    createdAt:
      typeof createdAt === 'string' && createdAt.length > 0
        ? createdAt
        : new Date().toISOString(),
  };
}

export function parseAppData(value: unknown): AppData | null {
  if (!isRecord(value) || !Array.isArray(value.transactions)) {
    return null;
  }

  const transactions: Transaction[] = [];
  const seenIds = new Set<string>();
  for (const item of value.transactions) {
    const transaction = parseTransaction(item);
    if (!transaction || seenIds.has(transaction.id)) {
      return null;
    }
    seenIds.add(transaction.id);
    transactions.push(transaction);
  }

  let budgetCents: number | null = null;
  if (value.budgetCents !== null && value.budgetCents !== undefined) {
    if (
      !Number.isInteger(value.budgetCents) ||
      (value.budgetCents as number) <= 0
    ) {
      return null;
    }
    budgetCents = value.budgetCents as number;
  }

  return { transactions, budgetCents };
}

export function parseBackup(
  text: string
): { data: AppData; exportedAt: string | null } | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  if (!isRecord(parsed)) {
    return null;
  }
  if (parsed.app !== undefined && parsed.app !== 'money-tracker') {
    return null;
  }

  const data = parseAppData(parsed);
  if (!data) {
    return null;
  }

  return {
    data,
    exportedAt:
      typeof parsed.exportedAt === 'string' ? parsed.exportedAt : null,
  };
}

export function backupFileName(now = new Date()): string {
  const date = dateKeyFromDate(now);
  const time = `${pad2(now.getHours())}${pad2(now.getMinutes())}`;
  return `记账备份_${date}_${time}.json`;
}
