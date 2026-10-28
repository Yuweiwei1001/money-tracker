import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { DateRangeSelector } from '@/src/components/DateRangeSelector';
import { EmptyState } from '@/src/components/EmptyState';
import { Screen } from '@/src/components/Screen';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { TransactionRow } from '@/src/components/TransactionRow';
import { useDateRange } from '@/src/hooks/useDateRange';
import { transactionsInRange } from '@/src/lib/export';
import { formatYuan, sumCents } from '@/src/lib/money';
import { useAppData } from '@/src/store/AppDataContext';
import { colors, radius } from '@/src/theme/colors';

export default function RecordsScreen() {
  const { transactions } = useAppData();
  const { preset, range, setPreset, setCustomRange } = useDateRange('thisMonth');

  const list = useMemo(
    () => [...transactionsInRange(transactions, range)].reverse(),
    [transactions, range]
  );
  const expenseCents = sumCents(list, 'expense');
  const incomeCents = sumCents(list, 'income');

  return (
    <Screen>
      <ScreenHeader title="明细" subtitle="按日期范围筛选" />
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <DateRangeSelector
              preset={preset}
              range={range}
              onPresetChange={setPreset}
              onRangeChange={setCustomRange}
            />
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>支出</Text>
                <Text style={[styles.summaryValue, styles.expense]}>
                  {formatYuan(expenseCents)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>收入</Text>
                <Text style={[styles.summaryValue, styles.income]}>
                  {formatYuan(incomeCents)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>笔数</Text>
                <Text style={styles.summaryValue}>{list.length}</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <TransactionRow
              transaction={item}
              onPress={() =>
                router.push({
                  pathname: '/transaction',
                  params: { id: item.id },
                })
              }
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <EmptyState
              title="这段时间没有记录"
              hint="换个日期范围，或者点首页的 + 记一笔"
            />
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 12,
  },
  summaryCard: {
    marginTop: 12,
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  expense: {
    color: colors.expense,
  },
  income: {
    color: colors.income,
  },
  itemCard: {
    marginBottom: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
