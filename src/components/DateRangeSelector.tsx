import DateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RangePreset } from '@/src/hooks/useDateRange';
import { dateKeyFromDate, formatDateFullCN, parseDateKey } from '@/src/lib/date';
import type { DateRange } from '@/src/lib/types';
import { colors, radius } from '@/src/theme/colors';

const PRESETS: { key: RangePreset; label: string }[] = [
  { key: 'thisMonth', label: '本月' },
  { key: 'lastMonth', label: '上月' },
  { key: 'custom', label: '自定义' },
];

type Props = {
  preset: RangePreset;
  range: DateRange;
  onPresetChange: (preset: RangePreset) => void;
  onRangeChange: (range: DateRange) => void;
};

export function DateRangeSelector({
  preset,
  range,
  onPresetChange,
  onRangeChange,
}: Props) {
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(null);

  function handlePickerChange(event: DateTimePickerEvent, selected?: Date) {
    const target = pickerTarget;
    setPickerTarget(null);
    if (event.type !== 'set' || !selected || !target) {
      return;
    }
    const key = dateKeyFromDate(selected);
    if (target === 'start') {
      onRangeChange({ start: key, end: key > range.end ? key : range.end });
    } else {
      onRangeChange({ start: key < range.start ? key : range.start, end: key });
    }
  }

  const pickerValue = parseDateKey(
    pickerTarget === 'end' ? range.end : range.start
  );

  return (
    <View>
      <View style={styles.chips}>
        {PRESETS.map((item) => {
          const active = preset === item.key;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              onPress={() => onPresetChange(item.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {preset === 'custom' ? (
        <View style={styles.customRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="选择开始日期"
            onPress={() => setPickerTarget('start')}
            style={styles.dateButton}
          >
            <Text style={styles.dateLabel}>开始</Text>
            <Text style={styles.dateValue}>{formatDateFullCN(range.start)}</Text>
          </Pressable>
          <Text style={styles.dash}>—</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="选择结束日期"
            onPress={() => setPickerTarget('end')}
            style={styles.dateButton}
          >
            <Text style={styles.dateLabel}>结束</Text>
            <Text style={styles.dateValue}>{formatDateFullCN(range.end)}</Text>
          </Pressable>
        </View>
      ) : null}

      {pickerTarget ? (
        <DateTimePicker
          value={pickerValue}
          mode="date"
          display="default"
          onChange={handlePickerChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radius.pill,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primarySoft,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.primary,
  },
  customRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  dash: {
    color: colors.textMuted,
  },
});
