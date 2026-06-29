import { Text, type TextProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export type AppTextVariant = 'display' | 'headword' | 'body' | 'label' | 'muted';

interface Props extends TextProps {
  variant?: AppTextVariant;
}

export function AppText({ variant = 'body', style, ...rest }: Props) {
  return <Text style={[styles[variant], style]} {...rest} />;
}

const styles = StyleSheet.create((theme) => ({
  display: {
    fontFamily: theme.fonts.serifDisplay,
    fontSize: theme.fontSizes.display,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: theme.colors.headword,
  },
  headword: {
    fontFamily: theme.fonts.serifDisplay,
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.headword,
  },
  body: {
    fontFamily: theme.fonts.serifText,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: theme.colors.accent,
    fontWeight: '600',
  },
  muted: {
    fontFamily: theme.fonts.serifText,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
  },
}));
