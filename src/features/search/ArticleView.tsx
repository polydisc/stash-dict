import { useCallback, useMemo } from 'react';
import { useWindowDimensions, Text } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import type { ArticleEntry } from '../../db/search/getEntriesForHeadword';
import { parseBwordHref } from './bword';

interface Props {
  entry: ArticleEntry;
  onWordPress: (word: string) => void;
  fontScale?: number;
}

// Tags that must never render in an offline dictionary: scripts/styles, remote
// or local media (would require network/resources we don't ship), and embeds.
// StarDict HTML articles only need inline text formatting + anchors.
const IGNORED_TAGS = [
  'script',
  'style',
  'link',
  'meta',
  'head',
  'iframe',
  'object',
  'embed',
  'img',
  'audio',
  'video',
  'source',
  'track',
];

export function ArticleView({ entry, onWordPress, fontScale = 1 }: Props) {
  const { width } = useWindowDimensions();
  const { theme } = useUnistyles();
  const fontSize = theme.fontSizes.md * fontScale;

  const baseStyle = useMemo(
    () => ({
      fontSize,
      lineHeight: fontSize * 1.6,
      color: theme.colors.text,
      fontFamily: theme.fonts.serifText,
      paddingHorizontal: theme.spacing(2),
    }),
    [fontSize, theme],
  );
  const tagsStyles = useMemo(
    () => ({
      a: { color: theme.colors.primary, textDecorationLine: 'none' as const },
      blockquote: { color: theme.colors.textMuted, fontStyle: 'italic' as const, marginLeft: theme.spacing(1) },
      p: { marginTop: 0, marginBottom: theme.spacing(1) },
      div: { marginBottom: theme.spacing(0.5) },
      ol: { marginTop: theme.spacing(0.5), marginBottom: theme.spacing(0.5) },
      li: { marginBottom: theme.spacing(0.5) },
    }),
    [theme],
  );
  const onAnchorPress = useCallback(
    (_event: unknown, href: string) => {
      const word = parseBwordHref(href);
      if (word) onWordPress(word);
    },
    [onWordPress],
  );
  const renderersProps = useMemo(() => ({ a: { onPress: onAnchorPress } }), [onAnchorPress]);

  if (entry.articleType === 'h') {
    return (
      <RenderHtml
        contentWidth={width}
        source={{ html: entry.article }}
        baseStyle={baseStyle}
        tagsStyles={tagsStyles}
        ignoredDomTags={IGNORED_TAGS}
        renderersProps={renderersProps}
      />
    );
  }
  return <Text style={[styles.plain, { fontSize, lineHeight: fontSize * 1.6 }]}>{entry.article}</Text>;
}

const styles = StyleSheet.create((theme) => ({
  plain: {
    // fontSize is applied inline (scaled by fontScale), so it is not set here.
    color: theme.colors.text,
    fontFamily: theme.fonts.serifText,
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(1),
  },
}));
