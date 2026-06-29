import { View, Text } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { ListRow, AppText } from '../../theme/components';
import type { SearchHit } from '../../db/search/searchHeadwords';
import { truncateLabel } from './truncateLabel';

export function splitHeadword(
  headword: string,
  query: string,
): { matched: string; rest: string } {
  const n = Math.min(query.trim().length, headword.length);
  return { matched: headword.slice(0, n), rest: headword.slice(n) };
}

interface Props {
  hit: SearchHit;
  query: string;
  onPress: () => void;
}

export function SearchResultRow({ hit, query, onPress }: Props) {
  const { theme } = useUnistyles();
  const { matched, rest } = splitHeadword(hit.headword, query);
  return (
    <ListRow onPress={onPress}>
      <View style={styles.main}>
        <AppText variant="headword">
          <Text style={{ color: theme.colors.accent }}>{matched}</Text>
          {rest}
        </AppText>
        {hit.preview ? (
          <AppText variant="muted" numberOfLines={1} style={styles.preview}>
            {hit.preview}
          </AppText>
        ) : null}
        {hit.dictNames.length > 0 ? (
          <View style={styles.tags}>
            {hit.dictNames.map((name, i) => (
              <View key={`${name}-${i}`} style={styles.tag}>
                <AppText variant="label" numberOfLines={1}>{truncateLabel(name)}</AppText>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </ListRow>
  );
}

const styles = StyleSheet.create((theme) => ({
  main: { flex: 1 },
  preview: { marginTop: theme.spacing(0.25) },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing(0.5), marginTop: theme.spacing(0.5) },
  tag: {
    maxWidth: 96,
    borderWidth: StyleSheet.hairlineWidth ?? 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing(0.75),
    paddingVertical: theme.spacing(0.25),
  },
}));
