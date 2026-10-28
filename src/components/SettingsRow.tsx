import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/src/theme/colors';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  icon: IconName;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  busy?: boolean;
  showDivider?: boolean;
  danger?: boolean;
};

export function SettingsRow({
  icon,
  title,
  subtitle,
  value,
  onPress,
  busy = false,
  showDivider = false,
  danger = false,
}: Props) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress || busy}
      style={({ pressed }) => [
        styles.row,
        showDivider && styles.divider,
        pressed && onPress ? styles.pressed : null,
      ]}
    >
      <View style={[styles.iconBox, danger && styles.iconBoxDanger]}>
        <Ionicons
          name={icon}
          size={18}
          color={danger ? colors.expense : colors.primary}
        />
      </View>
      <View style={styles.main}>
        <Text style={[styles.title, danger && styles.titleDanger]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {busy ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <>
          {value ? <Text style={styles.value}>{value}</Text> : null}
          {onPress ? (
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
            />
          ) : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: colors.card,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.cardMuted,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  iconBoxDanger: {
    backgroundColor: colors.expenseSoft,
  },
  main: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  titleDanger: {
    color: colors.expense,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textSecondary,
  },
  value: {
    marginRight: 4,
    fontSize: 13,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
});
