jest.mock('@expo/vector-icons', () => ({ Feather: () => null, MaterialCommunityIcons: () => null }));

import { Linking } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { EntryDetailScreen } from '../EntryDetailScreen';
import type { DictionarySection } from '../../../db/search/getEntriesForHeadword';

const SECTIONS: DictionarySection[] = [
  { dictId: 1, dictName: 'My Dict', entries: [{ headword: 'Apple', article: 'a fruit', articleType: 'm' }] },
];

function fakeUserData() {
  let fav = false;
  return {
    recordOpened: jest.fn(),
    isFavorite: () => fav,
    toggleFavorite: jest.fn(() => {
      fav = !fav;
      return fav;
    }),
  };
}

describe('EntryDetailScreen', () => {
  it('records history on mount and renders sections', () => {
    const userData = fakeUserData();
    render(
      <EntryDetailScreen
        folded="apple"
        headword="Apple"
        loadDetail={() => SECTIONS}
        userData={userData}
        onWordPress={() => {}}
      />,
    );
    expect(userData.recordOpened).toHaveBeenCalledWith('Apple');
    expect(screen.getByText('My Dict')).toBeTruthy();
    expect(screen.getByText('a fruit')).toBeTruthy();
  });

  it('toggles favorite', () => {
    const userData = fakeUserData();
    render(
      <EntryDetailScreen
        folded="apple"
        headword="Apple"
        loadDetail={() => SECTIONS}
        userData={userData}
        onWordPress={() => {}}
      />,
    );
    fireEvent.press(screen.getByRole('button', { name: /favorite/i }));
    expect(userData.toggleFavorite).toHaveBeenCalledWith('Apple');
  });

  it('opens a Google search for the headword', () => {
    const spy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as never);
    const userData = fakeUserData();
    render(
      <EntryDetailScreen folded="apple" headword="Apple" loadDetail={() => SECTIONS} userData={userData} onWordPress={() => {}} />,
    );
    fireEvent.press(screen.getByRole('button', { name: /google/i }));
    expect(spy).toHaveBeenCalledWith('https://www.google.com/search?q=Apple');
    spy.mockRestore();
  });

  it('passes dictIds to the loader', () => {
    const loadDetail = jest.fn(() => SECTIONS);
    render(
      <EntryDetailScreen folded="apple" headword="Apple" dictIds={[2]} loadDetail={loadDetail} userData={fakeUserData()} onWordPress={() => {}} />,
    );
    expect(loadDetail).toHaveBeenCalledWith('apple', [2]);
  });
});
