import type { PropsWithChildren } from 'react';

import { SafeAreaView, StyleSheet } from 'react-native';

export const Container = ({ children }: PropsWithChildren) => {
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
