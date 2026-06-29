import { ScrollView, Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { AppText } from '../../theme/components/AppText';
import { truncateLabel } from './truncateLabel';

interface Props {
  dictionaries: { dictId: number; name: string }[];
  selected: number[];
  onChange: (ids: number[]) => void;
}

export function DictionaryFilter({ dictionaries, selected, onChange }: Props) {
  if (dictionaries.length < 2) return null;
  const toggle = (id: number) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="すべて"
        onPress={() => onChange([])}
        style={[styles.chip, selected.length === 0 && styles.active]}
      >
        <AppText variant="body">すべて</AppText>
      </Pressable>
      {dictionaries.map((d) => (
        <Pressable
          key={d.dictId}
          accessibilityRole="button"
          accessibilityLabel={d.name}
          onPress={() => toggle(d.dictId)}
          style={[styles.chip, selected.includes(d.dictId) && styles.active]}
        >
          <AppText variant="body" numberOfLines={1}>{truncateLabel(d.name)}</AppText>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  scroll: { flexGrow: 0 },
  row: { gap: theme.spacing(1), paddingHorizontal: theme.spacing(2), paddingVertical: theme.spacing(1) },
  chip: {
    maxWidth: 120,
    paddingVertical: theme.spacing(0.75),
    paddingHorizontal: theme.spacing(1.5),
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  active: { borderColor: theme.colors.accent },
}));
