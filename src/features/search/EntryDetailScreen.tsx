import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, View, Pressable, Linking } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { ArticleView } from './ArticleView';
import { Screen, AppText, SectionHeader, IconButton } from '../../theme/components';
import { useSettings } from '../settings/SettingsContext';
import type { DetailLoader, UserDataService } from './services';

interface Props {
  folded: string;
  headword: string;
  dictIds?: number[];
  loadDetail: DetailLoader;
  userData: UserDataService;
  onWordPress: (word: string) => void;
  onBackToSearch?: () => void;
}

export function EntryDetailScreen({ folded, headword, dictIds, loadDetail, userData, onWordPress, onBackToSearch }: Props) {
  const sections = useMemo(() => loadDetail(folded, dictIds), [loadDetail, folded, dictIds]);
  const { theme } = useUnistyles();
  const { settings } = useSettings();
  const fontScale = settings.fontScale;
  const [fav, setFav] = useState(() => userData.isFavorite(headword));
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    userData.recordOpened(headword);
  }, [userData, headword]);

  useEffect(() => {
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  }, [folded, opacity]);

  const onGoogle = () => {
    void Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(headword)}`);
  };

  return (
    <Screen>
      <Animated.ScrollView style={{ opacity }} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AppText variant="display" style={styles.headword}>{headword}</AppText>
          <IconButton
            name={fav ? 'star' : 'star-outline'}
            family="material"
            accessibilityLabel={fav ? 'Remove favorite' : 'Add favorite'}
            color={fav ? theme.colors.accent : theme.colors.textMuted}
            onPress={() => setFav(userData.toggleFavorite(headword))}
          />
        </View>
        {sections.map((section) => (
          <View key={section.dictId} style={styles.section}>
            <SectionHeader>{section.dictName}</SectionHeader>
            {section.entries.map((entry, i) => (
              <ArticleView key={i} entry={entry} onWordPress={onWordPress} fontScale={fontScale} />
            ))}
          </View>
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search on Google"
          onPress={onGoogle}
          style={styles.googleBtn}
        >
          <IconButton
            name="google"
            family="material"
            accessibilityLabel=""
            color={theme.colors.textMuted}
            size={18}
          />
          <AppText variant="muted">Search on Google</AppText>
        </Pressable>
      </Animated.ScrollView>
      {onBackToSearch ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to search"
          onPress={onBackToSearch}
          style={styles.fab}
        >
          <IconButton name="magnify" family="material" accessibilityLabel="" color={theme.colors.onAccent} />
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: { paddingBottom: theme.spacing(10) },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1),
  },
  headword: { flex: 1 },
  section: { marginBottom: theme.spacing(2) },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1),
    alignSelf: 'flex-start',
    margin: theme.spacing(2),
    paddingVertical: theme.spacing(1),
    paddingHorizontal: theme.spacing(2),
    borderRadius: theme.radii.pill,
    borderWidth: StyleSheet.hairlineWidth ?? 1,
    borderColor: theme.colors.border,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing(2.5),
    bottom: theme.spacing(3),
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
}));
