import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/src/components/EmptyState';
import { Fab } from '@/src/components/Fab';
import { Screen } from '@/src/components/Screen';
import { TransactionRow } from '@/src/components/TransactionRow';
import {
  currentMonthKey,
  formatDateCN,
  formatMonthCN,
  isInMonth,
  todayKey,
} from '@/src/lib/date';
import { formatYuan, sumCents } from '@/src/lib/money';
import { useAppData } from '@/src/store/AppDataContext';
import { colors, radius } from '@/src/theme/colors';

export default function HomeScreen() {
  const { transactions, budgetCents } = useAppData();

  const monthKey = currentMonthKey();
  const monthLabel = formatMonthCN(monthKey);
  const monthTransactions = useMemo(
    () => transactions.filter((transaction) => isInMonth(transaction.date, monthKey)),
    [transactions, monthKey]
  );
  const expenseCents = sumCents(monthTransactions, 'expense');
  const incomeCents = sumCents(monthTransactions, 'income');
  const balanceCents = incomeCents - expenseCents;

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort(
          (a, b) =>
            b.date.localeCompare(a.date) ||
            b.createdAt.localeCompare(a.createdAt)
        )
        .slice(0, 10),
    [transactions]
  );

  const hasBudget = budgetCents !== null;
  const isOverBudget = hasBudget && expenseCents > budgetCents;
  const ratio = hasBudget
    ? Math.min(expenseCents / budgetCents, 1)
    : 0;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <View>
            <Text style={styles.brand}>记账</Text>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
          </View>
          <View style={styles.todayPill}>
            <Text style={styles.todayText}>{formatDateCN(todayKey())}</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>本月结余</Text>
          <Text style={styles.heroBalance}>{formatYuan(balanceCents)}</Text>
          <View style={styles.heroDivider} />
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>支出</Text>
              <Text style={styles.heroStatValue}>{formatYuan(expenseCents)}</Text>
            </View>
            <View style={[styles.heroStat, styles.heroStatRight]}>
              <Text style={styles.heroStatLabel}>收入</Text>
              <Text style={styles.heroStatValue}>{formatYuan(incomeCents)}</Text>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/budget')}
          style={({ pressed }) => [styles.budgetCard, pressed && styles.pressed]}
        >
          <View style={styles.budgetTop}>
            <View>
              <Text style={styles.cardTitle}>本月预算</Text>
              <Text style={styles.budgetHint}>
                {hasBudget
                  ? '每月支出上限'
                  : '设置一个支出上限，超了提醒你'}
              </Text>
            </View>
            {hasBudget ? (
              <Text style={styles.budgetAmount}>{formatYuan(budgetCents)}</Text>
            ) : (
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            )}
          </View>

          {hasBudget ? (
            <>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      flex: ratio,
                      backgroundColor: isOverBudget
                        ? colors.expense
                        : colors.primary,
                    },
                  ]}
                />
                <View style={{ flex: 1 - ratio }} />
              </View>
              <View style={styles.budgetBottom}>
                <Text style={styles.budgetSpent}>
                  已花 {formatYuan(expenseCents)}
                </Text>
                <Text
                  style={[
                    styles.budgetStatus,
                    isOverBudget && styles.budgetOver,
                  ]}
                >
                  {isOverBudget
                    ? `已超支 ${formatYuan(expenseCents - budgetCents)}`
                    : `剩余 ${formatYuan(budgetCents - expenseCents)}`}
                </Text>
              </View>
            </>
          ) : null}
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>最近记录</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/records')}
          >
            <Text style={styles.sectionLink}>查看全部</Text>
          </Pressable>
        </View>

        <View style={styles.listCard}>
          {recentTransactions.length === 0 ? (
            <EmptyState title="还没有记录" hint="点右下角 + 记第一笔" />
          ) : (
            recentTransactions.map((transaction, index) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                showDivider={index < recentTransactions.length - 1}
                onPress={() =>
                  router.push({
                    pathname: '/transaction',
                    params: { id: transaction.id },
                  })
                }
              />
            ))
          )}
        </View>

        <Text style={styles.footerNote}>
          数据只保存在这台手机上，记得定期备份
        </Text>
      </ScrollView>

      <Fab onPress={() => router.push('/transaction')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 110,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  brand: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    color: colors.textSecondary,
  },
  monthLabel: {
    marginTop: 4,
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  todayPill: {
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  todayText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  hero: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 14,
  },
  heroLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.68)',
  },
  heroBalance: {
    marginTop: 6,
    fontSize: 34,
    fontWeight: '800',
    color: colors.white,
    fontVariant: ['tabular-nums'],
  },
  heroDivider: {
    height: 1,
    marginVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroStats: {
    flexDirection: 'row',
  },
  heroStat: {
    flex: 1,
  },
  heroStatRight: {
    alignItems: 'flex-end',
  },
  heroStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.58)',
    marginBottom: 3,
  },
  heroStatValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
    fontVariant: ['tabular-nums'],
  },
  budgetCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 22,
  },
  pressed: {
    opacity: 0.8,
  },
  budgetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  budgetHint: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textSecondary,
  },
  budgetAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginTop: 14,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  budgetSpent: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  budgetStatus: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  budgetOver: {
    color: colors.expense,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  listCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  footerNote: {
    marginTop: 16,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
