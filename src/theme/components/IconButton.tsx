import { Pressable } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUnistyles } from 'react-native-unistyles';

interface Props {
  name: string;
  family?: 'feather' | 'material';
  accessibilityLabel: string;
  onPress?: () => void;
  color?: string;
  size?: number;
}

export function IconButton({ name, family = 'feather', accessibilityLabel, onPress, color, size = 22 }: Props) {
  const { theme } = useUnistyles();
  const tint = color ?? theme.colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={10}
    >
      {family === 'material' ? (
        <MaterialCommunityIcons name={name as never} size={size} color={tint} />
      ) : (
        <Feather name={name as never} size={size} color={tint} />
      )}
    </Pressable>
  );
}
