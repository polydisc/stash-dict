import { useState, useMemo } from 'react';
import { View, Pressable, FlatList, ActivityIndicator, Modal, TextInput } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useDictionaryManager, DictionaryService } from './useDictionaryManager';
import { createDictionaryService } from './dictionaryService';
import { DictionaryRow } from './DictionaryRow';
import { openAppDatabase } from '../../db/openAppDatabase';
import { Screen, AppText } from '../../theme/components';

async function pickAndReadZip(): Promise<Uint8Array | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: 'application/zip', copyToCacheDirectory: true });
  if (result.canceled || !result.assets[0]) return null;
  const buffer = await new File(result.assets[0].uri).arrayBuffer();
  return new Uint8Array(buffer);
}

export function DictionaryManagerScreen({ service }: { service?: DictionaryService }) {
  const svc = useMemo(() => service ?? createDictionaryService(openAppDatabase()), [service]);
  const mgr = useDictionaryManager(svc);
  const { theme } = useUnistyles();

  const [renaming, setRenaming] = useState<{ id: number; name: string } | null>(null);

  const openRename = (id: number) => {
    const dict = mgr.dictionaries.find((d) => d.dictId === id);
    if (dict) setRenaming({ id, name: dict.name });
  };
  const submitRename = () => {
    if (renaming && renaming.name.trim()) {
      mgr.rename(renaming.id, renaming.name.trim());
    }
    setRenaming(null);
  };

  const onImport = async () => {
    try {
      const bytes = await pickAndReadZip();
      if (bytes) await mgr.importZip(bytes);
    } catch (e) {
      console.warn('[import] failed:', e);
    }
  };

  return (
    <Screen>
      <Pressable
        style={styles.importBtn}
        onPress={onImport}
        disabled={mgr.importing}
        accessibilityRole="button"
      >
        <AppText variant="headword" style={styles.importText}>
          {mgr.importing ? 'Importing…' : 'Import dictionary (.zip)'}
        </AppText>
      </Pressable>
      {mgr.error && (
        <AppText variant="body" style={styles.error}>{mgr.error}</AppText>
      )}
      <FlatList
        data={mgr.dictionaries}
        keyExtractor={(d) => String(d.dictId)}
        renderItem={({ item }) => (
          <DictionaryRow dictionary={item} onToggle={mgr.toggle} onDelete={mgr.remove} onRename={openRename} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <AppText variant="muted">No dictionaries yet.</AppText>
          </View>
        }
      />
      <Modal visible={mgr.importing} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <ActivityIndicator />
            <AppText variant="body" style={styles.dialogText}>Importing…</AppText>
          </View>
        </View>
      </Modal>
      <Modal visible={renaming !== null} transparent animationType="fade" onRequestClose={() => setRenaming(null)}>
        <Pressable style={styles.overlay} onPress={() => setRenaming(null)}>
          <Pressable style={styles.renameDialog} onPress={() => {}}>
            <AppText variant="headword">Rename dictionary</AppText>
            <TextInput
              style={styles.input}
              value={renaming?.name ?? ''}
              onChangeText={(t) => setRenaming((r) => (r ? { ...r, name: t } : r))}
              autoFocus
              placeholder="Dictionary name"
              placeholderTextColor={theme.colors.textMuted}
            />
            <View style={styles.dialogActions}>
              <Pressable accessibilityRole="button" onPress={() => setRenaming(null)}>
                <AppText variant="body" style={styles.cancel}>Cancel</AppText>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={submitRename}>
                <AppText variant="body" style={styles.save}>Save</AppText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  importBtn: {
    margin: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
  },
  importText: { color: theme.colors.onAccent },
  error: { color: theme.colors.danger, paddingHorizontal: theme.spacing(2) },
  emptyWrap: { alignItems: 'center', marginTop: theme.spacing(4) },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dialog: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing(3),
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },
  dialogText: { color: theme.colors.text },
  renameDialog: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing(3),
    alignItems: 'stretch',
    gap: theme.spacing(1.5),
    minWidth: 280,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth ?? 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing(1.5),
    paddingVertical: theme.spacing(1),
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    minWidth: 220,
  },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing(2) },
  cancel: { color: theme.colors.textMuted },
  save: { color: theme.colors.accent, fontWeight: '600' },
}));
