export type TransactionType = 'expense' | 'income';

export type Transaction = {
  id: string;
  type: TransactionType;
  amountCents: number;
  category: string;
  date: string;
  note: string;
  createdAt: string;
};

export type TransactionInput = Omit<Transaction, 'id' | 'createdAt'>;

export type AppData = {
  transactions: Transaction[];
  budgetCents: number | null;
};

export type DateRange = {
  start: string;
  end: string;
};

export const EXPENSE_CATEGORIES = [
  '餐饮',
  '交通',
  '购物',
  '居住',
  '娱乐',
  '医疗',
  '学习',
  '人情',
  '其他',
] as const;

export const INCOME_CATEGORIES = ['工资', '奖金', '理财', '其他'] as const;

export const EMPTY_DATA: AppData = {
  transactions: [],
  budgetCents: null,
};

export function categoriesFor(type: TransactionType): readonly string[] {
  return type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
}

export function isTransactionType(value: unknown): value is TransactionType {
  return value === 'expense' || value === 'income';
}
