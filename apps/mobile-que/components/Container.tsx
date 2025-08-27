import { StyleSheet, SafeAreaView } from 'react-native';
import type { PropsWithChildren } from 'react';

export const Container = ({ children }: PropsWithChildren) => {  
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
