import DateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { EmptyState } from '@/src/components/EmptyState';
import { Screen } from '@/src/components/Screen';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { getBudgetOverAmount, monthExpenseCents } from '@/src/lib/budget';
import {
  currentMonthKey,
  dateKeyFromDate,
  formatDateFullCN,
  isInMonth,
  parseDateKey,
  todayKey,
} from '@/src/lib/date';
import { formatCents, parseAmountToCents } from '@/src/lib/money';
import { categoriesFor } from '@/src/lib/types';
import type { TransactionType } from '@/src/lib/types';
import { useAppData } from '@/src/store/AppDataContext';
import { colors, radius } from '@/src/theme/colors';

export default function TransactionScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const {
    transactions,
    budgetCents,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useAppData();

  const editing = id
    ? transactions.find((transaction) => transaction.id === id)
    : undefined;
  const initialType = editing?.type ?? 'expense';
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState(
    editing ? (editing.amountCents / 100).toFixed(2) : ''
  );
  const [category, setCategory] = useState(
    editing?.category ?? categoriesFor(initialType)[0] ?? '其他'
  );
  const [date, setDate] = useState(editing?.date ?? todayKey());
  const [note, setNote] = useState(editing?.note ?? '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const categories = categoriesFor(type);

  function changeType(nextType: TransactionType) {
    if (nextType === type) {
      return;
    }
    setType(nextType);
    const nextCategories = categoriesFor(nextType);
    if (!nextCategories.includes(category)) {
      setCategory(nextCategories[0] ?? '其他');
    }
  }

  function handleDateChange(event: DateTimePickerEvent, selected?: Date) {
    setShowDatePicker(false);
    if (event.type === 'set' && selected) {
      setDate(dateKeyFromDate(selected));
    }
  }

  async function handleSave() {
    const cents = parseAmountToCents(amount);
    if (cents === null) {
      Alert.alert('金额不正确', '请输入大于 0 的金额，最多两位小数。');
      return;
    }

    const monthKey = currentMonthKey();
    const beforeCents = monthExpenseCents(transactions, monthKey);
    const oldMonthExpense =
      editing &&
      editing.type === 'expense' &&
      isInMonth(editing.date, monthKey)
        ? editing.amountCents
        : 0;
    const newMonthExpense =
      type === 'expense' && isInMonth(date, monthKey) ? cents : 0;
    const afterCents = beforeCents - oldMonthExpense + newMonthExpense;
    const overAmount = getBudgetOverAmount(
      budgetCents,
      beforeCents,
      afterCents
    );

    const input = {
      type,
      amountCents: cents,
      category,
      date,
      note: note.trim(),
    };

    setSaving(true);
    try {
      if (editing) {
        await updateTransaction(editing.id, input);
      } else {
        await addTransaction(input);
      }

      if (overAmount !== null) {
        Alert.alert(
          '已超出本月预算',
          `本月支出已超出预算 ¥${formatCents(overAmount)}，这笔已经保存。`,
          [{ text: '知道了', onPress: () => router.back() }]
        );
      } else {
        router.back();
      }
    } catch {
      Alert.alert('保存失败', '数据没有保存成功，请再试一次。');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!editing) {
      return;
    }
    Alert.alert('删除这笔记录？', '删除后无法恢复。', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          setSaving(true);
          deleteTransaction(editing.id)
            .then(() => router.back())
            .catch(() => Alert.alert('删除失败', '请再试一次。'))
            .finally(() => setSaving(false));
        },
      },
    ]);
  }

  if (id && !editing) {
    return (
      <Screen edges={['top', 'left', 'right', 'bottom']}>
        <ScreenHeader
          title="记录不存在"
          onBack={() => router.back()}
          closeIcon
        />
        <EmptyState title="找不到这笔记录" hint="它可能已经被删除。" />
      </Screen>
    );
  }

  const activeColor =
    type === 'expense' ? colors.expense : colors.primary;

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader
        title={editing ? '编辑记录' : '记一笔'}
        onBack={() => router.back()}
        closeIcon
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.typeSwitch}>
            {(['expense', 'income'] as const).map((option) => {
              const active = type === option;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  onPress={() => changeType(option)}
                  style={[
                    styles.typeOption,
                    active && {
                      backgroundColor:
                        option === 'expense' ? colors.expense : colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[styles.typeText, active && styles.typeTextActive]}
                  >
                    {option === 'expense' ? '支出' : '收入'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.amountCard}>
            <Text style={styles.currency}>¥</Text>
            <TextInput
              accessibilityLabel="金额"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              style={styles.amountInput}
              maxLength={12}
              autoFocus={!editing}
            />
          </View>
          <Text style={styles.helper}>最多两位小数</Text>

          <Text style={styles.sectionLabel}>分类</Text>
          <View style={styles.categoryGrid}>
            {categories.map((item) => {
              const active = category === item;
              return (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  onPress={() => setCategory(item)}
                  style={[
                    styles.categoryChip,
                    active && {
                      backgroundColor:
                        type === 'expense'
                          ? colors.expenseSoft
                          : colors.primarySoft,
                      borderColor:
                        type === 'expense'
                          ? colors.expenseSoft
                          : colors.primarySoft,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      active && { color: activeColor, fontWeight: '700' },
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => setShowDatePicker(true)}
            style={({ pressed }) => [styles.dateRow, pressed && styles.pressed]}
          >
            <Text style={styles.dateLabel}>日期</Text>
            <Text style={styles.dateValue}>{formatDateFullCN(date)}</Text>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={colors.textMuted}
            />
          </Pressable>

          <TextInput
            accessibilityLabel="备注"
            value={note}
            onChangeText={setNote}
            placeholder="备注（选填）"
            placeholderTextColor={colors.textMuted}
            style={styles.noteInput}
            multiline
            maxLength={200}
            textAlignVertical="top"
          />

          <Pressable
            accessibilityRole="button"
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => [
              styles.saveButton,
              { backgroundColor: activeColor },
              (pressed || saving) && styles.pressed,
            ]}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveText}>
                {editing ? '保存修改' : '保存'}
              </Text>
            )}
          </Pressable>

          {editing ? (
            <Pressable
              accessibilityRole="button"
              onPress={handleDelete}
              disabled={saving}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>删除这笔</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      {showDatePicker ? (
        <DateTimePicker
          value={parseDateKey(date)}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  typeSwitch: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: radius.md,
    backgroundColor: colors.cardMuted,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  typeTextActive: {
    color: colors.white,
  },
  amountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currency: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textSecondary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    padding: 0,
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  helper: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 11,
    color: colors.textMuted,
  },
  sectionLabel: {
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  dateRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 15,
  },
  dateLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginRight: 12,
  },
  dateValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  noteInput: {
    marginTop: 12,
    minHeight: 84,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    fontSize: 14,
    color: colors.text,
  },
  saveButton: {
    marginTop: 24,
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  pressed: {
    opacity: 0.8,
  },
  deleteButton: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.expense,
  },
});
