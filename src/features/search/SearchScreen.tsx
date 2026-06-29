import { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, View, FlatList } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useSearch, type SearchService } from './useSearch';
import { Screen, SearchField } from '../../theme/components';
import { SearchResultRow } from './SearchResultRow';
import { SearchEmptyState } from './SearchEmptyState';
import { DictionaryFilter } from './DictionaryFilter';
import type { SearchHit } from '../../db/search/searchHeadwords';

interface Props {
  service: SearchService;
  onOpen: (hit: SearchHit, dictIds: number[]) => void;
  favorites: string[];
  recent: string[];
  onOpenWord: (headword: string) => void;
  dictionaries: { dictId: number; name: string }[];
}

export function SearchScreen({ service, onOpen, favorites, recent, onOpenWord, dictionaries }: Props) {
  const [selectedDictIds, setSelectedDictIds] = useState<number[]>([]);
  const { query, setQuery, results } = useSearch(service, { dictIds: selectedDictIds });
  useEffect(() => {
    setSelectedDictIds((prev) => {
      const next = prev.filter((id) => dictionaries.some((d) => d.dictId === id));
      return next.length === prev.length ? prev : next;
    });
  }, [dictionaries]);
  const showEmpty = query.trim() === '';
  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.fill}>
          {showEmpty ? (
            <SearchEmptyState favorites={favorites} recent={recent} onOpenWord={onOpenWord} />
          ) : (
            <FlatList
              data={results}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(h) => h.folded}
              renderItem={({ item }) => (
                <SearchResultRow hit={item} query={query} onPress={() => onOpen(item, selectedDictIds)} />
              )}
            />
          )}
        </View>
        <DictionaryFilter
          dictionaries={dictionaries}
          selected={selectedDictIds}
          onChange={setSelectedDictIds}
        />
        <SearchField value={query} onChangeText={setQuery} placeholder="検索" />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create(() => ({
  fill: { flex: 1 },
}));
