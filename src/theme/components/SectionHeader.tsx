import type { ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { AppText } from './AppText';

export function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <View style={styles.wrap}>
      <AppText variant="label">{children}</AppText>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrap: {
    paddingHorizontal: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(0.5),
  },
}));
