import { View, Switch } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { AppText, IconButton, Divider } from '../../theme/components';
import type { DictionaryRow as Row } from '../../db/dictionaries/repository';

interface Props {
  dictionary: Row;
  onToggle: (id: number, enabled: boolean) => void;
  onDelete: (id: number) => void;
  onRename: (id: number) => void;
}

export function DictionaryRow({ dictionary, onToggle, onDelete, onRename }: Props) {
  const { theme } = useUnistyles();
  return (
    <>
      <View style={styles.row}>
        <View style={styles.info}>
          <AppText variant="headword">{dictionary.name}</AppText>
          <AppText variant="muted">{dictionary.wordCount} words</AppText>
        </View>
        <IconButton
          name="edit-2"
          accessibilityLabel={`Rename ${dictionary.name}`}
          color={theme.colors.textMuted}
          size={18}
          onPress={() => onRename(dictionary.dictId)}
        />
        <Switch
          value={dictionary.enabled}
          onValueChange={(v) => onToggle(dictionary.dictId, v)}
          trackColor={{ true: theme.colors.accent, false: theme.colors.border }}
        />
        <IconButton
          name="trash-2"
          accessibilityLabel={`Delete ${dictionary.name}`}
          color={theme.colors.danger}
          onPress={() => onDelete(dictionary.dictId)}
        />
      </View>
      <Divider />
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing(1.5),
    paddingHorizontal: theme.spacing(2),
    gap: theme.spacing(1.5),
  },
  info: { flex: 1 },
}));
