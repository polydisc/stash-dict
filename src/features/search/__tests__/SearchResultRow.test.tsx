import { render, fireEvent } from '@testing-library/react-native';
import { SearchResultRow, splitHeadword } from '../SearchResultRow';
import type { SearchHit } from '../../../db/search/searchHeadwords';

jest.mock('@expo/vector-icons', () => ({ Feather: () => null, MaterialCommunityIcons: () => null }));

const hit = (over: Partial<SearchHit>): SearchHit => ({
  folded: 'apple', headword: 'apple', dictNames: [], preview: '', ...over,
});

describe('splitHeadword', () => {
  it('splits the matched prefix from the rest', () => {
    expect(splitHeadword('apple', 'ap')).toEqual({ matched: 'ap', rest: 'ple' });
  });
  it('caps the prefix at the headword length', () => {
    expect(splitHeadword('ap', 'apple')).toEqual({ matched: 'ap', rest: '' });
  });
});

describe('SearchResultRow', () => {
  it('renders the full headword and fires onPress', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <SearchResultRow hit={hit({ headword: 'apple' })} query="ap" onPress={onPress} />,
    );
    fireEvent.press(getByText('apple')); // nested Text composes to the full word
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows a tag for each source dictionary', () => {
    const { getByText } = render(
      <SearchResultRow hit={hit({ headword: 'apple', dictNames: ['Alpha', 'Beta'] })} query="ap" onPress={jest.fn()} />,
    );
    expect(getByText('Alpha')).toBeTruthy();
    expect(getByText('Beta')).toBeTruthy();
  });

  it('renders both tags without error when two dicts share a name', () => {
    const { getAllByText } = render(
      <SearchResultRow hit={hit({ headword: 'apple', dictNames: ['Foo', 'Foo'] })} query="ap" onPress={jest.fn()} />,
    );
    expect(getAllByText('Foo')).toHaveLength(2);
  });

  it('renders no tags when there are no dictionary names', () => {
    const { queryByText } = render(
      <SearchResultRow hit={hit({ dictNames: [] })} query="ap" onPress={jest.fn()} />,
    );
    expect(queryByText('Alpha')).toBeNull();
  });

  it('truncates a long dictionary tag name', () => {
    const { getByText } = render(
      <SearchResultRow hit={hit({ headword: 'apple', dictNames: ['Oxford English'] })} query="ap" onPress={jest.fn()} />,
    );
    expect(getByText('Oxford…')).toBeTruthy();
  });
});
