import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface Props extends ViewProps {
  children: ReactNode;
}

export function Screen({ children, style, ...rest }: Props) {
  return (
    <View style={[styles.screen, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background },
}));
