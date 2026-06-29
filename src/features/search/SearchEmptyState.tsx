import { ScrollView, View, Pressable, Image } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { AppText, SectionHeader, ListRow } from '../../theme/components';

const APP_ICON = require('../../../assets/icon.png');

interface Props {
  favorites: string[];
  recent: string[];
  onOpenWord: (headword: string) => void;
}

function BrandHeader() {
  return (
    <View style={styles.brand}>
      <Image source={APP_ICON} style={styles.icon} accessibilityIgnoresInvertColors />
      <AppText variant="display" style={styles.wordmark}>StashDict</AppText>
    </View>
  );
}

export function SearchEmptyState({ favorites, recent, onOpenWord }: Props) {
  if (favorites.length === 0 && recent.length === 0) {
    return (
      <View style={styles.empty}>
        <BrandHeader />
        <AppText variant="muted">言葉を検索してみましょう。</AppText>
      </View>
    );
  }
  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <BrandHeader />
      {favorites.length > 0 ? (
        <>
          <SectionHeader>お気に入り</SectionHeader>
          <View style={styles.chips}>
            {favorites.map((w) => (
              <Pressable key={w} style={styles.chip} onPress={() => onOpenWord(w)}>
                <AppText variant="body">{w}</AppText>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}
      {recent.length > 0 ? (
        <>
          <SectionHeader>最近の検索</SectionHeader>
          {recent.map((w) => (
            <ListRow key={w} onPress={() => onOpenWord(w)}>
              <AppText variant="body">{w}</AppText>
            </ListRow>
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing(4), gap: theme.spacing(2) },
  brand: { alignItems: 'center', paddingTop: theme.spacing(4), paddingBottom: theme.spacing(2), gap: theme.spacing(1) },
  icon: { width: 72, height: 72, borderRadius: 16 },
  wordmark: { letterSpacing: 0.5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing(1), paddingHorizontal: theme.spacing(2), paddingBottom: theme.spacing(1) },
  chip: {
    borderWidth: StyleSheet.hairlineWidth ?? 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing(1.5),
    paddingVertical: theme.spacing(0.75),
  },
}));
