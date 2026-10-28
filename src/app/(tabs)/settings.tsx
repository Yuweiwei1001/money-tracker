import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/src/components/Screen';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { SettingsRow } from '@/src/components/SettingsRow';
import { backupFileName, buildBackup, parseBackup } from '@/src/lib/backup';
import { formatDateTimeCN } from '@/src/lib/date';
import { shareTextFile } from '@/src/lib/fileShare';
import { formatYuan } from '@/src/lib/money';
import type { AppData } from '@/src/lib/types';
import { useAppData } from '@/src/store/AppDataContext';
import { colors, radius } from '@/src/theme/colors';

type BusyState = 'backup' | 'restore' | null;

export default function SettingsScreen() {
  const { transactions, budgetCents, replaceData } = useAppData();
  const [busy, setBusy] = useState<BusyState>(null);

  const version = Constants.expoConfig?.version ?? '1.0.0';

  async function handleBackup() {
    if (busy) {
      return;
    }
    setBusy('backup');
    try {
      const content = buildBackup({ transactions, budgetCents });
      await shareTextFile(
        backupFileName(),
        content,
        'application/json',
        '保存记账备份'
      );
    } catch (error) {
      Alert.alert(
        '备份失败',
        error instanceof Error ? error.message : '没有生成备份文件，请再试一次。'
      );
    } finally {
      setBusy(null);
    }
  }

  function doRestore(data: AppData) {
    setBusy('restore');
    replaceData(data)
      .then(() => {
        Alert.alert('恢复完成', `已恢复 ${data.transactions.length} 笔记录。`);
      })
      .catch(() => {
        Alert.alert('恢复失败', '数据没有写入，请再试一次。');
      })
      .finally(() => {
        setBusy(null);
      });
  }

  async function handleRestore() {
    if (busy) {
      return;
    }
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      if (result.canceled) {
        return;
      }
      const asset = result.assets[0];
      if (!asset) {
        return;
      }

      setBusy('restore');
      const text = await new File(asset.uri).text();
      const parsed = parseBackup(text);
      setBusy(null);

      if (!parsed) {
        Alert.alert(
          '无法读取备份',
          '这个文件不是本 App 生成的备份，或者内容已经损坏。'
        );
        return;
      }

      const backupTime = parsed.exportedAt
        ? formatDateTimeCN(parsed.exportedAt)
        : '未知时间';

      Alert.alert(
        '确认恢复？',
        `备份时间：${backupTime}\n共 ${parsed.data.transactions.length} 笔记录\n\n恢复会覆盖当前全部数据，且不可撤销。`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '覆盖并恢复',
            style: 'destructive',
            onPress: () => doRestore(parsed.data),
          },
        ]
      );
    } catch {
      setBusy(null);
      Alert.alert('恢复失败', '没有读取到备份文件，请再试一次。');
    }
  }

  return (
    <Screen>
      <ScreenHeader title="设置" subtitle="数据只存在本机" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.groupLabel}>预算</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="wallet-outline"
            title="本月支出预算"
            subtitle="只统计支出，超出时提醒一次"
            value={budgetCents !== null ? formatYuan(budgetCents) : '未设置'}
            onPress={() => router.push('/budget')}
          />
        </View>

        <Text style={styles.groupLabel}>数据</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="download-outline"
            title="导出账目"
            subtitle="按日期导出给 AI 或 Excel"
            onPress={() => router.push('/export')}
            showDivider
          />
          <SettingsRow
            icon="save-outline"
            title="备份全部数据"
            subtitle="含全部记录和预算设置"
            onPress={handleBackup}
            busy={busy === 'backup'}
            showDivider
          />
          <SettingsRow
            icon="refresh-outline"
            title="从备份恢复"
            subtitle="选择备份文件，覆盖当前数据"
            onPress={handleRestore}
            busy={busy === 'restore'}
          />
        </View>

        <Text style={styles.groupLabel}>关于</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="phone-portrait-outline"
            title="数据存放"
            subtitle="只保存在这台手机上，不联网"
            showDivider
          />
          <SettingsRow
            icon="receipt-outline"
            title="记录数量"
            value={`${transactions.length} 笔`}
            showDivider
          />
          <SettingsRow
            icon="information-circle-outline"
            title="版本"
            value={version}
          />
        </View>

        <Text style={styles.warning}>
          卸载 App 前请先备份，否则本机数据会一起被删除。
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
  groupLabel: {
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 14,
  },
  warning: {
    marginTop: 4,
    marginHorizontal: 8,
    fontSize: 11,
    lineHeight: 17,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
