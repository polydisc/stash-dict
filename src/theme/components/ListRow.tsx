import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import * as Haptics from 'expo-haptics';
import { Divider } from './Divider';

interface Props {
  onPress?: () => void;
  showDivider?: boolean;
  children: ReactNode;
}

export function ListRow({ onPress, showDivider = true, children }: Props) {
  const handlePress = () => {
    if (!onPress) return;
    void Haptics.selectionAsync();
    onPress();
  };
  return (
    <>
      <Pressable
        onPress={onPress ? handlePress : undefined}
        style={({ pressed }) => [styles.row, pressed && onPress ? styles.pressed : null]}
      >
        {children}
      </Pressable>
      {showDivider ? <Divider /> : null}
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: { paddingVertical: theme.spacing(1.25), paddingHorizontal: theme.spacing(2) },
  pressed: { backgroundColor: theme.colors.surface },
}));
