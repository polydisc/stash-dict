import { Pressable, View, FlatList } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Screen, AppText, IconButton, Divider } from '../../theme/components';

interface Props {
  items: { headword: string }[];
  onOpen: (headword: string) => void;
  onRemove: (headword: string) => void;
}

export function FavoritesScreen({ items, onOpen, onRemove }: Props) {
  const { theme } = useUnistyles();
  return (
    <Screen>
      <FlatList
        data={items}
        keyExtractor={(it) => it.headword}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <AppText variant="muted">No favorites yet.</AppText>
          </View>
        }
        renderItem={({ item }) => (
          <>
            <View style={styles.row}>
              <Pressable style={styles.wordWrap} onPress={() => onOpen(item.headword)}>
                <AppText variant="body">{item.headword}</AppText>
              </Pressable>
              <IconButton
                name="star"
                family="material"
                accessibilityLabel={`Remove ${item.headword}`}
                color={theme.colors.accent}
                onPress={() => onRemove(item.headword)}
              />
            </View>
            <Divider />
          </>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: { flexDirection: 'row', alignItems: 'center', paddingRight: theme.spacing(1) },
  wordWrap: { flex: 1, paddingVertical: theme.spacing(1.5), paddingHorizontal: theme.spacing(2) },
  emptyWrap: { alignItems: 'center', marginTop: theme.spacing(4) },
}));
