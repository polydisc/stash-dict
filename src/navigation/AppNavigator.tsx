import { useCallback, useMemo, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUnistyles } from 'react-native-unistyles';
import { openAppDatabase } from '../db/openAppDatabase';
import { createSearchService, createDetailLoader, createUserDataService } from '../features/search/services';
import { SearchScreen } from '../features/search/SearchScreen';
import { EntryDetailScreen } from '../features/search/EntryDetailScreen';
import { DictionaryManagerScreen } from '../features/dictionaries/DictionaryManagerScreen';
import { HistoryScreen } from '../features/userlists/HistoryScreen';
import { FavoritesScreen } from '../features/userlists/FavoritesScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { listHistory, listFavorites, clearHistory, removeFavorite } from '../db/userdata/repository';
import { listDictionaries } from '../db/dictionaries/repository';
import { foldHeadword } from '../folding/foldHeadword';
import type { SearchHit } from '../db/search/searchHeadwords';

type SearchStackParams = {
  Search: undefined;
  Detail: { folded: string; headword: string; dictIds?: number[] };
};

type TabParams = {
  SearchTab: { screen: 'Detail'; params: { folded: string; headword: string } } | undefined;
  Dictionaries: undefined;
  History: undefined;
  Favorites: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParams>();
const Stack = createNativeStackNavigator<SearchStackParams>();

const TAB_ICON: Record<string, string> = {
  SearchTab: 'magnify',
  Dictionaries: 'book-open-variant',
  History: 'history',
  Favorites: 'star',
  Settings: 'cog',
};

// openAppDatabase() is an idempotent singleton: it returns the same underlying
// connection on repeated calls, so keeping it at module scope is safe and avoids
// threading a db prop through every tab sub-component.
const db = openAppDatabase();

function SearchStack() {
  const search = useMemo(() => createSearchService(db), []);
  const loadDetail = useMemo(() => createDetailLoader(db), []);
  const userData = useMemo(() => createUserDataService(db), []);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [dictionaries, setDictionaries] = useState<{ dictId: number; name: string }[]>([]);

  useFocusEffect(
    useCallback(() => {
      setFavorites(listFavorites(db).map((f) => f.headword));
      setRecent(listHistory(db).map((h) => h.headword));
      setDictionaries(
        listDictionaries(db)
          .filter((d) => d.enabled)
          .map((d) => ({ dictId: d.dictId, name: d.name })),
      );
    }, []),
  );

  return (
    <Stack.Navigator>
      <Stack.Screen name="Search" options={{ title: 'Search' }}>
        {({ navigation }) => (
          <SearchScreen
            service={search}
            favorites={favorites}
            recent={recent}
            dictionaries={dictionaries}
            onOpen={(hit: SearchHit, dictIds: number[]) =>
              navigation.navigate('Detail', { folded: hit.folded, headword: hit.headword, dictIds })
            }
            onOpenWord={(headword) =>
              navigation.navigate('Detail', { folded: foldHeadword(headword), headword })
            }
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Detail" options={{ title: '' }}>
        {({ route, navigation }) => (
          <EntryDetailScreen
            folded={route.params.folded}
            headword={route.params.headword}
            dictIds={route.params.dictIds}
            loadDetail={loadDetail}
            userData={userData}
            onWordPress={(word) => navigation.push('Detail', { folded: foldHeadword(word), headword: word })}
            onBackToSearch={() => navigation.popToTop()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

type TabNavProp = BottomTabNavigationProp<TabParams>;

function HistoryTab({ navigation }: { navigation: TabNavProp }) {
  const [items, setItems] = useState<{ headword: string }[]>([]);

  useFocusEffect(
    useCallback(() => {
      setItems(listHistory(db));
    }, []),
  );

  const handleOpen = useCallback(
    (headword: string) => {
      navigation.navigate('SearchTab', {
        screen: 'Detail',
        params: { folded: foldHeadword(headword), headword },
      });
    },
    [navigation],
  );

  const handleClear = useCallback(() => {
    clearHistory(db);
    setItems([]);
  }, []);

  return <HistoryScreen items={items} onOpen={handleOpen} onClear={handleClear} />;
}

function FavoritesTab({ navigation }: { navigation: TabNavProp }) {
  const [items, setItems] = useState<{ headword: string }[]>([]);

  useFocusEffect(
    useCallback(() => {
      setItems(listFavorites(db));
    }, []),
  );

  const handleOpen = useCallback(
    (headword: string) => {
      navigation.navigate('SearchTab', {
        screen: 'Detail',
        params: { folded: foldHeadword(headword), headword },
      });
    },
    [navigation],
  );

  const handleRemove = useCallback((headword: string) => {
    removeFavorite(db, headword);
    setItems((prev) => prev.filter((it) => foldHeadword(it.headword) !== foldHeadword(headword)));
  }, []);

  return <FavoritesScreen items={items} onOpen={handleOpen} onRemove={handleRemove} />;
}

export function AppNavigator() {
  // The settings provider (App.tsx) applies the theme and supplies live
  // settings (font scale, theme) to every screen via context.
  const { theme } = useUnistyles();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: theme.colors.accent,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name={TAB_ICON[route.name] as never} color={color} size={size} />
          ),
        })}
      >
        <Tab.Screen name="SearchTab" component={SearchStack} options={{ title: 'Search', headerShown: false }} />
        <Tab.Screen name="Dictionaries" component={DictionaryManagerScreen} options={{ title: 'Dictionaries' }} />
        <Tab.Screen name="History" component={HistoryTab} options={{ title: 'History' }} />
        <Tab.Screen name="Favorites" component={FavoritesTab} options={{ title: 'Favorites' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
