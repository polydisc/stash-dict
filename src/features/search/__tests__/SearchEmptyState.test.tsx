import { render, fireEvent } from '@testing-library/react-native';
import { SearchEmptyState } from '../SearchEmptyState';

jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));

describe('SearchEmptyState', () => {
  it('renders favorites and recent, and opens a tapped word', () => {
    const onOpenWord = jest.fn();
    const { getByText } = render(
      <SearchEmptyState
        favorites={['serendipity']}
        recent={['petrichor']}
        onOpenWord={onOpenWord}
      />,
    );
    expect(getByText('お気に入り')).toBeTruthy();
    expect(getByText('最近の検索')).toBeTruthy();
    fireEvent.press(getByText('serendipity'));
    fireEvent.press(getByText('petrichor'));
    expect(onOpenWord).toHaveBeenCalledWith('serendipity');
    expect(onOpenWord).toHaveBeenCalledWith('petrichor');
  });

  it('shows a prompt when there is nothing yet', () => {
    const { getByText, queryByText } = render(
      <SearchEmptyState favorites={[]} recent={[]} onOpenWord={jest.fn()} />,
    );
    expect(queryByText('お気に入り')).toBeNull();
    expect(getByText('言葉を検索してみましょう。')).toBeTruthy();
  });

  it('shows the app brand header in both states', () => {
    const withData = render(
      <SearchEmptyState favorites={['a']} recent={[]} onOpenWord={jest.fn()} />,
    );
    expect(withData.getByText('StashDict')).toBeTruthy();
    const empty = render(
      <SearchEmptyState favorites={[]} recent={[]} onOpenWord={jest.fn()} />,
    );
    expect(empty.getByText('StashDict')).toBeTruthy();
  });
});
