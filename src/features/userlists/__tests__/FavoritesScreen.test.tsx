import { render, screen, fireEvent } from '@testing-library/react-native';
import { FavoritesScreen } from '../FavoritesScreen';

jest.mock('@expo/vector-icons', () => ({ Feather: () => null, MaterialCommunityIcons: () => null }));

describe('FavoritesScreen', () => {
  it('renders items and opens one', () => {
    const onOpen = jest.fn();
    render(<FavoritesScreen items={[{ headword: 'apple' }]} onOpen={onOpen} onRemove={() => {}} />);
    fireEvent.press(screen.getByText('apple'));
    expect(onOpen).toHaveBeenCalledWith('apple');
  });

  it('removes a favorite', () => {
    const onRemove = jest.fn();
    render(<FavoritesScreen items={[{ headword: 'apple' }]} onOpen={() => {}} onRemove={onRemove} />);
    fireEvent.press(screen.getByLabelText('Remove apple'));
    expect(onRemove).toHaveBeenCalledWith('apple');
  });
});
