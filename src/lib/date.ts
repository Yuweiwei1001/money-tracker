import type { DateRange } from './types';

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function dateKeyFromDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function todayKey(): string {
  return dateKeyFromDate(new Date());
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function isValidDateKey(key: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    return false;
  }
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function monthKeyOf(dateKey: string): string {
  return dateKey.slice(0, 7);
}

export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
}

export function isInMonth(dateKey: string, monthKey: string): boolean {
  return dateKey.startsWith(`${monthKey}-`);
}

export function currentMonthRange(): DateRange {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  return {
    start: `${year}-${pad2(month + 1)}-01`,
    end: dateKeyFromDate(new Date(year, month + 1, 0)),
  };
}

export function lastMonthRange(): DateRange {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  return {
    start: dateKeyFromDate(new Date(year, month - 1, 1)),
    end: dateKeyFromDate(new Date(year, month, 0)),
  };
}

export function isDateInRange(dateKey: string, range: DateRange): boolean {
  return dateKey >= range.start && dateKey <= range.end;
}

export function compareDateKeys(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function formatMonthCN(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  return `${year}年${Number(month)}月`;
}

export function formatDateCN(dateKey: string): string {
  const date = parseDateKey(dateKey);
  const now = new Date();
  const yearPrefix =
    date.getFullYear() === now.getFullYear() ? '' : `${date.getFullYear()}年`;
  return `${yearPrefix}${date.getMonth() + 1}月${date.getDate()}日 ${WEEKDAYS[date.getDay()]}`;
}

export function formatDateFullCN(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

export function formatRangeCN(range: DateRange): string {
  return `${formatDateFullCN(range.start)} 至 ${formatDateFullCN(range.end)}`;
}

export function formatDateTimeCN(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '未知时间';
  }
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${pad2(
    date.getHours()
  )}:${pad2(date.getMinutes())}`;
}
