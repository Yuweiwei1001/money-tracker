import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DateRangeSelector } from '@/src/components/DateRangeSelector';
import { Screen } from '@/src/components/Screen';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { useDateRange } from '@/src/hooks/useDateRange';
import {
  buildCsv,
  buildMarkdown,
  exportFileName,
  transactionsInRange,
} from '@/src/lib/export';
import { shareTextFile } from '@/src/lib/fileShare';
import { formatYuan, sumCents } from '@/src/lib/money';
import { useAppData } from '@/src/store/AppDataContext';
import { colors, radius } from '@/src/theme/colors';

type ExportFormat = 'md' | 'csv';

export default function ExportScreen() {
  const { transactions } = useAppData();
  const { preset, range, setPreset, setCustomRange } = useDateRange('thisMonth');
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const [copied, setCopied] = useState(false);

  const list = transactionsInRange(transactions, range);
  const expenseCents = sumCents(list, 'expense');
  const incomeCents = sumCents(list, 'income');
  const disabled = list.length === 0 || busy !== null;

  async function handleExport(format: ExportFormat) {
    if (list.length === 0) {
      Alert.alert('没有可导出的记录', '这段时间没有记录。');
      return;
    }
    setBusy(format);
    try {
      const content =
        format === 'md' ? buildMarkdown(list, range) : buildCsv(list);
      await shareTextFile(
        exportFileName(range, format),
        content,
        format === 'md' ? 'text/plain' : 'text/csv',
        format === 'md' ? '导出给 AI 的文本' : '导出 Excel 表格'
      );
    } catch (error) {
      Alert.alert(
        '导出失败',
        error instanceof Error ? error.message : '没有生成文件，请再试一次。'
      );
    } finally {
      setBusy(null);
    }
  }

  async function handleCopy() {
    if (list.length === 0) {
      Alert.alert('没有可复制的内容', '这段时间没有记录。');
      return;
    }
    try {
      await Clipboard.setStringAsync(buildMarkdown(list, range));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      Alert.alert('复制失败', '请改用下面的导出方式。');
    }
  }

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="导出账目" onBack={() => router.back()} closeIcon />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DateRangeSelector
          preset={preset}
          range={range}
          onPresetChange={setPreset}
          onRangeChange={setCustomRange}
        />

        <View style={styles.summaryCard}>
          <Text style={styles.summaryCount}>{list.length} 笔</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryItem}>
              支出 <Text style={styles.expense}>{formatYuan(expenseCents)}</Text>
            </Text>
            <Text style={styles.summaryItem}>
              收入 <Text style={styles.income}>{formatYuan(incomeCents)}</Text>
            </Text>
          </View>
          {list.length === 0 ? (
            <Text style={styles.emptyHint}>这段时间没有记录，换一个日期范围试试。</Text>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={() => handleExport('md')}
          style={({ pressed }) => [
            styles.optionCard,
            disabled && styles.disabled,
            pressed && !disabled ? styles.pressed : null,
          ]}
        >
          <View style={styles.optionIcon}>
            <Ionicons
              name="document-text-outline"
              size={22}
              color={colors.primary}
            />
          </View>
          <View style={styles.optionMain}>
            <View style={styles.optionTitleRow}>
              <Text style={styles.optionTitle}>给 AI 的文本</Text>
              <Text style={styles.badge}>.md</Text>
            </View>
            <Text style={styles.optionHint}>
              含汇总和分类小计，可直接粘贴给 DeepSeek、通义、豆包
            </Text>
          </View>
          {busy === 'md' ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Ionicons
              name="share-outline"
              size={20}
              color={colors.textMuted}
            />
          )}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={() => handleExport('csv')}
          style={({ pressed }) => [
            styles.optionCard,
            disabled && styles.disabled,
            pressed && !disabled ? styles.pressed : null,
          ]}
        >
          <View style={styles.optionIcon}>
            <Ionicons name="grid-outline" size={22} color={colors.primary} />
          </View>
          <View style={styles.optionMain}>
            <View style={styles.optionTitleRow}>
              <Text style={styles.optionTitle}>Excel 表格</Text>
              <Text style={styles.badge}>.csv</Text>
            </View>
            <Text style={styles.optionHint}>
              一行一笔，可用 Excel 或 WPS 打开、直接求和
            </Text>
          </View>
          {busy === 'csv' ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Ionicons
              name="share-outline"
              size={20}
              color={colors.textMuted}
            />
          )}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={handleCopy}
          style={({ pressed }) => [
            styles.copyButton,
            disabled && styles.disabled,
            pressed && !disabled ? styles.pressed : null,
          ]}
        >
          <Ionicons
            name={copied ? 'checkmark-circle' : 'copy-outline'}
            size={18}
            color={colors.primary}
          />
          <Text style={styles.copyText}>
            {copied ? '已复制，去粘贴给 AI' : '复制文本给 AI'}
          </Text>
        </Pressable>

        <Text style={styles.note}>
          导出只生成文件，不会改动原记录。生成后会打开手机自带的分享面板，可以保存到文件、发微信或发给自己。
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  summaryCard: {
    marginTop: 14,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  summaryCount: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 6,
  },
  summaryItem: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  expense: {
    color: colors.expense,
    fontWeight: '600',
  },
  income: {
    color: colors.income,
    fontWeight: '600',
  },
  emptyHint: {
    marginTop: 10,
    fontSize: 11,
    color: colors.warning,
  },
  optionCard: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.8,
  },
  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  optionMain: {
    flex: 1,
    marginHorizontal: 12,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  optionHint: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  copyButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  copyText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  note: {
    marginTop: 18,
    marginHorizontal: 4,
    fontSize: 11,
    lineHeight: 17,
    color: colors.textMuted,
  },
});
