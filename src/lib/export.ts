import { compareDateKeys, isDateInRange } from './date';
import { formatCentsPlain, formatYuan, sumCents } from './money';
import type { DateRange, Transaction, TransactionType } from './types';

type CategoryTotal = {
  category: string;
  amountCents: number;
  count: number;
};

export function transactionsInRange(
  transactions: readonly Transaction[],
  range: DateRange
): Transaction[] {
  return transactions
    .filter((transaction) => isDateInRange(transaction.date, range))
    .sort((a, b) => {
      const byDate = compareDateKeys(a.date, b.date);
      return byDate !== 0 ? byDate : a.createdAt.localeCompare(b.createdAt);
    });
}

function categoryTotals(
  transactions: readonly Transaction[],
  type: TransactionType
): CategoryTotal[] {
  const totals = new Map<string, CategoryTotal>();
  for (const transaction of transactions) {
    if (transaction.type !== type) {
      continue;
    }
    const existing = totals.get(transaction.category);
    if (existing) {
      existing.amountCents += transaction.amountCents;
      existing.count += 1;
    } else {
      totals.set(transaction.category, {
        category: transaction.category,
        amountCents: transaction.amountCents,
        count: 1,
      });
    }
  }
  return [...totals.values()].sort(
    (a, b) => b.amountCents - a.amountCents || a.category.localeCompare(b.category)
  );
}

function escapeMarkdownCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();
}

function typeLabel(type: TransactionType): string {
  return type === 'expense' ? '支出' : '收入';
}

function appendCategoryTable(
  lines: string[],
  heading: string,
  totals: CategoryTotal[]
): void {
  lines.push(`## ${heading}`, '');
  if (totals.length === 0) {
    lines.push('无记录。', '');
    return;
  }
  lines.push('| 分类 | 金额 | 笔数 |', '| --- | ---: | ---: |');
  for (const total of totals) {
    lines.push(
      `| ${escapeMarkdownCell(total.category)} | ${formatYuan(
        total.amountCents
      )} | ${total.count} |`
    );
  }
  lines.push('');
}

export function buildMarkdown(
  transactions: readonly Transaction[],
  range: DateRange
): string {
  const sorted = transactionsInRange(transactions, range);
  const expenseCents = sumCents(sorted, 'expense');
  const incomeCents = sumCents(sorted, 'income');
  const lines: string[] = [];

  lines.push(`# 记账导出（${range.start} 至 ${range.end}）`, '');
  lines.push('金额单位：人民币元', '');
  lines.push('## 汇总', '');
  lines.push(`- 总支出：${formatYuan(expenseCents)}`);
  lines.push(`- 总收入：${formatYuan(incomeCents)}`);
  lines.push(`- 结余：${formatYuan(incomeCents - expenseCents)}`);
  lines.push(`- 共 ${sorted.length} 笔`, '');

  appendCategoryTable(
    lines,
    '支出分类小计',
    categoryTotals(sorted, 'expense')
  );
  appendCategoryTable(lines, '收入分类小计', categoryTotals(sorted, 'income'));

  lines.push('## 逐笔明细', '');
  if (sorted.length === 0) {
    lines.push('无记录。');
  } else {
    lines.push(
      '| 日期 | 类型 | 分类 | 金额 | 备注 |',
      '| --- | --- | --- | ---: | --- |'
    );
    for (const transaction of sorted) {
      lines.push(
        `| ${transaction.date} | ${typeLabel(transaction.type)} | ${escapeMarkdownCell(
          transaction.category
        )} | ${formatYuan(transaction.amountCents)} | ${escapeMarkdownCell(
          transaction.note
        )} |`
      );
    }
  }

  return `${lines.join('\n')}\n`;
}

function escapeCsv(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCsv(transactions: readonly Transaction[]): string {
  const sorted = [...transactions].sort((a, b) => {
    const byDate = compareDateKeys(a.date, b.date);
    return byDate !== 0 ? byDate : a.createdAt.localeCompare(b.createdAt);
  });

  const rows = [
    ['日期', '类型', '分类', '金额', '备注'],
    ...sorted.map((transaction) => [
      transaction.date,
      typeLabel(transaction.type),
      transaction.category,
      formatCentsPlain(transaction.amountCents),
      transaction.note,
    ]),
  ];

  return `\uFEFF${rows
    .map((row) => row.map(escapeCsv).join(','))
    .join('\r\n')}\r\n`;
}

export function exportFileName(
  range: DateRange,
  extension: 'md' | 'csv'
): string {
  return `记账_${range.start}_${range.end}.${extension}`;
}
