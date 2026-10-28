import { router } from 'expo-router';
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

import { Screen } from '@/src/components/Screen';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { centsToInput, parseAmountToCents } from '@/src/lib/money';
import { useAppData } from '@/src/store/AppDataContext';
import { colors, radius } from '@/src/theme/colors';

export default function BudgetScreen() {
  const { budgetCents, setBudget } = useAppData();
  const [value, setValue] = useState(
    budgetCents !== null ? centsToInput(budgetCents) : ''
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const cents = parseAmountToCents(value);
    if (cents === null) {
      Alert.alert('金额不正确', '请输入大于 0 的金额，最多两位小数。');
      return;
    }
    setSaving(true);
    try {
      await setBudget(cents);
      router.back();
    } catch {
      Alert.alert('保存失败', '预算没有保存成功，请再试一次。');
    } finally {
      setSaving(false);
    }
  }

  function handleClear() {
    Alert.alert('关闭预算？', '关闭后首页不再显示预算进度，已有的记账不受影响。', [
      { text: '取消', style: 'cancel' },
      {
        text: '关闭',
        style: 'destructive',
        onPress: () => {
          setSaving(true);
          setBudget(null)
            .then(() => router.back())
            .catch(() => Alert.alert('操作失败', '请再试一次。'))
            .finally(() => setSaving(false));
        },
      },
    ]);
  }

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader
        title="本月支出预算"
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
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>预算怎么用</Text>
            <Text style={styles.tipText}>
              只统计支出，不统计收入。超出预算不会拦住你记账，只会在第一次超过时提醒一次。
            </Text>
          </View>

          <Text style={styles.label}>每月预算金额</Text>
          <View style={styles.inputCard}>
            <Text style={styles.currency}>¥</Text>
            <TextInput
              accessibilityLabel="预算金额"
              value={value}
              onChangeText={setValue}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              maxLength={12}
              autoFocus
            />
          </View>
          <Text style={styles.hint}>例如 3000 或 3000.50</Text>

          <Pressable
            accessibilityRole="button"
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => [
              styles.saveButton,
              (pressed || saving) && styles.pressed,
            ]}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveText}>保存预算</Text>
            )}
          </Pressable>

          {budgetCents !== null ? (
            <Pressable
              accessibilityRole="button"
              onPress={handleClear}
              disabled={saving}
              style={styles.clearButton}
            >
              <Text style={styles.clearText}>关闭预算</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  tipCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 24,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 12,
    lineHeight: 19,
    color: colors.primaryDark,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  currency: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textSecondary,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    padding: 0,
    fontVariant: ['tabular-nums'],
  },
  hint: {
    marginTop: 8,
    marginLeft: 4,
    fontSize: 11,
    color: colors.textMuted,
  },
  saveButton: {
    marginTop: 28,
    backgroundColor: colors.primary,
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
  clearButton: {
    marginTop: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.expense,
  },
});
