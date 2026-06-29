import { View, FlatList } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Screen, AppText, ListRow, IconButton } from '../../theme/components';

interface Props {
  items: { headword: string }[];
  onOpen: (headword: string) => void;
  onClear: () => void;
}

export function HistoryScreen({ items, onOpen, onClear }: Props) {
  return (
    <Screen>
      <View style={styles.bar}>
        <IconButton name="trash-2" accessibilityLabel="Clear history" onPress={onClear} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(it) => it.headword}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <AppText variant="muted">No history yet.</AppText>
          </View>
        }
        renderItem={({ item }) => (
          <ListRow onPress={() => onOpen(item.headword)}>
            <AppText variant="body">{item.headword}</AppText>
          </ListRow>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  bar: { alignSelf: 'flex-end', padding: theme.spacing(1.5) },
  emptyWrap: { alignItems: 'center', marginTop: theme.spacing(4) },
}));
