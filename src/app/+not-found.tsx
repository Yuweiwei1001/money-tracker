import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/src/theme/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Text style={styles.title}>页面不存在</Text>
        <Text style={styles.hint}>这个地址没有对应的页面。</Text>
        <Link href="/" style={styles.link}>
          回首页
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  hint: {
    marginTop: 8,
    fontSize: 13,
    color: colors.textSecondary,
  },
  link: {
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
    overflow: 'hidden',
  },
});
