import { useState } from 'react';
import { View, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useSettings } from './SettingsContext';
import { MIN_FONT_SCALE, MAX_FONT_SCALE, type ThemePref } from '../../db/settings/repository';
import { Screen } from '../../theme/components/Screen';
import { AppText } from '../../theme/components/AppText';
import { SectionHeader } from '../../theme/components/SectionHeader';

const THEME_OPTIONS: { label: string; value: ThemePref }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export function SettingsScreen() {
  const { settings, setTheme, setFontScale } = useSettings();
  const { theme } = useUnistyles();
  // While dragging, preview the value locally; only persist (a SQLite write)
  // when the gesture ends, so we don't write on every drag frame.
  const [dragScale, setDragScale] = useState<number | null>(null);
  const fontScale = dragScale ?? settings.fontScale;
  const resetFont = () => {
    setDragScale(null);
    setFontScale(1);
  };
  return (
    <Screen>
      <View style={styles.body}>
        <SectionHeader>Theme</SectionHeader>
        <View style={styles.rowGroup}>
          {THEME_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              accessibilityRole="button"
              onPress={() => setTheme(opt.value)}
              style={[styles.chip, settings.theme === opt.value && styles.chipActive]}
            >
              <AppText variant="body">{opt.label}</AppText>
            </Pressable>
          ))}
        </View>

        <SectionHeader>Font size</SectionHeader>
        <View style={styles.fontRow}>
          <AppText variant="muted">A</AppText>
          <Slider
            style={styles.slider}
            minimumValue={MIN_FONT_SCALE}
            maximumValue={MAX_FONT_SCALE}
            step={0.05}
            value={settings.fontScale}
            onValueChange={setDragScale}
            onSlidingComplete={(v) => {
              setDragScale(null);
              setFontScale(v);
            }}
            minimumTrackTintColor={theme.colors.accent}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.accent}
          />
          <AppText style={{ fontSize: theme.fontSizes.lg * fontScale }}>A</AppText>
        </View>
        <View style={styles.scaleRow}>
          <AppText variant="muted">{fontScale.toFixed(2)}×</AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reset font size"
            onPress={resetFont}
            disabled={fontScale === 1}
            style={[styles.resetBtn, fontScale === 1 && styles.resetDisabled]}
          >
            <AppText variant="label">Default</AppText>
          </Pressable>
        </View>

        <View style={styles.preview}>
          <AppText style={{ fontSize: theme.fontSizes.md * fontScale }}>
            The quick brown fox jumps over the lazy dog.
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  body: { padding: theme.spacing(2) },
  rowGroup: { flexDirection: 'row', gap: theme.spacing(1), paddingHorizontal: theme.spacing(2) },
  chip: {
    paddingVertical: theme.spacing(1),
    paddingHorizontal: theme.spacing(2),
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: { borderColor: theme.colors.accent },
  fontRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing(1), paddingHorizontal: theme.spacing(2) },
  slider: { flex: 1, height: 40 },
  scaleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing(2),
    marginTop: theme.spacing(0.5),
  },
  resetBtn: {
    paddingVertical: theme.spacing(0.5),
    paddingHorizontal: theme.spacing(1.5),
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  resetDisabled: { opacity: 0.4 },
  preview: {
    marginTop: theme.spacing(2),
    marginHorizontal: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
  },
}));
