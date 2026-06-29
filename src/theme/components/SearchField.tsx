import { View, TextInput } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Feather } from '@expo/vector-icons';
import { IconButton } from './IconButton';

interface Props {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
}

export function SearchField({ value, onChangeText, placeholder = 'Search' }: Props) {
  const { theme } = useUnistyles();
  return (
    <View style={styles.wrap}>
      <Feather name="search" size={18} color={theme.colors.textMuted} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        autoCorrect={false}
        autoCapitalize="none"
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 ? (
        <IconButton
          name="x"
          accessibilityLabel="Clear search"
          onPress={() => onChangeText('')}
          color={theme.colors.textMuted}
          size={18}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1),
    margin: theme.spacing(2),
    paddingHorizontal: theme.spacing(1.5),
    paddingVertical: theme.spacing(1),
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    padding: 0,
  },
}));
