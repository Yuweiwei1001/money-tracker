import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDateCN } from '@/src/lib/date';
import { formatSignedYuan } from '@/src/lib/money';
import type { Transaction } from '@/src/lib/types';
import { colors, radius } from '@/src/theme/colors';

type Props = {
  transaction: Transaction;
  onPress?: () => void;
  showDivider?: boolean;
};

export function TransactionRow({
  transaction,
  onPress,
  showDivider = false,
}: Props) {
  const isExpense = transaction.type === 'expense';

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        showDivider && styles.divider,
        pressed && onPress ? styles.pressed : null,
      ]}
    >
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: isExpense ? colors.expenseSoft : colors.incomeSoft,
          },
        ]}
      >
        <Text
          style={[
            styles.avatarText,
            { color: isExpense ? colors.expense : colors.income },
          ]}
        >
          {transaction.category.slice(0, 1)}
        </Text>
      </View>

      <View style={styles.main}>
        <Text style={styles.category}>{transaction.category}</Text>
        {transaction.note ? (
          <Text numberOfLines={1} style={styles.note}>
            {transaction.note}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>
        <Text
          style={[
            styles.amount,
            { color: isExpense ? colors.expense : colors.income },
          ]}
        >
          {formatSignedYuan(transaction.amountCents, transaction.type)}
        </Text>
        <Text style={styles.date}>{formatDateCN(transaction.date)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.card,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.cardMuted,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  main: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  category: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  note: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  date: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textMuted,
  },
});
