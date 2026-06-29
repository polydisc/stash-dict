import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { SearchScreen } from '../SearchScreen';
import type { SearchHit } from '../../../db/search/searchHeadwords';

jest.mock('@expo/vector-icons', () => ({
  Feather: () => null,
  MaterialCommunityIcons: () => null,
}));

const HITS: SearchHit[] = [
  { folded: 'apple', headword: 'apple', dictNames: [], preview: 'a fruit' },
];

describe('SearchScreen', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const base = {
    onOpen: jest.fn(),
    favorites: ['serendipity'],
    recent: ['petrichor'],
    onOpenWord: jest.fn(),
    dictionaries: [],
  };

  it('shows the empty state when the query is blank', () => {
    render(<SearchScreen service={{ search: () => HITS }} {...base} />);
    expect(screen.getByText('最近の検索')).toBeTruthy();
  });

  it('shows debounced results and opens one on press', () => {
    const onOpen = jest.fn();
    const service = { search: (q: string) => (q.startsWith('ap') ? HITS : []) };
    render(<SearchScreen service={service} {...base} onOpen={onOpen} />);
    fireEvent.changeText(screen.getByPlaceholderText('検索'), 'ap');
    act(() => jest.advanceTimersByTime(150));
    fireEvent.press(screen.getByText('apple'));
    expect(onOpen).toHaveBeenCalledWith(HITS[0], []);
  });

  it('drops a selected dictionary from the scope when it is removed', () => {
    const search = jest.fn((q: string, dictIds?: number[]) =>
      q ? [{ folded: 'apple', headword: 'apple', dictNames: ['Alpha'], preview: '' }] : [],
    );
    const base = { service: { search }, onOpen: jest.fn(), favorites: [], recent: [], onOpenWord: jest.fn() };
    const { rerender } = render(
      <SearchScreen {...base} dictionaries={[{ dictId: 1, name: 'Alpha' }, { dictId: 2, name: 'Beta' }]} />,
    );
    fireEvent.changeText(screen.getByPlaceholderText('検索'), 'ap');
    act(() => jest.advanceTimersByTime(150));
    fireEvent.press(screen.getByText('Beta'));        // selectedDictIds = [2]
    act(() => jest.advanceTimersByTime(150));
    expect(search).toHaveBeenLastCalledWith('ap', [2]);
    // Beta is now removed/disabled -> navigator supplies only Alpha
    rerender(<SearchScreen {...base} dictionaries={[{ dictId: 1, name: 'Alpha' }]} />);
    act(() => jest.advanceTimersByTime(150));
    expect(search).toHaveBeenLastCalledWith('ap', []); // [2] reconciled away -> empty (all enabled)
  });

  it('scopes the search when a dictionary chip is selected', () => {
    const search = jest.fn((q: string, dictIds?: number[]) =>
      q ? [{ folded: 'apple', headword: 'apple', dictNames: ['Alpha'], preview: '' }] : [],
    );
    render(
      <SearchScreen
        service={{ search }}
        onOpen={jest.fn()}
        favorites={[]}
        recent={[]}
        onOpenWord={jest.fn()}
        dictionaries={[{ dictId: 1, name: 'Alpha' }, { dictId: 2, name: 'Beta' }]}
      />,
    );
    fireEvent.changeText(screen.getByPlaceholderText('検索'), 'ap');
    act(() => jest.advanceTimersByTime(150));
    fireEvent.press(screen.getByText('Beta'));
    act(() => jest.advanceTimersByTime(150));
    expect(search).toHaveBeenLastCalledWith('ap', [2]);
  });
});
